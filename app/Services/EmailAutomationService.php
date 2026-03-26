<?php

namespace App\Services;

use App\Models\Email;
use App\Models\EmailResponse;
use App\Models\EmailRule;
use App\Services\EmailProviderManager;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class EmailAutomationService
{
    private GrokApiService $grokApiService;
    private EmailProviderManager $emailManager;

    public function __construct(GrokApiService $grokApi, EmailProviderManager $emailManager)
    {
        $this->grokApiService = $grokApi;
        $this->emailManager = $emailManager;
    }

    /**
     * Process incoming emails with automation rules
     */
    public function processIncomingEmails(Collection $emails): void
    {
        foreach ($emails as $email) {
            $this->processEmail($email);
        }
    }

    /**
     * Process a single email through automation rules
     */
    public function processEmail(Email $email): void
    {
        try {
            // Analyze email with AI first
            $this->analyzeEmailWithAI($email);

            // Get applicable rules
            $rules = $this->getApplicableRules($email);

            foreach ($rules as $rule) {
                if ($this->ruleMatchesEmail($rule, $email)) {
                    $this->executeRule($rule, $email);
                }
            }
        } catch (\Exception $e) {
            Log::error('Email processing failed: ' . $e->getMessage(), [
                'email_id' => $email->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Analyze email content using AI
     */
    private function analyzeEmailWithAI(Email $email): void
    {
        try {
            $prompt = $this->buildAnalysisPrompt($email);

            // Use non-streaming response for analysis
            $response = $this->grokApiService->generateChat(
                $prompt,
                'grok-4', // Use Grok model
                [], // No history needed
                [], // No tools needed for analysis
                ['type' => 'json_object'] // Request JSON format
            );

            $analysis = json_decode($response, true);

            if ($analysis && $this->isValidAnalysis($analysis)) {
                $email->update(['ai_analysis' => $analysis]);
                Log::info('AI email analysis completed', [
                    'email_id' => $email->id,
                    'sentiment' => $analysis['sentiment'] ?? 'unknown',
                    'category' => $analysis['category'] ?? 'unknown'
                ]);
            } else {
                Log::warning('AI analysis returned invalid format', [
                    'email_id' => $email->id,
                    'response' => $response
                ]);
            }
        } catch (\Exception $e) {
            Log::error('AI email analysis failed: ' . $e->getMessage(), [
                'email_id' => $email->id
            ]);
        }
    }

    /**
     * Validate AI analysis structure
     */
    private function isValidAnalysis(array $analysis): bool
    {
        $requiredFields = ['sentiment', 'urgency_level', 'category', 'key_topics', 'action_required', 'suggested_response_type'];

        foreach ($requiredFields as $field) {
            if (!isset($analysis[$field])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Build analysis prompt for AI
     */
    private function buildAnalysisPrompt(Email $email): string
    {
        $bodyPreview = substr($email->body_text ?? '', 0, 2000); // Limit body length

        return "Analyze this email and provide insights in valid JSON format with exactly these fields:
- sentiment (string: positive/negative/neutral)
- urgency_level (string: low/medium/high)
- category (string: personal/business/marketing/support/inquiry/complaint/other)
- key_topics (array of strings: main topics discussed)
- action_required (boolean: true/false)
- suggested_response_type (string: reply/forward/ignore/mark_read)

Email Details:
Subject: {$email->subject}
From: {$email->from['name']} <{$email->from['email']}>
Body Preview: {$bodyPreview}

Return ONLY valid JSON, no additional text or explanations.";
    }

    /**
     * Check if a rule matches the email
     */
    private function ruleMatchesEmail(EmailRule $rule, Email $email): bool
    {
        foreach ($rule->conditions as $condition) {
            if (!$this->checkCondition($condition, $email)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check individual condition against email
     */
    private function checkCondition(array $condition, Email $email): bool
    {
        $field = $condition['field'];
        $operator = $condition['operator'];
        $value = $condition['value'];

        switch ($field) {
            case 'subject':
                $emailValue = $email->subject ?? '';
                break;
            case 'from':
                $emailValue = $email->from['email'] ?? '';
                break;
            case 'body':
                $emailValue = $email->body_text ?? '';
                break;
            case 'has_attachments':
                $emailValue = !empty($email->attachments);
                break;
            default:
                return false;
        }

        return $this->evaluateCondition($emailValue, $operator, $value);
    }

    /**
     * Evaluate condition with operator
     */
    private function evaluateCondition($emailValue, string $operator, $conditionValue): bool
    {
        switch ($operator) {
            case 'contains':
                return stripos($emailValue, $conditionValue) !== false;
            case 'not_contains':
                return stripos($emailValue, $conditionValue) === false;
            case 'equals':
                return strtolower($emailValue) === strtolower($conditionValue);
            case 'not_equals':
                return strtolower($emailValue) !== strtolower($conditionValue);
            case 'starts_with':
                return stripos($emailValue, $conditionValue) === 0;
            case 'ends_with':
                return strripos($emailValue, $conditionValue) === (strlen($emailValue) - strlen($conditionValue));
            case 'is_true':
                return (bool)$emailValue === true;
            case 'is_false':
                return (bool)$emailValue === false;
            default:
                return false;
        }
    }

    /**
     * Get rules applicable to this email
     */
    private function getApplicableRules(Email $email): Collection
    {
        return EmailRule::where('is_active', true)
            ->where(function($query) use ($email) {
                $query->where('email_account_id', $email->email_account_id)
                      ->orWhereNull('email_account_id');
            })
            ->orderBy('priority', 'desc')
            ->get();
    }

    /**
     * Execute a rule on an email
     */
    private function executeRule(EmailRule $rule, Email $email): void
    {
        Log::info("Executing rule '{$rule->name}' on email {$email->id}", [
            'rule_id' => $rule->id,
            'email_id' => $email->id
        ]);

        foreach ($rule->actions as $action) {
            try {
                $this->executeAction($action, $email, $rule);
            } catch (\Exception $e) {
                Log::error('Rule action execution failed', [
                    'rule_id' => $rule->id,
                    'email_id' => $email->id,
                    'action' => $action['type'] ?? 'unknown',
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    /**
     * Execute a single action
     */
    private function executeAction(array $action, Email $email, EmailRule $rule): void
    {
        switch ($action['type']) {
            case 'generate_response':
                $this->generateResponse($email, $rule, $action);
                break;
            case 'mark_read':
                $this->emailManager->markAsRead($email);
                break;
            case 'mark_unread':
                $this->emailManager->markAsUnread($email);
                break;
            case 'forward':
                $this->forwardEmail($email, $action['to'] ?? '');
                break;
            case 'move_to_folder':
                $this->moveToFolder($email, $action['folder'] ?? '');
                break;
            case 'add_label':
                $this->addLabel($email, $action['label'] ?? '');
                break;
            default:
                Log::warning('Unknown action type', ['action_type' => $action['type']]);
        }
    }

    /**
     * Generate AI response for email
     */
    private function generateResponse(Email $email, EmailRule $rule, array $action): void
    {
        try {
            $prompt = $this->buildResponsePrompt($email, $action);

            // Use non-streaming response for email generation
            $response = $this->grokApiService->generateChat(
                $prompt,
                'grok-4', // Use Grok model
                [], // No history needed
                []  // No tools needed for response generation
            );

            // Clean up the response
            $cleanedResponse = $this->cleanResponse($response);

            EmailResponse::create([
                'email_id' => $email->id,
                'email_rule_id' => $rule->id,
                'generated_response' => $cleanedResponse,
                'final_response' => $cleanedResponse, // Initially same as generated
                'is_approved' => false,
                'is_sent' => false,
            ]);

            Log::info("Generated AI response for email {$email->id}", [
                'email_id' => $email->id,
                'rule_id' => $rule->id,
                'response_length' => strlen($cleanedResponse)
            ]);

        } catch (\Exception $e) {
            Log::error('AI response generation failed: ' . $e->getMessage(), [
                'email_id' => $email->id,
                'rule_id' => $rule->id
            ]);
        }
    }

    /**
     * Clean and format the AI response
     */
    private function cleanResponse(string $response): string
    {
        // Remove common AI artifacts
        $clean = trim($response);
        $clean = preg_replace('/^(Dear|Hello|Hi)\s+.*?,\s*/i', '', $clean);
        $clean = preg_replace('/\s*Best regards,.*$/is', '', $clean);
        $clean = preg_replace('/\s*Sincerely,.*$/is', '', $clean);
        $clean = preg_replace('/^["\'](.*)["\']$/', '$1', $clean);

        return trim($clean);
    }

    /**
     * Build response generation prompt
     */
    private function buildResponsePrompt(Email $email, array $action): string
    {
        $tone = $action['tone'] ?? 'professional';
        $length = $action['length'] ?? 'medium';
        $style = $action['style'] ?? 'direct';

        $bodyPreview = substr($email->body_text ?? '', 0, 1500);

        return "Generate a {$tone} email response. Keep it {$length} length and {$style} style.

ORIGINAL EMAIL:
Subject: {$email->subject}
From: {$email->from['name']}
Body: {$bodyPreview}

RESPONSE REQUIREMENTS:
- Be helpful and {$tone}
- Address the main points from the original email
- Keep response {$length} - approximately " . $this->getLengthGuide($length) . " words
- Use {$style} communication style
- Do NOT include subject line, greetings, or signatures
- Write only the response body content

Generate ONLY the response body text:";
    }

    /**
     * Get word count guide for length
     */
    private function getLengthGuide(string $length): string
    {
        return match($length) {
            'short' => '50-100',
            'medium' => '100-200',
            'long' => '200-400',
            default => '100-200'
        };
    }

    /**
     * Forward email to another address
     */
    private function forwardEmail(Email $email, string $to): void
    {
        if (empty($to) || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
            Log::warning('Invalid forward email address', ['to' => $to]);
            return;
        }

        $forwardData = [
            'to' => $to,
            'subject' => 'Fwd: ' . $email->subject,
            'body' => $this->buildForwardBody($email),
            'headers' => [
                'References' => $email->message_id,
                'In-Reply-To' => $email->message_id,
            ]
        ];

        try {
            $this->emailManager->sendEmail($email->emailAccount, $forwardData);
            Log::info('Email forwarded successfully', [
                'email_id' => $email->id,
                'to' => $to
            ]);
        } catch (\Exception $e) {
            Log::error('Email forwarding failed', [
                'email_id' => $email->id,
                'to' => $to,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Build forward email body
     */
    private function buildForwardBody(Email $email): string
    {
        return "---------- Forwarded message ---------\n" .
               "From: {$email->from['name']} <{$email->from['email']}>\n" .
               "Date: {$email->received_at}\n" .
               "Subject: {$email->subject}\n\n" .
               ($email->body_text ?? 'No content') .
               "\n\n---------- End forwarded message ---------";
    }

    /**
     * Move email to folder
     */
    private function moveToFolder(Email $email, string $folder): void
    {
        try {
            $this->emailManager->moveToFolder($email, $folder);
            Log::info('Email moved to folder', [
                'email_id' => $email->id,
                'folder' => $folder
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to move email to folder', [
                'email_id' => $email->id,
                'folder' => $folder,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Add label to email
     */
    private function addLabel(Email $email, string $label): void
    {
        try {
            $this->emailManager->addLabel($email, $label);
            Log::info('Label added to email', [
                'email_id' => $email->id,
                'label' => $label
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to add label to email', [
                'email_id' => $email->id,
                'label' => $label,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send generated response
     */
    public function sendResponse(EmailResponse $response): bool
    {
        try {
            $email = $response->email;

            $sendData = [
                'to' => $email->from['email'],
                'subject' => 'Re: ' . $email->subject,
                'body' => $response->final_response,
                'headers' => [
                    'References' => $email->message_id,
                    'In-Reply-To' => $email->message_id,
                ]
            ];

            $result = $this->emailManager->sendEmail($email->emailAccount, $sendData);

            if ($result) {
                $response->update([
                    'is_sent' => true,
                    'sent_at' => now(),
                ]);

                Log::info('Email response sent successfully', [
                    'response_id' => $response->id,
                    'email_id' => $email->id
                ]);
            }

            return $result;

        } catch (\Exception $e) {
            Log::error('Failed to send email response', [
                'response_id' => $response->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Test AI service connectivity
     */
    public function testAIConnectivity(): bool
    {
        try {
            return $this->grokApiService->testConnection();
        } catch (\Exception $e) {
            Log::error('AI connectivity test failed: ' . $e->getMessage());
            return false;
        }
    }
}

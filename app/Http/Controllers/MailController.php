<?php

namespace App\Http\Controllers;

use App\Models\EmailAccount;
use App\Models\Email;
use App\Models\EmailRule;
use App\Models\EmailResponse;
use App\Services\EmailProviderManager;
use App\Services\EmailAutomationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;

class MailController extends Controller
{
    protected $emailProviderManager;
    protected $emailAutomationService;

    public function __construct(
        EmailProviderManager $emailProviderManager,
        EmailAutomationService $emailAutomationService
    ) {
        $this->emailProviderManager = $emailProviderManager;
        $this->emailAutomationService = $emailAutomationService;
    }

    /**
     * Show email dashboard
     */
    public function mails()
    {
        $emailAccounts = Auth::user()->emailAccounts()->with('emails')->get();
        $emailRules = Auth::user()->emailRules;

        return Inertia::render('Emails/Index', [
            'emailAccounts' => $emailAccounts,
            'emailRules' => $emailRules,
            'user' => Auth::user(),
        ]);
    }

    /**
     * Show emails for specific account
     */
    public function showEmails($accountId)
    {
        $account = Auth::user()->emailAccounts()->findOrFail($accountId);

        $emails = $account->emails()
            ->orderBy('received_at', 'desc')
            ->paginate(50);

        return Inertia::render('Emails/AccountEmails', [
            'emailAccount' => $account,
            'emails' => $emails,
        ]);
    }

    /**
     * Show rules management page
     */
    public function rules()
    {
        $emailAccounts = Auth::user()->emailAccounts;
        $emailRules = Auth::user()->emailRules;

        return Inertia::render('Emails/Rules', [
            'emailAccounts' => $emailAccounts,
            'emailRules' => $emailRules,
        ]);
    }

    /**
     * Connect Gmail account (OAuth redirect)
     * Uses separate email automation OAuth credentials (different from user login)
     */
    // public function connectGmail()
    // {
    //     // Generate OAuth authorization URL using email automation Gmail credentials
    //     $clientId = config('services.email_automation.gmail.client_id');
    //     $redirectUri = route('emails.callback.gmail');

    //     $scopes = [
    //         'https://www.googleapis.com/auth/gmail.readonly',
    //         'https://www.googleapis.com/auth/gmail.send'
    //     ];

    //     $authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
    //         'client_id' => $clientId,
    //         'redirect_uri' => $redirectUri,
    //         'response_type' => 'code',
    //         'scope' => implode(' ', $scopes),
    //         'access_type' => 'offline',
    //         'prompt' => 'consent',
    //         'state' => session()->token(), // CSRF protection
    //     ]);

    //     return redirect($authUrl);
    // }

    public function connectGmail()
    {
        // Configure Socialite with email automation credentials
        config([
            'services.google.client_id' => config('services.email_automation.gmail.client_id'),
            'services.google.client_secret' => config('services.email_automation.gmail.client_secret'),
            'services.google.redirect' => route('emails.callback.gmail'),
        ]);

        return Socialite::driver('google')
            ->scopes([
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.send'
            ])
            ->with([
                'access_type' => 'offline',
                'prompt' => 'consent',
            ])
            ->redirect();
    }

    public function gmailCallback(Request $request)
    {
        try {
            // Reconfigure Socialite for callback
            config([
                'services.google.client_id' => config('services.email_automation.gmail.client_id'),
                'services.google.client_secret' => config('services.email_automation.gmail.client_secret'),
                'services.google.redirect' => route('emails.callback.gmail'),
            ]);

            // Let Socialite handle state verification automatically
            $googleUser = Socialite::driver('google')->user();

            $email = $googleUser->getEmail();

            if (!$email) {
                Log::error('Gmail OAuth: No email in user info response');
                return redirect()->route('user.library')->with('error', 'Could not retrieve email address from Gmail.');
            }

            // Check if account already exists
            $existingAccount = EmailAccount::where('email_address', $email)
                ->where('user_id', Auth::id())
                ->first();

            if ($existingAccount) {
                return redirect()->route('user.library')->with('error', 'Gmail account already connected.');
            }

            // Create email account with encrypted credentials
            $emailAccount = EmailAccount::create([
                'user_id' => Auth::id(),
                'provider' => 'gmail',
                'email_address' => $email,
                'credentials' => [
                    'access_token' => $googleUser->token,
                    'refresh_token' => $googleUser->refreshToken,
                    'expires_in' => $googleUser->expiresIn ?? 3600,
                    'expires_at' => now()->addSeconds($googleUser->expiresIn ?? 3600),
                ],
                'is_active' => true,
            ]);

            Log::info('Gmail account connected successfully via Socialite', [
                'user_id' => Auth::id(),
                'email' => $email,
                'account_id' => $emailAccount->id,
                'has_refresh_token' => !empty($googleUser->refreshToken),
            ]);

            // Sync emails in background
            $this->emailProviderManager->syncEmails($emailAccount);

            return redirect()->route('user.library')->with('success', 'Gmail account connected successfully!');
        } catch (\Laravel\Socialite\Two\InvalidStateException $e) {
            Log::warning('Gmail OAuth: Invalid state exception - possible CSRF attack or session issue', [
                'user_id' => Auth::id(),
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]);
            return redirect()->route('user.library')->with('error', 'Security validation failed. Please try connecting again.');
        } catch (\Laravel\Socialite\Two\InvalidStateException $e) {
            Log::error('Gmail OAuth: Invalid authorization code', ['user_id' => Auth::id()]);
            return redirect()->route('user.library')->with('error', 'Invalid authorization code. Please try connecting again.');
        } catch (\Exception $e) {
            Log::error('Gmail OAuth callback error: ' . $e->getMessage(), [
                'exception' => $e,
                'user_id' => Auth::id()
            ]);
            return redirect()->route('user.library')->with('error', 'Failed to connect Gmail account. Please try again.');
        }
    }

    /**
     * Connect Outlook account
     * Uses separate email automation OAuth credentials (different from user login)
     */
    public function connectOutlook()
    {
        // Generate OAuth authorization URL using email automation Outlook credentials
        $clientId = config('services.email_automation.outlook.client_id');
        $redirectUri = config('services.email_automation.outlook.redirect_uri');
        $tenantId = config('services.email_automation.outlook.tenant_id', 'common');

        $scopes = [
            'https://graph.microsoft.com/Mail.ReadWrite',
            'https://graph.microsoft.com/Mail.Send',
            'offline_access',
        ];

        $authUrl = 'https://login.microsoftonline.com/' . $tenantId . '/oauth2/v2.0/authorize?' . http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => implode(' ', $scopes),
            'response_mode' => 'query',
            'state' => session()->token(), // CSRF protection
        ]);

        return redirect($authUrl);
    }

    /**
     * Outlook OAuth callback
     * Exchanges authorization code for access token using email automation credentials
     */
    public function outlookCallback(Request $request)
    {
        try {
            // Verify CSRF state token
            if (!$request->has('state') || $request->state !== session()->token()) {
                Log::warning('Outlook OAuth: Invalid state token for user ' . Auth::id());
                return redirect()->route('user.library')->with('error', 'Security validation failed. Please try again.');
            }

            // Handle errors from Microsoft
            if ($request->has('error')) {
                Log::warning('Outlook OAuth error: ' . $request->error . ' - ' . ($request->error_description ?? ''));
                return redirect()->route('user.library')->with('error', 'Outlook connection was cancelled or failed. Please try again.');
            }

            // Check if authorization code exists
            if (!$request->has('code')) {
                return redirect()->route('user.library')->with('error', 'Missing authorization code from Outlook. Please try again.');
            }

            // Exchange authorization code for access token using email automation credentials
            $clientId = config('services.email_automation.outlook.client_id');
            $clientSecret = config('services.email_automation.outlook.client_secret');
            $redirectUri = config('services.email_automation.outlook.redirect_uri');
            $tenantId = config('services.email_automation.outlook.tenant_id', 'common');

            $client = new \GuzzleHttp\Client();
            $tokenResponse = $client->post('https://login.microsoftonline.com/' . $tenantId . '/oauth2/v2.0/token', [
                'form_params' => [
                    'client_id' => $clientId,
                    'client_secret' => $clientSecret,
                    'code' => $request->code,
                    'redirect_uri' => $redirectUri,
                    'grant_type' => 'authorization_code',
                    'scope' => 'https://graph.microsoft.com/.default',
                ],
            ]);

            $tokenData = json_decode($tokenResponse->getBody(), true);

            if (!isset($tokenData['access_token'])) {
                Log::error('Outlook OAuth: No access token in response', $tokenData);
                return redirect()->route('user.library')->with('error', 'Failed to obtain access token from Outlook.');
            }

            // Get user info using access token
            $userResponse = $client->get('https://graph.microsoft.com/v1.0/me', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $tokenData['access_token'],
                ],
            ]);

            $userData = json_decode($userResponse->getBody(), true);
            $email = $userData['userPrincipalName'] ?? $userData['mail'] ?? null;

            if (!$email) {
                Log::error('Outlook OAuth: No email in user info response', $userData);
                return redirect()->route('user.library')->with('error', 'Could not retrieve email address from Outlook.');
            }

            // Check if account already exists
            $existingAccount = EmailAccount::where('email_address', $email)->first();

            if ($existingAccount) {
                return redirect()->route('user.library')->with('error', 'Email account already connected');
            }

            // Create email account with encrypted credentials
            $emailAccount = EmailAccount::create([
                'user_id' => Auth::id(),
                'provider' => 'outlook',
                'email_address' => $email,
                'credentials' => [
                    'access_token' => $tokenData['access_token'],
                    'refresh_token' => $tokenData['refresh_token'] ?? null,
                    'expires_in' => $tokenData['expires_in'] ?? 3600,
                    'expires_at' => now()->addSeconds($tokenData['expires_in'] ?? 3600),
                ],
                'is_active' => true,
            ]);

            Log::info('Outlook account connected successfully', [
                'user_id' => Auth::id(),
                'email' => $email,
                'account_id' => $emailAccount->id,
            ]);

            // Sync emails in background
            $this->emailProviderManager->syncEmails($emailAccount);

            return redirect()->route('user.library')->with('success', 'Outlook account connected successfully');
        } catch (\GuzzleHttp\Exception\ClientException $e) {
            $errorBody = $e->getResponse()->getBody()->getContents();
            Log::error('Outlook OAuth token exchange failed: ' . $errorBody);
            return redirect()->route('user.library')->with('error', 'Failed to authenticate with Outlook. Please try again.');
        } catch (\Exception $e) {
            Log::error('Outlook OAuth callback error: ' . $e->getMessage(), ['exception' => $e]);
            return redirect()->route('user.library')->with('error', 'Failed to connect Outlook account: ' . $e->getMessage());
        }
    }

    /**
     * Connect IMAP account
     */
    public function connectImap(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'host' => 'required',
            'port' => 'required|integer',
            'encryption' => 'nullable|in:ssl,tls',
        ]);

        try {
            // Check if account already exists
            $existingAccount = EmailAccount::where('email_address', $request->email)->first();

            if ($existingAccount) {
                return response()->json(['error' => 'Email account already connected'], 400);
            }

            // Create email account
            $emailAccount = EmailAccount::create([
                'user_id' => Auth::id(),
                'provider' => 'imap',
                'email_address' => $request->email,
                'credentials' => [
                    'password' => $request->password,
                    'host' => $request->host,
                    'port' => $request->port,
                    'encryption' => $request->encryption ?? 'ssl',
                ],
                'is_active' => true,
            ]);

            // Sync emails in background
            $this->emailProviderManager->syncEmails($emailAccount);

            return response()->json(['success' => true, 'message' => 'IMAP account connected successfully']);
        } catch (\Exception $e) {
            Log::error('IMAP connection error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to connect IMAP account'], 500);
        }
    }

    /**
     * Disconnect email account
     */
    public function disconnectAccount($accountId)
    {
        $account = Auth::user()->emailAccounts()->findOrFail($accountId);

        $account->delete();

        return response()->json(['success' => true, 'message' => 'Email account disconnected']);
    }

    /**
     * Get emails for account
     */
    public function getEmails($accountId)
    {
        $account = Auth::user()->emailAccounts()->findOrFail($accountId);

        $emails = $account->emails()
            ->orderBy('received_at', 'desc')
            ->paginate(50);

        return response()->json($emails);
    }

    /**
     * Sync emails for account
     */
    public function syncEmails(Request $request, $accountId)
    {
        $account = Auth::user()->emailAccounts()->findOrFail($accountId);

        $limit = $request->input('limit', 50);
        $since = $request->input('since');

        try {
            $emails = $this->emailProviderManager->syncEmails($account, $limit, $since);

            return response()->json([
                'success' => true,
                'message' => 'Emails synced successfully',
                'emails_count' => $emails->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Email sync error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to sync emails'], 500);
        }
    }

    /**
     * Process email with AI
     */
    public function processEmail($emailId)
    {
        $email = Email::whereHas('emailAccount', function ($query) {
            $query->where('user_id', Auth::id());
        })->findOrFail($emailId);

        try {
            $this->emailAutomationService->processEmail($email);

            return response()->json(['success' => true, 'message' => 'Email processed successfully']);
        } catch (\Exception $e) {
            Log::error('Email processing error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to process email'], 500);
        }
    }

    /**
     * Get email rules
     */
    public function getRules()
    {
        $rules = Auth::user()->emailRules()->with('emailAccount')->get();

        return response()->json($rules);
    }

    /**
     * Create email rule
     */
    public function createRule(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email_account_id' => 'nullable|exists:email_accounts,id',
            'conditions' => 'required|array',
            'actions' => 'required|array',
            'is_active' => 'boolean',
            'priority' => 'integer',
        ]);

        $rule = EmailRule::create([
            'user_id' => Auth::id(),
            'email_account_id' => $request->email_account_id,
            'name' => $request->name,
            'description' => $request->description,
            'conditions' => $request->conditions,
            'actions' => $request->actions,
            'is_active' => $request->is_active ?? true,
            'priority' => $request->priority ?? 0,
        ]);

        return response()->json(['success' => true, 'rule' => $rule]);
    }

    /**
     * Update email rule
     */
    public function updateRule(Request $request, $ruleId)
    {
        $rule = Auth::user()->emailRules()->findOrFail($ruleId);

        $request->validate([
            'name' => 'required|string|max:255',
            'email_account_id' => 'nullable|exists:email_accounts,id',
            'conditions' => 'required|array',
            'actions' => 'required|array',
            'is_active' => 'boolean',
            'priority' => 'integer',
        ]);

        $rule->update($request->only([
            'name',
            'description',
            'email_account_id',
            'conditions',
            'actions',
            'is_active',
            'priority'
        ]));

        return response()->json(['success' => true, 'rule' => $rule]);
    }

    /**
     * Delete email rule
     */
    public function deleteRule($ruleId)
    {
        $rule = Auth::user()->emailRules()->findOrFail($ruleId);

        $rule->delete();

        return response()->json(['success' => true, 'message' => 'Rule deleted successfully']);
    }

    /**
     * Send email response
     */
    public function sendResponse(Request $request, $responseId)
    {
        $response = EmailResponse::whereHas('email.emailAccount', function ($query) {
            $query->where('user_id', Auth::id());
        })->findOrFail($responseId);

        $request->validate([
            'final_response' => 'required|string',
        ]);

        try {
            $response->update([
                'final_response' => $request->final_response,
            ]);

            $this->emailProviderManager->sendEmail(
                $response->email->emailAccount,
                $response->email->from['email'],
                'Re: ' . $response->email->subject,
                $request->final_response,
                $response->email->message_id
            );

            $response->update(['is_sent' => true, 'sent_at' => now()]);

            return response()->json(['success' => true, 'message' => 'Response sent successfully']);
        } catch (\Exception $e) {
            Log::error('Send response error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to send response'], 500);
        }
    }

    /**
     * Show emails for specific account
     */
    // public function showEmails($accountId)
    // {
    //     $account = Auth::user()->emailAccounts()->findOrFail($accountId);
    //     $emails = $account->emails()
    //         ->with('responses')
    //         ->orderBy('received_at', 'desc')
    //         ->paginate(50);

    //     return Inertia::render('Emails/AccountEmails', [
    //         'emailAccount' => $account,
    //         'emails' => $emails,
    //         'user' => Auth::user(),
    //     ]);
    // }

    /**
 * Show email rules management page
 */
    // public function rules()
    // {
    //     $emailAccounts = Auth::user()->emailAccounts;
    //     $emailRules = Auth::user()->emailRules()->with('emailAccount')->get();

    //     return Inertia::render('Emails/Rules', [
    //         'emailAccounts' => $emailAccounts,
    //         'emailRules' => $emailRules,
    //         'user' => Auth::user(),
    //     ]);
    // }
}

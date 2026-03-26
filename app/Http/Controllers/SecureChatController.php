<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Conversation;
use App\Services\SecureGrokApiService;
use App\Services\SearchService;
use App\Services\SubscriptionService;
use App\Services\LimitResponseService;
use App\Services\ChatPersonalizationService;
use App\Services\SecurityAuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SecureChatController extends Controller
{
    protected $secureGrokService;
    protected $searchService;
    protected $subscriptionService;
    protected $securityAuditService;

    public function __construct(
        SecureGrokApiService $secureGrokService,
        SearchService $searchService,
        SubscriptionService $subscriptionService,
        SecurityAuditService $securityAuditService
    ) {
        $this->secureGrokService = $secureGrokService;
        $this->searchService = $searchService;
        $this->subscriptionService = $subscriptionService;
        $this->securityAuditService = $securityAuditService;
    }

    /**
     * Display the main chat interface with enhanced security
     */
    public function index(Request $request)
    {
        // Log access attempt
        $this->securityAuditService->logAccess($request, 'chat_interface');

        // Check user permissions
        if (!$this->hasValidAccess($request)) {
            return $this->unauthorizedResponse();
        }

        $component = match ($request->route()->getName()) {
            'home' => 'welcome',
            'secure.app' => 'chat/interface',
            'secure.new' => 'new',
            default => 'welcome',
        };

        return Inertia::render($component, [
            'security_token' => $this->generateSecurityToken(),
            'session_id' => $this->getSecureSessionId(),
        ]);
    }

    /**
     * Display privacy policy
     */
    public function privacyPolicy(Request $request)
    {
        $this->securityAuditService->logAccess($request, 'privacy_policy');
        return Inertia::render('PrivacyPolicy');
    }

    /**
     * Create a new conversation with enhanced security
     */
    public function create(Request $request)
    {
        try {
            // Enhanced validation
            $validated = $request->validate([
                'title' => 'nullable|string|max:255|regex:/^[a-zA-Z0-9\s\-_\.]+$/',
                'canvas_mode' => 'boolean',
                'context' => 'nullable|array|max:10',
                'context.*' => 'string|max:1000',
                'security_token' => 'required|string'
            ]);

            // Verify security token
            if (!$this->verifySecurityToken($validated['security_token'])) {
                return $this->securityViolationResponse('Invalid security token');
            }

            // Rate limiting
            $rateLimitKey = 'conversation_create:' . Auth::id();
            if (!RateLimiter::attempt($rateLimitKey, 5, function() {}, 300)) {
                return response()->json([
                    'error' => 'Too many conversation creation attempts'
                ], 429);
            }

            // Check subscription limits
            if (!$this->subscriptionService->canCreateConversation(Auth::user())) {
                return response()->json([
                    'error' => 'Conversation limit reached for your subscription'
                ], 403);
            }

            $title = $validated['title'] ?? 'New Chat';
            $canvasMode = $validated['canvas_mode'] ?? false;
            $context = $this->sanitizeContext($validated['context'] ?? []);

            $conversation = Conversation::create([
                'id' => Str::uuid(),
                'user_id' => Auth::id(),
                'title' => $title,
                'canvas_mode' => $canvasMode,
                'context' => $context,
                'security_hash' => $this->generateConversationHash(),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Log security event
            $this->securityAuditService->logConversationCreated($conversation, $request);

            // Set as active conversation if first one
            $conversationsCount = Conversation::where('user_id', Auth::id())->count();
            if ($conversationsCount === 1) {
                session(['current_conversation_id' => $conversation->id]);
            }

            return response()->json([
                'success' => true,
                'conversation' => [
                    'id' => $conversation->id,
                    'title' => $conversation->title,
                    'canvas_mode' => $conversation->canvas_mode,
                    'created_at' => $conversation->created_at->toISOString()
                ],
                'message' => 'Conversation created successfully',
                'security_token' => $this->generateSecurityToken()
            ]);

        } catch (ValidationException $e) {
            $this->securityAuditService->logValidationFailure($request, $e->errors());
            return response()->json([
                'error' => 'Validation failed',
                'details' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Secure conversation creation failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $this->securityAuditService->logError($request, 'conversation_creation_failed', $e);

            return response()->json([
                'error' => 'Failed to create conversation'
            ], 500);
        }
    }

    /**
     * Show a specific conversation with enhanced security
     */
    public function show(Request $request, string $conversationUuid)
    {
        try {
            // Validate UUID format
            if (!$this->isValidUuid($conversationUuid)) {
                return $this->invalidParameterResponse();
            }

            $conversation = Conversation::where('id', $conversationUuid)
                ->where('user_id', Auth::id())
                ->first();

            if (!$conversation) {
                $this->securityAuditService->logUnauthorizedAccess($request, 'conversation', $conversationUuid);
                return response()->json(['error' => 'Conversation not found'], 404);
            }

            // Verify conversation integrity
            if (!$this->verifyConversationIntegrity($conversation)) {
                $this->securityAuditService->logIntegrityViolation($request, 'conversation', $conversationUuid);
                return $this->integrityViolationResponse();
            }

            $conversation->load(['chats' => function ($query) {
                $query->orderBy('created_at', 'asc')
                      ->with('files')
                      ->select(['id', 'conversation_id', 'message', 'response', 'role', 'created_at', 'updated_at']);
            }]);

            // Log access
            $this->securityAuditService->logConversationAccess($conversation, $request);

            // Set as current conversation
            session(['current_conversation_id' => $conversation->id]);

            return Inertia::render('chat/interface', [
                'conversation' => [
                    'id' => $conversation->id,
                    'title' => $conversation->title,
                    'canvas_mode' => $conversation->canvas_mode,
                    'chats' => $conversation->chats,
                    'created_at' => $conversation->created_at->toISOString()
                ],
                'security_token' => $this->generateSecurityToken(),
                'session_id' => $this->getSecureSessionId()
            ]);

        } catch (\Exception $e) {
            Log::error('Secure conversation access failed', [
                'user_id' => Auth::id(),
                'conversation_uuid' => $conversationUuid,
                'error' => $e->getMessage()
            ]);

            return response()->json(['error' => 'Failed to load conversation'], 500);
        }
    }

    /**
     * Send a message with enhanced security
     */
    public function chat(Request $request)
    {
        try {
            // Enhanced validation
            $validated = $request->validate([
                'message' => 'required|string|max:10000',
                'conversation_id' => 'required|uuid',
                'files' => 'nullable|array|max:5',
                'files.*' => 'file|max:10240|mimes:txt,pdf,doc,docx,jpg,jpeg,png,gif',
                'security_token' => 'required|string',
                'session_id' => 'required|string'
            ]);

            // Verify security tokens
            if (!$this->verifySecurityToken($validated['security_token']) ||
                !$this->verifySessionId($validated['session_id'])) {
                return $this->securityViolationResponse('Invalid security credentials');
            }

            // Enhanced rate limiting
            $rateLimitKey = 'chat_message:' . Auth::id();
            if (!RateLimiter::attempt($rateLimitKey, 30, function() {}, 60)) {
                return response()->json(['error' => 'Rate limit exceeded'], 429);
            }

            // Verify conversation ownership
            $conversation = Conversation::where('id', $validated['conversation_id'])
                ->where('user_id', Auth::id())
                ->first();

            if (!$conversation) {
                $this->securityAuditService->logUnauthorizedAccess($request, 'conversation', $validated['conversation_id']);
                return response()->json(['error' => 'Conversation not found'], 404);
            }

            // Content security checks
            $message = $this->sanitizeMessage($validated['message']);
            if (!$this->isMessageSafe($message)) {
                $this->securityAuditService->logUnsafeContent($request, $message);
                return response()->json(['error' => 'Message contains unsafe content'], 400);
            }

            // Check subscription limits
            if (!$this->subscriptionService->canSendMessage(Auth::user())) {
                return response()->json(['error' => 'Message limit reached'], 403);
            }

            // Process files securely
            $fileData = [];
            if (!empty($validated['files'])) {
                $fileData = $this->processFilesSecurely($validated['files']);
            }

            // Create chat record
            $chat = Chat::create([
                'id' => Str::uuid(),
                'conversation_id' => $conversation->id,
                'user_id' => Auth::id(),
                'message' => $message,
                'role' => 'user',
                'files' => $fileData,
                'security_hash' => $this->generateMessageHash($message),
                'created_at' => now()
            ]);

            // Log message creation
            $this->securityAuditService->logMessageSent($chat, $request);

            // Get AI response securely
            $response = $this->secureGrokService->generateSecureResponse(
                $message,
                $conversation,
                $fileData,
                Auth::user()
            );

            // Create AI response record
            $aiChat = Chat::create([
                'id' => Str::uuid(),
                'conversation_id' => $conversation->id,
                'user_id' => Auth::id(),
                'message' => $response['content'],
                'role' => 'assistant',
                'metadata' => $response['metadata'] ?? [],
                'security_hash' => $this->generateMessageHash($response['content']),
                'created_at' => now()
            ]);

            // Update conversation
            $conversation->update([
                'updated_at' => now(),
                'last_message_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'chat' => [
                    'id' => $chat->id,
                    'message' => $chat->message,
                    'role' => $chat->role,
                    'created_at' => $chat->created_at->toISOString()
                ],
                'response' => [
                    'id' => $aiChat->id,
                    'message' => $aiChat->message,
                    'role' => $aiChat->role,
                    'created_at' => $aiChat->created_at->toISOString()
                ],
                'security_token' => $this->generateSecurityToken()
            ]);

        } catch (ValidationException $e) {
            $this->securityAuditService->logValidationFailure($request, $e->errors());
            return response()->json([
                'error' => 'Validation failed',
                'details' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Secure chat failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $this->securityAuditService->logError($request, 'chat_failed', $e);

            return response()->json(['error' => 'Failed to process message'], 500);
        }
    }

    /**
     * List conversations with enhanced security
     */
    public function list(Request $request)
    {
        try {
            $conversations = Conversation::where('user_id', Auth::id())
                ->select(['id', 'title', 'canvas_mode', 'created_at', 'updated_at', 'last_message_at'])
                ->orderBy('updated_at', 'desc')
                ->paginate(20);

            $this->securityAuditService->logConversationsList($request);

            return response()->json([
                'conversations' => $conversations->items(),
                'pagination' => [
                    'current_page' => $conversations->currentPage(),
                    'last_page' => $conversations->lastPage(),
                    'total' => $conversations->total()
                ],
                'security_token' => $this->generateSecurityToken()
            ]);

        } catch (\Exception $e) {
            Log::error('Secure conversation list failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json(['error' => 'Failed to load conversations'], 500);
        }
    }

    // Security helper methods

    private function hasValidAccess(Request $request): bool
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return false;
        }

        // Check if user account is active
        $user = Auth::user();
        if (!$user->is_active || $user->is_suspended) {
            return false;
        }

        // Check session validity
        if (!$this->isValidSession($request)) {
            return false;
        }

        return true;
    }

    private function generateSecurityToken(): string
    {
        $token = Str::random(32);
        Cache::put('security_token:' . Auth::id() . ':' . $token, true, 300); // 5 minutes
        return $token;
    }

    private function verifySecurityToken(string $token): bool
    {
        $key = 'security_token:' . Auth::id() . ':' . $token;
        return Cache::has($key);
    }

    private function getSecureSessionId(): string
    {
        return hash('sha256', session()->getId() . Auth::id() . config('app.key'));
    }

    private function verifySessionId(string $sessionId): bool
    {
        return hash_equals($this->getSecureSessionId(), $sessionId);
    }

    private function isValidSession(Request $request): bool
    {
        // Check session age
        $sessionStart = session('session_start', now());
        if (now()->diffInHours($sessionStart) > 24) {
            return false;
        }

        // Check IP consistency (optional, can be disabled for mobile users)
        $sessionIp = session('session_ip');
        if ($sessionIp && $sessionIp !== $request->ip()) {
            // Log potential session hijacking
            Log::warning('Session IP mismatch detected', [
                'user_id' => Auth::id(),
                'session_ip' => $sessionIp,
                'request_ip' => $request->ip()
            ]);
        }

        return true;
    }

    private function isValidUuid(string $uuid): bool
    {
        return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $uuid);
    }

    private function sanitizeMessage(string $message): string
    {
        // Remove potentially dangerous content
        $message = strip_tags($message);
        $message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
        return trim($message);
    }

    private function isMessageSafe(string $message): bool
    {
        // Check for malicious patterns
        $dangerousPatterns = [
            '/javascript:/i',
            '/vbscript:/i',
            '/<script/i',
            '/eval\s*\(/i',
            '/expression\s*\(/i',
            '/document\./i',
            '/window\./i',
        ];

        foreach ($dangerousPatterns as $pattern) {
            if (preg_match($pattern, $message)) {
                return false;
            }
        }

        return true;
    }

    private function sanitizeContext(array $context): array
    {
        return array_map(function($item) {
            return is_string($item) ? $this->sanitizeMessage($item) : $item;
        }, $context);
    }

    private function generateConversationHash(): string
    {
        return hash('sha256', Auth::id() . now()->timestamp . Str::random(16));
    }

    private function generateMessageHash(string $message): string
    {
        return hash('sha256', $message . Auth::id() . now()->timestamp);
    }

    private function verifyConversationIntegrity(Conversation $conversation): bool
    {
        // Verify conversation belongs to authenticated user
        if ($conversation->user_id !== Auth::id()) {
            return false;
        }

        // Additional integrity checks can be added here
        return true;
    }

    private function processFilesSecurely(array $files): array
    {
        $processedFiles = [];

        foreach ($files as $file) {
            // Validate file type and size
            if (!$this->isFileSecure($file)) {
                continue;
            }

            // Store file securely
            $path = $file->store('secure_uploads/' . Auth::id(), 'private');

            $processedFiles[] = [
                'id' => Str::uuid(),
                'original_name' => $file->getClientOriginalName(),
                'path' => $path,
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'hash' => hash_file('sha256', $file->getRealPath())
            ];
        }

        return $processedFiles;
    }

    private function isFileSecure($file): bool
    {
        // Check file size (10MB max)
        if ($file->getSize() > 10 * 1024 * 1024) {
            return false;
        }

        // Check allowed mime types
        $allowedMimes = [
            'text/plain',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/gif'
        ];

        return in_array($file->getMimeType(), $allowedMimes);
    }

    // Response helper methods

    private function unauthorizedResponse()
    {
        return response()->json(['error' => 'Unauthorized access'], 401);
    }

    private function securityViolationResponse(string $message = 'Security violation detected')
    {
        return response()->json(['error' => $message], 403);
    }

    private function invalidParameterResponse()
    {
        return response()->json(['error' => 'Invalid request parameters'], 400);
    }

    private function integrityViolationResponse()
    {
        return response()->json(['error' => 'Data integrity violation detected'], 403);
    }
}

<?php

namespace App\Http\Controllers\Meta;

use App\Http\Controllers\Controller;
use App\Models\MetaAccount;
use App\Models\MetaAutomationPreference;
use App\Models\MetaMessageDraft;
use App\Services\MetaApiService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Illuminate\Support\Carbon;

class MetaAccountController extends Controller
{
    use AuthorizesRequests;

    private MetaApiService $metaService;

    public function __construct(MetaApiService $metaService)
    {
        // $this->middleware('auth');
        $this->metaService = $metaService;
    }

    /**
     * Show Meta dashboard
     */
    public function dashboard()
    {
        $user = Auth::user();

        // Check subscription access (Meta available on Pro and above)
        $currentPlan = $user->getCurrentPlan();
        $canAccessMeta = $currentPlan && $currentPlan->tier !== 'free';

        if (!$canAccessMeta) {
            $payload = [
                'accounts' => [],
                'stats' => [],
                'canAccessMeta' => false,
                'subscriptionTier' => $currentPlan?->tier ?? 'free',
            ];

            return response()->json($payload);
        }

        $accounts = MetaAccount::where('user_id', $user->id)
            ->with('preferences')
            ->get()
            ->map(function ($account) {
                $messageCount = $account->messages()->count();
                $conversationCount = $account->conversations()->count();
                $unreadCount = $account->conversations()->sum('unread_count');
                $latestDraft = MetaMessageDraft::query()
                    ->whereIn('meta_conversation_id', $account->conversations()->pluck('id'))
                    ->latest()
                    ->first();

                return [
                    'id' => $account->id,
                    'platform' => $account->platform,
                    'account_id' => $account->account_id,
                    'account_name' => $account->account_name,
                    'account_email' => $account->account_email,
                    'profile_picture_url' => $account->profile_picture_url,
                    'is_business_account' => $account->is_business_account,
                    'is_active' => $account->is_active,
                    'last_sync_at' => $account->last_sync_at,
                    'message_count' => $messageCount,
                    'conversation_count' => $conversationCount,
                    'unread_count' => $unreadCount,
                    'preferences' => $account->preferences?->only([
                        'enable_auto_reply',
                        'enable_message_analysis',
                        'require_approval_before_send',
                        'reply_tone',
                    ]),
                    'latest_ai_insight' => $this->formatDraftInsight($latestDraft),
                ];
            });

        // Calculate stats
        $userAccountIds = MetaAccount::where('user_id', $user->id)->pluck('id');

        $stats = [
            'total_accounts' => $accounts->count(),
            'total_conversations' => $accounts->sum('conversation_count'),
            'total_messages' => $accounts->sum('message_count'),
            'auto_replies_sent' => \App\Models\MetaMessageDraft::whereIn('meta_conversation_id',
                \App\Models\MetaConversation::whereIn('meta_account_id', $userAccountIds)->pluck('id'))
                ->where('status', 'sent')
                ->where('auto_approved', true)
                ->count(),
            'pending_drafts' => \App\Models\MetaMessageDraft::whereIn('meta_conversation_id',
                \App\Models\MetaConversation::whereIn('meta_account_id', $userAccountIds)->pluck('id'))
                ->where('status', 'draft')
                ->count(),
        ];

        $payload = [
            'accounts' => $accounts,
            'stats' => $stats,
            'canAccessMeta' => true,
            'subscriptionTier' => $currentPlan->tier,
        ];

        return response()->json($payload);
    }

    private function formatDraftInsight(?MetaMessageDraft $draft): ?array
    {
        if (! $draft) {
            return null;
        }

        $analysis = $draft->ai_analysis;

        if (is_string($analysis)) {
            $decoded = json_decode($analysis, true);
            $analysis = json_last_error() === JSON_ERROR_NONE ? $decoded : null;
        }

        if (! is_array($analysis)) {
            return null;
        }

        return [
            'intent' => $analysis['intent'] ?? null,
            'priority' => $analysis['priority'] ?? null,
            'reply_goal' => $analysis['reply_goal'] ?? null,
            'key_points' => array_slice(array_values(array_filter($analysis['key_points'] ?? [], fn ($value) => is_string($value) && trim($value) !== '')), 0, 2),
            'memory_hits' => $analysis['trace']['memory_hits'] ?? count($analysis['memory'] ?? []),
            'status' => $draft->status,
            'confidence_score' => $draft->confidence_score,
            'sentiment' => $draft->sentiment,
            'category' => $draft->category,
        ];
    }

    /**
     * Show Meta accounts management
     */
    public function index()
    {
        $user = Auth::user();
        $accounts = MetaAccount::where('user_id', $user->id)
            ->with('preferences')
            ->get()
            ->map(function ($account) {
                return [
                    'id' => $account->id,
                    'platform' => $account->platform,
                    'account_id' => $account->account_id,
                    'account_name' => $account->account_name,
                    'account_email' => $account->account_email,
                    'profile_picture_url' => $account->profile_picture_url,
                    'is_business_account' => $account->is_business_account,
                    'is_active' => $account->is_active,
                    'last_sync_at' => $account->last_sync_at,
                    'created_at' => $account->created_at,
                    'conversation_count' => $account->conversations()->count(),
                    'unread_count' => $account->conversations()->sum('unread_count'),
                    'preferences' => $account->preferences?->only([
                        'enable_auto_reply',
                        'enable_message_analysis',
                        'require_approval_before_send',
                        'reply_tone',
                    ]),
                ];
            });

        $currentPlan = $user->getCurrentPlan();

        $payload = [
            'accounts' => $accounts,
            'canAccessMeta' => $currentPlan && $currentPlan->tier !== 'free',
        ];

        return response()->json($payload);
    }

    /**
     * Start OAuth flow for platform
     */
    public function initiateOAuth(Request $request)
    {
        $validated = $request->validate([
            'platform' => 'required|in:facebook,instagram,whatsapp',
        ]);

        $user = $request->user();

        if (!$user) {
            abort(401, 'Authentication required.');
        }

        $redirectUri = route('meta.oauth.callback');
        $state = $this->encodeOAuthState($user, $validated['platform']);
        $authUrl = $this->metaService->getOAuthUrl($validated['platform'], $redirectUri, state: $state);

        if ($request->expectsJson()) {
            return response()->json(['oauth_url' => $authUrl]);
        }

        return redirect($authUrl);
    }

    /**
     * Handle OAuth callback
     */
    public function handleCallback(Request $request)
    {
        $code = $request->get('code');
        $error = $request->get('error');
        $stateData = $this->decodeOAuthState($request->string('state')->toString());
        $user = $stateData['user'] ?? Auth::user();
        $platform = $stateData['platform'] ?? 'facebook';

        if ($error) {
            Log::error('Meta OAuth callback error', ['error' => $error]);
            return redirect('/meta?status=error&message=' . urlencode('OAuth error: ' . $error));
        }

        if (!$code) {
            Log::error('Meta OAuth callback missing code');
            return redirect('/meta?status=error&message=' . urlencode('No authorization code received'));
        }

        if (!$user) {
            Log::error('Meta OAuth callback missing user context');
            return redirect('/meta?status=error&message=' . urlencode('Your login session could not be verified. Start the Meta connection again from the dashboard.'));
        }

        try {
            // Exchange code for token
            $tokenData = $this->metaService->exchangeCodeForToken($code, route('meta.oauth.callback'));

            if (!$tokenData || !isset($tokenData['access_token'])) {
                Log::error('Meta OAuth token exchange failed', ['response' => $tokenData]);
                return redirect('/meta?status=error&message=' . urlencode('Failed to obtain access token'));
            }

            // Use the new getUserAccounts method or individual methods
            $accountDetails = $this->fetchAccountDetails($platform, $tokenData['access_token']);

            if (!$accountDetails || empty($accountDetails)) {
                Log::error('Failed to fetch account details', [
                    'platform' => $platform,
                    'token_has_data' => !empty($tokenData)
                ]);
                return redirect('/meta?status=error&message=' . urlencode('Failed to fetch account details for ' . $platform));
            }

            $createdAccounts = [];

            // Create or update Meta account
            foreach ($accountDetails as $account) {
                $metaAccount = MetaAccount::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'platform' => $platform,
                        'account_id' => $account['account_id'],
                    ],
                    [
                        'access_token' => Crypt::encryptString($tokenData['access_token']),
                        'access_token_encrypted' => Crypt::encryptString($tokenData['access_token']),
                        'refresh_token' => isset($tokenData['refresh_token']) ? Crypt::encryptString($tokenData['refresh_token']) : null,
                        'account_name' => $account['account_name'],
                        'account_email' => $account['account_email'] ?? null,
                        'profile_picture_url' => $account['profile_picture_url'] ?? null,
                        'is_business_account' => $account['is_business_account'] ?? false,
                        'page_id' => $account['page_id'] ?? null,
                        'token_expires_at' => isset($tokenData['expires_in']) ? now()->addSeconds($tokenData['expires_in']) : null,
                        'platform_data' => $account['platform_data'] ?? null,
                        'is_active' => true,
                    ]
                );

                // Create default preferences if they don't exist
                MetaAutomationPreference::firstOrCreate([
                    'user_id' => $user->id,
                    'meta_account_id' => $metaAccount->id,
                ], [
                    'enable_auto_reply' => false,
                    'enable_message_analysis' => true,
                    'require_approval_before_send' => true,
                    'reply_tone' => 'professional',
                ]);

                $createdAccounts[] = $account['account_name'];
            }

            // Log successful connection
            $this->metaService->logActivity(
                $user->id,
                $metaAccount->id ?? null,
                'account_connected',
                "Connected {$platform} account: " . implode(', ', $createdAccounts),
                [
                    'platform' => $platform,
                    'accounts_count' => count($createdAccounts),
                    'account_names' => $createdAccounts,
                ]
            );

            return redirect('/meta?status=success&message=' . urlencode(
                count($createdAccounts) . ' ' . $platform . ' account(s) connected successfully!'
            ));

        } catch (\Exception $e) {
            Log::error('Meta OAuth callback exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect('/meta?status=error&message=' . urlencode(
                'Failed to connect account: ' . $e->getMessage()
            ));
        }
    }

    /**
     * Fetch account details based on platform - UPDATED WITH CORRECT METHOD NAMES
     */
    private function fetchAccountDetails(string $platform, string $accessToken): ?array
    {
        try {
            Log::info('Fetching account details for platform', ['platform' => $platform]);

            $accounts = match ($platform) {
                'facebook' => $this->metaService->getUserPages($accessToken),
                'instagram' => $this->metaService->getInstagramAccounts($accessToken),
                'whatsapp' => $this->metaService->getWhatsAppBusinessAccounts($accessToken), // CORRECTED: plural method name
                default => null,
            };

            Log::info('Account details fetched', [
                'platform' => $platform,
                'accounts_count' => $accounts ? count($accounts) : 0,
                'accounts' => $accounts ? array_map(fn($acc) => $acc['account_name'] ?? 'Unknown', $accounts) : []
            ]);

            return $accounts;

        } catch (\Exception $e) {
            Log::error('Failed to fetch account details', [
                'platform' => $platform,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Alternative method to get all accounts at once
     */
    private function fetchAllAccountDetails(string $accessToken): array
    {
        try {
            return $this->metaService->getUserAccounts($accessToken);
        } catch (\Exception $e) {
            Log::error('Failed to fetch all account details', ['error' => $e->getMessage()]);
            return [];
        }
    }

    private function encodeOAuthState(User $user, string $platform): string
    {
        return Crypt::encryptString(json_encode([
            'user_id' => $user->id,
            'platform' => $platform,
            'issued_at' => now()->timestamp,
        ], JSON_THROW_ON_ERROR));
    }

    private function decodeOAuthState(?string $state): array
    {
        if (!$state) {
            return [];
        }

        try {
            $payload = json_decode(Crypt::decryptString($state), true, 512, JSON_THROW_ON_ERROR);
        } catch (\Throwable $e) {
            Log::warning('Meta OAuth state decode failed', ['error' => $e->getMessage()]);
            return [];
        }

        $userId = $payload['user_id'] ?? null;
        $platform = $payload['platform'] ?? null;
        $issuedAt = (int) ($payload['issued_at'] ?? 0);

        if (!$userId || !in_array($platform, ['facebook', 'instagram', 'whatsapp'], true)) {
            return [];
        }

        if ($issuedAt > 0 && Carbon::createFromTimestamp($issuedAt)->diffInMinutes(now()) > 30) {
            Log::warning('Meta OAuth state expired', ['user_id' => $userId, 'platform' => $platform]);
            return [];
        }

        $user = User::find($userId);

        if (!$user) {
            return [];
        }

        return [
            'user' => $user,
            'platform' => $platform,
        ];
    }

    /**
     * Disconnect a Meta account
     */
    public function disconnect(MetaAccount $account)
    {
        $this->authorize('delete', $account);

        try {
            $accountName = $account->account_name;
            $platform = $account->platform;

            $account->delete();

            // Log disconnection activity
            $this->metaService->logActivity(
                Auth::id(),
                $account->id,
                'account_disconnected',
                "Disconnected {$platform} account: {$accountName}",
                [
                    'platform' => $platform,
                    'account_name' => $accountName,
                ]
            );

            if (request()->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Account disconnected successfully',
                ]);
            }

            return redirect('/meta?status=success&message=' . urlencode('Account disconnected successfully'));

        } catch (\Exception $e) {
            Log::error('Failed to disconnect Meta account', [
                'account_id' => $account->id,
                'error' => $e->getMessage()
            ]);

            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to disconnect account',
                ], 500);
            }

            return redirect('/meta?status=error&message=' . urlencode('Failed to disconnect account'));
        }
    }

    /**
     * Update account status
     */
    public function updateStatus(MetaAccount $account, Request $request)
    {
        $this->authorize('update', $account);

        $validated = $request->validate([
            'is_active' => 'required|boolean',
        ]);

        try {
            $account->update($validated);

            // Log status change
            $this->metaService->logActivity(
                Auth::id(),
                $account->id,
                'account_status_updated',
                "Updated account status to: " . ($validated['is_active'] ? 'active' : 'inactive'),
                [
                    'platform' => $account->platform,
                    'account_name' => $account->account_name,
                    'new_status' => $validated['is_active'],
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Account status updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update account status', [
                'account_id' => $account->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update account status'
            ], 500);
        }
    }

    /**
     * Test connection to Meta account
     */
    public function testConnection(MetaAccount $account)
    {
        $this->authorize('view', $account);

        try {
            // Try to fetch recent messages to test connection
            $messages = $this->metaService->fetchConversationMessages($account, $account->account_id, 1);

            if ($messages !== null) {
                // Log successful connection test
                $this->metaService->logActivity(
                    Auth::id(),
                    $account->id,
                    'connection_test_success',
                    "Successfully tested connection to {$account->platform} account",
                    [
                        'platform' => $account->platform,
                        'account_name' => $account->account_name,
                    ]
                );

                return response()->json([
                    'success' => true,
                    'message' => 'Connection successful'
                ]);
            }

            // Log failed connection test
            $this->metaService->logActivity(
                Auth::id(),
                $account->id,
                'connection_test_failed',
                "Failed to test connection to {$account->platform} account",
                [
                    'platform' => $account->platform,
                    'account_name' => $account->account_name,
                ],
                'No messages returned from API'
            );

            return response()->json([
                'success' => false,
                'message' => 'Connection failed - no data returned'
            ], 400);

        } catch (\Throwable $e) {
            Log::error('Meta account connection test failed', [
                'account_id' => $account->id,
                'error' => $e->getMessage()
            ]);

            // Log connection test error
            $this->metaService->logActivity(
                Auth::id(),
                $account->id,
                'connection_test_error',
                "Error testing connection to {$account->platform} account",
                [
                    'platform' => $account->platform,
                    'account_name' => $account->account_name,
                ],
                $e->getMessage()
            );

            return response()->json([
                'success' => false,
                'message' => 'Connection test failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function webhookInfo(MetaAccount $account)
    {
        $this->authorize('view', $account);

        $verifyToken = (string) config('services.meta.webhook_verify_token');

        return response()->json([
            'webhook_url' => url('/meta/webhook/receive/' . $verifyToken),
            'verify_token' => $verifyToken,
            'platform' => $account->platform,
        ]);
    }

    /**
     * Refresh account token if needed
     */
    public function refreshToken(MetaAccount $account)
    {
        $this->authorize('update', $account);

        try {
            $result = $this->metaService->refreshAccessToken($account);

            if ($result) {
                // Log token refresh
                $this->metaService->logActivity(
                    Auth::id(),
                    $account->id,
                    'token_refreshed',
                    "Successfully refreshed access token",
                    [
                        'platform' => $account->platform,
                        'account_name' => $account->account_name,
                    ]
                );

                return response()->json([
                    'success' => true,
                    'message' => 'Token refreshed successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to refresh token'
            ], 400);

        } catch (\Exception $e) {
            Log::error('Failed to refresh token', [
                'account_id' => $account->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Token refresh failed: ' . $e->getMessage()
            ], 500);
        }
    }
}

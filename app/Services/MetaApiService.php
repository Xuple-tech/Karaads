<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\ServerException;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Cache;
use App\Models\MetaAccount;
use App\Models\MetaMessage;
use App\Models\MetaConversation;
use App\Models\MetaAutomationLog;

class MetaApiService
{
    private Client $client;
    private string $apiVersion = 'v18.0';
    private array $platformConfig;
    private array $rateLimitStats = [];

    public function __construct()
    {
        $verifySsl = config('services.meta.verify_ssl');

        $this->client = new Client([
            'timeout' => 30,
            'connect_timeout' => 10,
            'http_errors' => true,
            'verify' => is_null($verifySsl) ? !app()->environment('local') : filter_var($verifySsl, FILTER_VALIDATE_BOOL),
        ]);

        $this->platformConfig = [
            'facebook' => [
                'base_url' => 'https://graph.facebook.com',
                'api_path' => $this->apiVersion,
            ],
            'instagram' => [
                'base_url' => 'https://graph.instagram.com',
                'api_path' => $this->apiVersion,
            ],
            'whatsapp' => [
                'base_url' => 'https://graph.facebook.com',
                'api_path' => $this->apiVersion,
            ],
        ];
    }

    /**
     * Generate Meta OAuth authorization URL
     */
    public function getOAuthUrl(string $platform, string $redirectUri, array $additionalScopes = [], ?string $state = null): string
    {
        $clientId = config('services.meta.client_id');
        $scopes = array_merge($this->getScopeForPlatform($platform), $additionalScopes);

        $params = [
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'scope' => implode(',', array_unique($scopes)),
            'response_type' => 'code',
            'state' => $state ?: $this->generateStateParameter(),
            'auth_type' => 'rerequest',
        ];

        return "https://www.facebook.com/{$this->apiVersion}/dialog/oauth?" . http_build_query($params);
    }

    /**
     * Exchange OAuth code for access token
     */
    public function exchangeCodeForToken(string $code, string $redirectUri): ?array
    {
        $cacheKey = "meta_token_exchange_{$code}";

        return Cache::remember($cacheKey, 300, function () use ($code, $redirectUri) {
            try {
                $response = $this->retryableRequest(function () use ($code, $redirectUri) {
                    return $this->client->post('https://graph.facebook.com/v18.0/oauth/access_token', [
                        'form_params' => [
                            'client_id' => config('services.meta.client_id'),
                            'client_secret' => config('services.meta.client_secret'),
                            'redirect_uri' => $redirectUri,
                            'code' => $code,
                        ],
                    ]);
                }, 'Token Exchange');

                $data = json_decode((string) $response->getBody(), true);

                if (!isset($data['access_token'])) {
                    Log::error('Token exchange failed: No access token in response', ['response' => $data]);
                    return null;
                }

                // Get token details for debugging
                $tokenInfo = $this->debugToken($data['access_token']);

                if ($tokenInfo && isset($tokenInfo['data'])) {
                    $data['token_info'] = $tokenInfo['data'];
                }

                Log::info('Token exchange successful', [
                    'token_type' => $data['token_type'] ?? 'unknown',
                    'expires_in' => $data['expires_in'] ?? 'unknown',
                    'scopes' => $tokenInfo['data']['scopes'] ?? [],
                ]);

                return $data;
            } catch (ClientException | ServerException $e) {
                $response = $e->getResponse();
                $errorBody = json_decode((string) $response->getBody(), true);

                Log::error('Meta OAuth token exchange failed', [
                    'status_code' => $response->getStatusCode(),
                    'error' => $errorBody['error'] ?? $e->getMessage(),
                    'client_id' => config('services.meta.client_id'),
                ]);

                return null;
            } catch (\Exception $e) {
                Log::error('Unexpected error during token exchange', [
                    'error' => $e->getMessage(),
                ]);
                return null;
            }
        });
    }

    /**
     * Get long-lived access token
     */
    public function getLongLivedToken(string $shortLivedToken): ?array
    {
        try {
            $response = $this->retryableRequest(function () use ($shortLivedToken) {
                return $this->client->get('https://graph.facebook.com/v18.0/oauth/access_token', [
                    'query' => [
                        'grant_type' => 'fb_exchange_token',
                        'client_id' => config('services.meta.client_id'),
                        'client_secret' => config('services.meta.client_secret'),
                        'fb_exchange_token' => $shortLivedToken,
                    ],
                ]);
            }, 'Long-lived Token Exchange');

            return json_decode((string) $response->getBody(), true);
        } catch (\Exception $e) {
            Log::error('Failed to get long-lived token', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Get user accounts for all platforms
     */
    public function getUserAccounts(string $accessToken): array
    {
        $accounts = [];

        try {
            // Get Facebook Pages
            $pages = $this->getUserPages($accessToken);
            if ($pages) {
                $accounts['facebook'] = $pages;
            }

            // Get Instagram Accounts
            $instagramAccounts = $this->getInstagramAccounts($accessToken);
            if ($instagramAccounts) {
                $accounts['instagram'] = $instagramAccounts;
            }

            // Get WhatsApp Business Accounts
            $whatsappAccounts = $this->getWhatsAppBusinessAccounts($accessToken);
            if ($whatsappAccounts) {
                $accounts['whatsapp'] = $whatsappAccounts;
            }

            // Get user profile info
            $userProfile = $this->getUserProfile($accessToken);
            if ($userProfile) {
                $accounts['user'] = $userProfile;
            }

            return $accounts;
        } catch (\Exception $e) {
            Log::error('Failed to get user accounts', ['error' => $e->getMessage()]);
            return $accounts;
        }
    }

    /**
     * Get Facebook pages
     */
    public function getUserPages(string $accessToken): ?array
    {
        try {
            $response = $this->retryableRequest(function () use ($accessToken) {
                return $this->client->get('https://graph.facebook.com/v18.0/me/accounts', [
                    'query' => [
                        'access_token' => $accessToken,
                        'fields' => 'id,name,access_token,picture,category,instagram_business_account{id,username},whatsapp_business_accounts{id,name}',
                        'limit' => 100,
                    ],
                ]);
            }, 'Get User Pages');

            $data = json_decode((string) $response->getBody(), true);
            $pages = $data['data'] ?? [];

            return array_map(function ($page) {
                $instagramAccount = $page['instagram_business_account'] ?? null;
                $whatsappAccounts = $page['whatsapp_business_accounts']['data'] ?? [];

                return [
                    'account_id' => $page['id'],
                    'account_name' => $page['name'],
                    'access_token' => $page['access_token'] ?? null,
                    'profile_picture_url' => $page['picture']['data']['url'] ?? null,
                    'category' => $page['category'] ?? null,
                    'is_business_account' => true,
                    'platform' => 'facebook',
                    'instagram_business_account' => $instagramAccount,
                    'whatsapp_business_accounts' => $whatsappAccounts,
                    'platform_data' => $page,
                ];
            }, $pages);
        } catch (\Exception $e) {
            Log::error('Failed to get user pages', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Get Instagram accounts
     */
    public function getInstagramAccounts(string $accessToken): ?array
    {
        try {
            $response = $this->retryableRequest(function () use ($accessToken) {
                return $this->client->get('https://graph.instagram.com/v18.0/me', [
                    'query' => [
                        'access_token' => $accessToken,
                        'fields' => 'id,username,name,biography,profile_picture_url,followers_count,website,media_count',
                    ],
                ]);
            }, 'Get Instagram Accounts');

            $data = json_decode((string) $response->getBody(), true);

            if (empty($data['id'])) {
                return null;
            }

            return [[
                'account_id' => $data['id'],
                'account_name' => $data['username'] ?? $data['name'] ?? 'Instagram Account',
                'profile_picture_url' => $data['profile_picture_url'] ?? null,
                'biography' => $data['biography'] ?? null,
                'followers_count' => $data['followers_count'] ?? 0,
                'website' => $data['website'] ?? null,
                'media_count' => $data['media_count'] ?? 0,
                'is_business_account' => false,
                'platform' => 'instagram',
                'platform_data' => $data,
            ]];
        } catch (\Exception $e) {
            Log::error('Failed to get Instagram accounts', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Get WhatsApp Business accounts - IMPROVED VERSION with better error handling
     */
    public function getWhatsAppBusinessAccounts(string $accessToken): ?array
    {
        try {
            $whatsappAccounts = [];

            // Method 1: Try to get via businesses with different field combinations
            try {
                $response = $this->retryableRequest(function () use ($accessToken) {
                    return $this->client->get('https://graph.facebook.com/' . $this->apiVersion . '/me/businesses', [
                        'query' => [
                            'access_token' => $accessToken,
                            'fields' => 'id,name,verified_name,whatsapp_business_accounts{id,name}',
                            'limit' => 50,
                        ],
                    ]);
                }, 'Get Businesses for WhatsApp');

                $businessData = json_decode((string) $response->getBody(), true);
                $businesses = $businessData['data'] ?? [];

                foreach ($businesses as $business) {
                    $wabaAccounts = $business['whatsapp_business_accounts']['data'] ?? [];

                    foreach ($wabaAccounts as $account) {
                        $whatsappAccounts[] = [
                            'account_id' => $account['id'],
                            'account_name' => $account['name'] ?? $business['name'] ?? 'WhatsApp Business Account',
                            'business_id' => $business['id'],
                            'business_name' => $business['name'] ?? null,
                            'is_business_account' => true,
                            'platform' => 'whatsapp',
                            'platform_data' => $account,
                        ];
                    }
                }
            } catch (ClientException $e) {
                // If businesses endpoint fails, try alternative methods
                Log::warning('Businesses endpoint failed, trying alternative methods', [
                    'error' => $e->getMessage()
                ]);
            }

            // Method 2: Try direct WhatsApp Business Accounts endpoint
            if (empty($whatsappAccounts)) {
                try {
                    $response = $this->retryableRequest(function () use ($accessToken) {
                        return $this->client->get('https://graph.facebook.com/' . $this->apiVersion . '/me/whatsapp_business_accounts', [
                            'query' => [
                                'access_token' => $accessToken,
                                'fields' => 'id,name,timezone_id,message_template_namespace,account_review_status',
                            ],
                        ]);
                    }, 'Get Direct WhatsApp Accounts');

                    $wabaData = json_decode((string) $response->getBody(), true);
                    $accounts = $wabaData['data'] ?? [];

                    foreach ($accounts as $account) {
                        $whatsappAccounts[] = [
                            'account_id' => $account['id'],
                            'account_name' => $account['name'] ?? 'WhatsApp Business Account',
                            'timezone_id' => $account['timezone_id'] ?? null,
                            'message_template_namespace' => $account['message_template_namespace'] ?? null,
                            'review_status' => $account['account_review_status'] ?? 'unknown',
                            'is_business_account' => true,
                            'platform' => 'whatsapp',
                            'platform_data' => $account,
                        ];
                    }
                } catch (ClientException $e) {
                    Log::warning('Direct WhatsApp accounts endpoint failed', [
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // Method 3: Try via pages as fallback
            if (empty($whatsappAccounts)) {
                $whatsappAccounts = $this->getWhatsAppAccountsViaPages($accessToken);
            }

            // Method 4: Final fallback - check if user has any WhatsApp access
            if (empty($whatsappAccounts)) {
                $hasWhatsAppAccess = $this->checkWhatsAppAccess($accessToken);

                if ($hasWhatsAppAccess) {
                    Log::info('User has WhatsApp permissions but no business accounts found');
                    // Return empty array instead of null to indicate no accounts but successful check
                    return [];
                }
            }

            Log::info('WhatsApp business accounts retrieval completed', [
                'accounts_found' => count($whatsappAccounts),
                'account_names' => array_map(fn($acc) => $acc['account_name'], $whatsappAccounts)
            ]);

            return empty($whatsappAccounts) ? [] : $whatsappAccounts;
        } catch (\Exception $e) {
            Log::error('Failed to get WhatsApp business accounts', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return [];
        }
    }

    /**
     * Check if user has WhatsApp API access
     */
    private function checkWhatsAppAccess(string $accessToken): bool
    {
        try {
            // Try a simple WhatsApp API call to check access
            $response = $this->client->get('https://graph.facebook.com/' . $this->apiVersion . '/me/permissions', [
                'query' => [
                    'access_token' => $accessToken,
                ],
            ]);

            $data = json_decode((string) $response->getBody(), true);
            $permissions = $data['data'] ?? [];

            $whatsappPermissions = array_filter($permissions, function ($perm) {
                return in_array($perm['permission'], [
                    'whatsapp_business_messaging',
                    'whatsapp_business_management'
                ]) && $perm['status'] === 'granted';
            });

            return !empty($whatsappPermissions);
        } catch (\Exception $e) {
            Log::warning('Failed to check WhatsApp permissions', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Alternative method to get WhatsApp accounts via pages
     */
    private function getWhatsAppAccountsViaPages(string $accessToken): array
    {
        try {
            $response = $this->retryableRequest(function () use ($accessToken) {
                return $this->client->get('https://graph.facebook.com/' . $this->apiVersion . '/me/accounts', [
                    'query' => [
                        'access_token' => $accessToken,
                        'fields' => 'id,name,whatsapp_business_accounts{id,name}',
                        'limit' => 50,
                    ],
                ]);
            }, 'Get WhatsApp Accounts via Pages');

            $pagesData = json_decode((string) $response->getBody(), true);
            $pages = $pagesData['data'] ?? [];

            $whatsappAccounts = [];

            foreach ($pages as $page) {
                $wabaAccounts = $page['whatsapp_business_accounts']['data'] ?? [];

                foreach ($wabaAccounts as $account) {
                    $whatsappAccounts[] = [
                        'account_id' => $account['id'],
                        'account_name' => $account['name'] ?? $page['name'] ?? 'WhatsApp Business Account',
                        'page_id' => $page['id'],
                        'page_name' => $page['name'] ?? null,
                        'is_business_account' => true,
                        'platform' => 'whatsapp',
                        'platform_data' => $account,
                    ];
                }
            }

            return $whatsappAccounts;
        } catch (\Exception $e) {
            Log::warning('Failed to get WhatsApp accounts via pages', ['error' => $e->getMessage()]);
            return [];
        }
    }



    /**
     * Get user profile
     */
    public function getUserProfile(string $accessToken): ?array
    {
        try {
            $response = $this->retryableRequest(function () use ($accessToken) {
                return $this->client->get('https://graph.facebook.com/v18.0/me', [
                    'query' => [
                        'access_token' => $accessToken,
                        'fields' => 'id,name,email,picture',
                    ],
                ]);
            }, 'Get User Profile');

            return json_decode((string) $response->getBody(), true);
        } catch (\Exception $e) {
            Log::error('Failed to get user profile', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Fetch conversation messages
     */
    public function fetchConversationMessages(MetaAccount $account, string $conversationId, int $limit = 50): ?array
    {
        $accessToken = $this->decryptToken($account->access_token_encrypted ?? $account->access_token);

        try {
            $endpoint = $this->buildEndpoint($account->platform, $conversationId . '/messages');

            $response = $this->retryableRequest(function () use ($endpoint, $accessToken, $limit) {
                return $this->client->get($endpoint, [
                    'query' => [
                        'access_token' => $accessToken,
                        'fields' => 'id,from,to,message,created_time,type,media,sticker,attachments,sharing',
                        'limit' => $limit,
                        'order' => 'chronological',
                    ],
                ]);
            }, 'Fetch Conversation Messages');

            $data = json_decode((string) $response->getBody(), true);
            return $data['data'] ?? null;
        } catch (\Exception $e) {
            Log::error('Failed to fetch conversation messages', [
                'account_id' => $account->id,
                'conversation_id' => $conversationId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Send a message
     */
    public function sendMessage(MetaAccount $account, string $conversationId, string $message, array $options = []): ?array
    {
        $accessToken = $this->decryptToken($account->access_token_encrypted ?? $account->access_token);

        try {
            $endpoint = $this->buildEndpoint($account->platform, $conversationId . '/messages');
            $payload = $this->buildMessagePayload($account->platform, $message, $options);
            $payload['access_token'] = $accessToken;

            $response = $this->retryableRequest(function () use ($endpoint, $payload) {
                return $this->client->post($endpoint, [
                    'form_params' => $payload,
                ]);
            }, 'Send Message');

            $result = json_decode((string) $response->getBody(), true);

            // Log successful message send
            $this->logActivity(
                $account->user_id,
                $account->id,
                'send',
                "Message sent to conversation {$conversationId}",
                [
                    'conversation_id' => $conversationId,
                    'message_length' => strlen($message),
                    'platform' => $account->platform,
                ]
            );

            return $result;
        } catch (\Exception $e) {
            Log::error('Failed to send message', [
                'account_id' => $account->id,
                'conversation_id' => $conversationId,
                'error' => $e->getMessage(),
            ]);

            $this->logActivity(
                $account->user_id,
                $account->id,
                'error',
                "Failed to send message to conversation {$conversationId}",
                null,
                $e->getMessage()
            );

            return null;
        }
    }

    /**
     * Debug token information
     */
    public function debugToken(string $accessToken): ?array
    {
        try {
            $response = $this->client->get('https://graph.facebook.com/debug_token', [
                'query' => [
                    'input_token' => $accessToken,
                    'access_token' => config('services.meta.client_id') . '|' . config('services.meta.client_secret'),
                ],
            ]);

            $data = json_decode((string) $response->getBody(), true);

            Log::info('Token debug info', [
                'is_valid' => $data['data']['is_valid'] ?? false,
                'user_id' => $data['data']['user_id'] ?? null,
                'scopes' => $data['data']['scopes'] ?? [],
                'expires_at' => $data['data']['expires_at'] ?? null,
            ]);

            return $data;
        } catch (\Exception $e) {
            Log::error('Token debug failed', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Refresh access token
     */
    public function refreshAccessToken(MetaAccount $account): bool
    {
        try {
            $longLivedToken = $this->decryptToken($account->refresh_token ?? $account->access_token);

            $response = $this->retryableRequest(function () use ($longLivedToken) {
                return $this->client->get('https://graph.facebook.com/v18.0/oauth/access_token', [
                    'query' => [
                        'grant_type' => 'fb_exchange_token',
                        'client_id' => config('services.meta.client_id'),
                        'client_secret' => config('services.meta.client_secret'),
                        'fb_exchange_token' => $longLivedToken,
                    ],
                ]);
            }, 'Refresh Access Token');

            $data = json_decode((string) $response->getBody(), true);

            if ($data['access_token'] ?? null) {
                $account->update([
                    'access_token_encrypted' => Crypt::encryptString($data['access_token']),
                    'token_expires_at' => now()->addSeconds($data['expires_in'] ?? 5184000),
                    'last_token_refresh' => now(),
                ]);

                Log::info('Access token refreshed successfully', [
                    'account_id' => $account->id,
                    'expires_in' => $data['expires_in'] ?? 'unknown',
                ]);

                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('Failed to refresh access token', [
                'account_id' => $account->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Ensure token is valid and refresh if needed
     */
    public function ensureValidToken(MetaAccount $account): bool
    {
        // Check if token is expired or about to expire
        $refreshBuffer = config('services.meta.token_refresh_buffer', 2592000); // 30 days

        if (!$account->token_expires_at || $account->token_expires_at->lessThan(now()->addSeconds($refreshBuffer))) {
            return $this->refreshAccessToken($account);
        }

        return true;
    }

    /**
     * Build API endpoint for platform
     */
    private function buildEndpoint(string $platform, string $path): string
    {
        $config = $this->platformConfig[$platform] ?? $this->platformConfig['facebook'];
        return $config['base_url'] . '/' . $config['api_path'] . '/' . ltrim($path, '/');
    }

    /**
     * Build message payload for platform
     */
    private function buildMessagePayload(string $platform, string $message, array $options = []): array
    {
        $basePayload = ['message' => $message];

        switch ($platform) {
            case 'whatsapp':
                return array_merge([
                    'messaging_product' => 'whatsapp',
                    'recipient_type' => 'individual',
                    'type' => 'text',
                    'text' => [
                        'preview_url' => $options['preview_url'] ?? true,
                        'body' => $message,
                    ],
                ], $options);

            case 'instagram':
                return array_merge($basePayload, $options);

            case 'facebook':
            default:
                return array_merge($basePayload, $options);
        }
    }

    /**
     * Get OAuth scopes for platform
     */
    private function getScopeForPlatform(string $platform): array
    {
        return match ($platform) {
            'facebook' => [
                'pages_manage_metadata',
                // 'pages_read_engagement',
                'pages_messaging',
                // 'pages_messaging_subscriptions',
                // 'instagram_basic',
                'business_management',
            ],
            'instagram' => [
                'instagram_basic',
                'instagram_manage_comments',
                'instagram_manage_messages',
            ],
            'whatsapp' => [
                'whatsapp_business_messaging',
                'whatsapp_business_management',
                'business_management',
                // 'pages_read_engagement',
            ],
            default => [
                'email',
                'public_profile',
            ],
        };
    }

    /**
     * Generate state parameter for OAuth
     */
    private function generateStateParameter(): string
    {
        return bin2hex(random_bytes(32));
    }

    /**
     * Decrypt access token
     */
    private function decryptToken(string $token): string
    {
        try {
            return Crypt::decryptString($token);
        } catch (\Throwable $e) {
            return $token;
        }
    }

    /**
     * Retryable request with exponential backoff
     */
    public function retryableRequest(callable $request, string $operationName = 'API Request'): mixed
    {
        $maxRetries = config('services.meta.max_retries', 3);
        $delayMs = config('services.meta.retry_delay', 1000);

        $lastException = null;

        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            try {
                $response = $request();

                // Track rate limiting
                $this->updateRateLimitStats($response);

                return $response;
            } catch (ClientException $e) {
                $lastException = $e;
                $statusCode = $e->getResponse()->getStatusCode();

                // Don't retry on client errors except 429 (rate limit)
                if ($statusCode !== 429 && $statusCode < 500) {
                    throw $e;
                }

                if ($attempt < $maxRetries) {
                    $sleepTime = $delayMs * pow(2, $attempt - 1);
                    Log::warning("{$operationName} failed with status {$statusCode}, retrying in {$sleepTime}ms", [
                        'attempt' => $attempt,
                        'error' => $e->getMessage(),
                    ]);
                    usleep($sleepTime * 1000);
                }
            } catch (ServerException | RequestException $e) {
                $lastException = $e;

                if ($attempt < $maxRetries) {
                    $sleepTime = $delayMs * pow(2, $attempt - 1);
                    Log::warning("{$operationName} failed, retrying in {$sleepTime}ms", [
                        'attempt' => $attempt,
                        'error' => $e->getMessage(),
                    ]);
                    usleep($sleepTime * 1000);
                }
            }
        }

        throw $lastException;
    }

    /**
     * Update rate limit statistics
     */
    private function updateRateLimitStats($response): void
    {
        if (method_exists($response, 'getHeader')) {
            $usage = $response->getHeader('X-Business-Use-Case-Usage');
            if (!empty($usage)) {
                $this->rateLimitStats = json_decode($usage[0] ?? '{}', true) ?? [];
            }
        }
    }

    /**
     * Get current rate limit statistics
     */
    public function getRateLimitStats(): array
    {
        return $this->rateLimitStats;
    }

    /**
     * Log automation activity
     */
    public function logActivity(string $userId, string $accountId, string $action, string $description, ?array $data = null, ?string $errorMessage = null): void
    {
        $allowedActions = ['analyze', 'draft', 'approve', 'send', 'reject', 'sync', 'error'];

        MetaAutomationLog::create([
            'user_id' => $userId,
            'meta_account_id' => $accountId,
            'action' => in_array($action, $allowedActions, true) ? $action : 'sync',
            'description' => $description,
            'data' => $data,
            'error_message' => $errorMessage,
        ]);
    }

    /**
     * Validate app credentials
     */
    public function validateAppCredentials(): bool
    {
        $clientId = config('services.meta.client_id');
        $clientSecret = config('services.meta.client_secret');

        if (empty($clientId) || empty($clientSecret)) {
            Log::error('Meta app credentials not configured');
            return false;
        }

        if (strlen($clientSecret) < 10) {
            Log::error('Meta client secret appears invalid');
            return false;
        }

        return true;
    }

    /**
     * Get available webhook events for platform
     */
    public function getWebhookEvents(string $platform): array
    {
        return match ($platform) {
            'facebook' => [
                'messages',
                'messaging_postbacks',
                'messaging_optins',
                'message_deliveries',
                'message_reads',
            ],
            'instagram' => [
                'messages',
                'message_deliveries',
                'message_reads',
            ],
            'whatsapp' => [
                'messages',
                'message_template_status_update',
            ],
            default => [],
        };
    }
}

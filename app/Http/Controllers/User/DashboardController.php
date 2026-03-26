<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Site;
use App\Models\AIAgent;
use App\Models\AgentConversation;
use App\Models\SiteSubscription;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Initialize counters with 0 values
        $sitesCount = 0;
        $activeSitesCount = 0;
        $agentsCount = 0;
        $activeAgentsCount = 0;
        $conversationsCount = 0;
        $activeConversationsCount = 0;
        $todaysConversationsCount = 0;
        $last7DaysConversationsCount = 0;
        $last30DaysConversationsCount = 0;

        // Check if user has sites relationship
        if (method_exists($user, 'sites')) {
            $sitesCount = $user->sites()->count();
            $activeSitesCount = $user->sites()->where('is_active', true)->count();
        }

        // Check if user has aiAgents relationship
        if (method_exists($user, 'aiAgents')) {
            $agentsCount = $user->aiAgents()->count();
            $activeAgentsCount = $user->aiAgents()->where('is_active', true)->count();
            
            $agentIds = $user->aiAgents()->pluck('id');
            
            if ($agentIds->isNotEmpty()) {
                $conversationsCount = AgentConversation::whereIn('agent_id', $agentIds)->count();
                $activeConversationsCount = AgentConversation::whereIn('agent_id', $agentIds)
                    ->where('status', 'active')
                    ->count();
                
                $todaysConversationsCount = AgentConversation::whereIn('agent_id', $agentIds)
                    ->whereDate('created_at', Carbon::today())
                    ->count();
                
                $last7DaysConversationsCount = AgentConversation::whereIn('agent_id', $agentIds)
                    ->where('created_at', '>=', Carbon::now()->subDays(7))
                    ->count();
                
                $last30DaysConversationsCount = AgentConversation::whereIn('agent_id', $agentIds)
                    ->where('created_at', '>=', Carbon::now()->subDays(30))
                    ->count();
            }
        }

        // Format stats for the dashboard
        $stats = [
            'sites_count' => $sitesCount,
            'active_sites_count' => $activeSitesCount,
            'agents_count' => $agentsCount,
            'active_agents_count' => $activeAgentsCount,
            'conversations_count' => $conversationsCount,
            'active_conversations_count' => $activeConversationsCount,
            'today_conversations' => $todaysConversationsCount,
            'last_7_days_conversations' => $last7DaysConversationsCount,
            'last_30_days_conversations' => $last30DaysConversationsCount,
            'avg_response_time' => 2400, // Default value
        ];

        // Get recent sites with proper relations
        $recentSites = collect([]);
        if (method_exists($user, 'sites')) {
            $recentSites = $user->sites()
                ->select(['id', 'name', 'domain', 'url', 'is_active', 'created_at'])
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($site) {
                    return [
                        'id' => $site->id,
                        'name' => $site->name,
                        'domain' => $site->domain,
                        'url' => $site->url,
                        'is_active' => (bool) $site->is_active,
                        'created_at' => $site->created_at->toISOString(),
                        'display_url' => $this->getDisplayUrl($site),
                    ];
                });
        }

        // Get recent agents with site information
        $recentAgents = collect([]);
        if (method_exists($user, 'aiAgents')) {
            $recentAgents = $user->aiAgents()
                ->with(['site:id,name'])
                ->select(['id', 'name',  'is_active', 'site_id', 'created_at'])
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($agent) {
                    return [
                        'id' => $agent->id,
                        'name' => $agent->name,
                        'type' => $agent->type ?? 'custom',
                        'is_active' => (bool) $agent->is_active,
                        'created_at' => $agent->created_at->toISOString(),
                        'site' => $agent->site ? [
                            'id' => $agent->site->id,
                            'name' => $agent->site->name,
                        ] : null,
                    ];
                });
        }

        // Get recent conversations with agent information
        $recentConversations = collect([]);
        if (method_exists($user, 'aiAgents')) {
            $agentIds = $user->aiAgents()->pluck('id');
            if ($agentIds->isNotEmpty()) {
                $recentConversations = AgentConversation::whereIn('agent_id', $agentIds)
                    ->with(['aiAgent:id,name'])
                    ->select(['id', 'agent_id', 'status', 'message_count', 'created_at', 'updated_at'])
                    ->latest()
                    ->take(10)
                    ->get()
                    ->map(function ($conversation) {
                        return [
                            'id' => $conversation->id,
                            'status' => $conversation->status,
                            'message_count' => (int) $conversation->message_count,
                            'created_at' => $conversation->created_at->toISOString(),
                            'updated_at' => $conversation->updated_at->toISOString(),
                            'ai_agent' => [
                                'id' => $conversation->aiAgent->id,
                                'name' => $conversation->aiAgent->name,
                            ],
                        ];
                    });
            }
        }

        // Get trial information
        $trialInfo = [
            'isOnTrial' => $user->isOnTrial(),
            'hasTrialExpired' => $user->hasTrialExpired(),
            'daysRemaining' => $user->getTrialDaysRemaining(),
            'agentQuota' => $user->getAgentCreationQuota(),
            'remainingQuota' => $user->getRemainingAgentQuota(),
        ];

        // Get user's current plan from auth data
        $currentPlan = $user->current_plan ?? null;
        
        // Determine plan limits based on user's plan
        $planLimits = $this->getPlanLimits($currentPlan);
        
        // Calculate usage percentages
        $maxSites = $planLimits['max_sites'];
        $maxAgents = $planLimits['max_agents'];
        
        $siteUsagePercentage = $maxSites > 0 ? ($sitesCount / $maxSites) * 100 : 0;
        $agentUsagePercentage = $maxAgents > 0 ? ($agentsCount / $maxAgents) * 100 : 0;

        // Prepare conversations analytics
        $conversationsAnalytics = [
            'today' => $todaysConversationsCount,
            'last_7_days' => $last7DaysConversationsCount,
            'last_30_days' => $last30DaysConversationsCount,
            'avg_response_time' => $stats['avg_response_time'],
            'completion_rate' => $conversationsCount > 0 ? 
                (($conversationsCount - $activeConversationsCount) / $conversationsCount) * 100 : 0,
        ];

        return Inertia::render('User/Dashboard', [
            'stats' => $stats,
            'recentSites' => $recentSites,
            'recentAgents' => $recentAgents,
            'recentConversations' => $recentConversations,
            'planLimits' => $planLimits,
            'trial' => $trialInfo,
            'usage' => [
                'sites' => [
                    'current' => $sitesCount,
                    'max' => $maxSites,
                    'percentage' => round($siteUsagePercentage, 1),
                ],
                'agents' => [
                    'current' => $agentsCount,
                    'max' => $maxAgents,
                    'percentage' => round($agentUsagePercentage, 1),
                ],
            ],
            'conversationsAnalytics' => $conversationsAnalytics,
            'hasData' => [
                'sites' => $sitesCount > 0,
                'agents' => $agentsCount > 0,
                'conversations' => $conversationsCount > 0,
            ],
        ]);
    }

    /**
     * Get display URL for a site
     */
    private function getDisplayUrl($site)
    {
        if ($site->domain) {
            $parsed = parse_url($site->domain);
            return $parsed['host'] ?? $site->domain;
        }
        
        if ($site->url) {
            $parsed = parse_url($site->url);
            return $parsed['host'] ?? $site->url;
        }
        
        return 'No URL';
    }

    /**
     * Get plan limits based on user's plan
     */
    private function getPlanLimits($currentPlan)
    {
        if (!$currentPlan) {
            return [
                'max_sites' => 1,
                'max_agents' => 3,
                'features' => [
                    'Basic Analytics',
                    'Standard Support',
                    'Limited Conversations',
                ],
            ];
        }

        // Map plan names to limits
        $planLimitsMap = [
            'Free' => [
                'max_sites' => 1,
                'max_agents' => 3,
                'features' => [
                    'Basic Analytics',
                    'Standard Support',
                    'Limited Conversations',
                ],
            ],
            'Starter' => [
                'max_sites' => 3,
                'max_agents' => 10,
                'features' => [
                    'Advanced Analytics',
                    'Priority Support',
                    'Unlimited Conversations',
                    'Custom Branding',
                ],
            ],
            'Pro' => [
                'max_sites' => 10,
                'max_agents' => 50,
                'features' => [
                    'Advanced Analytics',
                    '24/7 Priority Support',
                    'Unlimited Conversations',
                    'Custom Branding',
                    'API Access',
                    'White Label',
                ],
            ],
            'Enterprise' => [
                'max_sites' => 100,
                'max_agents' => 500,
                'features' => [
                    'Enterprise Analytics',
                    'Dedicated Support',
                    'Unlimited Everything',
                    'Custom Development',
                    'SLA Guarantee',
                ],
            ],
        ];

        $planName = $currentPlan['name'] ?? 'Free';
        
        return $planLimitsMap[$planName] ?? $planLimitsMap['Free'];
    }
}
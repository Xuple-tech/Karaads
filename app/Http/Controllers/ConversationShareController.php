<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\ConversationShare;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ConversationShareController extends Controller
{
    /**
     * Create or get share link for a conversation
     */
    public function createShare(Request $request, $conversationId)
    {
        try {
            $conversation = Conversation::where('user_id', Auth::id())
                ->findOrFail($conversationId);

            $validated = $request->validate([
                'is_public' => 'required|boolean',
                'expires_at' => 'nullable|date|after:now',
            ]);

            // Check if already has active share
            $existingShare = $conversation->getActiveShare();
            if ($existingShare) {
                return response()->json([
                    'success' => true,
                    'share' => $existingShare,
                    'share_url' => route('share.view', $existingShare->share_token),
                    'message' => 'Share link already exists'
                ]);
            }

            // Create new share
            $share = $conversation->shares()->create([
                'share_token' => ConversationShare::generateToken(),
                'is_public' => $validated['is_public'],
                'expires_at' => $validated['expires_at'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'share' => $share,
                'share_url' => route('share.view', $share->share_token),
                'message' => 'Share link created successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating share: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to create share link'
            ], 500);
        }
    }

    /**
     * Get share details for a conversation
     */
    public function getShare($conversationId)
    {
        try {
            $conversation = Conversation::where('user_id', Auth::id())
                ->findOrFail($conversationId);

            $share = $conversation->getActiveShare();

            if (!$share) {
                return response()->json([
                    'success' => true,
                    'share' => null
                ]);
            }

            return response()->json([
                'success' => true,
                'share' => $share,
                'share_url' => route('share.view', $share->share_token),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching share: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch share details'
            ], 500);
        }
    }

    /**
     * Disable/revoke a share link
     */
    public function revokeShare($conversationId)
    {
        try {
            $conversation = Conversation::where('user_id', Auth::id())
                ->findOrFail($conversationId);

            $share = $conversation->getActiveShare();
            if (!$share) {
                return response()->json([
                    'success' => false,
                    'error' => 'No active share found'
                ], 404);
            }

            $share->update(['is_active' => false]);

            return response()->json([
                'success' => true,
                'message' => 'Share link revoked successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error revoking share: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to revoke share link'
            ], 500);
        }
    }

    /**
     * View shared conversation (public access)
     */
    public function viewShare($token)
    {
        try {
            $share = ConversationShare::where('share_token', $token)
                ->first();

            if (!$share || !$share->isValid()) {
                abort(404, 'Share link not found or expired');
            }

            // Load conversation with messages
            $conversation = $share->conversation->load([
                'chats' => function ($query) {
                    $query->orderBy('created_at', 'asc')->with('files');
                },
                'user'
            ]);

            return Inertia::render('SharedConversation', [
                'conversation' => $conversation,
                'shareToken' => $token,
                'isSharedView' => true,
                'owner' => $conversation->user,
            ]);
        } catch (\Exception $e) {
            Log::error('Error viewing shared conversation: ' . $e->getMessage());
            abort(404, 'Shared conversation not found or expired');
        }
    }

    /**
     * Get shared conversation data (API endpoint)
     */
    public function getSharedConversationData($token)
    {
        try {
            $share = ConversationShare::where('share_token', $token)
                ->first();

            if (!$share || !$share->isValid()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Share link not found or expired'
                ], 404);
            }

            $conversation = $share->conversation->load([
                'chats' => function ($query) {
                    $query->orderBy('created_at', 'asc')->with('files');
                },
                'user'
            ]);

            return response()->json([
                'success' => true,
                'conversation' => $conversation,
                'owner' => $conversation->user,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching shared conversation data: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch conversation data'
            ], 500);
        }
    }

    /**
     * Update share settings
     */
    public function updateShare(Request $request, $conversationId)
    {
        try {
            $conversation = Conversation::where('user_id', Auth::id())
                ->findOrFail($conversationId);

            $share = $conversation->getActiveShare();
            if (!$share) {
                return response()->json([
                    'success' => false,
                    'error' => 'No active share found'
                ], 404);
            }

            $validated = $request->validate([
                'is_public' => 'sometimes|boolean',
                'expires_at' => 'sometimes|nullable|date|after:now',
            ]);

            $share->update($validated);

            return response()->json([
                'success' => true,
                'share' => $share,
                'message' => 'Share settings updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating share: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update share settings'
            ], 500);
        }
    }

    /**
     * Get all shares for authenticated user
     */
    public function listUserShares()
    {
        try {
            $shares = ConversationShare::whereHas('conversation', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->with('conversation:id,title,user_id')
            ->active()
            ->latest()
            ->get();

            return response()->json([
                'success' => true,
                'shares' => $shares->map(function ($share) {
                    return [
                        'id' => $share->id,
                        'conversation' => $share->conversation,
                        'share_token' => $share->share_token,
                        'share_url' => route('share.view', $share->share_token),
                        'is_public' => $share->is_public,
                        'expires_at' => $share->expires_at,
                        'created_at' => $share->created_at,
                    ];
                })
            ]);
        } catch (\Exception $e) {
            Log::error('Error listing shares: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch shares'
            ], 500);
        }
    }
}

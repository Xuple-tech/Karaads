<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Http\Resources\ConversationResource;
use App\Models\Conversation;
use App\Models\User;
use App\Support\UserPrivacy;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ConversationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $viewer = $request->user();

        $query = $viewer
            ->conversations()
            ->with(['participants', 'latestMessage'])
            ->whereDoesntHave('participants', function ($q) use ($viewer) {
                $q->where('users.id', '!=', $viewer->id)
                    ->where(function ($blocked) use ($viewer) {
                        $blocked->whereIn('users.id', function ($sub) use ($viewer) {
                            $sub->select('blocked_user_id')
                                ->from('blocks')
                                ->where('blocker_id', $viewer->id);
                        })->orWhereIn('users.id', function ($sub) use ($viewer) {
                            $sub->select('blocker_id')
                                ->from('blocks')
                                ->where('blocked_user_id', $viewer->id);
                        });
                    });
            })
            ->latest();

        if ($request->has('user_id')) {
            $userId = $request->input('user_id');
            $query->whereHas('participants', function ($q) use ($userId) {
                $q->where('users.id', $userId);
            });
        }

        $conversations = $query->paginate(15);

        return ConversationResource::collection($conversations);
    }

    public function show(Conversation $conversation, Request $request): ConversationResource
    {
        $viewer = $request->user();
        $this->ensureParticipant($conversation, (string) $viewer->id);
        $this->ensureConversationAllowed($conversation, $viewer);

        $conversation->load(['participants', 'messages.user']);

        return new ConversationResource($conversation);
    }

    public function store(Request $request): ConversationResource
    {
        $validated = $request->validate([
            'participant_ids' => 'required|array|min:1',
            'participant_ids.*' => 'uuid|exists:users,id',
            'type' => 'in:private,group',
            'name' => 'nullable|string|max:255',
            'avatar' => 'nullable|file|mimetypes:image/jpeg,image/png,image/jpg,image/gif,image/webp|max:10240',
        ]);

        $creator = $request->user();
        $participantIds = array_values(array_unique(array_filter(
            $validated['participant_ids'],
            fn ($id) => (string) $id !== (string) $creator->id
        )));
        abort_if(empty($participantIds), 422, 'Please select at least one other participant.');

        $participants = User::query()
            ->whereIn('id', $participantIds)
            ->get();

        foreach ($participants as $participant) {
            abort_unless(
                UserPrivacy::canMessage($creator, $participant),
                422,
                'You cannot start a conversation with this user due to privacy settings.'
            );
        }

        $type = count($participantIds) > 1 ? 'group' : ($validated['type'] ?? 'private');
        $name = $type === 'group'
            ? trim((string) ($validated['name'] ?? '')) ?: 'Group chat'
            : null;

        if ($type === 'private' && count($participantIds) === 1) {
            $existing = $creator->conversations()
                ->where('type', 'private')
                ->whereHas('participants', fn ($q) => $q->where('users.id', $participantIds[0]))
                ->with(['participants', 'latestMessage'])
                ->first();

            if ($existing) {
                return new ConversationResource($existing);
            }
        }

        $conversation = Conversation::create([
            'id' => (string) Str::uuid(),
            'type' => $type,
            'name' => $name,
            'avatar' => $type === 'group' && $request->hasFile('avatar')
                ? $this->storeGroupAvatar($request->file('avatar'))
                : null,
            'invite_token' => $type === 'group' ? Str::random(48) : null,
            'invite_enabled' => true,
            'created_by' => $creator->id,
        ]);

        // Add current user and participants
        $allParticipantIds = array_merge([$creator->id], $participantIds);

        $pivot = [];
        foreach ($allParticipantIds as $participantId) {
            $pivot[$participantId] = [
                'id' => (string) Str::uuid(),
                'joined_at' => now(),
            ];
        }

        $conversation->participants()->attach($pivot);

        return new ConversationResource($conversation->load('participants'));
    }

    public function update(Conversation $conversation, Request $request): ConversationResource
    {
        $viewer = $request->user();
        $this->ensureGroupAdmin($conversation, (string) $viewer->id);

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'avatar' => 'nullable|file|mimetypes:image/jpeg,image/png,image/jpg,image/gif,image/webp|max:10240',
            'invite_enabled' => 'nullable|boolean',
        ]);

        $payload = [];
        if (array_key_exists('name', $validated)) {
            $payload['name'] = trim((string) $validated['name']) ?: 'Group chat';
        }

        if (array_key_exists('invite_enabled', $validated)) {
            $payload['invite_enabled'] = filter_var($validated['invite_enabled'], FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->hasFile('avatar')) {
            $payload['avatar'] = $this->storeGroupAvatar($request->file('avatar'));
        }

        if (! $conversation->invite_token) {
            $payload['invite_token'] = Str::random(48);
        }

        $conversation->update($payload);

        return new ConversationResource($conversation->load(['participants', 'latestMessage']));
    }

    public function addMembers(Conversation $conversation, Request $request): ConversationResource
    {
        $viewer = $request->user();
        $this->ensureGroupAdmin($conversation, (string) $viewer->id);

        $validated = $request->validate([
            'participant_ids' => 'required|array|min:1',
            'participant_ids.*' => 'uuid|exists:users,id',
        ]);

        $participantIds = array_values(array_unique(array_filter(
            $validated['participant_ids'],
            fn ($id) => (string) $id !== (string) $viewer->id
        )));

        $users = User::query()->whereIn('id', $participantIds)->get();
        foreach ($users as $user) {
            abort_unless(
                UserPrivacy::canMessage($viewer, $user),
                422,
                'You cannot add one or more users due to privacy settings.'
            );
        }

        $existingIds = $conversation->participants()->pluck('users.id')->map(fn ($id) => (string) $id)->all();
        $pivot = [];
        foreach ($participantIds as $participantId) {
            if (in_array((string) $participantId, $existingIds, true)) {
                continue;
            }

            $pivot[$participantId] = [
                'id' => (string) Str::uuid(),
                'joined_at' => now(),
            ];
        }

        if ($pivot !== []) {
            DB::table('conversation_user_blocks')
                ->where('conversation_id', $conversation->id)
                ->whereIn('user_id', array_keys($pivot))
                ->delete();

            $conversation->participants()->attach($pivot);
            $conversation->touch();
        }

        return new ConversationResource($conversation->load(['participants', 'latestMessage']));
    }

    public function blockMember(Conversation $conversation, User $user, Request $request): ConversationResource
    {
        $viewer = $request->user();
        $this->ensureGroupAdmin($conversation, (string) $viewer->id);
        abort_if((string) $user->id === (string) $viewer->id, 422, 'You cannot block yourself from your group.');

        $conversation->participants()->detach($user->id);
        DB::table('conversation_user_blocks')->updateOrInsert(
            [
                'conversation_id' => $conversation->id,
                'user_id' => $user->id,
            ],
            [
                'id' => (string) Str::uuid(),
                'blocked_by' => $viewer->id,
                'updated_at' => now(),
                'created_at' => now(),
            ],
        );

        $conversation->touch();

        return new ConversationResource($conversation->load(['participants', 'latestMessage']));
    }

    public function unblockMember(Conversation $conversation, User $user, Request $request): ConversationResource
    {
        $viewer = $request->user();
        $this->ensureGroupAdmin($conversation, (string) $viewer->id);

        DB::table('conversation_user_blocks')
            ->where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->delete();

        return new ConversationResource($conversation->load(['participants', 'latestMessage']));
    }

    public function removeMember(Conversation $conversation, User $user, Request $request): ConversationResource
    {
        $viewer = $request->user();
        $this->ensureGroupAdmin($conversation, (string) $viewer->id);
        abort_if((string) $user->id === (string) $viewer->id, 422, 'Use leave group to remove yourself.');

        $conversation->participants()->detach($user->id);
        $conversation->touch();

        return new ConversationResource($conversation->load(['participants', 'latestMessage']));
    }

    public function leave(Conversation $conversation, Request $request)
    {
        $viewer = $request->user();
        $this->ensureParticipant($conversation, (string) $viewer->id);
        abort_unless($conversation->type === 'group', 422, 'Only group chats can be left.');

        $conversation->participants()->detach($viewer->id);

        if ((string) $conversation->created_by === (string) $viewer->id) {
            $nextAdminId = $conversation->participants()->orderByPivot('joined_at')->value('users.id');
            $conversation->created_by = $nextAdminId ?: null;
        }

        $conversation->touch();
        $conversation->save();

        return response()->json(['left' => true]);
    }

    public function joinByInvite(string $token, Request $request): ConversationResource
    {
        $viewer = $request->user();
        $conversation = Conversation::query()
            ->where('type', 'group')
            ->where('invite_token', $token)
            ->where('invite_enabled', true)
            ->firstOrFail();

        $isParticipant = $conversation->participants()
            ->where('users.id', $viewer->id)
            ->exists();

        if (! $isParticipant) {
            abort_if(
                $this->isBlockedFromGroup($conversation, (string) $viewer->id),
                403,
                'You cannot join this group.'
            );

            $conversation->participants()->attach([
                $viewer->id => [
                    'id' => (string) Str::uuid(),
                    'joined_at' => now(),
                ],
            ]);

            $message = $conversation->messages()->create([
                'id' => (string) Str::uuid(),
                'user_id' => $viewer->id,
                'content' => sprintf('@%s joined the group using the invite link.', $viewer->username ?: $viewer->name),
                'message_type' => 'text',
                'attachments' => [],
                'delivered_at' => now(),
            ]);

            $message->load('user');
            broadcast(new MessageSent($message))->toOthers();

            $conversation->touch();
        }

        return new ConversationResource($conversation->load(['participants', 'latestMessage']));
    }

    public function markAsRead(Conversation $conversation, Request $request)
    {
        $viewer = $request->user();
        $this->ensureParticipant($conversation, (string) $viewer->id);
        $this->ensureConversationAllowed($conversation, $viewer);

        $conversation->messages()
            ->where('user_id', '!=', $viewer->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Conversation marked as read']);
    }

    private function ensureParticipant(Conversation $conversation, string $userId): void
    {
        $isParticipant = $conversation->participants()
            ->where('users.id', $userId)
            ->exists();

        abort_unless($isParticipant, 403);
    }

    private function ensureGroupAdmin(Conversation $conversation, string $userId): void
    {
        abort_unless($conversation->type === 'group', 422, 'This action is only available for group chats.');
        abort_unless((string) $conversation->created_by === $userId, 403, 'Only the group admin can do this.');
    }

    private function isBlockedFromGroup(Conversation $conversation, string $userId): bool
    {
        return DB::table('conversation_user_blocks')
            ->where('conversation_id', $conversation->id)
            ->where('user_id', $userId)
            ->exists();
    }

    private function storeGroupAvatar(?UploadedFile $file): ?string
    {
        if (! $file) {
            return null;
        }

        $path = $file->store('conversation-avatars', 'public');

        return $path;
    }

    private function ensureConversationAllowed(Conversation $conversation, User $viewer): void
    {
        $conversation->loadMissing('participants');

        foreach ($conversation->participants as $participant) {
            if ((string) $participant->id === (string) $viewer->id) {
                continue;
            }

            if (UserPrivacy::isBlockedBetween($viewer, $participant)) {
                abort(404);
            }
        }
    }
}

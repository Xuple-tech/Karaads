<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\Media\MediaPathService;
use App\Services\Push\PushDispatchService;
use App\Support\UserPrivacy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    public function __construct(
        private readonly PushDispatchService $pushDispatch,
    ) {
    }

    public function index(Conversation $conversation, Request $request): AnonymousResourceCollection
    {
        $viewer = $request->user();
        $this->ensureParticipant($conversation, (string) $viewer->id);
        $this->ensureConversationVisible($conversation, $viewer->id);

        $messages = $conversation->messages()
            ->with(['user', 'replyTo.user'])
            ->latest()
            ->paginate(30);

        return MessageResource::collection($messages);
    }

    public function show(Conversation $conversation, Message $message, Request $request): MessageResource
    {
        $viewer = $request->user();
        $this->ensureParticipant($conversation, (string) $viewer->id);
        $this->ensureConversationVisible($conversation, $viewer->id);
        abort_unless((string) $message->conversation_id === (string) $conversation->id, 404);

        $message->load(['user', 'replyTo.user']);

        return new MessageResource($message);
    }

    public function store(Conversation $conversation, Request $request): MessageResource
    {
        $sender = $request->user();
        $this->ensureParticipant($conversation, (string) $sender->id);
        $this->ensureConversationVisible($conversation, $sender->id);
        $this->ensureConversationAllowsMessaging($conversation, $sender->id);

        if (is_string($request->input('attachments'))) {
            $decoded = json_decode((string) $request->input('attachments'), true);
            if (is_array($decoded)) {
                $request->merge(['attachments' => $decoded]);
            }
        }

        Log::info('Creating message', [
            'conversation_id' => $conversation->id,
            'user_id' => $sender->id,
            'timestamp' => now(),
        ]);

        $validated = $request->validate([
            'content' => 'nullable|string|max:5000|required_without:attachments',
            'reply_to_message_id' => 'nullable|uuid|exists:messages,id',
            'message_type' => 'in:text,image,video,file,call,audio,document,location,contact,poll,event',
            'attachments' => 'nullable|array',
            'attachments.*.id' => 'required_with:attachments|string',
            'attachments.*.type' => 'nullable|string|max:100',
            'attachments.*.path' => 'nullable|string|max:2048',
            'attachments.*.thumbnail_path' => 'nullable|string|max:2048',
            'attachments.*.url' => 'nullable|string',
            'attachments.*.thumbnail_url' => 'nullable|string',
            'attachments.*.name' => 'nullable|string|max:255',
            'attachments.*.mime_type' => 'nullable|string|max:255',
            'attachments.*.size' => 'nullable|integer|min:0',
            'attachments.*.width' => 'nullable|integer|min:1',
            'attachments.*.height' => 'nullable|integer|min:1',
            'attachments.*.label' => 'nullable|string|max:255',
            'attachments.*.latitude' => 'nullable|numeric|between:-90,90',
            'attachments.*.longitude' => 'nullable|numeric|between:-180,180',
            'attachments.*.address' => 'nullable|string|max:1000',
            'attachments.*.map_url' => 'nullable|string|max:2048',
            'attachments.*.live' => 'nullable|boolean',
            'attachments.*.live_session_id' => 'nullable|string|max:255',
            'attachments.*.last_updated_at' => 'nullable|date',
            'attachments.*.expires_at' => 'nullable|date',
            'attachments.*.phone' => 'nullable|string|max:255',
            'attachments.*.email' => 'nullable|string|max:255',
            'attachments.*.organization' => 'nullable|string|max:255',
            'attachments.*.options' => 'nullable|array',
            'attachments.*.options.*' => 'nullable|string|max:255',
            'attachments.*.total_votes' => 'nullable|integer|min:0',
            'attachments.*.event_title' => 'nullable|string|max:255',
            'attachments.*.starts_at' => 'nullable|date',
            'attachments.*.ends_at' => 'nullable|date',
            'attachments.*.venue' => 'nullable|string|max:255',
            'attachments.*.notes' => 'nullable|string|max:5000',
        ]);

        if (
            ! empty($validated['reply_to_message_id'])
            && ! $conversation->messages()->whereKey($validated['reply_to_message_id'])->exists()
        ) {
            abort(422, 'The message you are replying to was not found in this conversation.');
        }

        $message = $conversation->messages()->create([
            'id' => (string) Str::uuid(),
            'user_id' => $sender->id,
            'delivered_at' => now(),
            ...$validated,
        ]);

        $message->load(['user', 'replyTo.user']);

        broadcast(new MessageSent($message))->toOthers();
        $this->pushDispatch->dispatchMessageNotification(
            $conversation,
            $sender,
            (string) $message->id,
            (string) ($message->content ?? ''),
        );

        return new MessageResource($message);
    }

    public function update(Conversation $conversation, Message $message, Request $request): MessageResource
    {
        $sender = $request->user();
        $this->ensureParticipant($conversation, (string) $sender->id);
        $this->ensureConversationVisible($conversation, $sender->id);
        $this->ensureConversationAllowsMessaging($conversation, $sender->id);

        abort_unless((string) $message->conversation_id === (string) $conversation->id, 404);
        abort_unless((string) $message->user_id === (string) $sender->id, 403);

        if (is_string($request->input('attachments'))) {
            $decoded = json_decode((string) $request->input('attachments'), true);
            if (is_array($decoded)) {
                $request->merge(['attachments' => $decoded]);
            }
        }

        $validated = $request->validate([
            'content' => 'nullable|string|max:5000',
            'message_type' => 'sometimes|in:text,image,video,file,call,audio,document,location,contact,poll,event',
            'attachments' => 'nullable|array',
            'attachments.*.id' => 'required_with:attachments|string',
            'attachments.*.type' => 'nullable|string|max:100',
            'attachments.*.path' => 'nullable|string|max:2048',
            'attachments.*.thumbnail_path' => 'nullable|string|max:2048',
            'attachments.*.url' => 'nullable|string',
            'attachments.*.thumbnail_url' => 'nullable|string',
            'attachments.*.name' => 'nullable|string|max:255',
            'attachments.*.mime_type' => 'nullable|string|max:255',
            'attachments.*.size' => 'nullable|integer|min:0',
            'attachments.*.width' => 'nullable|integer|min:1',
            'attachments.*.height' => 'nullable|integer|min:1',
            'attachments.*.label' => 'nullable|string|max:255',
            'attachments.*.latitude' => 'nullable|numeric|between:-90,90',
            'attachments.*.longitude' => 'nullable|numeric|between:-180,180',
            'attachments.*.address' => 'nullable|string|max:1000',
            'attachments.*.map_url' => 'nullable|string|max:2048',
            'attachments.*.live' => 'nullable|boolean',
            'attachments.*.live_session_id' => 'nullable|string|max:255',
            'attachments.*.last_updated_at' => 'nullable|date',
            'attachments.*.expires_at' => 'nullable|date',
            'attachments.*.phone' => 'nullable|string|max:255',
            'attachments.*.email' => 'nullable|string|max:255',
            'attachments.*.organization' => 'nullable|string|max:255',
            'attachments.*.options' => 'nullable|array',
            'attachments.*.options.*' => 'nullable|string|max:255',
            'attachments.*.total_votes' => 'nullable|integer|min:0',
            'attachments.*.event_title' => 'nullable|string|max:255',
            'attachments.*.starts_at' => 'nullable|date',
            'attachments.*.ends_at' => 'nullable|date',
            'attachments.*.venue' => 'nullable|string|max:255',
            'attachments.*.notes' => 'nullable|string|max:5000',
        ]);

        $message->fill($validated);
        $message->save();
        $message->load(['user', 'replyTo.user']);

        return new MessageResource($message);
    }

    public function uploadAttachment(Conversation $conversation, Request $request): JsonResponse
    {
        $sender = $request->user();
        $this->ensureParticipant($conversation, (string) $sender->id);
        $this->ensureConversationVisible($conversation, $sender->id);
        $this->ensureConversationAllowsMessaging($conversation, $sender->id);

        $validated = $request->validate([
            'file' => [
                'required',
                'file',
                'max:51200',
                'mimetypes:image/jpeg,image/png,image/jpg,image/gif,image/webp,video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska,audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/wav,audio/webm,audio/ogg,audio/aac,audio/flac,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,application/zip,application/x-rar-compressed',
            ],
        ]);

        /** @var UploadedFile $file */
        $file = $validated['file'];
        $mimeType = (string) ($file->getMimeType() ?? '');
        $isImage = str_starts_with($mimeType, 'image/');
        [$width, $height] = $isImage ? $this->resolveImageDimensions($file) : [null, null];

        $path = $file->store('messages', 'public');
        $url = app(MediaPathService::class)->toUrl($path, 'public') ?? '/storage/' . $path;
        $attachment = [
            'id' => (string) Str::uuid(),
            'path' => $path,
            'url' => $url,
            'thumbnail_path' => $isImage ? $path : null,
            'thumbnail_url' => $isImage ? $url : null,
            'name' => (string) $file->getClientOriginalName(),
            'mime_type' => $mimeType,
            'size' => (int) $file->getSize(),
            'width' => $width,
            'height' => $height,
        ];

        return response()->json([
            'attachment' => $attachment,
        ], 201);
    }

    public function markAsRead(Message $message, Request $request): array
    {
        if ($message->user_id !== $request->user()->id) {
            $message->update(['read_at' => now()]);
        }

        return ['read' => true];
    }

    private function ensureParticipant(Conversation $conversation, string $userId): void
    {
        $isParticipant = $conversation->participants()
            ->where('users.id', $userId)
            ->exists();

        abort_unless($isParticipant, 403);
    }

    private function ensureConversationVisible(Conversation $conversation, string $viewerId): void
    {
        $viewer = $conversation->participants()->where('users.id', $viewerId)->first();
        if (! $viewer) {
            abort(403);
        }

        $conversation->loadMissing('participants');
        foreach ($conversation->participants as $participant) {
            if ((string) $participant->id === $viewerId) {
                continue;
            }

            if (UserPrivacy::isBlockedBetween($viewer, $participant)) {
                abort(404);
            }
        }
    }

    private function ensureConversationAllowsMessaging(Conversation $conversation, string $senderId): void
    {
        $sender = $conversation->participants()->where('users.id', $senderId)->first();
        if (! $sender) {
            abort(403);
        }

        $conversation->loadMissing('participants');
        foreach ($conversation->participants as $participant) {
            if ((string) $participant->id === $senderId) {
                continue;
            }

            abort_unless(
                UserPrivacy::canMessage($sender, $participant),
                422,
                'You cannot message this user due to privacy settings.'
            );
        }
    }

    /**
     * @return array{0:int|null,1:int|null}
     */
    private function resolveImageDimensions(UploadedFile $file): array
    {
        try {
            $size = @getimagesize($file->getRealPath() ?: '');
            if (!is_array($size)) {
                return [null, null];
            }

            return [
                isset($size[0]) ? (int) $size[0] : null,
                isset($size[1]) ? (int) $size[1] : null,
            ];
        } catch (\Throwable) {
            return [null, null];
        }
    }

    public function destroy(Conversation $conversation, Message $message, Request $request): \Illuminate\Http\Response
    {
        $user = $request->user();
        abort_unless((string) $message->user_id === (string) $user->id, 403, 'You cannot delete this message.');
        abort_unless((string) $message->conversation_id === (string) $conversation->id, 404, 'Message not found in this conversation.');
        $message->delete();
        return response()->noContent();
    }

}
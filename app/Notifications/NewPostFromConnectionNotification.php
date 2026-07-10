<?php

namespace App\Notifications;

use App\Models\Post;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class NewPostFromConnectionNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Post $post
    ) {
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        if ($notifiable instanceof User) {
            $enabled = User::query()
                ->whereKey($notifiable->getKey())
                ->value('post_email_notifications_enabled');

            if (! (bool) $enabled) {
                return [];
            }
        }

        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $post = $this->post->loadMissing('user');
        $authorName = $post->user?->name ?: 'Someone you know';
        $snippet = Str::limit(trim((string) $post->content), 140);
        $postUrl = url('/app/moments?post=' . urlencode((string) $post->id));

        $message = (new MailMessage)
            ->subject($authorName . ' posted on Karaads')
            ->greeting('Hi ' . ($notifiable->name ?: 'there') . ',')
            ->line($authorName . ' just shared a new post on Karaads.');

        if ($snippet !== '') {
            $message->line('"' . $snippet . '"');
        }

        $message->line('Views: ' . number_format((int) ($post->view_count ?? 0)));

        return $message
            ->action('View post', $postUrl)
            ->line('You are receiving this because you follow each other, follow this user, or this user follows you.');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'post_id' => $this->post->id,
            'user_id' => $this->post->user_id,
        ];
    }
}

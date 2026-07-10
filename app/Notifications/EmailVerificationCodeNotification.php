<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailVerificationCodeNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $code
    ) {
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $verificationUrl = url('/auth/verify-email/otp?' . http_build_query([
            'email' => $notifiable->email ?? '',
        ]));

        return (new MailMessage)
            ->subject('Karaads Email Verification Code')
            ->greeting('Hello,')
            ->line('Use this one-time code to verify your email address on Karaads:')
            ->line('**' . $this->code . '**')
            ->action('Open verification page', $verificationUrl)
            ->line('If the button does not open, sign in and visit: ' . $verificationUrl)
            ->line('This code expires in 15 minutes.')
            ->line('If you did not request this, you can ignore this email.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'code' => $this->code,
        ];
    }
}

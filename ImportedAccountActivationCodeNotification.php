<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ImportedAccountActivationCodeNotification extends Notification
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
        return (new MailMessage)
            ->mailer(config('mail.auth_mailer', 'hostinger'))
            ->from(
                config('mail.auth_from.address', config('mail.from.address')),
                config('mail.auth_from.name', config('mail.from.name'))
            )
            ->subject('Your Karaads Account Activation Code')
            ->line('Use the code below to verify your imported account.')
            ->line('Activation code: ' . $this->code)
            ->line('This code expires in 15 minutes.');
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


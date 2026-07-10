<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountDeletionConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $token,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Account Deletion Confirmation',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.account-deletion-confirmation',
            with: [
                'user' => $this->user,
                'deletionUrl' => route('account-deletion.show', ['token' => $this->token]),
            ],
        );
    }
}

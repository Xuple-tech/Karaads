<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\VerificationRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class UserVerificationRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_submit_verification_request(): void
    {
        Http::fake([
            'https://api.paystack.co/transaction/initialize' => Http::response([
                'status' => true,
                'data' => ['authorization_url' => 'https://checkout.paystack.test/pay'],
            ]),
        ]);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/users/verification-request', [
            'category' => 'creator',
            'full_name' => 'Jane Doe',
            'contact_email' => 'jane@example.com',
            'reason' => 'I am a notable creator on the platform and I want protection against impersonation.',
            'portfolio_url' => 'https://example.com',
            'social_url' => 'https://instagram.com/janedoe',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.payment_status', 'pending')
            ->assertJsonPath('authorization_url', 'https://checkout.paystack.test/pay');

        $this->assertDatabaseHas('verification_requests', [
            'user_id' => $user->id,
            'status' => VerificationRequest::STATUS_PENDING,
            'category' => 'creator',
            'payment_status' => 'pending',
            'payment_provider' => 'paystack',
        ]);
    }

    public function test_user_cannot_submit_second_pending_verification_request(): void
    {
        $user = User::factory()->create();

        VerificationRequest::query()->create([
            'user_id' => $user->id,
            'status' => VerificationRequest::STATUS_PENDING,
            'category' => 'creator',
            'full_name' => 'Jane Doe',
            'username_snapshot' => $user->username,
            'contact_email' => $user->email,
            'reason' => 'A prior pending request already exists for review.',
            'followers_count_snapshot' => 0,
        ]);

        $response = $this->actingAs($user)->postJson('/api/users/verification-request', [
            'category' => 'creator',
            'full_name' => 'Jane Doe',
            'contact_email' => 'jane@example.com',
            'reason' => 'I am trying to send another request while the first one is pending already.',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'You already have a pending badge payment. Verify it or wait a few minutes before starting another one.');
    }

    public function test_user_can_start_new_payment_after_failed_badge_payment(): void
    {
        Http::fake([
            'https://api.paystack.co/transaction/initialize' => Http::response([
                'status' => true,
                'data' => ['authorization_url' => 'https://checkout.paystack.test/retry'],
            ]),
        ]);

        $user = User::factory()->create();

        VerificationRequest::query()->create([
            'user_id' => $user->id,
            'status' => VerificationRequest::STATUS_REJECTED,
            'category' => 'creator',
            'full_name' => 'Jane Doe',
            'username_snapshot' => $user->username,
            'contact_email' => $user->email,
            'reason' => 'The last badge payment was abandoned by the user.',
            'followers_count_snapshot' => 0,
            'payment_provider' => 'paystack',
            'payment_status' => 'abandoned',
            'payment_reference' => 'kara_verified_old_reference',
        ]);

        $response = $this->actingAs($user)->postJson('/api/users/verification-request', [
            'category' => 'creator',
            'full_name' => 'Jane Doe',
            'contact_email' => 'jane@example.com',
            'reason' => 'I am restarting my badge payment after the earlier payment failed.',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.payment_status', 'pending')
            ->assertJsonPath('authorization_url', 'https://checkout.paystack.test/retry');

        $this->assertSame(2, VerificationRequest::query()->where('user_id', $user->id)->count());
    }

    public function test_stale_pending_badge_payment_is_cleared_before_retry(): void
    {
        Http::fake([
            'https://api.paystack.co/transaction/initialize' => Http::response([
                'status' => true,
                'data' => ['authorization_url' => 'https://checkout.paystack.test/new'],
            ]),
        ]);

        $user = User::factory()->create();
        $stale = VerificationRequest::query()->create([
            'user_id' => $user->id,
            'status' => VerificationRequest::STATUS_PENDING,
            'category' => 'creator',
            'full_name' => 'Jane Doe',
            'username_snapshot' => $user->username,
            'contact_email' => $user->email,
            'reason' => 'A stale pending badge payment should not block retries.',
            'followers_count_snapshot' => 0,
            'payment_provider' => 'paystack',
            'payment_status' => 'pending',
            'payment_reference' => 'kara_verified_stale_reference',
        ]);
        $stale->forceFill([
            'created_at' => now()->subMinutes(45),
            'updated_at' => now()->subMinutes(45),
        ])->save();

        $response = $this->actingAs($user)->postJson('/api/users/verification-request', [
            'category' => 'creator',
            'full_name' => 'Jane Doe',
            'contact_email' => 'jane@example.com',
            'reason' => 'I am restarting my badge payment because the previous one became stale.',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.payment_status', 'pending');

        $this->assertDatabaseHas('verification_requests', [
            'id' => $stale->id,
            'status' => VerificationRequest::STATUS_REJECTED,
            'payment_status' => 'failed',
        ]);
    }

    public function test_show_endpoint_auto_approves_paid_badge_request(): void
    {
        $user = User::factory()->create([
            'kara_verified_at' => null,
            'kara_verified_expires_at' => null,
        ]);

        $request = VerificationRequest::query()->create([
            'user_id' => $user->id,
            'status' => VerificationRequest::STATUS_PENDING,
            'category' => 'creator',
            'full_name' => 'Jane Doe',
            'username_snapshot' => $user->username,
            'contact_email' => $user->email,
            'reason' => 'This badge payment was already completed and should be auto-approved when viewed.',
            'followers_count_snapshot' => 0,
            'payment_provider' => 'wallet',
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);

        $response = $this->actingAs($user)->getJson('/api/users/verification-request');

        $response->assertOk()
            ->assertJsonPath('data.id', $request->id)
            ->assertJsonPath('data.status', VerificationRequest::STATUS_APPROVED)
            ->assertJsonPath('data.payment_status', 'paid');

        $this->assertDatabaseHas('verification_requests', [
            'id' => $request->id,
            'status' => VerificationRequest::STATUS_APPROVED,
            'payment_status' => 'paid',
        ]);

        $user->refresh();

        $this->assertNotNull($user->kara_verified_at);
        $this->assertTrue($user->hasActiveKaraVerifiedBadge());
    }
}

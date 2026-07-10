<?php

namespace App\Http\Controllers\Api\V2;

use App\Domain\AdsV2\Services\EventIngestionService;
use App\Http\Controllers\Controller;
use App\Models\AdsV2\AdDelivery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdsEventController extends Controller
{
    public function __construct(private readonly EventIngestionService $eventIngestionService) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'delivery_id' => 'nullable|uuid',
            'event_type' => 'required|in:impression,view_start,view_complete,click,dismiss,conversion,invalidated',
            'occurred_at' => 'nullable|date',
            'session_id' => 'nullable|string|max:128',
            'fingerprint' => 'nullable|string|max:255',
            'idempotency_key' => 'nullable|string|max:255',
            'signature' => 'nullable|string|max:255',
            'meta' => 'nullable|array',
        ]);

        if (! empty($validated['delivery_id'])) {
            $delivery = AdDelivery::find($validated['delivery_id']);
            if (! $delivery) {
                return response()->json(['message' => 'Delivery not found.'], 404);
            }

            if (! empty($validated['session_id']) && $validated['session_id'] !== $delivery->session_id) {
                return response()->json(['message' => 'Session mismatch.'], 422);
            }

            if ($delivery->expires_at && now()->greaterThan($delivery->expires_at)) {
                return response()->json(['message' => 'Delivery has expired.'], 410);
            }

            $viewerId = $request->user()?->id;
            if ($delivery->viewer_user_id && $viewerId && $delivery->viewer_user_id !== $viewerId) {
                return response()->json(['message' => 'Unauthorized delivery access.'], 403);
            }

            $providedSignature = (string) ($validated['signature'] ?? '');
            $expected = (string) ($delivery->signature ?: hash_hmac(
                'sha256',
                $delivery->id . '|' . $delivery->session_id,
                (string) config('app.key'),
            ));

            if (! hash_equals($expected, $providedSignature)) {
                return response()->json(['message' => 'Invalid signature.'], 422);
            }
        }

        $event = $this->eventIngestionService->ingest(
            $validated,
            $request->user()?->id,
            $request->ip(),
            $request->userAgent(),
        );

        return response()->json([
            'message' => 'Event recorded.',
            'event' => [
                'id' => $event->id,
                'event_type' => $event->event_type,
                'is_billable' => $event->is_billable,
                'billed_amount' => (float) $event->billed_amount,
                'invalidated' => $event->invalidated,
                'invalid_reason' => $event->invalid_reason,
            ],
        ], 201);
    }
}

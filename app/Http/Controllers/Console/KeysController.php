<?php

namespace App\Http\Controllers\Console;

use App\Models\DeveloperApiKey;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KeysController extends ConsoleBaseController
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $filters = $this->filters($request);
        $keyQuery = $user->developerApiKeys()
            ->withCount('usageRecords')
            ->withSum('usageRecords', 'cost_usd')
            ->latest();

        if (($filters['key_status'] ?? null) === 'active') {
            $keyQuery->where('is_active', true);
        } elseif (($filters['key_status'] ?? null) === 'revoked') {
            $keyQuery->where('is_active', false);
        }

        return Inertia::render('User/DeveloperApi/Index', array_merge(
            $this->sharedProps($request, 'keys'),
            [
                'apiKeys' => $keyQuery->paginate(10)->withQueryString()->through(fn (DeveloperApiKey $k) => [
                    'id' => $k->id,
                    'name' => $k->name,
                    'key_prefix' => $k->key_prefix,
                    'is_active' => $k->is_active,
                    'notes' => $k->notes,
                    'allowed_model_ids' => $k->allowed_model_ids ?? [],
                    'expires_at' => optional($k->expires_at)->toIso8601String(),
                    'last_used_at' => optional($k->last_used_at)->toIso8601String(),
                    'last_rotated_at' => optional($k->last_rotated_at)->toIso8601String(),
                    'usage_requests_count' => (int) $k->usage_records_count,
                    'usage_spend_usd' => round((float) ($k->usage_records_sum_cost_usd ?? 0), 6),
                ]),
            ]
        ));
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'allowed_model_ids' => 'nullable|array',
            'allowed_model_ids.*' => 'string|exists:api_models,public_id',
            'expires_at' => 'nullable|date|after:now',
        ]);

        [, $plainTextKey] = $this->tokenService->createKey(
            $request->user(),
            $validated['name'],
            $validated['allowed_model_ids'] ?? null,
            $validated['expires_at'] ?? null,
            $validated['notes'] ?? null
        );

        return back()
            ->with('success', 'Developer API key created successfully.')
            ->with('developer_plaintext_key', $plainTextKey);
    }

    public function update(Request $request, DeveloperApiKey $developerApiKey): RedirectResponse
    {
        abort_unless($developerApiKey->user_id === $request->user()->id, 404);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'allowed_model_ids' => 'nullable|array',
            'allowed_model_ids.*' => 'string|exists:api_models,public_id',
            'expires_at' => 'nullable|date',
        ]);

        $this->tokenService->updateKey(
            $developerApiKey,
            $validated['name'],
            $validated['allowed_model_ids'] ?? null,
            $validated['expires_at'] ?? null,
            $validated['notes'] ?? null
        );

        return back()->with('success', 'Developer API key updated.');
    }

    public function revoke(Request $request, DeveloperApiKey $developerApiKey): RedirectResponse
    {
        abort_unless($developerApiKey->user_id === $request->user()->id, 404);

        $developerApiKey->update(['is_active' => false]);

        return back()->with('success', 'Developer API key revoked.');
    }

    public function regenerate(Request $request, DeveloperApiKey $developerApiKey): RedirectResponse
    {
        abort_unless($developerApiKey->user_id === $request->user()->id, 404);

        [, $plainTextKey] = $this->tokenService->regenerateKey($developerApiKey);

        return back()
            ->with('success', 'Developer API key regenerated successfully.')
            ->with('developer_plaintext_key', $plainTextKey);
    }
}

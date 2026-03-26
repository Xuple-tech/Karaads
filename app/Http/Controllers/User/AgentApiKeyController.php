<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AIAgent;
use App\Models\AgentApiKey;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class AgentApiKeyController extends Controller
{
    public function index(Request $request, AIAgent $agent)
    {
        // $this->authorize('view', $agent);

        $apiKeys = $agent->apiKeys()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('User/Agents/ApiKeys/Index', [
            'agent' => $agent,
            'apiKeys' => $apiKeys,
        ]);
    }

    public function create(Request $request, AIAgent $agent)
    {
        // $this->authorize('update', $agent);

        return Inertia::render('User/Agents/ApiKeys/Create', [
            'agent' => $agent,
        ]);
    }

    public function store(Request $request, AIAgent $agent)
    {
        // $this->authorize('update', $agent);

        $request->validate([
            'name' => 'required|string|max:255',
            'permissions' => 'nullable|array',
            'expires_at' => 'nullable|date|after:today',
        ]);

        $apiKey = Str::random(32);
        $secretKey = Str::random(64);

        $agent->apiKeys()->create([
            'name' => $request->name,
            'api_key' => hash('sha256', $apiKey),
            'secret_key' => hash('sha256', $secretKey),
            'permissions' => $request->permissions ?? ['read', 'write'],
            'expires_at' => $request->expires_at,
            'is_active' => true,
        ]);

        // Return the plain keys only once (for user to copy)
        return Inertia::render('User/Agents/ApiKeys/Created', [
            'agent' => $agent,
            'plain_api_key' => $apiKey,
            'plain_secret_key' => $secretKey,
            'apiKey' => [
                'name' => $request->name,
                'expires_at' => $request->expires_at,
            ],
        ]);
    }

    public function destroy(Request $request, AIAgent $agent, AgentApiKey $apiKey)
    {
        // $this->authorize('update', $agent);

        if ($apiKey->agent_id !== $agent->id) {
            abort(404);
        }

        $apiKey->delete();

        return back()->with('success', 'API key deleted successfully.');
    }

    public function toggleActive(Request $request, AIAgent $agent, AgentApiKey $apiKey)
    {
        // $this->authorize('update', $agent);

        if ($apiKey->agent_id !== $agent->id) {
            abort(404);
        }

        $apiKey->update([
            'is_active' => !$apiKey->is_active,
        ]);

        return back()->with('success', 'API key ' . ($apiKey->is_active ? 'activated' : 'deactivated') . ' successfully.');
    }

    public function regenerate(Request $request, AIAgent $agent, AgentApiKey $apiKey)
    {
        // $this->authorize('update', $agent);

        if ($apiKey->agent_id !== $agent->id) {
            abort(404);
        }

        $newApiKey = Str::random(32);
        $newSecretKey = Str::random(64);

        $apiKey->update([
            'api_key' => hash('sha256', $newApiKey),
            'secret_key' => hash('sha256', $newSecretKey),
            'last_used_at' => null,
        ]);

        // Return the new plain keys
        return Inertia::render('User/Agents/ApiKeys/Regenerated', [
            'agent' => $agent,
            'plain_api_key' => $newApiKey,
            'plain_secret_key' => $newSecretKey,
            'apiKey' => $apiKey,
        ]);
    }
}

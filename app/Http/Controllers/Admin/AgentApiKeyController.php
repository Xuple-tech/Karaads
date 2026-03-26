<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgentApiKey;
use App\Models\AIAgent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class AgentApiKeyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = AgentApiKey::with('agent');

        if ($request->has('agent_id')) {
            $query->where('agent_id', $request->agent_id);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $apiKeys = $query->orderBy('created_at', 'desc')
            ->paginate(20);

        // Mask API keys for security
        $apiKeys->getCollection()->transform(function ($key) {
            if ($key->api_key) {
                $key->api_key = substr($key->api_key, 0, 4) . '...' . substr($key->api_key, -4);
            }
            return $key;
        });

        return Inertia::render('Admin/AgentApiKeys/Index', [
            'apiKeys' => $apiKeys,
            'filters' => $request->only(['search', 'agent_id']),
            'agents' => AIAgent::select('id', 'name')->where('is_active', true)->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/AgentApiKeys/Create', [
            'agents' => AIAgent::select('id', 'name')->where('is_active', true)->get(),
            'permissionOptions' => [
                'chat' => 'Chat Access',
                'knowledge_base' => 'Knowledge Base Access',
                'tools' => 'Tools Access',
                'analytics' => 'Analytics Access',
                'admin' => 'Admin Access',
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'agent_id' => 'required|exists:ai_agents,id',
            'name' => 'required|string|max:255',
            'expires_at' => 'nullable|date|after:today',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string',
        ]);

        // Generate API keys
        $validated['api_key'] = 'kapi_' . Str::random(32);
        $validated['secret_key'] = 'ksec_' . Str::random(64);
        $validated['is_active'] = true;

        $apiKey = AgentApiKey::create($validated);

        // Return full keys only on creation
        session()->flash('api_key_created', [
            'api_key' => $apiKey->api_key,
            'secret_key' => $apiKey->secret_key,
            'warning' => 'Please save these keys now. They will not be shown again.'
        ]);

        return redirect()->route('admin.agent-api-keys.show', $apiKey)
            ->with('success', 'API key created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(AgentApiKey $agentApiKey)
    {
        $agentApiKey->load('agent');

        // Mask keys for display
        if ($agentApiKey->api_key) {
            // $agentApiKey->api_key = substr($agentApiKey->api_key, 0, 4) . '...' . substr($agentApiKey->api_key, -4);
            $realKey = $agentApiKey->api_key;
        }

        return Inertia::render('Admin/AgentApiKeys/Show', [
            'apiKey' => $agentApiKey,
            'realKey' => $realKey,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AgentApiKey $agentApiKey)
    {
        $agentApiKey->load('agent');

        return Inertia::render('Admin/AgentApiKeys/Edit', [
            'apiKey' => $agentApiKey,
            'agents' => AIAgent::select('id', 'name')->where('is_active', true)->get(),
            'permissionOptions' => [
                'chat' => 'Chat Access',
                'knowledge_base' => 'Knowledge Base Access',
                'tools' => 'Tools Access',
                'analytics' => 'Analytics Access',
                'admin' => 'Admin Access',
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AgentApiKey $agentApiKey)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'expires_at' => 'nullable|date|after:today',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string',
            'is_active' => 'boolean',
        ]);

        $agentApiKey->update($validated);

        return redirect()->route('admin.agent-api-keys.index')
            ->with('success', 'API key updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AgentApiKey $agentApiKey)
    {
        $agentApiKey->delete();

        return redirect()->route('admin.agent-api-keys.index')
            ->with('success', 'API key deleted successfully.');
    }

    /**
     * Regenerate API key
     */
    public function regenerate(AgentApiKey $agentApiKey)
    {
        $newApiKey = 'kapi_' . Str::random(32);

        $agentApiKey->update([
            'api_key' => $newApiKey,
            'last_used_at' => null,
        ]);

        session()->flash('api_key_regenerated', [
            'api_key' => $newApiKey,
            'warning' => 'Please save the new API key now. It will not be shown again.'
        ]);

        return redirect()->route('admin.agent-api-keys.show', $agentApiKey)
            ->with('success', 'API key regenerated successfully.');
    }

    /**
     * Regenerate secret key
     */
    public function regenerateSecret(AgentApiKey $agentApiKey)
    {
        $newSecretKey = 'ksec_' . Str::random(64);

        $agentApiKey->update([
            'secret_key' => $newSecretKey,
            'last_used_at' => null,
        ]);

        session()->flash('secret_key_regenerated', [
            'secret_key' => $newSecretKey,
            'warning' => 'Please save the new secret key now. It will not be shown again.'
        ]);

        return redirect()->route('admin.agent-api-keys.show', $agentApiKey)
            ->with('success', 'Secret key regenerated successfully.');
    }

    /**
     * Revoke API key
     */
    public function revoke(AgentApiKey $agentApiKey)
    {
        $agentApiKey->update([
            'is_active' => false,
            'expires_at' => now(),
        ]);

        return redirect()->back()
            ->with('success', 'API key revoked successfully.');
    }
}

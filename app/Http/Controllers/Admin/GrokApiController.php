<?php

namespace App\Http\Controllers\Admin;

use App\Models\GrokApiConfig;
use App\Models\AiPromptTemplate;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;

/**
 * GrokApiController
 *
 * Manage Grok API keys and configurations
 */
class GrokApiController extends \Illuminate\Routing\Controller
{
    /**
     * Show all API configurations
     */
    public function index()
    {
        $configs = GrokApiConfig::with('creator')->latest()->paginate(20);

        return Inertia::render('Admin/GrokApi/Index', ['configs' => $configs]);
    }

    /**
     * Show create form
     */
    public function create()
    {
        return Inertia::render('Admin/GrokApi/Create');
    }

    /**
     * Store new API configuration
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'api_key' => 'required|string|min:20',
            'model' => 'required|string|in:grok-3,grok-4',
            'rate_limit' => 'required|integer|min:100',
            'allowed_features' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $config = GrokApiConfig::create([
            ...$validated,
            'created_by' => auth()->id(),
        ]);

        // Verify the key works
        if (!$config->verifyKey()) {
            $config->delete();
            return back()->withErrors(['api_key' => 'Failed to verify API key']);
        }

        AuditLog::logAction('create', 'GrokApiConfig', $config->id, null, $validated, 'Created new Grok API configuration');

        return redirect()->route('admin.grok-api.show', $config)->with('success', 'API configuration created');
    }

    /**
     * Show configuration
     */
    public function show(GrokApiConfig $config)
    {
        return Inertia::render('Admin/GrokApi/Show', ['config' => $config->load('creator')]);
    }

    /**
     * Edit configuration
     */
    public function edit(GrokApiConfig $config)
    {
        return Inertia::render('Admin/GrokApi/Edit', ['config' => $config]);
    }

    /**
     * Update configuration
     */
    public function update(Request $request, GrokApiConfig $config)
    {
        $validated = $request->validate([
            'model' => 'required|string|in:grok-3,grok-4',
            'rate_limit' => 'required|integer|min:100',
            'allowed_features' => 'nullable|array',
            'notes' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $oldValues = $config->toArray();
        $config->update($validated);

        AuditLog::logAction('update', 'GrokApiConfig', $config->id, $oldValues, $validated, 'Updated Grok API configuration');

        return redirect()->route('admin.grok-api.show', $config)->with('success', 'Configuration updated');
    }

    /**
     * Test API key
     */
    public function test(GrokApiConfig $config)
    {
        $isValid = $config->verifyKey();

        return response()->json([
            'valid' => $isValid,
            'message' => $isValid ? 'API key verified successfully' : 'API key verification failed',
        ]);
    }

    /**
     * Deactivate configuration
     */
    public function deactivate(GrokApiConfig $config)
    {
        $config->update(['is_active' => false]);

        AuditLog::logAction('deactivate', 'GrokApiConfig', $config->id, null, ['is_active' => false], 'Deactivated API configuration');

        return back()->with('success', 'API configuration deactivated');
    }

    /**
     * Delete configuration
     */
    public function destroy(GrokApiConfig $config)
    {
        $config->delete();

        AuditLog::logAction('delete', 'GrokApiConfig', $config->id, $config->toArray(), null, 'Deleted API configuration');

        return redirect()->route('admin.grok-api.index')->with('success', 'Configuration deleted');
    }
}

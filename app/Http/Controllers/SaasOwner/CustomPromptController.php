<?php

namespace App\Http\Controllers\SaasOwner;

use App\Models\AiPromptTemplate;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * CustomPromptController
 *
 * Manage custom AI prompts for SaaS instance
 */
class CustomPromptController extends \Illuminate\Routing\Controller
{
    /**
     * Show custom prompts
     */
    public function index()
    {
        $user = auth()->user();
        $prompts = AiPromptTemplate::where('user_id', $user->id)
            ->paginate(20)
            ->through(fn ($prompt) => [
                'id' => $prompt->id,
                'title' => $prompt->name,
                'description' => $prompt->description ?? '',
                'content' => $prompt->prompt,
                'category' => $prompt->category ?? 'uncategorized',
                'is_active' => true,
                'usage_count' => $prompt->usage_count ?? 0,
                'created_at' => $prompt->created_at->toIso8601String(),
            ]);

        // Get stats
        $stats = [
            'total_prompts' => AiPromptTemplate::where('user_id', $user->id)->count(),
            'active_prompts' => AiPromptTemplate::where('user_id', $user->id)->count(),
            'total_usage' => AiPromptTemplate::where('user_id', $user->id)->sum('usage_count'),
        ];

        return Inertia::render('SaasOwner/Prompts', [
            'prompts' => [
                'data' => $prompts->items(),
                'current_page' => $prompts->currentPage(),
                'last_page' => $prompts->lastPage(),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Create new custom prompt
     */
    public function create()
    {
        $systemPrompts = AiPromptTemplate::getSystemTemplates();

        return Inertia::render('SaasOwner/Prompts/Create', ['systemPrompts' => $systemPrompts]);
    }

    /**
     * Store new prompt
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:ai_prompt_templates,name,NULL,id,user_id,' . auth()->id(),
            'prompt' => 'required|string|min:10',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'variables' => 'nullable|array',
        ]);

        $prompt = AiPromptTemplate::create([
            ...$validated,
            'user_id' => auth()->id(),
        ]);

        AuditLog::logAction('create', 'AiPromptTemplate', $prompt->id, null, $validated, 'Created custom prompt');

        return redirect()->route('saas-owner.prompts.show', $prompt)->with('success', 'Prompt created');
    }

    /**
     * Show prompt
     */
    public function show(AiPromptTemplate $prompt)
    {
        if ($prompt->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('SaasOwner/Prompts/Show', ['prompt' => $prompt]);
    }

    /**
     * Edit prompt
     */
    public function edit(AiPromptTemplate $prompt)
    {
        if ($prompt->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('SaasOwner/Prompts/Edit', ['prompt' => $prompt]);
    }

    /**
     * Update prompt
     */
    public function update(Request $request, AiPromptTemplate $prompt)
    {
        if ($prompt->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'prompt' => 'required|string|min:10',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'variables' => 'nullable|array',
        ]);

        $oldValues = $prompt->toArray();
        $prompt->update($validated);

        AuditLog::logAction('update', 'AiPromptTemplate', $prompt->id, $oldValues, $validated, 'Updated custom prompt');

        return redirect()->route('saas-owner.prompts.show', $prompt)->with('success', 'Prompt updated');
    }

    /**
     * Test prompt
     */
    public function test(Request $request, AiPromptTemplate $prompt)
    {
        if ($prompt->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'test_input' => 'required|string',
        ]);

        $renderedPrompt = $prompt->renderPrompt([
            'user_input' => $validated['test_input'],
        ]);

        return response()->json(['rendered' => $renderedPrompt]);
    }

    /**
     * Delete prompt
     */
    public function destroy(AiPromptTemplate $prompt)
    {
        if ($prompt->user_id !== auth()->id()) {
            abort(403);
        }

        $prompt->delete();

        AuditLog::logAction('delete', 'AiPromptTemplate', $prompt->id, $prompt->toArray(), null, 'Deleted custom prompt');

        return redirect()->route('saas-owner.prompts.index')->with('success', 'Prompt deleted');
    }
}

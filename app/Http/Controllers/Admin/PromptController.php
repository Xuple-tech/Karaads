<?php

namespace App\Http\Controllers\Admin;

use App\Models\AiPromptTemplate;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * PromptController
 *
 * Manage AI prompt templates system-wide and per SaaS owner
 */
class PromptController extends \Illuminate\Routing\Controller
{
    /**
     * Show system prompts
     */
    public function index(Request $request)
    {
        $query = AiPromptTemplate::whereNull('user_id');

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('prompt', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category') && $request->category !== '') {
            $query->where('category', $request->category);
        }

        // Filter by active status
        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->is_active === '1');
        }

        $prompts = $query->orderBy('created_at', 'desc')->paginate(20);

        return Inertia::render('Admin/Prompts/Index', [
            'prompts' => $prompts,
            'filters' => [
                'search' => $request->search,
                'category' => $request->category,
                'is_active' => $request->is_active,
            ],
        ]);
    }

    /**
     * Create new system prompt
     */
    public function create()
    {
        return Inertia::render('Admin/Prompts/Create');
    }

    /**
     * Store new prompt
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:ai_prompt_templates,name',
            'prompt' => 'required|string|min:10',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'variables' => 'nullable|array',
        ]);

        $validated['user_id'] = null; // System prompt
        $validated['is_active'] = true;

        $prompt = AiPromptTemplate::create($validated);

        AuditLog::logAction('create', 'AiPromptTemplate', $prompt->id, null, $validated, 'Created system prompt template');

        return redirect()->route('admin.prompts.show', $prompt)->with('success', 'Prompt created');
    }

    /**
     * Show prompt
     */
    public function show(AiPromptTemplate $prompt)
    {
        if ($prompt->user_id !== null) {
            abort(403);
        }

        return Inertia::render('Admin/Prompts/Show', ['prompt' => $prompt]);
    }

    /**
     * Edit prompt
     */
    public function edit(AiPromptTemplate $prompt)
    {
        if ($prompt->user_id !== null) {
            abort(403);
        }

        return Inertia::render('Admin/Prompts/Edit', ['prompt' => $prompt]);
    }

    /**
     * Update prompt
     */
    public function update(Request $request, AiPromptTemplate $prompt)
    {
        if ($prompt->user_id !== null) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|unique:ai_prompt_templates,name,' . $prompt->id,
            'prompt' => 'required|string|min:10',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'variables' => 'nullable|array',
        ]);

        $oldValues = $prompt->toArray();
        $prompt->update($validated);

        AuditLog::logAction('update', 'AiPromptTemplate', $prompt->id, $oldValues, $validated, 'Updated prompt template');

        return redirect()->route('admin.prompts.show', $prompt)->with('success', 'Prompt updated');
    }

    /**
     * Test prompt (call with sample input)
     */
    public function test(Request $request, AiPromptTemplate $prompt)
    {
        $validated = $request->validate([
            'test_input' => 'required|string',
        ]);

        // Render the prompt with test input
        $renderedPrompt = $prompt->renderPrompt([
            'user_input' => $validated['test_input'],
        ]);

        return response()->json([
            'rendered' => $renderedPrompt,
        ]);
    }

    /**
     * Delete prompt
     */
    public function destroy(AiPromptTemplate $prompt)
    {
        if ($prompt->user_id !== null) {
            abort(403);
        }

        $prompt->delete();

        AuditLog::logAction('delete', 'AiPromptTemplate', $prompt->id, $prompt->toArray(), null, 'Deleted prompt template');

        return redirect()->route('admin.prompts.index')->with('success', 'Prompt deleted');
    }
}

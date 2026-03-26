<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgentTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgentTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $templates = AgentTemplate::withCount('agents')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/AgentTemplates/Index', [
            'templates' => $templates,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/AgentTemplates/Create', [
            'categories' => ['ecommerce', 'support', 'booking', 'education', 'healthcare', 'other'],
            'industries' => [
                'retail', 'technology', 'healthcare', 'education', 'finance',
                'hospitality', 'real_estate', 'marketing', 'consulting', 'other'
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string',
            'industry' => 'nullable|string',
            'default_config' => 'nullable|array',
            'welcome_message' => 'nullable|string',
            'suggested_questions' => 'nullable|array',
            'tools_config' => 'nullable|array',
            'knowledge_base_structure' => 'nullable|array',
            'widget_settings' => 'nullable|array',
            'is_active' => 'boolean',
            'is_premium' => 'boolean',
            'price' => 'nullable|numeric|min:0',
        ]);

        $validated['created_by_admin_id'] = auth()->id();

        AgentTemplate::create($validated);

        return redirect()->route('admin.agent-templates.index')
            ->with('success', 'Template created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(AgentTemplate $agentTemplate)
    {
        $agentTemplate->load('agents');

        return Inertia::render('Admin/AgentTemplates/Show', [
            'template' => $agentTemplate,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AgentTemplate $agentTemplate)
    {
        return Inertia::render('Admin/AgentTemplates/Edit', [
            'template' => $agentTemplate,
            'categories' => ['ecommerce', 'support', 'booking', 'education', 'healthcare', 'other'],
            'industries' => [
                'retail', 'technology', 'healthcare', 'education', 'finance',
                'hospitality', 'real_estate', 'marketing', 'consulting', 'other'
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AgentTemplate $agentTemplate)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string',
            'industry' => 'nullable|string',
            'default_config' => 'nullable|array',
            'welcome_message' => 'nullable|string',
            'suggested_questions' => 'nullable|array',
            'tools_config' => 'nullable|array',
            'knowledge_base_structure' => 'nullable|array',
            'widget_settings' => 'nullable|array',
            'is_active' => 'boolean',
            'is_premium' => 'boolean',
            'price' => 'nullable|numeric|min:0',
        ]);

        $agentTemplate->update($validated);

        return redirect()->route('admin.agent-templates.index')
            ->with('success', 'Template updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AgentTemplate $agentTemplate)
    {
        if ($agentTemplate->agents()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete template that has associated agents.');
        }

        $agentTemplate->delete();

        return redirect()->route('admin.agent-templates.index')
            ->with('success', 'Template deleted successfully.');
    }

    /**
     * Toggle template status
     */
    public function toggleStatus(AgentTemplate $agentTemplate)
    {
        $agentTemplate->update([
            'is_active' => !$agentTemplate->is_active
        ]);

        return redirect()->back()
            ->with('success', 'Template status updated.');
    }
}

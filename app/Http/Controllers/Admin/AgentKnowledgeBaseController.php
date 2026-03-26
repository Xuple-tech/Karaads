<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgentKnowledgeBase;
use App\Models\AIAgent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgentKnowledgeBaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = AgentKnowledgeBase::with('agent');

        if ($request->has('agent_id')) {
            $query->where('agent_id', $request->agent_id);
        }

        if ($request->has('content_type')) {
            $query->where('content_type', $request->content_type);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }

        $knowledgeBases = $query->orderBy('order')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/AgentKnowledgeBases/Index', [
            'knowledgeBases' => $knowledgeBases,
            'filters' => $request->only(['search', 'agent_id', 'content_type']),
            'agents' => AIAgent::select('id', 'name')->where('is_active', true)->get(),
            'contentTypes' => ['faq', 'product_info', 'policy', 'custom', 'website_content'],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/AgentKnowledgeBases/Create', [
            'agents' => AIAgent::select('id', 'name')->where('is_active', true)->get(),
            'contentTypes' => ['faq', 'product_info', 'policy', 'custom', 'website_content'],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'agent_id' => 'required|exists:ai_agents,id',
            'content_type' => 'required|string',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'source_url' => 'nullable|url',
            'file_path' => 'nullable|string',
            'file_type' => 'nullable|string',
            'file_size' => 'nullable|integer',
            'is_active' => 'boolean',
            'order' => 'nullable|integer',
            'metadata' => 'nullable|array',
        ]);

        AgentKnowledgeBase::create($validated);

        return redirect()->route('admin.agent-knowledge-bases.index')
            ->with('success', 'Knowledge base item created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(AgentKnowledgeBase $agentKnowledgeBase)
    {
        $agentKnowledgeBase->load('agent');

        return Inertia::render('Admin/AgentKnowledgeBases/Show', [
            'knowledgeBase' => $agentKnowledgeBase,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AgentKnowledgeBase $agentKnowledgeBase)
    {
        return Inertia::render('Admin/AgentKnowledgeBases/Edit', [
            'knowledgeBase' => $agentKnowledgeBase,
            'agents' => AIAgent::select('id', 'name')->where('is_active', true)->get(),
            'contentTypes' => ['faq', 'product_info', 'policy', 'custom', 'website_content'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AgentKnowledgeBase $agentKnowledgeBase)
    {
        $validated = $request->validate([
            'agent_id' => 'required|exists:ai_agents,id',
            'content_type' => 'required|string',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'source_url' => 'nullable|url',
            'file_path' => 'nullable|string',
            'file_type' => 'nullable|string',
            'file_size' => 'nullable|integer',
            'is_active' => 'boolean',
            'order' => 'nullable|integer',
            'metadata' => 'nullable|array',
        ]);

        $agentKnowledgeBase->update($validated);

        return redirect()->route('admin.agent-knowledge-bases.index')
            ->with('success', 'Knowledge base item updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AgentKnowledgeBase $agentKnowledgeBase)
    {
        $agentKnowledgeBase->delete();

        return redirect()->route('admin.agent-knowledge-bases.index')
            ->with('success', 'Knowledge base item deleted successfully.');
    }

    /**
     * Toggle active status
     */
    public function toggleStatus(AgentKnowledgeBase $agentKnowledgeBase)
    {
        $agentKnowledgeBase->update([
            'is_active' => !$agentKnowledgeBase->is_active
        ]);

        return redirect()->back()
            ->with('success', 'Status updated.');
    }

    /**
     * Bulk actions
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'action' => 'required|in:activate,deactivate,delete',
        ]);

        $query = AgentKnowledgeBase::whereIn('id', $request->ids);

        switch ($request->action) {
            case 'activate':
                $query->update(['is_active' => true]);
                $message = 'Selected items activated.';
                break;
            case 'deactivate':
                $query->update(['is_active' => false]);
                $message = 'Selected items deactivated.';
                break;
            case 'delete':
                $query->delete();
                $message = 'Selected items deleted.';
                break;
        }

        return redirect()->back()->with('success', $message);
    }
}

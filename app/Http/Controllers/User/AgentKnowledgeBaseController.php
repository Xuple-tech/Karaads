<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AIAgent;
use App\Models\AgentKnowledgeBase;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgentKnowledgeBaseController extends Controller
{ 
    public function index(Request $request, AIAgent $agent)
    {
        // $this->authorize('view', $agent);

        $knowledgeBase = $agent->knowledgeBase()
            ->orderBy('order')
            ->paginate(20);

        return Inertia::render('User/Agents/KnowledgeBase/Index', [
            'agent' => $agent,
            'knowledgeBase' => $knowledgeBase,
        ]);
    }

    public function create(Request $request, AIAgent $agent)
    {
        // $this->authorize('update', $agent);

        return Inertia::render('User/Agents/KnowledgeBase/Create', [
            'agent' => $agent,
        ]);
    }

    public function store(Request $request, AIAgent $agent)
    {
        // $this->authorize('update', $agent);

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'content_type' => 'required|in:faq,product_info,policy,custom,website_content',
            'source_url' => 'nullable|url',
            'is_active' => 'boolean',
        ]);

        $order = $agent->knowledgeBase()->max('order') + 1;

        $agent->knowledgeBase()->create([
            'title' => $request->title,
            'content' => $request->content,
            'content_type' => $request->content_type,
            'source_url' => $request->source_url,
            'is_active' => $request->is_active ?? true,
            'order' => $order,
        ]);

        return redirect()->route('user.agents.knowledge-base.index', $agent)->with('success', 'Knowledge base item added successfully.');
    }

    public function edit(Request $request, AIAgent $agent, AgentKnowledgeBase $knowledge)
    {
        // $this->authorize('update', $agent);

        if ($knowledge->agent_id !== $agent->id) {
            abort(404);
        }

        return Inertia::render('User/Agents/KnowledgeBase/Edit', [
            'agent' => $agent,
            'knowledge' => $knowledge,
        ]);
    }

    public function update(Request $request, AIAgent $agent, AgentKnowledgeBase $knowledge)
    {
        // $this->authorize('update', $agent);

        if ($knowledge->agent_id !== $agent->id) {
            abort(404);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'content_type' => 'required|in:faq,product_info,policy,custom,website_content',
            'source_url' => 'nullable|url',
            'is_active' => 'boolean',
        ]);

        $knowledge->update($request->only([
            'title',
            'content',
            'content_type',
            'source_url',
            'is_active'
        ]));

        return redirect()->route('user.agents.knowledge-base.index', $agent)->with('success', 'Knowledge base item updated successfully.');
    }

    public function destroy(Request $request, AIAgent $agent, AgentKnowledgeBase $knowledge)
    {
        // $this->authorize('update', $agent);

        if ($knowledge->agent_id !== $agent->id) {
            abort(404);
        }

        $knowledge->delete();

        // Reorder remaining items
        $items = $agent->knowledgeBase()->orderBy('order')->get();
        foreach ($items as $index => $item) {
            $item->update(['order' => $index + 1]);
        }

        return back()->with('success', 'Knowledge base item deleted successfully.');
    }

    public function toggleActive(Request $request, AIAgent $agent, AgentKnowledgeBase $knowledge)
    {
        // $this->authorize('update', $agent);

        if ($knowledge->agent_id !== $agent->id) {
            abort(404);
        }

        $knowledge->update([
            'is_active' => !$knowledge->is_active,
        ]);

        return back()->with('success', 'Item ' . ($knowledge->is_active ? 'activated' : 'deactivated') . ' successfully.');
    }

    public function import(Request $request, AIAgent $agent)
    {
        $this->authorize('update', $agent);

        $request->validate([
            'type' => 'required|in:csv,json,website',
            'file' => 'required_if:type,csv,json|file|max:10240',
            'url' => 'required_if:type,website|url',
        ]);

        // Implement import logic based on type
        // This is a simplified example

        return back()->with('success', 'Import completed successfully.');
    }
}

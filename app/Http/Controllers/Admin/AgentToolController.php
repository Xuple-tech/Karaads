<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgentTool;
use App\Models\AIAgent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgentToolController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = AgentTool::with('agent');

        if ($request->has('agent_id')) {
            $query->where('agent_id', $request->agent_id);
        }

        if ($request->has('tool_type')) {
            $query->where('tool_type', $request->tool_type);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $tools = $query->orderBy('order')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/AgentTools/Index', [
            'tools' => $tools,
            'filters' => $request->only(['search', 'agent_id', 'tool_type']),
            'agents' => AIAgent::select('id', 'name')->where('is_active', true)->get(),
            'toolTypes' => ['calculator', 'booking', 'product_search', 'support_ticket', 'custom'],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/AgentTools/Create', [
            'agents' => AIAgent::select('id', 'name')->where('is_active', true)->get(),
            'toolTypes' => ['calculator', 'booking', 'product_search', 'support_ticket', 'custom'],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'agent_id' => 'required|exists:ai_agents,id',
            'tool_type' => 'required|string',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'configuration' => 'nullable|array',
            'is_active' => 'boolean',
            'order' => 'nullable|integer',
        ]);

        AgentTool::create($validated);

        return redirect()->route('admin.agent-tools.index')
            ->with('success', 'Tool created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(AgentTool $agentTool)
    {
        $agentTool->load('agent');

        return Inertia::render('Admin/AgentTools/Show', [
            'tool' => $agentTool,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AgentTool $agentTool)
    {
        return Inertia::render('Admin/AgentTools/Edit', [
            'tool' => $agentTool,
            'agents' => AIAgent::select('id', 'name')->where('is_active', true)->get(),
            'toolTypes' => ['calculator', 'booking', 'product_search', 'support_ticket', 'custom'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AgentTool $agentTool)
    {
        $validated = $request->validate([
            'agent_id' => 'required|exists:ai_agents,id',
            'tool_type' => 'required|string',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'configuration' => 'nullable|array',
            'is_active' => 'boolean',
            'order' => 'nullable|integer',
        ]);

        $agentTool->update($validated);

        return redirect()->route('admin.agent-tools.index')
            ->with('success', 'Tool updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AgentTool $agentTool)
    {
        $agentTool->delete();

        return redirect()->route('admin.agent-tools.index')
            ->with('success', 'Tool deleted successfully.');
    }

    /**
     * Test tool configuration
     */
    public function test(Request $request, AgentTool $agentTool)
    {
        $request->validate([
            'test_data' => 'nullable|array',
        ]);

        // Here you would implement actual tool testing logic
        // This is a placeholder for tool testing

        return response()->json([
            'success' => true,
            'message' => 'Tool test completed.',
            'tool' => $agentTool,
            'test_data' => $request->test_data,
        ]);
    }
}

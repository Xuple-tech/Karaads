<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AIAgent;
use App\Models\AgentTool;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgentToolController extends Controller
{
    public function index(Request $request, AIAgent $agent)
    {
        // $this->authorize('view', $agent);

        $tools = $agent->tools()
            ->orderBy('order')
            ->paginate(20);

        return Inertia::render('User/Agents/Tools/Index', [
            'agent' => $agent,
            'tools' => $tools,
        ]);
    }

    public function create(Request $request, AIAgent $agent)
    {
        // $this->authorize('update', $agent);

        return Inertia::render('User/Agents/Tools/Create', [
            'agent' => $agent,
        ]);
    }

    public function store(Request $request, AIAgent $agent)
    {
        // $this->authorize('update', $agent);

        $request->validate([
            'name' => 'required|string|max:255',
            'tool_type' => 'required|in:calculator,booking,product_search,support_ticket,custom',
            'description' => 'nullable|string',
            'configuration' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $order = $agent->tools()->max('order') + 1;

        $agent->tools()->create([
            'name' => $request->name,
            'tool_type' => $request->tool_type,
            'description' => $request->description,
            'configuration' => $request->configuration ?? [],
            'is_active' => $request->is_active ?? true,
            'order' => $order,
        ]);

        return redirect()->route('user.agents.tools.index', $agent)->with('success', 'Tool added successfully.');
    }

    public function edit(Request $request, AIAgent $agent, AgentTool $tool)
    {
        // $this->authorize('update', $agent);

        if ($tool->agent_id !== $agent->id) {
            abort(404);
        }

        return Inertia::render('User/Agents/Tools/Edit', [
            'agent' => $agent,
            'tool' => $tool,
        ]);
    }

    public function update(Request $request, AIAgent $agent, AgentTool $tool)
    {
        // $this->authorize('update', $agent);

        if ($tool->agent_id !== $agent->id) {
            abort(404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'tool_type' => 'required|in:calculator,booking,product_search,support_ticket,custom',
            'description' => 'nullable|string',
            'configuration' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $tool->update($request->only([
            'name', 'tool_type', 'description', 'configuration', 'is_active'
        ]));

        return redirect()->route('user.agents.tools.index', $agent)->with('success', 'Tool updated successfully.');
    }

    public function destroy(Request $request, AIAgent $agent, AgentTool $tool)
    {
        // $this->authorize('update', $agent);

        if ($tool->agent_id !== $agent->id) {
            abort(404);
        }

        $tool->delete();

        // Reorder remaining tools
        $tools = $agent->tools()->orderBy('order')->get();
        foreach ($tools as $index => $item) {
            $item->update(['order' => $index + 1]);
        }

        return back()->with('success', 'Tool deleted successfully.');
    }

    public function toggleActive(Request $request, AIAgent $agent, AgentTool $tool)
    {
        // $this->authorize('update', $agent);

        if ($tool->agent_id !== $agent->id) {
            abort(404);
        }

        $tool->update([
            'is_active' => !$tool->is_active,
        ]);

        return back()->with('success', 'Tool ' . ($tool->is_active ? 'activated' : 'deactivated') . ' successfully.');
    }

    public function reorder(Request $request, AIAgent $agent)
    {
        // $this->authorize('update', $agent);

        $request->validate([
            'tools' => 'required|array',
            'tools.*.id' => 'required|exists:agent_tools,id',
            'tools.*.order' => 'required|integer',
        ]);

        foreach ($request->tools as $toolData) {
            $tool = AgentTool::find($toolData['id']);
            if ($tool && $tool->agent_id === $agent->id) {
                $tool->update(['order' => $toolData['order']]);
            }
        }

        return response()->json(['success' => true]);
    }
}

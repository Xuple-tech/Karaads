<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AIMode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AIModeController extends Controller
{
    /**
     * Display a listing of all AI modes
     */
    public function index(Request $request)
    {
        try {
            $modes = AIMode::orderBy('display_order')->get();

            // Check if this is an API request
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => true,
                    'modes' => $modes
                ]);
            }

            // Web request - return Inertia view
            return Inertia::render('Admin/AIModes/Index', [
                'modes' => $modes
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching AI modes: ' . $e->getMessage());

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to fetch AI modes'
                ], 500);
            }

            return redirect()->back()->withErrors(['error' => 'Failed to fetch AI modes']);
        }
    }

    /**
     * Show the form for creating a new AI mode
     */
    public function create()
    {
        return Inertia::render('Admin/AIModes/Create');
    }

    /**
     * Display the specified AI mode
     */
    public function show(Request $request, $id)
    {
        try {
            $mode = AIMode::findOrFail($id);

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => true,
                    'mode' => $mode
                ]);
            }

            return Inertia::render('Admin/AIModes/Show', [
                'mode' => $mode
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching AI mode: ' . $e->getMessage());

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'error' => 'AI mode not found'
                ], 404);
            }

            return redirect()->route('admin.ai-modes.index')->withErrors(['error' => 'AI mode not found']);
        }
    }

    /**
     * Show the form for editing the specified AI mode
     */
    public function edit($id)
    {
        try {
            $mode = AIMode::findOrFail($id);

            return Inertia::render('Admin/AIModes/Edit', [
                'mode' => $mode
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching AI mode: ' . $e->getMessage());
            return redirect()->route('admin.ai-modes.index')->withErrors(['error' => 'AI mode not found']);
        }
    }

    /**
     * Store a newly created AI mode
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:ai_modes',
            'description' => 'required|string|max:500',
            'emoji' => 'required|string|max:10',
            'system_prompt' => 'required|string',
            'display_order' => 'sometimes|integer',
            'is_active' => 'sometimes|boolean',
        ]);

        try {
            $mode = AIMode::create([
                'name' => $request->name,
                'description' => $request->description,
                'emoji' => $request->emoji,
                'system_prompt' => $request->system_prompt,
                'display_order' => $request->display_order ?? AIMode::max('display_order') + 1,
                'is_active' => $request->is_active ?? true,
            ]);

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => true,
                    'mode' => $mode,
                    'message' => 'AI mode created successfully'
                ], 201);
            }

            return redirect()->route('admin.ai-modes.index')->with('success', 'AI mode created successfully');
        } catch (\Exception $e) {
            Log::error('Error creating AI mode: ' . $e->getMessage());

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to create AI mode'
                ], 500);
            }

            return redirect()->back()->withErrors(['error' => 'Failed to create AI mode'])->withInput();
        }
    }



    /**
     * Update the specified AI mode
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255|unique:ai_modes,name,' . $id,
            'description' => 'sometimes|string|max:500',
            'emoji' => 'sometimes|string|max:10',
            'system_prompt' => 'sometimes|string',
            'display_order' => 'sometimes|integer',
            'is_active' => 'sometimes|boolean',
        ]);

        try {
            $mode = AIMode::findOrFail($id);
            $mode->update($request->only([
                'name', 'description', 'emoji', 'system_prompt', 'display_order', 'is_active'
            ]));

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => true,
                    'mode' => $mode,
                    'message' => 'AI mode updated successfully'
                ]);
            }

            return redirect()->route('admin.ai-modes.index')->with('success', 'AI mode updated successfully');
        } catch (\Exception $e) {
            Log::error('Error updating AI mode: ' . $e->getMessage());

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to update AI mode'
                ], 500);
            }

            return redirect()->back()->withErrors(['error' => 'Failed to update AI mode']);
        }
    }

    /**
     * Delete the specified AI mode
     */
    public function destroy(Request $request, $id)
    {
        try {
            $mode = AIMode::findOrFail($id);

            // Prevent deletion if users are using this mode
            $userCount = $mode->users()->count();
            if ($userCount > 0) {
                if ($request->expectsJson() || $request->is('api/*')) {
                    return response()->json([
                        'success' => false,
                        'error' => "Cannot delete this mode as {$userCount} user(s) are using it. Please reassign users first."
                    ], 409);
                }
                return redirect()->back()->withErrors(['error' => "Cannot delete this mode as {$userCount} user(s) are using it. Please reassign users first."]);
            }

            $mode->delete();

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => true,
                    'message' => 'AI mode deleted successfully'
                ]);
            }

            return redirect()->route('admin.ai-modes.index')->with('success', 'AI mode deleted successfully');
        } catch (\Exception $e) {
            Log::error('Error deleting AI mode: ' . $e->getMessage());

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to delete AI mode'
                ], 500);
            }

            return redirect()->back()->withErrors(['error' => 'Failed to delete AI mode']);
        }
    }

    /**
     * Toggle the active status of an AI mode
     */
    public function toggleStatus(Request $request, $id)
    {
        try {
            $mode = AIMode::findOrFail($id);
            $mode->update(['is_active' => !$mode->is_active]);

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => true,
                    'mode' => $mode,
                    'message' => 'AI mode status updated successfully'
                ]);
            }

            return redirect()->back()->with('success', 'AI mode status updated successfully');
        } catch (\Exception $e) {
            Log::error('Error toggling AI mode status: ' . $e->getMessage());

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to toggle AI mode status'
                ], 500);
            }

            return redirect()->back()->withErrors(['error' => 'Failed to toggle AI mode status']);
        }
    }

    /**
     * Reorder AI modes
     */
    public function reorder(Request $request)
    {
        $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|exists:ai_modes',
            'orders.*.display_order' => 'required|integer',
        ]);

        try {
            foreach ($request->orders as $order) {
                AIMode::where('id', $order['id'])->update(['display_order' => $order['display_order']]);
            }

            return response()->json([
                'success' => true,
                'message' => 'AI modes reordered successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error reordering AI modes: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to reorder AI modes'
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Models\SystemPersonalization;
use App\Models\PersonalizationTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * PersonalizationController
 *
 * Manage system personalizations and personalization templates for admin panel
 * Provides web interface for creating, editing, and managing personalization settings
 */
class PersonalizationController extends \Illuminate\Routing\Controller
{
    /**
     * System Personalizations - Index
     * Display all system personalizations with filtering
     */
    public function indexPersonalizations(Request $request): Response
    {
        $query = SystemPersonalization::with('templates');

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by active status
        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->is_active === '1');
        }

        $personalizations = $query->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Personalizations/Index', [
            'personalizations' => $personalizations,
            'filters' => [
                'search' => $request->search,
                'is_active' => $request->is_active,
            ],
        ]);
    }

    /**
     * System Personalizations - Create Form
     */
    public function createPersonalization(): Response
    {
        return Inertia::render('Admin/Personalizations/Create');
    }

    /**
     * System Personalizations - Store
     */
    public function storePersonalization(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:system_personalizations|max:255',
            'description' => 'nullable|string|max:1000',
            'system_prompt' => 'required|string',
            'min_tone_level' => 'required|integer|between:1,10',
            'max_tone_level' => 'required|integer|between:1,10|gte:min_tone_level',
            'min_detail_level' => 'required|integer|between:1,10',
            'max_detail_level' => 'required|integer|between:1,10|gte:min_detail_level',
            'min_response_length' => 'required|integer|between:1,10',
            'max_response_length' => 'required|integer|between:1,10|gte:min_response_length',
            'is_default' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
        ]);

        // If setting as default, remove default from others
        if ($request->boolean('is_default')) {
            SystemPersonalization::where('is_default', true)
                ->update(['is_default' => false]);
        }

        SystemPersonalization::create($validated);

        return redirect()->route('admin.personalizations.index')
            ->with('success', 'System personalization created successfully');
    }

    /**
     * System Personalizations - Edit Form
     */
    public function editPersonalization(SystemPersonalization $personalization): Response
    {
        return Inertia::render('Admin/Personalizations/Edit', [
            'personalization' => $personalization->load('templates'),
        ]);
    }

    /**
     * System Personalizations - Update
     */
    public function updatePersonalization(Request $request, SystemPersonalization $personalization): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|unique:system_personalizations,name,' . $personalization->id . '|max:255',
            'description' => 'nullable|string|max:1000',
            'system_prompt' => 'sometimes|string',
            'min_tone_level' => 'sometimes|integer|between:1,10',
            'max_tone_level' => 'sometimes|integer|between:1,10',
            'min_detail_level' => 'sometimes|integer|between:1,10',
            'max_detail_level' => 'sometimes|integer|between:1,10',
            'min_response_length' => 'sometimes|integer|between:1,10',
            'max_response_length' => 'sometimes|integer|between:1,10',
            'is_default' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
        ]);

        // Ensure min <= max for each constraint
        if (isset($validated['min_tone_level']) && isset($validated['max_tone_level'])) {
            if ($validated['min_tone_level'] > $validated['max_tone_level']) {
                return back()->withErrors(['max_tone_level' => 'Maximum must be >= Minimum']);
            }
        }

        if (isset($validated['min_detail_level']) && isset($validated['max_detail_level'])) {
            if ($validated['min_detail_level'] > $validated['max_detail_level']) {
                return back()->withErrors(['max_detail_level' => 'Maximum must be >= Minimum']);
            }
        }

        if (isset($validated['min_response_length']) && isset($validated['max_response_length'])) {
            if ($validated['min_response_length'] > $validated['max_response_length']) {
                return back()->withErrors(['max_response_length' => 'Maximum must be >= Minimum']);
            }
        }

        // If setting as default, remove default from others
        if ($request->boolean('is_default')) {
            SystemPersonalization::where('id', '!=', $personalization->id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        $personalization->update($validated);

        return redirect()->route('admin.personalizations.edit', $personalization)
            ->with('success', 'System personalization updated successfully');
    }

    /**
     * System Personalizations - Delete
     */
    public function destroyPersonalization(SystemPersonalization $personalization): RedirectResponse
    {
        // Prevent deletion of default personalization
        if ($personalization->is_default) {
            return back()->withErrors(['error' => 'Cannot delete the default system personalization']);
        }

        // Prevent deletion if it has templates
        if ($personalization->templates()->exists()) {
            return back()->withErrors(['error' => 'Cannot delete personalization that has templates. Delete templates first.']);
        }

        $personalization->delete();

        return redirect()->route('admin.personalizations.index')
            ->with('success', 'System personalization deleted successfully');
    }

    /**
     * Personalization Templates - Index
     */
    public function indexTemplates(Request $request): Response
    {
        $query = PersonalizationTemplate::with('systemPersonalization');

        // Filter by system personalization
        if ($request->has('system_personalization_id') && !empty($request->system_personalization_id)) {
            $query->where('system_personalization_id', $request->system_personalization_id);
        }

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by active status
        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->is_active === '1');
        }

        $templates = $query->orderBy('usage_count', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $systemPersonalizations = SystemPersonalization::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/Personalizations/Templates/Index', [
            'templates' => $templates,
            'systemPersonalizations' => $systemPersonalizations,
            'filters' => [
                'search' => $request->search,
                'system_personalization_id' => $request->system_personalization_id,
                'is_active' => $request->is_active,
            ],
        ]);
    }

    /**
     * Personalization Templates - Create Form
     */
    public function createTemplate(): Response
    {
        $systemPersonalizations = SystemPersonalization::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'system_prompt']);

        return Inertia::render('Admin/Personalizations/Templates/Create', [
            'systemPersonalizations' => $systemPersonalizations,
        ]);
    }

    /**
     * Personalization Templates - Store
     */
    public function storeTemplate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'system_personalization_id' => 'required|uuid|exists:system_personalizations,id',
            'name' => 'required|string|unique:personalization_templates|max:255',
            'description' => 'nullable|string|max:1000',
            'emoji' => 'nullable|string|max:10',
            'default_tone_level' => 'required|integer|between:1,10',
            'default_detail_level' => 'required|integer|between:1,10',
            'default_response_length' => 'required|integer|between:1,10',
            'is_system_template' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
        ]);

        // Validate defaults are within system constraints
        $systemPersonalization = SystemPersonalization::findOrFail(
            $validated['system_personalization_id']
        );

        if (!$systemPersonalization->isPreferenceAllowed(
            'tone_level',
            $validated['default_tone_level']
        )) {
            return back()->withErrors([
                'default_tone_level' => 'Must be between ' . $systemPersonalization->min_tone_level . ' and ' . $systemPersonalization->max_tone_level,
            ]);
        }

        if (!$systemPersonalization->isPreferenceAllowed(
            'detail_level',
            $validated['default_detail_level']
        )) {
            return back()->withErrors([
                'default_detail_level' => 'Must be between ' . $systemPersonalization->min_detail_level . ' and ' . $systemPersonalization->max_detail_level,
            ]);
        }

        if (!$systemPersonalization->isPreferenceAllowed(
            'response_length',
            $validated['default_response_length']
        )) {
            return back()->withErrors([
                'default_response_length' => 'Must be between ' . $systemPersonalization->min_response_length . ' and ' . $systemPersonalization->max_response_length,
            ]);
        }

        PersonalizationTemplate::create($validated);

        return redirect()->route('admin.personalization-templates.index')
            ->with('success', 'Template created successfully');
    }

    /**
     * Personalization Templates - Edit Form
     */
    public function editTemplate(PersonalizationTemplate $template): Response
    {
        $systemPersonalizations = SystemPersonalization::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'min_tone_level', 'max_tone_level', 'min_detail_level', 'max_detail_level', 'min_response_length', 'max_response_length']);

        return Inertia::render('Admin/Personalizations/Templates/Edit', [
            'template' => $template->load('systemPersonalization'),
            'systemPersonalizations' => $systemPersonalizations,
        ]);
    }

    /**
     * Personalization Templates - Update
     */
    public function updateTemplate(Request $request, PersonalizationTemplate $template): RedirectResponse
    {
        $validated = $request->validate([
            'system_personalization_id' => 'sometimes|uuid|exists:system_personalizations,id',
            'name' => 'sometimes|string|unique:personalization_templates,name,' . $template->id . '|max:255',
            'description' => 'nullable|string|max:1000',
            'emoji' => 'nullable|string|max:10',
            'default_tone_level' => 'sometimes|integer|between:1,10',
            'default_detail_level' => 'sometimes|integer|between:1,10',
            'default_response_length' => 'sometimes|integer|between:1,10',
            'is_system_template' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
        ]);

        // Validate defaults are within system constraints
        $systemPersonalizationId = $validated['system_personalization_id'] ?? $template->system_personalization_id;
        $systemPersonalization = SystemPersonalization::findOrFail($systemPersonalizationId);

        if (isset($validated['default_tone_level']) && !$systemPersonalization->isPreferenceAllowed(
            'tone_level',
            $validated['default_tone_level']
        )) {
            return back()->withErrors([
                'default_tone_level' => 'Must be between ' . $systemPersonalization->min_tone_level . ' and ' . $systemPersonalization->max_tone_level,
            ]);
        }

        if (isset($validated['default_detail_level']) && !$systemPersonalization->isPreferenceAllowed(
            'detail_level',
            $validated['default_detail_level']
        )) {
            return back()->withErrors([
                'default_detail_level' => 'Must be between ' . $systemPersonalization->min_detail_level . ' and ' . $systemPersonalization->max_detail_level,
            ]);
        }

        if (isset($validated['default_response_length']) && !$systemPersonalization->isPreferenceAllowed(
            'response_length',
            $validated['default_response_length']
        )) {
            return back()->withErrors([
                'default_response_length' => 'Must be between ' . $systemPersonalization->min_response_length . ' and ' . $systemPersonalization->max_response_length,
            ]);
        }

        $template->update($validated);

        return redirect()->route('admin.personalization-templates.edit', $template)
            ->with('success', 'Template updated successfully');
    }

    /**
     * Personalization Templates - Delete (soft delete)
     */
    public function destroyTemplate(PersonalizationTemplate $template): RedirectResponse
    {
        $template->delete();

        return redirect()->route('admin.personalization-templates.index')
            ->with('success', 'Template deleted successfully');
    }

    /**
     * Personalization Templates - Show Statistics
     */
    public function statistics(): Response
    {
        $templates = PersonalizationTemplate::withCount('userPreferences')
            ->orderBy('usage_count', 'desc')
            ->get([
                'id',
                'name',
                'emoji',
                'usage_count',
                'created_at',
                'system_personalization_id',
            ])
            ->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'emoji' => $t->emoji,
                'usage_count' => $t->usage_count,
                'user_count' => $t->user_preferences_count ?? 0,
                'created_at' => $t->created_at,
            ]);

        $personalizations = SystemPersonalization::withCount('templates')
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get([
                'id',
                'name',
                'is_default',
                'created_at',
            ])
            ->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'is_default' => $p->is_default,
                'template_count' => $p->templates_count ?? 0,
                'created_at' => $p->created_at,
            ]);

        return Inertia::render('Admin/Personalizations/Statistics', [
            'topTemplates' => $templates->take(10),
            'allTemplates' => $templates,
            'personalizations' => $personalizations,
            'stats' => [
                'total_templates' => $templates->count(),
                'total_personalizations' => $personalizations->count(),
                'total_usages' => $templates->sum('usage_count'),
            ],
        ]);
    }
}

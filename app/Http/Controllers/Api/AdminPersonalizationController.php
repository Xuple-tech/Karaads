<?php

namespace App\Http\Controllers\Api;

use App\Models\SystemPersonalization;
use App\Models\PersonalizationTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class AdminPersonalizationController extends Controller
{
    /**
     * Constructor - apply admin middleware
     */
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('admin'); // Ensure only admins can access
    }

    /**
     * Get all system personalizations
     */
    public function getSystemPersonalizations(): JsonResponse
    {
        $personalizations = SystemPersonalization::with('templates')
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'personalizations' => $personalizations->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'description' => $p->description,
                'system_prompt' => $p->system_prompt,
                'constraints' => $p->getConstraints(),
                'is_default' => $p->is_default,
                'is_active' => $p->is_active,
                'template_count' => $p->templates()->count(),
                'created_at' => $p->created_at,
            ]),
        ]);
    }

    /**
     * Create a new system personalization
     */
    public function storeSystemPersonalization(Request $request): JsonResponse
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
        ]);

        // If setting as default, remove default from others
        if ($request->boolean('is_default')) {
            SystemPersonalization::where('is_default', true)
                ->update(['is_default' => false]);
        }

        $personalization = SystemPersonalization::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'System personalization created successfully',
            'personalization' => [
                'id' => $personalization->id,
                'name' => $personalization->name,
                'constraints' => $personalization->getConstraints(),
            ],
        ], 201);
    }

    /**
     * Update a system personalization
     */
    public function updateSystemPersonalization(Request $request, string $id): JsonResponse
    {
        $personalization = SystemPersonalization::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|unique:system_personalizations,name,' . $id . '|max:255',
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

        // If setting as default, remove default from others
        if ($request->boolean('is_default')) {
            SystemPersonalization::where('id', '!=', $id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        $personalization->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'System personalization updated successfully',
            'personalization' => [
                'id' => $personalization->id,
                'name' => $personalization->name,
                'constraints' => $personalization->getConstraints(),
            ],
        ]);
    }

    /**
     * Delete a system personalization
     */
    public function deleteSystemPersonalization(string $id): JsonResponse
    {
        $personalization = SystemPersonalization::findOrFail($id);

        if ($personalization->is_default) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete default system personalization',
            ], 422);
        }

        $personalization->delete();

        return response()->json([
            'success' => true,
            'message' => 'System personalization deleted successfully',
        ]);
    }

    /**
     * Get all personalization templates
     */
    public function getTemplates(): JsonResponse
    {
        $templates = PersonalizationTemplate::with('systemPersonalization')
            ->orderByDesc('usage_count')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'templates' => $templates->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'description' => $t->description,
                'emoji' => $t->emoji,
                'defaults' => $t->getDefaultPreferences(),
                'system_personalization' => $t->systemPersonalization ? [
                    'id' => $t->systemPersonalization->id,
                    'name' => $t->systemPersonalization->name,
                    'constraints' => $t->systemPersonalization->getConstraints(),
                ] : null,
                'is_system_template' => $t->is_system_template,
                'is_active' => $t->is_active,
                'usage_count' => $t->usage_count,
                'created_at' => $t->created_at,
            ]),
        ]);
    }

    /**
     * Create a new personalization template
     */
    public function storeTemplate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'system_personalization_id' => 'nullable|uuid|exists:system_personalizations,id',
            'name' => 'required|string|unique:personalization_templates|max:255',
            'description' => 'nullable|string|max:500',
            'emoji' => 'sometimes|string|max:10',
            'default_tone_level' => 'required|integer|between:1,10',
            'default_detail_level' => 'required|integer|between:1,10',
            'default_response_length' => 'required|integer|between:1,10',
        ]);

        // Validate against system personalization constraints if provided
        if ($validated['system_personalization_id'] ?? null) {
            $sys = SystemPersonalization::find($validated['system_personalization_id']);

            if (!$sys->isPreferenceAllowed('tone', $validated['default_tone_level'])
                || !$sys->isPreferenceAllowed('detail', $validated['default_detail_level'])
                || !$sys->isPreferenceAllowed('length', $validated['default_response_length'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Template defaults violate system personalization constraints',
                    'constraints' => $sys->getConstraints(),
                ], 422);
            }
        }

        $template = PersonalizationTemplate::create([
            ...$validated,
            'is_system_template' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Template created successfully',
            'template' => [
                'id' => $template->id,
                'name' => $template->name,
                'emoji' => $template->emoji,
            ],
        ], 201);
    }

    /**
     * Update a personalization template
     */
    public function updateTemplate(Request $request, string $id): JsonResponse
    {
        $template = PersonalizationTemplate::findOrFail($id);

        $validated = $request->validate([
            'system_personalization_id' => 'nullable|uuid|exists:system_personalizations,id',
            'name' => 'sometimes|string|unique:personalization_templates,name,' . $id . '|max:255',
            'description' => 'nullable|string|max:500',
            'emoji' => 'sometimes|string|max:10',
            'default_tone_level' => 'sometimes|integer|between:1,10',
            'default_detail_level' => 'sometimes|integer|between:1,10',
            'default_response_length' => 'sometimes|integer|between:1,10',
            'is_active' => 'sometimes|boolean',
        ]);

        // Validate against system personalization constraints if provided
        if ($validated['system_personalization_id'] ?? null) {
            $sys = SystemPersonalization::find($validated['system_personalization_id']);
            $toneLvl = $validated['default_tone_level'] ?? $template->default_tone_level;
            $detailLvl = $validated['default_detail_level'] ?? $template->default_detail_level;
            $lengthLvl = $validated['default_response_length'] ?? $template->default_response_length;

            if (!$sys->isPreferenceAllowed('tone', $toneLvl)
                || !$sys->isPreferenceAllowed('detail', $detailLvl)
                || !$sys->isPreferenceAllowed('length', $lengthLvl)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Template defaults violate system personalization constraints',
                    'constraints' => $sys->getConstraints(),
                ], 422);
            }
        }

        $template->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Template updated successfully',
            'template' => [
                'id' => $template->id,
                'name' => $template->name,
            ],
        ]);
    }

    /**
     * Delete a personalization template
     */
    public function deleteTemplate(string $id): JsonResponse
    {
        $template = PersonalizationTemplate::findOrFail($id);
        $template->delete();

        return response()->json([
            'success' => true,
            'message' => 'Template deleted successfully',
        ]);
    }

    /**
     * Get template usage statistics
     */
    public function getTemplateStatistics(): JsonResponse
    {
        $stats = [
            'total_templates' => PersonalizationTemplate::count(),
            'active_templates' => PersonalizationTemplate::where('is_active', true)->count(),
            'most_used' => PersonalizationTemplate::orderByDesc('usage_count')
                ->limit(5)
                ->get(['id', 'name', 'emoji', 'usage_count']),
            'total_system_personalizations' => SystemPersonalization::count(),
            'active_system_personalizations' => SystemPersonalization::where('is_active', true)->count(),
        ];

        return response()->json([
            'success' => true,
            'statistics' => $stats,
        ]);
    }

    /**
     * Get default system personalization
     */
    public function getDefaultPersonalization(): JsonResponse
    {
        $default = SystemPersonalization::where('is_default', true)->first();

        if (!$default) {
            return response()->json([
                'success' => false,
                'message' => 'No default system personalization set',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'personalization' => [
                'id' => $default->id,
                'name' => $default->name,
                'system_prompt' => $default->system_prompt,
                'constraints' => $default->getConstraints(),
            ],
        ]);
    }
}

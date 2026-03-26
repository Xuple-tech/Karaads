<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemPersonalization;
use App\Models\PersonalizationTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PersonalizationAdminController extends Controller
{
    /**
     * Check admin authorization
     */
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (!Auth::user()?->is_admin) {
                return response()->json([
                    'success' => false,
                    'error' => 'Unauthorized - Admin access required'
                ], 403);
            }
            return $next($request);
        });
    }

    /**
     * Get all system personalizations
     */
    public function getSystemPersonalizations(Request $request)
    {
        try {
            $personalizations = SystemPersonalization::with('templates')
                ->orderBy('is_default', 'desc')
                ->orderBy('is_active', 'desc')
                ->get()
                ->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'name' => $p->name,
                        'description' => $p->description,
                        'system_prompt' => $p->system_prompt,
                        'min_tone_level' => $p->min_tone_level,
                        'max_tone_level' => $p->max_tone_level,
                        'min_detail_level' => $p->min_detail_level,
                        'max_detail_level' => $p->max_detail_level,
                        'min_response_length' => $p->min_response_length,
                        'max_response_length' => $p->max_response_length,
                        'is_default' => $p->is_default,
                        'is_active' => $p->is_active,
                        'template_count' => $p->templates()->count(),
                        'created_at' => $p->created_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'personalizations' => $personalizations
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching system personalizations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch personalizations'
            ], 500);
        }
    }

    /**
     * Create a new system personalization
     */
    public function createSystemPersonalization(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:system_personalizations|max:255',
            'description' => 'nullable|string|max:1000',
            'system_prompt' => 'required|string',
            'min_tone_level' => 'required|integer|min:1|max:10',
            'max_tone_level' => 'required|integer|min:1|max:10',
            'min_detail_level' => 'required|integer|min:1|max:10',
            'max_detail_level' => 'required|integer|min:1|max:10',
            'min_response_length' => 'required|integer|min:1|max:10',
            'max_response_length' => 'required|integer|min:1|max:10',
            'is_default' => 'sometimes|boolean',
        ]);

        try {
            // Validate constraints
            if ($request->min_tone_level > $request->max_tone_level) {
                return response()->json([
                    'success' => false,
                    'error' => 'min_tone_level cannot be greater than max_tone_level'
                ], 422);
            }
            if ($request->min_detail_level > $request->max_detail_level) {
                return response()->json([
                    'success' => false,
                    'error' => 'min_detail_level cannot be greater than max_detail_level'
                ], 422);
            }
            if ($request->min_response_length > $request->max_response_length) {
                return response()->json([
                    'success' => false,
                    'error' => 'min_response_length cannot be greater than max_response_length'
                ], 422);
            }

            // If setting as default, unset previous default
            if ($request->is_default) {
                SystemPersonalization::where('is_default', true)->update(['is_default' => false]);
            }

            $personalization = SystemPersonalization::create([
                'id' => Str::uuid(),
                'name' => $request->name,
                'description' => $request->description,
                'system_prompt' => $request->system_prompt,
                'min_tone_level' => $request->min_tone_level,
                'max_tone_level' => $request->max_tone_level,
                'min_detail_level' => $request->min_detail_level,
                'max_detail_level' => $request->max_detail_level,
                'min_response_length' => $request->min_response_length,
                'max_response_length' => $request->max_response_length,
                'is_default' => $request->is_default ?? false,
                'is_active' => true,
            ]);

            Log::info("System personalization created: {$personalization->name}");

            return response()->json([
                'success' => true,
                'message' => 'System personalization created successfully',
                'personalization' => $personalization
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating system personalization: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to create personalization'
            ], 500);
        }
    }

    /**
     * Update system personalization
     */
    public function updateSystemPersonalization(Request $request, $id)
    {
        $request->validate([
            'name' => 'sometimes|string|unique:system_personalizations,name,' . $id . ',id|max:255',
            'description' => 'sometimes|nullable|string|max:1000',
            'system_prompt' => 'sometimes|string',
            'min_tone_level' => 'sometimes|integer|min:1|max:10',
            'max_tone_level' => 'sometimes|integer|min:1|max:10',
            'min_detail_level' => 'sometimes|integer|min:1|max:10',
            'max_detail_level' => 'sometimes|integer|min:1|max:10',
            'min_response_length' => 'sometimes|integer|min:1|max:10',
            'max_response_length' => 'sometimes|integer|min:1|max:10',
            'is_default' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
        ]);

        try {
            $personalization = SystemPersonalization::findOrFail($id);

            $data = $request->only([
                'name', 'description', 'system_prompt',
                'min_tone_level', 'max_tone_level',
                'min_detail_level', 'max_detail_level',
                'min_response_length', 'max_response_length',
                'is_active'
            ]);

            // Validate constraints if any are provided
            $minTone = $data['min_tone_level'] ?? $personalization->min_tone_level;
            $maxTone = $data['max_tone_level'] ?? $personalization->max_tone_level;
            if ($minTone > $maxTone) {
                return response()->json([
                    'success' => false,
                    'error' => 'min_tone_level cannot be greater than max_tone_level'
                ], 422);
            }

            // Handle default flag
            if ($request->has('is_default') && $request->is_default && !$personalization->is_default) {
                SystemPersonalization::where('is_default', true)->update(['is_default' => false]);
                $data['is_default'] = true;
            }

            $personalization->update($data);

            Log::info("System personalization updated: {$personalization->name}");

            return response()->json([
                'success' => true,
                'message' => 'System personalization updated successfully',
                'personalization' => $personalization
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating system personalization: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update personalization'
            ], 500);
        }
    }

    /**
     * Get all personalization templates
     */
    public function getTemplates(Request $request)
    {
        try {
            $templates = PersonalizationTemplate::with('systemPersonalization')
                ->orderBy('is_system_template', 'desc')
                ->orderBy('usage_count', 'desc')
                ->get()
                ->map(function ($t) {
                    return [
                        'id' => $t->id,
                        'name' => $t->name,
                        'description' => $t->description,
                        'emoji' => $t->emoji,
                        'default_tone_level' => $t->default_tone_level,
                        'default_detail_level' => $t->default_detail_level,
                        'default_response_length' => $t->default_response_length,
                        'is_system_template' => $t->is_system_template,
                        'is_active' => $t->is_active,
                        'usage_count' => $t->usage_count,
                        'system_personalization' => $t->systemPersonalization ? [
                            'id' => $t->systemPersonalization->id,
                            'name' => $t->systemPersonalization->name,
                        ] : null,
                        'created_at' => $t->created_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'templates' => $templates
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching templates: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch templates'
            ], 500);
        }
    }

    /**
     * Create personalization template
     */
    public function createTemplate(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:personalization_templates|max:255',
            'description' => 'nullable|string|max:500',
            'emoji' => 'nullable|string|max:10',
            'system_personalization_id' => 'nullable|exists:system_personalizations,id',
            'default_tone_level' => 'required|integer|min:1|max:10',
            'default_detail_level' => 'required|integer|min:1|max:10',
            'default_response_length' => 'required|integer|min:1|max:10',
            'is_system_template' => 'sometimes|boolean',
        ]);

        try {
            // If system personalization is specified, validate defaults against constraints
            if ($request->system_personalization_id) {
                $sysPers = SystemPersonalization::findOrFail($request->system_personalization_id);

                if (!$sysPers->isPreferenceAllowed('tone', $request->default_tone_level)) {
                    return response()->json([
                        'success' => false,
                        'error' => "Tone {$request->default_tone_level} not allowed by system constraints ({$sysPers->min_tone_level}-{$sysPers->max_tone_level})"
                    ], 422);
                }
                if (!$sysPers->isPreferenceAllowed('detail', $request->default_detail_level)) {
                    return response()->json([
                        'success' => false,
                        'error' => "Detail {$request->default_detail_level} not allowed by system constraints ({$sysPers->min_detail_level}-{$sysPers->max_detail_level})"
                    ], 422);
                }
                if (!$sysPers->isPreferenceAllowed('length', $request->default_response_length)) {
                    return response()->json([
                        'success' => false,
                        'error' => "Length {$request->default_response_length} not allowed by system constraints ({$sysPers->min_response_length}-{$sysPers->max_response_length})"
                    ], 422);
                }
            }

            $template = PersonalizationTemplate::create([
                'id' => Str::uuid(),
                'system_personalization_id' => $request->system_personalization_id,
                'name' => $request->name,
                'description' => $request->description,
                'emoji' => $request->emoji ?? '📝',
                'default_tone_level' => $request->default_tone_level,
                'default_detail_level' => $request->default_detail_level,
                'default_response_length' => $request->default_response_length,
                'is_system_template' => $request->is_system_template ?? false,
                'is_active' => true,
                'usage_count' => 0,
            ]);

            Log::info("Personalization template created: {$template->name}");

            return response()->json([
                'success' => true,
                'message' => 'Template created successfully',
                'template' => $template
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating template: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to create template'
            ], 500);
        }
    }

    /**
     * Update template
     */
    public function updateTemplate(Request $request, $id)
    {
        $request->validate([
            'name' => 'sometimes|string|unique:personalization_templates,name,' . $id . ',id|max:255',
            'description' => 'sometimes|nullable|string|max:500',
            'emoji' => 'sometimes|nullable|string|max:10',
            'default_tone_level' => 'sometimes|integer|min:1|max:10',
            'default_detail_level' => 'sometimes|integer|min:1|max:10',
            'default_response_length' => 'sometimes|integer|min:1|max:10',
            'is_active' => 'sometimes|boolean',
        ]);

        try {
            $template = PersonalizationTemplate::findOrFail($id);
            $template->update($request->only([
                'name', 'description', 'emoji',
                'default_tone_level', 'default_detail_level', 'default_response_length',
                'is_active'
            ]));

            Log::info("Template updated: {$template->name}");

            return response()->json([
                'success' => true,
                'message' => 'Template updated successfully',
                'template' => $template
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating template: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update template'
            ], 500);
        }
    }

    /**
     * Delete template
     */
    public function deleteTemplate(Request $request, $id)
    {
        try {
            $template = PersonalizationTemplate::findOrFail($id);
            $templateName = $template->name;
            $template->delete();

            Log::info("Template deleted: {$templateName}");

            return response()->json([
                'success' => true,
                'message' => 'Template deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting template: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete template'
            ], 500);
        }
    }
}

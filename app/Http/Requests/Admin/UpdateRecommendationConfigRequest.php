<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRecommendationConfigRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_active' => 'sometimes|boolean',
            'rollout_mode' => 'sometimes|in:rules_only,canary,big_bang',
            'canary_percentage' => 'sometimes|integer|min:0|max:100',
            'weights' => 'required|array|min:1',
            'weights.*' => 'numeric|min:0|max:5',
            'thresholds' => 'nullable|array',
            'thresholds.min_score' => 'nullable|numeric|min:0|max:1',
            'thresholds.max_freq_per_user_24h' => 'nullable|integer|min:1|max:1000',
        ];
    }
}

<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdProviderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth('admin')->check();
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'contact_email' => ['required', 'email', Rule::unique('ad_providers', 'contact_email')->ignore($this->route('adProvider'))],
            'contact_phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'status' => 'boolean',
            'payment_method' => 'nullable|string|max:50',
            'payment_details' => 'nullable|array',
            'min_budget' => 'numeric|min:0',
            'max_budget' => 'numeric|min:0|gte:min_budget',
            'targeting_options' => 'nullable|array',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Provider name is required',
            'company_name.required' => 'Company name is required',
            'contact_email.required' => 'Contact email is required',
            'contact_email.unique' => 'This email is already in use',
            'max_budget.gte' => 'Maximum budget must be greater than or equal to minimum budget',
        ];
    }
}

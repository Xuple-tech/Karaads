<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],

            'email' => [
                'sometimes',
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],

            'username' => [
                'sometimes',
                'string',
                'max:50',
                'alpha_dash',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],

            'bio' => ['sometimes', 'nullable', 'string', 'max:500'],

            'avatar' => ['sometimes', 'nullable', 'image', 'max:5120', 'mimes:jpeg,png,jpg,gif,webp'],

            'cover' => ['sometimes', 'nullable', 'image', 'max:10240', 'mimes:jpeg,png,jpg,gif,webp'],
        ];
    }
}

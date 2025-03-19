<?php

namespace App\Http\Requests;

use App\Models\ProductType;
use Illuminate\Foundation\Http\FormRequest;

class AddProductTypeRequest extends FormRequest
{
    protected $stopOnFirstFailure = true;
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|min:3|max:30|regex:/^[a-zA-Z0-9\s]+$/',
            'description' => 'required|string|min:5|max:100|regex:/^[a-zA-Z0-9\s]+$/',
            'image' => 'nullable|file|mimes:jpg,jpeg,png|max:3048',
        ];
    }
}

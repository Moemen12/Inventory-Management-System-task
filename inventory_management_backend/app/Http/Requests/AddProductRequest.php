<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class AddProductRequest extends FormRequest
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
        $userId = auth()->id();
        return [
            'name' => 'required|string|min:3|max:30|regex:/^[a-zA-Z0-9\s]+$/',
            'quantity' => 'integer|required|min:0',
            'description' => 'required|string|min:5|max:100|regex:/^[a-zA-Z0-9\s]+$/',
            'image' => 'nullable|file|mimes:jpg,jpeg,png|max:3048',
            'serial_number' => 'required|string|unique:products,serial_number',
            'has_sold' => 'nullable|in:true,false',
            'product_type_id' => [
                'uuid',
                'required',
                'string',
                Rule::exists('product_types', 'id')->where(function ($query) use ($userId) {

                    $query->where('user_id', $userId);
                }),
            ],

        ];
    }
}

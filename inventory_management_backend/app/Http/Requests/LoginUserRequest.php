<?php

namespace App\Http\Requests;

use App\Helpers\ResponseHelper;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class LoginUserRequest extends FormRequest
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

            'username' => 'required|string|min:10|max:30|regex:/^[a-zA-Z0-9]+$/',
            "password" => "required|string|max:20|min:8",
        ];
    }


    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            ResponseHelper::error(
                'Validation failed',
                $validator->errors()->toArray(),
                422
            )
        );
    }
}

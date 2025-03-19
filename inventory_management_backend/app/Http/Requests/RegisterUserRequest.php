<?php

namespace App\Http\Requests;

use App\Helpers\ResponseHelper;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class RegisterUserRequest extends FormRequest
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
            'username' => 'required|string|min:10|max:30|unique:users,username|regex:/^[a-zA-Z0-9]+$/',
            "email" => "required|email|unique:users,email",
            "password" => "required|string|max:20|min:8",
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        $errors = $validator->errors()->toArray();
        $status = 422;

        foreach ($errors as $field => $messages) {
            foreach ($messages as $message) {
                if (strpos($message, 'already been taken') !== false) {
                    $status = 409;
                    break 2;
                }
            }
        }

        throw new HttpResponseException(
            ResponseHelper::error(
                'Validation failed',
                $errors,
                $status
            )
        );
    }
}

<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;

class ResponseHelper
{
    public static function success($message, $data = [], $status = 200): JsonResponse
    {
        return response()->json([
            'status' => $status,
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    public static function error($error, $additionalErrors = null, $status = 400): JsonResponse
    {
        $errorResponse = [
            'status' => $status,
            'success' => false,
            'data' => null,
            'errors' => $additionalErrors ? $additionalErrors : ['general' => [$error]]
        ];

        return response()->json($errorResponse, $status);
    }
}
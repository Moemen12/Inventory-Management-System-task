<?php

use App\Helpers\ResponseHelper;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Log;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Middleware configuration (if needed)
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Customize exception handling
        $exceptions->renderable(function (\Exception $e, $request) {
            // Log the exception details
            Log::error('Exception occurred: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Return a custom JSON response for API requests
            if ($request->is('api/*')) {
                // return response()->json([
                //     'status' => 500,
                //     'success' => false,
                //     'message' => 'An unexpected error occurred.',
                //     'error' => $e->getMessage(),
                // ], 500);
                return ResponseHelper::error($e->getMessage(), [],500);
            }
        });
    })->create();
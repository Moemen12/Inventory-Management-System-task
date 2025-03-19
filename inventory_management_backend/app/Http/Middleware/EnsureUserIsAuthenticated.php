<?php

namespace App\Http\Middleware;

use App\Helpers\ResponseHelper;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Facades\JWTAuth;

class EnsureUserIsAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Retrieve the access token from cookies
        $accessToken = $request->cookie('access_token');

        // Set the token in the Authorization header if it exists
        if ($accessToken) {
            $request->headers->set('Authorization', 'Bearer ' . $accessToken);
        }

        try {
            // Attempt to authenticate the user using the token
            JWTAuth::parseToken()->authenticate();
            return $next($request);
        } catch (TokenInvalidException $e) {
            // Token is invalid
            return $this->respondWithUnauthorized('Token Invalid');
        } catch (TokenExpiredException $e) {
            // Token has expired
            return $this->respondWithUnauthorized('Token Expired');
        } catch (JWTException $e) {
            // Token is missing or invalid
            return $this->respondWithUnauthorized('Token is missing or invalid');
        }
    }

    /**
     * Respond with a 401 Unauthorized error and clear the access token cookie.
     *
     * @param string $message
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithUnauthorized(string $message): \Illuminate\Http\JsonResponse
    {
        // Clear the access_token cookie by setting it to expire immediately
        $response = ResponseHelper::error($message, null, 401);

        // Delete the cookie by setting its expiration time to a past date
        $response->withCookie(cookie()->forget('access_token'));

        return $response;
    }
}

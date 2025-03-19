<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Http\Requests\LoginUserRequest;
use App\Http\Requests\RegisterUserRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Tymon\JWTAuth\Facades\JWTAuth;
use OpenApi\Annotations as OA;


/**
 * @OA\PathItem(
 *     path="/users"
 * )
 */

class UserController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/v1/auth/register",
     *     summary="Register a new user",
     *     tags={"Users"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"username","email","password"},
     *             @OA\Property(property="username", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="User registered successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=201),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="User registered successfully"),
     *             @OA\Property(property="data", type="object", example={"token": "jwt_token"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=422),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="data", type="null"),
     *             @OA\Property(property="errors", type="object", example={"email": {"The email field is required."}})
     *         )
     *     ),
     *     @OA\Response(
     *         response=409,
     *         description="The email/username has already been taken.",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=409),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="data", type="null"),
     *             @OA\Property(property="errors", type="object", example={"general": {"Email already exists"}})
     *         )
     *     )
     * )
     */


    public function register(RegisterUserRequest $request)
    {
        $validated = $request->validated();
        $user = User::create([
            "username" => str_replace(' ', '', $validated["username"]),
            "email" => $validated["email"],
            "password" => bcrypt($validated["password"]),
        ]);

        $token = JWTAuth::fromUser($user);
        $cookies = Cookie::make('access_token', $token, 120, null, '127.0.0.1', false, true, false, 'Lax');

        return ResponseHelper::success('User registered successfully', 201)->withCookie($cookies);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/login",
     *     summary="Authenticate a user",
     *     tags={"Users"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"username","password"},
     *             @OA\Property(property="username", type="string"),
     *             @OA\Property(property="password", type="string", format="password")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Login successful"),
     *             @OA\Property(property="data", type="object", example={"token": "jwt_token"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=422),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="data", type="null"),
     *             @OA\Property(property="errors", type="object", example={"username": {"The username field is required."}})
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Invalid credentials",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=401),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="data", type="null"),
     *             @OA\Property(property="errors", type="object", example={"general": {"Invalid credentials"}})
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="User not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=404),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="data", type="null"),
     *             @OA\Property(property="errors", type="object", example={"general": {"User not found"}})
     *         )
     *     )
     * )
     */

    public function login(LoginUserRequest $request)
    {
        $validated = $request->validated();

        $user = User::where('username', str_replace(' ', '', $validated["username"]))->first();

        if (!$user) {
            return ResponseHelper::error('User not found', null, 404);
        }

        if (!password_verify($validated['password'], $user->password)) {
            return ResponseHelper::error('Invalid credentials', null, 401);
        }

        $token = JWTAuth::fromUser($user);
        $cookies = Cookie::make('access_token', $token, 120, null, '127.0.0.1', false, true, false, 'Lax');
        return ResponseHelper::success('Login successful', 200)->withCookie($cookies);
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/auth/logout",
     *     summary="Logout a user",
     *     tags={"Users"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Logged out successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Logged out successfully"),
     *             @OA\Property(property="data", type="null")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=401),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="data", type="null"),
     *             @OA\Property(property="errors", type="object", example={"general": {"Unauthenticated"}})
     *         )
     *     )
     * )
     */
    public function logout()
    {
        auth()->logout();
        $cookie = Cookie::forget('access_token');
        return ResponseHelper::success('Logged out successfully', 200)->withCookie($cookie);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/user/me",
     *     summary="Get authenticated user details",
     *     tags={"Users"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="User details retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="User details retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="name", type="string", example="johndoe"),
     *                 @OA\Property(property="added_product_types_count", type="integer", example=5),
     *                 @OA\Property(property="added_products_count", type="integer", example=12),
     *                 @OA\Property(property="sold_products_count", type="integer", example=8),
     *                 @OA\Property(
     *                     property="last_added_products",
     *                     type="array",
     *                     @OA\Items(
     *                         type="object",
     *                         @OA\Property(property="id", type="integer", example=42),
     *                         @OA\Property(property="name", type="string", example="Product Name"),
     *                         @OA\Property(property="created_at", type="string", example="2 days ago")
     *                     )
     *                 ),
     *                 @OA\Property(
     *                     property="last_added_product_types",
     *                     type="array",
     *                     @OA\Items(
     *                         type="object",
     *                         @OA\Property(property="id", type="integer", example=23),
     *                         @OA\Property(property="name", type="string", example="Type Name"),
     *                         @OA\Property(property="created_at", type="string", example="1 hour ago")
     *                     )
     *                 ),
     *                 @OA\Property(property="human_time", type="string", example="3 weeks ago")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=401),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="data", type="null"),
     *             @OA\Property(property="errors", type="object", example={"general": {"Unauthenticated"}})
     *         )
     *     )
     * )
     */
    public function me()
    {
        $user = Auth::user();

        $productTypesCount = $user->productTypes()->count();

        $productsCount = $user->products()->count();

        $soldProductsCount = $user->products()
            ->where('has_sold', true) // Assuming 'has_sold' is a boolean field
            ->count();

        $lastAddedProducts = $user->products()
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get(['id', 'name', 'created_at']);

        $lastAddedProducts = $lastAddedProducts->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'created_at' => $product->created_at->diffForHumans()
            ];
        });

        $lastAddedProductTypes = $user->productTypes()
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get(['id', 'name', 'created_at']);

        $lastAddedProductTypes = $lastAddedProductTypes->map(function ($productType) {
            return [
                'id' => $productType->id,
                'name' => $productType->name,
                'created_at' => $productType->created_at->diffForHumans()
            ];
        });

        $data = [
            'name' => $user->username,
            'added_product_types_count' => $productTypesCount,
            'added_products_count' => $productsCount,
            'sold_products_count' => $soldProductsCount,
            'last_added_products' => $lastAddedProducts,
            'last_added_product_types' => $lastAddedProductTypes,
            'human_time' => $user->created_at->diffForHumans()
        ];

        return ResponseHelper::success('User details retrieved successfully', $data, 200);
    }
}

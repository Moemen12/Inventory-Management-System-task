<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductTypeController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\EnsureUserIsAuthenticated;
use Illuminate\Support\Facades\Route;


Route::prefix('v1')->group(function () {

    Route::post('/auth/register', [UserController::class, 'register']);
    Route::post('/auth/login', [UserController::class, 'login']);
    Route::delete('/auth/logout', [UserController::class, 'logout'])
        ->middleware(EnsureUserIsAuthenticated::class);


    Route::get('/user/me', [UserController::class, 'me'])
        ->middleware(EnsureUserIsAuthenticated::class);


    Route::prefix('product-types')->middleware(EnsureUserIsAuthenticated::class)->group(function () {
        Route::post('/', [ProductTypeController::class, 'AddProductType']);
        Route::get('/', [ProductTypeController::class, 'getAllProductTypes']);
        Route::put('/{id}', [ProductTypeController::class, 'editProductType']);
        Route::delete('/{id}', [ProductTypeController::class, 'deleteProductType']);
    });


    Route::prefix('products')->middleware(EnsureUserIsAuthenticated::class)->group(function () {
        Route::post('/', [ProductController::class, 'AddProduct']);
        Route::get('/', [ProductController::class, 'getAllProducts']);
        Route::put('/{id}', [ProductController::class, 'editProduct']);
        Route::delete('/{id}', [ProductController::class, 'deleteProduct']);
    });
});

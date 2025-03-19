<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Http\Requests\AddProductRequest;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Gate;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(
 *     name="Products",
 *     description="API Endpoints for managing products"
 * )
 */
class ProductController extends Controller
{

    private function handleImageUpload($request)
{
    if ($request->hasFile('image')) {
        return '/storage/' . $request->file('image')->store('images/products', 'public');
    }
    return null; // Return null if no image is uploaded
}
    /**
     * @OA\Post(
     *     path="/api/v1/products",
     *     summary="Add a new product",
     *     tags={"Products"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"name", "quantity", "description", "serial_number", "product_type_id"},
     *                 @OA\Property(property="name", type="string", example="Laptop"),
     *                 @OA\Property(property="quantity", type="integer", example=10),
     *                 @OA\Property(property="description", type="string", example="A high-performance laptop"),
     *                 @OA\Property(property="image", type="string", format="binary", description="Product image file"),
     *                 @OA\Property(property="serial_number", type="string", example="SN123456789"),
     *                 @OA\Property(property="has_sold", type="boolean", example=false),
     *                 @OA\Property(property="product_type_id", type="integer", example=1)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Product added successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=201),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Product item added successfully"),
     *             @OA\Property(property="data", type="object", example={})
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=422),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="errors", type="object", example={"name": {"The name field is required."}})
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=500),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Failed to add new product")
     *         )
     *     )
     * )
     */
    public function AddProduct(AddProductRequest $request): JsonResponse
    {
        $user_id = auth()->id();
        $validated = $request->validated();

        try {
            // Handle image upload
            $imagePath = $this->handleImageUpload($request);

            // Create the product
            Product::create([
                'name' => $validated['name'],
                'quantity' => $validated['quantity'],
                'description' => $validated['description'],
                'image' => $imagePath,
                'serial_number' => $validated['serial_number'],
                'user_id' => $user_id,
                'has_sold' => isset($validated['has_sold']) && $validated['has_sold'] === 'true',
                'product_type_id' => $validated['product_type_id'],
            ]);

            return ResponseHelper::success('Product item added successfully', [], 201);
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to add new product', [], 500);
        }
    }
    /**
     * @OA\Get(
     *     path="/api/v1/products",
     *     summary="Retrieve all products for the authenticated user",
     *     tags={"Products"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Products retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Products retrieved successfully"),
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="Laptop"),
     *                     @OA\Property(property="quantity", type="integer", example=10),
     *                     @OA\Property(property="description", type="string", example="A high performance laptop"),
     *                     @OA\Property(property="image", type="string", example="/storage/images/products/abc123.jpg"),
     *                     @OA\Property(property="serial_number", type="string", example="SN123456789"),
     *                     @OA\Property(property="has_sold", type="boolean", example=false),
     *                     @OA\Property(property="product_type_id", type="integer", example=1)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=500),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Failed to retrieve products")
     *         )
     *     )
     * )
     */
    public function getAllProducts(): JsonResponse
    {
        $user_id = auth()->id();

        try {
            $allProducts = Product::where('user_id', $user_id)
                ->select('id', 'serial_number', 'name', 'has_sold', 'image', 'description', 'quantity')
                ->get();

            return ResponseHelper::success(
                'Products retrieved successfully',
                $allProducts,
                200
            );
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to retrieve products', [], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/products/{id}",
     *     summary="Delete a product by ID",
     *     tags={"Products"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID of the product to delete",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Product deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Product deleted successfully"),
     *             @OA\Property(property="data", type="object", example={"productId": 1})
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden - User is not authorized to delete this product",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=403),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="You are not authorized to delete this product")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Product not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=404),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Product not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=500),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Failed to delete product")
     *         )
     *     )
     * )
     */
    public function deleteProduct($id): JsonResponse
    {
        $product = Product::find($id);
        if (!Gate::allows('product', $product)) {
            return ResponseHelper::error('You are not authorized to delete this product', [], 403);
        }
        if (!$product) {
            return ResponseHelper::error('Product not found', [], 404);
        }
        try {
            if ($product->image) {
                $imagePath = public_path(ltrim($product->image, '/'));
                if (File::exists($imagePath)) {
                    File::delete($imagePath);
                }
            }
            $product->delete();
            return ResponseHelper::success('Product deleted successfully', ['productId' => $id], 200);
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to delete product', [], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/v1/products/{id}",
     *     summary="Update a product by ID",
     *     tags={"Products"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID of the product to update",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"name", "quantity", "description", "serial_number", "product_type_id"},
     *                 @OA\Property(property="name", type="string", example="Updated Laptop"),
     *                 @OA\Property(property="quantity", type="integer", example=15),
     *                 @OA\Property(property="description", type="string", example="An updated high-performance laptop"),
     *                 @OA\Property(property="image", type="string", format="binary", description="Updated product image file"),
     *                 @OA\Property(property="serial_number", type="string", example="SN987654321"),
     *                 @OA\Property(property="has_sold", type="boolean", example=true),
     *                 @OA\Property(property="product_type_id", type="integer", example=2)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Product updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Product updated successfully"),
     *             @OA\Property(property="data", type="object", example={"productId": 1})
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden - User is not authorized to edit this product",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=403),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="You are not authorized to edit this product")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Product not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=404),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Product not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=422),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="errors", type="object", example={"name": {"The name field is required."}})
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=500),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Failed to update product")
     *         )
     *     )
     * )
     */
    public function editProduct(AddProductRequest $request, $id): JsonResponse
    {
        $product = Product::find($id);
        if (!Gate::allows('product', $product)) {
            return ResponseHelper::error('You are not authorized to edit this product', [], 403);
        }
        if (!$product) {
            return ResponseHelper::error('Product not found', [], 404);
        }

        $validatedData = $request->validated();

        try {
            // Update product details
            $product->name = $validatedData['name'];
            $product->description = $validatedData['description'];
            $product->quantity = $validatedData['quantity'];
            $product->serial_number = $validatedData['serial_number'];
            $product->has_sold = isset($validatedData['has_sold']) && $validatedData['has_sold'] === 'true';
            $product->product_type_id = $validatedData['product_type_id'];

            // Handle image upload and deletion
            if ($request->hasFile('image')) {
                if ($product->image) {
                    $oldImagePath = public_path(ltrim($product->image, '/'));
                    if (File::exists($oldImagePath)) {
                        File::delete($oldImagePath);
                    }
                }
                $newImagePath = $request->file('image')->store('images/products', 'public');
                $product->image = '/storage/' . $newImagePath;
            }

            $product->save();
            return ResponseHelper::success('Product updated successfully', ['productId' => $product->id], 200);
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to update product', [], 500);
        }
    }
}

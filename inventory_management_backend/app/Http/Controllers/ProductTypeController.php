<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Http\Requests\AddProductTypeRequest;
use App\Models\Product;
use App\Models\ProductType;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(
 *     name="Product Types",
 *     description="API Endpoints for managing product types"
 * )
 */
class ProductTypeController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/v1/product-types",
     *     summary="Add a new product type",
     *     tags={"Product Types"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"name", "description"},
     *                 @OA\Property(property="name", type="string", example="Electronics"),
     *                 @OA\Property(property="description", type="string", example="A category for electronic items"),
     *                 @OA\Property(property="image", type="string", format="binary", description="Product type image file")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Product type added successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=201),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Product type added successfully"),
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
     *             @OA\Property(property="message", type="string", example="Failed to add product type")
     *         )
     *     )
     * )
     */
    public function addProductType(AddProductTypeRequest $request): JsonResponse
    {
        $user = auth()->user();
        $validated = $request->validated();

        try {
            $imagePath = $request->hasFile('image') ? '/storage/' . $request->file('image')->store('images/types', 'public') : null;
            ProductType::create([
                "name" => $validated["name"],
                "description" => $validated["description"],
                "user_id" => $user->id,
                'image' => $imagePath,
            ]);

            return ResponseHelper::success('Product type added successfully', [], 201);
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to add product type', [], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/v1/product-types",
     *     summary="Retrieve all product types for the authenticated user",
     *     tags={"Product Types"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Product types retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Product types retrieved successfully"),
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="Electronics"),
     *                     @OA\Property(property="description", type="string", example="A category for electronic items"),
     *                     @OA\Property(property="products_count", type="integer", example=10)
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
     *             @OA\Property(property="message", type="string", example="Failed to retrieve product types")
     *         )
     *     )
     * )
     */
    public function getAllProductTypes()
    {
        $user = Auth::user();

        try {
            // Retrieve all product types for the authenticated user
            $allTypes = ProductType::where('user_id', $user->id)
                ->select('id', 'name', 'description') // Select only the necessary fields
                ->withCount('products')
                ->get();

            return ResponseHelper::success(
                'Product Types retrieved successfully',
                $allTypes,
                200
            );
        } catch (\Exception $e) {
            Log::error('Error retrieving product types:', ['error' => $e->getMessage()]);
            return ResponseHelper::error('Failed to retrieve product types', [], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/v1/product-types/{id}",
     *     summary="Update a product type by ID",
     *     tags={"Product Types"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID of the product type to update",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"name", "description"},
     *                 @OA\Property(property="name", type="string", example="Updated Electronics"),
     *                 @OA\Property(property="description", type="string", example="An updated category for electronic items"),
     *                 @OA\Property(property="image", type="string", format="binary", description="Updated product type image file")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Product type updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Product type updated successfully"),
     *             @OA\Property(property="data", type="object", example={"productTypeId": 1})
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden - User is not authorized to edit this product type",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=403),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="You are not authorized to edit this product type")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Product type not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=404),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Product type not found")
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
     *             @OA\Property(property="message", type="string", example="Failed to update product type")
     *         )
     *     )
     * )
     */
    public function editProductType(AddProductTypeRequest $request, $id)
    {
        $productType = ProductType::find($id);

        if (!Gate::allows('product-type', $productType)) {
            return ResponseHelper::error('You are not authorized to edit this Product Type', [], 403);
        }

        if (!$productType) {
            return ResponseHelper::error('Product Type not found', [], 404);
        }

        $validatedData = $request->validated();

        $productType->name = $validatedData['name'];
        $productType->description = $validatedData['description'];

        if ($request->hasFile('image')) {
            if ($productType->image) {
                $oldImagePath = public_path(ltrim($productType->image, '/'));
                if (File::exists($oldImagePath)) {
                    File::delete($oldImagePath);
                }
            }
            $newImagePath = $request->file('image')->store('images/types', 'public');
            $productType->image = '/storage/' . $newImagePath; // Ensure consistency with /storage prefix
        }

        $productType->save();

        return ResponseHelper::success('Product Type updated successfully', ['productTypeId' => $productType->id], 200);
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/product-types/{id}",
     *     summary="Delete a product type by ID",
     *     tags={"Product Types"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID of the product type to delete",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Product type deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success",
     *      *             type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Product type deleted successfully"),
     *             @OA\Property(property="data", type="object", example={"productTypeId": 1})
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden - User is not authorized to delete this product type",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=403),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="You are not authorized to delete this product type")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Product type not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=404),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Product type not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=500),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Failed to delete product type")
     *         )
     *     )
     * )
     */
    public function deleteProductType($id): JsonResponse
    {
        $productType = ProductType::find($id);

        if (!Gate::allows('product-type', $productType)) {
            return ResponseHelper::error('You are not authorized to delete this product type', [], 403);
        }

        if (!$productType) {
            return ResponseHelper::error('Product type not found', [], 404);
        }

        try {
            // Delete the associated image file if it exists
            if ($productType->image) {
                $imagePath = public_path(ltrim($productType->image, '/'));
                if (File::exists($imagePath)) {
                    File::delete($imagePath);
                }
            }

            // Delete the product type from the database
            $productType->delete();

            return ResponseHelper::success('Product type deleted successfully', ['productTypeId' => $id], 200);
        } catch (\Exception $e) {
            return ResponseHelper::error('Failed to delete product type', [], 500);
        }
    }
}

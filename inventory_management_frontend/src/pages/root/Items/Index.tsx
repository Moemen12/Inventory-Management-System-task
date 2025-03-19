import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customKy, handleApiError } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/constants";
import { z } from "zod";
import { productSchema } from "@/lib/validation";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomForm from "@/components/shared/CutomForm";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import { Link } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  serial_number: string;
  has_sold: boolean;
  image: string | null;
  product_type_id: string;
  description: string;
  quantity: number;
}

// Define the type for the API response
interface ApiResponse {
  data: Product[];
  message: string;
}

const Index = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProductType, setEditingProductType] = useState<Product | null>(
    null
  );
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      image: undefined,
      serial_number: "",
      product_type_id: "",
      quantity: 0,
      has_sold: false,
    },
  });

  const addMutation = useMutation<
    { message: string },
    { message: string },
    z.infer<typeof productSchema>
  >({
    mutationFn: async ({
      name,
      description,
      image,
      serial_number,
      quantity,
      product_type_id,
      has_sold,
    }) => {
      try {
        const formData = new FormData();
        formData.append("name", name);
        if (description) formData.append("description", description);
        if (image) formData.append("image", image);
        if (serial_number) formData.append("serial_number", serial_number);
        if (quantity) formData.append("quantity", String(quantity));
        if (product_type_id)
          formData.append("product_type_id", product_type_id);
        formData.append("has_sold", String(has_sold));

        const response = await customKy
          .post(`${API_BASE_URL}/products`, {
            body: formData,
            credentials: "include",
          })
          .json<{ message: string }>();

        return response;
      } catch (error: unknown) {
        const errorResult = await handleApiError(error);
        throw errorResult;
      }
    },
    onError: (error) => {
      setErrorMessage(error.message);
      //  toast.error(error.message);
    },
    onSuccess: (response) => {
      setErrorMessage(null);
      form.reset();
      toast.success(response.message);
      refetch();
      setIsDialogOpen(false); // Close the dialog after successful addition
    },
  });

  // Mutation for deleting a product type
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await customKy.delete(`${API_BASE_URL}/products/${id}`, {
        credentials: "include",
      });
    },
    onError: () => {
      toast.error("Failed to delete product type");
    },
    onSuccess: () => {
      toast.success("Product type deleted successfully");
      refetch(); // Refetch data after deletion
      setIsDeleteDialogOpen(false); // Close the dialog
      setDeleteProductId(null); // Reset the delete ID
    },
  });

  // Handle delete button click
  const handleDelete = (id: string) => {
    setDeleteProductId(id);
    setIsDeleteDialogOpen(true);
  };

  // Mutation for updating a product type
  const updateMutation = useMutation<
    { message: string },
    { message: string },
    z.infer<typeof productSchema> & { id: string }
  >({
    mutationFn: async (data) => {
      try {
        const formData = new FormData();
        formData.append("name", data.name);
        if (data.description) formData.append("description", data.description);
        if (data.image) formData.append("image", data.image);
        if (data.serial_number)
          formData.append("serial_number", data.serial_number);
        if (data.quantity) formData.append("quantity", String(data.quantity));
        if (data.product_type_id)
          formData.append("product_type_id", data.product_type_id);
        formData.append("has_sold", String(data.has_sold));

        const response = await customKy
          .post(`${API_BASE_URL}/products/${data.id}?_method=PUT`, {
            body: formData,
            credentials: "include",
          })
          .json<{ message: string }>();

        return response;
      } catch (error: unknown) {
        const errorResult = await handleApiError(error);
        throw errorResult;
      }
    },
    onError: (error) => {
      setErrorMessage(error.message);
      // toast.error(error.message);
    },
    onSuccess: (response) => {
      setErrorMessage(null);
      form.reset();
      toast.success(response.message);
      refetch();
      setIsDialogOpen(false); // Close the dialog after successful update
      setEditingProductType(null); // Reset editing state
    },
  });

  const { isPending, isError, data, refetch } = useQuery<
    ApiResponse,
    { message: string }
  >({
    queryKey: ["products"],
    queryFn: async () => {
      return await customKy
        .get(`${API_BASE_URL}/products`, {
          credentials: "include",
        })
        .json();
    },
  });

  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    const formData = {
      ...data,
      has_sold: data.has_sold || false, // Set to false if undefined
    };

    if (editingProductType) {
      updateMutation.mutate({ ...formData, id: editingProductType.id });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProductType(product);
    form.reset({
      name: product.name,
      description: product.description || "",
      image: undefined,
      serial_number: product.serial_number,
      product_type_id: product.product_type_id,
      quantity: product.quantity,
      has_sold: product.has_sold ? true : false,
    });
    setIsDialogOpen(true);
  };

  // Handle add button click
  const handleAdd = () => {
    setEditingProductType(null); // Reset editing state
    form.reset({
      name: "",
      description: "",
      image: undefined,
      serial_number: "",
      product_type_id: "",
      quantity: 0,
      has_sold: false,
    });
    setIsDialogOpen(true); // Open the dialog
  };

  // Filter data based on search term
  const filteredData =
    data?.data?.filter((product) =>
      product.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="w-full max-w-[90%] sm:max-w-4xl py-8 px-4 sm:px-8 bg-gray-800 rounded-xl shadow-xl space-y-6 border border-gray-700">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Product Items</h1>
          <div className="flex items-center gap-2">
            <Link
              to={"/dashboard/products/types"}
              onClick={handleAdd}
              className="text-sm w-full sm:w-auto cursor-pointer px-4 py-2 transition-all duration-200 rounded-lg shadow-lg text-white"
            >
              Add new Category ?
            </Link>
            <Button
              onClick={handleAdd}
              className="text-sm w-full sm:w-auto cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 rounded-lg shadow-lg text-white"
            >
              + Add new Item
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search by product type name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 border-gray-600 text-sm placeholder:text-gray-400 py-2 px-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg w-full"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <Table>
            <TableHeader className="bg-gray-900">
              <TableRow className="border-b border-gray-700">
                <TableHead className="text-gray-300 font-medium p-4 text-sm">
                  S.N
                </TableHead>
                <TableHead className="text-gray-300 font-medium p-4 text-sm">
                  Name
                </TableHead>
                <TableHead className="text-gray-300 font-medium p-4 text-sm">
                  Sold
                </TableHead>
                <TableHead className="text-gray-300 font-medium p-4 text-sm">
                  Image
                </TableHead>
                <TableHead className="text-gray-300 font-medium p-4 text-sm">
                  Tools
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-400">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-red-500">
                    Failed to load product types.
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-400">
                    {searchTerm
                      ? "No matching product found."
                      : "No products available."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((product) => (
                  <TableRow
                    key={product.id}
                    className="border-b border-gray-700 hover:bg-gray-750"
                  >
                    <TableCell className="text-gray-300 p-4 font-medium">
                      # {product.serial_number}
                    </TableCell>
                    <TableCell className="text-gray-300 p-4 font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-gray-300 p-4">
                      {product.has_sold ? "Yes" : "No"}{" "}
                      {/* Display "Yes" or "No" instead of true/false */}
                    </TableCell>
                    <TableCell className="text-gray-300 p-4">
                      {product.image ? (
                        <img
                          className="w-24 rounded-xl"
                          src={`http://127.0.0.1:8000${product.image}`}
                          alt={product.name}
                        />
                      ) : (
                        <div className="text-amber-400 py-1 rounded-md text-xs font-medium text-center">
                          No image available
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex gap-3">
                        <Button
                          variant="ghost"
                          className="text-indigo-400 hover:text-indigo-300 hover:bg-gray-700 p-2 h-8 rounded-md text-sm"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-gray-700 p-2 h-8 rounded-md text-sm"
                          onClick={() => handleDelete(product.id)} // Fixed here
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDeleteProductId(null);
          }}
          onConfirm={() => deleteMutation.mutate(deleteProductId!)}
          title="Confirm Deletion"
          description="Are you sure you want to delete this product type? This action cannot be undone."
        />

        <CustomForm
          isItForProduct={true}
          placeholder="product item"
          text="Product Item"
          btnTitle={editingProductType ? "Edit Product" : "Add Product"}
          btnDesc={
            editingProductType
              ? "Update the details of the product."
              : "Fill in the details to add a new product."
          }
          form={form}
          onSubmit={onSubmit}
          isSubmitting={addMutation.isPending || updateMutation.isPending}
          submitText={editingProductType ? "Update Product" : "Add Product"}
          submittingText={editingProductType ? "Updating..." : "Adding..."}
          errorMessage={errorMessage}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </div>
    </div>
  );
};

export default Index;

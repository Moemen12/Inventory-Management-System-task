import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customKy, handleApiError } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/constants";
import { z } from "zod";
import { productTypeSchema } from "@/lib/validation";
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

// Define the type for a product type
interface ProductType {
  id: string;
  name: string;
  description?: string;
  products_count?: number;
  image?: string;
}

// Define the type for the API response
interface ApiResponse {
  data: ProductType[];
  message: string;
}

const Index = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProductType, setEditingProductType] =
    useState<ProductType | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof productTypeSchema>>({
    resolver: zodResolver(productTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      image: undefined,
    },
  });

  // Mutation for adding a product type
  const addMutation = useMutation<
    { message: string },
    { message: string },
    z.infer<typeof productTypeSchema>
  >({
    mutationFn: async (data) => {
      try {
        const formData = new FormData();
        formData.append("name", data.name);
        if (data.description) formData.append("description", data.description);
        if (data.image) formData.append("image", data.image);

        const response = await customKy
          .post(`${API_BASE_URL}/product-types`, {
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
      await customKy.delete(`${API_BASE_URL}/product-types/${id}`, {
        credentials: "include",
      });
    },
    onError: (error) => {
      setErrorMessage(error.message);
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
    z.infer<typeof productTypeSchema> & { id: string }
  >({
    mutationFn: async (data) => {
      try {
        const formData = new FormData();
        formData.append("name", data.name);
        if (data.description) formData.append("description", data.description);
        if (data.image) formData.append("image", data.image);

        const response = await customKy
          .post(`${API_BASE_URL}/product-types/${data.id}?_method=PUT`, {
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
    queryKey: ["product_types"],
    queryFn: async () => {
      return await customKy
        .get(`${API_BASE_URL}/product-types`, {
          credentials: "include",
        })
        .json();
    },
  });

  const onSubmit = async (data: z.infer<typeof productTypeSchema>) => {
    if (editingProductType) {
      updateMutation.mutate({ ...data, id: editingProductType.id });
    } else {
      addMutation.mutate(data);
    }
  };

  const handleEdit = (productType: ProductType) => {
    setEditingProductType(productType);
    form.reset({
      name: productType.name,
      description: productType.description || "",
      image: undefined,
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
    });
    setIsDialogOpen(true); // Open the dialog
  };

  // Filter data based on search term
  const filteredData =
    data?.data?.filter((type) =>
      type.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="w-full max-w-[90%] sm:max-w-4xl py-8 px-4 sm:px-8 bg-gray-800 rounded-xl shadow-xl space-y-6 border border-gray-700">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Product Types</h1>
          <div className="flex items-center gap-2">
            <Link
              to={"/dashboard/products/items"}
              onClick={handleAdd}
              className="text-sm w-full sm:w-auto cursor-pointer px-4 py-2 transition-all duration-200 rounded-lg shadow-lg text-white"
            >
              Add new Items ?
            </Link>
            <Button
              onClick={handleAdd}
              className="text-sm w-full sm:w-auto cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 rounded-lg shadow-lg text-white"
            >
              + Add Product Type
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
                  ID
                </TableHead>
                <TableHead className="text-gray-300 font-medium p-4 text-sm">
                  Name
                </TableHead>
                <TableHead className="text-gray-300 font-medium p-4 text-sm">
                  Count
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
                      ? "No matching product types found."
                      : "No product types available."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((type, index) => (
                  <TableRow
                    key={type.id}
                    className="border-b border-gray-700 hover:bg-gray-750"
                  >
                    <TableCell className="text-gray-300 p-4">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-gray-300 p-4 font-medium">
                      {type.name}
                    </TableCell>
                    <TableCell className="text-gray-300 p-4">
                      {type.products_count}
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex gap-3">
                        <Button
                          variant="ghost"
                          className="text-indigo-400 hover:text-indigo-300 hover:bg-gray-700 p-2 h-8 rounded-md text-sm"
                          onClick={() => handleEdit(type)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-gray-700 p-2 h-8 rounded-md text-sm"
                          onClick={() => handleDelete(type.id)} // Fixed here
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

        {/* Confirmation Dialog */}
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

        {/* Dialog for Add/Edit */}
        <CustomForm
          text="Product Type"
          placeholder="product type"
          btnTitle={
            editingProductType ? "Edit Product Type" : "Add Product Type"
          }
          btnDesc={
            editingProductType
              ? "Update the details of the product type."
              : "Fill in the details to add a new product type."
          }
          form={form}
          onSubmit={onSubmit}
          isSubmitting={addMutation.isPending || updateMutation.isPending}
          submitText={
            editingProductType ? "Update Product Type" : "Add Product Type"
          }
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

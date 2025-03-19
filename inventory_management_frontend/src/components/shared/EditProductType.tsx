import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { productTypeSchema } from "@/lib/validation";
import { customKy, handleApiError } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/constants";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import CustomForm from "./CutomForm";

interface ProductType {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

interface EditProductTypeProps {
  productType: ProductType;
  onSuccess: () => void;
  onClose: () => void;
}

const EditProductType = ({
  productType,
  onSuccess,
  onClose,
}: EditProductTypeProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof productTypeSchema>>({
    resolver: zodResolver(productTypeSchema),
    defaultValues: {
      name: productType.name,
      description: productType.description || "",
      image: undefined,
    },
  });

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
          .put(`${API_BASE_URL}/products-types/${data.id}`, {
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
      toast.error(error.message);
    },
    onSuccess: (response) => {
      setErrorMessage(null);
      form.reset();
      toast.success(response.message);
      onSuccess();
      onClose();
    },
  });

  const onSubmit = async (data: z.infer<typeof productTypeSchema>) => {
    updateMutation.mutate({ ...data, id: productType.id });
  };

  return (
    <CustomForm
      btnText="Edit Product Type"
      btnTitle="Edit Product Type"
      btnDesc="Update the details of the product type."
      form={form}
      onSubmit={onSubmit}
      isSubmitting={updateMutation.isPending}
      submitText="Update Product Type"
      submittingText="Updating..."
      errorMessage={errorMessage}
      isOpen={true}
      onOpenChange={onClose}
      dialogTriggerClassName="hidden" // Hide the trigger since we're controlling the dialog externally
    />
  );
};

export default EditProductType;

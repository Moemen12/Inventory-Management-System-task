import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import ErrorMessage from "./ErrorMessage";
import { FormInput } from "./FormInput";
import { Input } from "../ui/input";
import { UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import BarcodeScanner from "./Scanner";
import { useQuery } from "@tanstack/react-query";
import { customKy } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/constants";

// Define the API response type
interface ProductType {
  id: string; // UUID
  name: string;
  // any other fields your API returns
}

interface ApiResponse {
  data: ProductType[];
  // any other metadata your API returns
}

// Match your FormData to your Zod schema
interface FormData {
  name: string;
  description: string;
  image?: File;
  quantity: string; // Required
  has_sold?: boolean;
  product_type_id: string; // Required - matches your Zod schema field name
  serial_number: string; // Required
}

interface CustomFormProps {
  text: string;
  placeholder: string;
  btnText?: string;
  btnTitle: string;
  btnDesc: string;
  form: UseFormReturn<FormData>;
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting?: boolean;
  submitText: string;
  submittingText: string;
  errorMessage?: string | null;
  showImageUpload?: boolean;
  dialogTriggerClassName?: string;
  isOpen?: boolean;
  isItForProduct: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CustomForm = ({
  text,
  placeholder,
  btnTitle,
  btnDesc,
  form,
  onSubmit,
  isSubmitting = false,
  submitText,
  submittingText,
  errorMessage = null,
  showImageUpload = true,
  isOpen,
  isItForProduct = false,
  onOpenChange,
}: CustomFormProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showScannerModal, setShowScannerModal] = useState(false);

  // Fetch product types from the API
  const { isPending, isError, data } = useQuery<
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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleScan = (serialNumber: string) => {
    form.setValue("serial_number", serialNumber);
    setShowScannerModal(false); // Close the scanner modal after scanning
  };

  // Clean up object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <>
      {/* Main Dialog */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#1E293B] border-none rounded-lg shadow-lg p-6 !max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {btnTitle}
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-sm">
              {btnDesc}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Main Container for Form and Scanner */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* Form Fields */}
                <div className="flex-1 space-y-6">
                  {errorMessage && <ErrorMessage errorMessage={errorMessage} />}

                  {/* Name and Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      className="bg-[#334155] border-gray-500 placeholder:text-gray-300 py-4 px-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg"
                      name="name"
                      label={`${text} Name`}
                      placeholder={`Enter ${placeholder} name`}
                    />
                    <FormInput
                      className="bg-[#334155] border-gray-500 placeholder:text-gray-300 py-4 px-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg"
                      name="description"
                      label="Description"
                      placeholder={`Enter ${text} description`}
                    />
                  </div>

                  {/* Image Upload */}
                  {showImageUpload && (
                    <div className="space-y-2">
                      <label className="block text-gray-300 font-medium text-sm">
                        Upload Image (Optional)
                      </label>
                      <Input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleImageChange}
                        className="bg-[#334155] border-gray-500 placeholder:text-gray-300 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg"
                      />
                      {form.formState.errors.image && (
                        <p className="text-red-500 text-sm">
                          {form.formState.errors.image.message?.toString()}
                        </p>
                      )}
                      {imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-md border border-gray-600"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Product-Specific Fields */}
                  {isItForProduct && (
                    <>
                      {/* Quantity and Has Sold */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                          className="bg-[#334155] border-gray-500 placeholder:text-gray-300 py-4 px-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg"
                          name="quantity"
                          label="Quantity"
                          placeholder="Enter quantity"
                          type="number"
                        />
                        <div className="flex items-center space-x-2 mt-6">
                          <Checkbox
                            id="has_sold"
                            name="has_sold"
                            checked={form.watch("has_sold")}
                            onCheckedChange={(checked) =>
                              form.setValue("has_sold", !!checked)
                            }
                          />
                          <label
                            htmlFor="has_sold"
                            className="text-gray-300 text-sm"
                          >
                            Has Sold
                          </label>
                          {form.formState.errors.has_sold && (
                            <p className="text-red-500 text-sm">
                              {form.formState.errors.has_sold.message?.toString()}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Product Type and Serial Number */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div className="flex flex-col gap-2">
                          <label
                            className={`block ${
                              form.formState.errors.product_type_id
                                ? "text-red-600"
                                : "text-gray-300"
                            } font-medium text-sm mb-0`}
                          >
                            Product Type
                          </label>
                          <Select
                            onValueChange={(value) =>
                              form.setValue("product_type_id", value)
                            }
                            defaultValue={form.watch("product_type_id")}
                          >
                            <SelectTrigger className="bg-[#334155] border-gray-500 text-white focus:ring-1 focus:ring-purple-500 rounded-lg mb-0 w-full">
                              <SelectValue placeholder="Select product type" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#334155] border-gray-500 text-white">
                              {isPending ? (
                                <SelectItem value="loading" disabled>
                                  Loading...
                                </SelectItem>
                              ) : isError ? (
                                <SelectItem value="error" disabled>
                                  Error loading product types
                                </SelectItem>
                              ) : data?.data?.length ? (
                                data.data.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-data" disabled>
                                  Plz add Product Type before adding new item
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          {form.formState.errors.product_type_id && (
                            <p className="text-red-500 text-sm">
                              {form.formState.errors.product_type_id.message?.toString()}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2 items-center">
                          <div className="flex items-end space-x-2">
                            <FormInput
                              label="Serial Number"
                              className="bg-[#334155] border-gray-500 placeholder:text-gray-300 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg"
                              name="serial_number"
                              placeholder="Enter serial number"
                            />
                            <Button
                              type="button"
                              onClick={() => setShowScannerModal(true)}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 rounded-lg shadow-md"
                            >
                              Scan
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <Button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full text-base cursor-pointer py-5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 rounded-lg shadow-md"
                  >
                    {isSubmitting ? submittingText : submitText}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Scanner Modal */}
      <Dialog open={showScannerModal} onOpenChange={setShowScannerModal}>
        <DialogContent className="bg-[#1E293B] border-none rounded-lg shadow-lg p-6 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Barcode Scanner
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-sm">
              Align the barcode within the frame to scan.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <BarcodeScanner onScan={handleScan} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomForm;

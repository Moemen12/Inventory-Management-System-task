import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(10, "Username must be at least 10 characters long")
    .max(30, "Username must be at most 30 characters long")
    .regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(20, "Password must be at most 20 characters long"),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(10, "Username must be at least 10 characters long")
    .max(30, "Username must be at most 30 characters long")
    .regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers"),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(20, "Password must be at most 20 characters long"),
});

export const productTypeSchema = z.object({
  name: z
    .string()
    .min(3, "Type Name must be at least 3 characters")
    .max(30, "Type Name must be at most 30 characters long")
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      "Type Name can only contain letters and numbers"
    ),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(100, "Description must be at most 100 characters long")
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      "Description can only contain letters and numbers"
    ),
  image: z
    .instanceof(File, { message: "Please upload a valid image file." })
    .refine(
      (file) => file.size <= 3048 * 1024,
      "Image size must be less than 3MB."
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/jpg"].includes(file.type),
      "Only JPEG, JPG, and PNG image formats are allowed."
    )
    .optional(),
});

export const productSchema = z.object({
  name: z
    .string()
    .min(3, "Type Name must be at least 3 characters")
    .max(30, "Type Name must be at most 30 characters long")
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      "Type Name can only contain letters and numbers"
    ),
  quantity: z.coerce
    .number({ message: "Quantity must be a number" })
    .int("Quantity must be an integer")
    .min(0, "Quantity cannot be less than 0"),

  serial_number: z.string().nonempty("Serial number is required"),
  has_sold: z.boolean().optional(),
  product_type_id: z.string().nonempty("Serial number is required"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(100, "Description must be at most 100 characters long")
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      "Description can only contain letters and numbers"
    ),
  image: z
    .instanceof(File, { message: "Please upload a valid image file." })
    .refine(
      (file) => file.size <= 3048 * 1024,
      "Image size must be less than 3MB."
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/jpg"].includes(file.type),
      "Only JPEG, JPG, and PNG image formats are allowed."
    )
    .optional(),
});

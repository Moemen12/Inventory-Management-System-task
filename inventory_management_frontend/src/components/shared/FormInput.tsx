"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import clsx from "clsx";
import React from "react";
import { useFormContext } from "react-hook-form";

interface FormInputProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  className?: string;
  min?: number;
}

export function FormInput({
  name,
  label,
  placeholder = "",
  type = "text",
  min = 0,
  className,
}: FormInputProps): React.ReactNode {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-slate-400">{label}</FormLabel>
          <FormControl>
            <Input
              min={min}
              className={clsx(
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                className
              )}
              placeholder={placeholder}
              autoComplete="on"
              {...field}
              type={type}
            />
          </FormControl>
          <FormMessage className="text-red-500" />
        </FormItem>
      )}
    />
  );
}

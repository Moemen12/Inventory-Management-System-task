import { Button } from "@/components/ui/button";
import { JSX, useState } from "react";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/FormInput";
import { z } from "zod";
import { registerSchema } from "@/lib/validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { API_BASE_URL } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";
import { SignupFields, ErrorResult } from "@/types";
import ky from "ky";
import { handleApiError } from "@/lib/utils";

import ErrorMessage from "@/components/shared/ErrorMessage";
import { useNavigate } from "react-router-dom";

const Index = (): JSX.Element => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });
  const mutation = useMutation({
    mutationFn: async (data: SignupFields) => {
      try {
        return await ky
          .post(`${API_BASE_URL}/auth/register`, {
            json: data,
            credentials: "include",
          })
          .json();
      } catch (error: unknown) {
        const errorResult: ErrorResult = await handleApiError(error);
        throw errorResult;
      }
    },
    onError: (error: ErrorResult) => {
      setErrorMessage(error.message);
    },
    onSuccess: () => {
      setErrorMessage(null);
      navigate("/dashboard");
    },
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) =>
    mutation.mutate(data);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 bg-[#1E293B] rounded-xl shadow-lg p-6"
      >
        {errorMessage && <ErrorMessage errorMessage={errorMessage} />}
        <FormInput
          className="bg-[#334155] border-gray-500 placeholder:text-gray-300 py-4 px-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg"
          name="username"
          label="Username"
          placeholder="Enter your username"
        />
        <FormInput
          className="bg-[#334155] border-gray-500 placeholder:text-gray-300 py-4 px-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg"
          name="email"
          label="Email"
          placeholder="Enter your email"
        />
        <FormInput
          className="bg-[#334155] border-gray-500 placeholder:text-gray-300 py-4 px-4 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg"
          type="password"
          name="password"
          label="Password"
          placeholder="Enter your password"
        />
        <Button
          disabled={mutation.isPending}
          type="submit"
          className="w-full text-base cursor-pointer py-5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 rounded-lg shadow-md"
        >
          {mutation.isPending ? "Registering..." : "Register"}
        </Button>
      </form>
    </Form>
  );
};

export default Index;

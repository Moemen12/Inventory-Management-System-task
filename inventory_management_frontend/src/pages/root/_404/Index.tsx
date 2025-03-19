import { Button } from "@/components/ui/button";
import { JSX } from "react";

import { useNavigate } from "react-router-dom";

const Index = (): JSX.Element => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <h1 className="text-6xl font-bold text-red-500">404</h1>
      <p className="text-2xl font-medium mt-4">Oops! Page Not Found</p>
      <p className="text-sm text-gray-600 mt-2">
        It seems like you're lost. This page doesn't exist in our inventory
        management system.
      </p>
      <Button
        className="mt-6 px-6 py-2 rounded-lg text-white hover:bg-red-600 transition-colors cursor-pointer"
        onClick={handleGoBack}
      >
        Go Back to Dashboard
      </Button>
    </div>
  );
};

export default Index;

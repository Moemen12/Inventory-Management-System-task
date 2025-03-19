import React, { JSX } from "react";
import clsx from "clsx";
import { CircleAlert } from "lucide-react";

interface ErrorMessageProps {
  errorMessage: string;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  errorMessage,
  className,
}): JSX.Element => {
  return (
    <div
      className={clsx(
        "flex items-center p-4 mb-4 bg-red-100 border-l-4 border-red-500 rounded-r-lg", // Base styles
        className // Merge with any additional classes passed via props
      )}
    >
      <CircleAlert className="w-5 h-5 text-red-500 mr-2" />
      <span className="text-sm text-red-700 font-medium">{errorMessage}</span>
    </div>
  );
};

export default ErrorMessage;

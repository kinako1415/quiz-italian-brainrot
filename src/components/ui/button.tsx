import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded font-medium transition",
        variant === "default" && "bg-blue-500 text-white hover:bg-blue-600",
        variant === "outline" &&
          "border border-gray-300 text-gray-700 hover:bg-gray-100",
        className
      )}
      {...props}
    />
  );
};

import { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-white/5 hover:bg-white/10 border border-white/10 text-white",
        primary:
          "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30",
        success:
          "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30",
        danger:
          "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30",
        purple:
          "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-sm",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
}

const Button = ({
  className,
  variant,
  size,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button, buttonVariants };

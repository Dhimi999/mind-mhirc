
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = ({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  ...props
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 button-hover";
  
  const variantStyles = {
    primary: "bg-primary text-white hover:bg-primary-600 focus:ring-primary",
    secondary: "bg-secondary text-white hover:bg-secondary-600 focus:ring-secondary",
    outline: "bg-transparent border border-primary text-primary hover:bg-primary-100 focus:ring-primary",
    ghost: "bg-transparent text-primary hover:bg-primary-100 focus:ring-primary",
    link: "bg-transparent text-primary underline-offset-4 hover:underline focus:ring-primary p-0"
  };
  
  const sizeStyles = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3"
  };
  
  const loadingStyles = isLoading ? "opacity-70 cursor-not-allowed" : "";
  
  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        variant !== "link" && sizeStyles[size],
        loadingStyles,
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;

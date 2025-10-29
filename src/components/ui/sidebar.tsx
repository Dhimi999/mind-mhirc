import React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  isCollapsed?: boolean;
  isCollapsible?: boolean;
}

export function Sidebar({
  children,
  className,
  isCollapsed = false,
  isCollapsible = true,
  ...props
}: SidebarProps) {
  const isMobile = useIsMobile();

  return (
    <aside
      {...props}
      className={cn(
        "flex flex-col flex-1 w-full border-r bg-background/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-0 data-[state=open]:slide-in-from-left-0",
        isCollapsed && "w-[50px]",
        !isCollapsed && "w-[280px]",
        isCollapsible && "transition-all duration-300",
        className
      )}
    >
      {children}
    </aside>
  );
}

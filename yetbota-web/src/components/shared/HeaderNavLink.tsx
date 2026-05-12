"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Props = ComponentProps<typeof Link> & {
  active?: boolean;
};

export default function HeaderNavLink({ active = false, className, children, ...rest }: Props) {
  return (
    <Link
      {...rest}
      className={cn(
        "relative inline-flex items-center text-sm font-medium transition-colors",
        "after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1.5 after:h-0.5 after:bg-brand after:transition-all after:duration-300",
        active
          ? "text-fg after:w-full"
          : "text-fg-muted hover:text-fg after:w-0 hover:after:w-full",
        className
      )}
    >
      {children}
    </Link>
  );
}

import Link from "next/link";
import React from "react";
import { cn } from "~/lib/utils";
import { ThemeToggle } from "~/components/theme-toggle";

export function SiteHeader({ className }: React.ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <div className={"flex h-full items-center gap-8 px-4"}>
        <div className={"flex items-center gap-5"}>
          <Link className={"flex gap-2 font-bold"} href={"/"}>
            Bitcoin Chart
          </Link>
        </div>

        <div className={"flex flex-1 items-center justify-end gap-1"}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

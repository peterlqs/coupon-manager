"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

import { AlignRight, MountainIcon } from "lucide-react";
import { defaultLinks } from "@/config/nav";
import { SignOutButton, UserButton } from "@clerk/nextjs";
import { ModeToggle } from "./ui/ThemeToggle";

export default function Navbar2() {
  return (
    <header className="absolute top-0 left-0 w-full lg:px-8 px-4 h-20 flex items-center">
      <Link className="flex items-center justify-center" href="#">
        <MountainIcon className="h-6 w-6" />
        <span className="sr-only">Acme Inc</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        <ModeToggle />

        <Link
          className="text-sm font-medium hover:underline underline-offset-4"
          href="/groups"
        >
          Groups
        </Link>
        <Link
          className="text-sm font-medium hover:underline underline-offset-4"
          href="/coupons"
        >
          Coupons
        </Link>
        <UserButton />
      </nav>
    </header>
  );
}

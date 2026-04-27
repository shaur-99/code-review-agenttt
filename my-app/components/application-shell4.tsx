"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronsUpDown,
  HelpCircle,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavGroup = {
  title: string;
  href: string;
};

type FooterItem = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

// User data for footer (Sidebar6+)
type UserData = {
  name: string;
  email: string;
  avatar: string;
};

// Complete sidebar data structure
type SidebarData = {
  // Logo/branding (all sidebars)
  logo: {
    src: string;
    alt: string;
    title: string;
    description: string;
  };
  // Main navigation groups (all sidebars)
  navGroups: NavGroup[];
  // Footer navigation group (mobile sheet)
  footerGroup: {
    title: string;
    items: FooterItem[];
  };
  // User data for user footer (Sidebar6+)
  user?: UserData;
  // Workspaces for switcher (Sidebar7+)
  workspaces?: Array<{
    id: string;
    name: string;
    logo: string;
    plan: string;
  }>;
  // Currently active workspace (Sidebar7+)
  activeWorkspace?: string;
};

// Shared sidebar data - works with all sidebar variations
const sidebarData: SidebarData = {
  logo: {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg",
    alt: "Shadcnblocks",
    title: "Code Review Agent",
    description: "Build your app",
  },
  navGroups: [
    { title: "Github Link", href: "/github-link" },
    { title: "Report", href: "/report" },
  ],
  footerGroup: {
    title: "Support",
    items: [
      { label: "Help Center", icon: HelpCircle },
      { label: "Settings", icon: Settings },
    ],
  },
  user: {
    name: "John Doe",
    email: "john@example.com",
    avatar:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
  },
  workspaces: [
    {
      id: "1",
      name: "Shadcnblocks",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg",
      plan: "Enterprise",
    },
    {
      id: "2",
      name: "Shadcn Templates",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg",
      plan: "Startup",
    },
    {
      id: "3",
      name: "Shadcn Components",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg",
      plan: "Free",
    },
  ],
  activeWorkspace: "1",
};

// Desktop navigation dropdown for each group
const NavDropdown = ({
  group,
  isActive,
}: {
  group: NavGroup;
  isActive: boolean;
}) => {
  return (
    <Button
      asChild
      variant="ghost"
      className={cn("gap-1", isActive && "bg-muted")}
    >
      <Link href={group.href}>{group.title}</Link>
    </Button>
  );
};

// Mobile navigation sheet
const MobileNav = ({ pathname }: { pathname: string }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="px-4 pt-4">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-primary">
              <img
                src={sidebarData.logo.src}
                alt={sidebarData.logo.alt}
                className="size-6 text-primary-foreground invert dark:invert-0"
              />
            </div>
            {sidebarData.logo.title}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <nav className="flex flex-col gap-4 px-4 py-4">
            {sidebarData.navGroups.map((group) => (
              <div key={group.title}>
                <Link
                  href={group.href}
                  className={cn(
                    "mb-2 text-xs font-medium tracking-wider uppercase",
                    pathname === group.href
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {group.title}
                </Link>
              </div>
            ))}
            <Separator />
            <div>
              <div className="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {sidebarData.footerGroup.title}
              </div>
              <div className="flex flex-col gap-1">
                {sidebarData.footerGroup.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// User dropdown
const NavUser = ({ user }: { user: UserData }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2">
          <Avatar className="size-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium md:inline">
            {user.name}
          </span>
          <ChevronsUpDown className="hidden size-4 md:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 size-4" />
          Account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface ApplicationShell4Props {
  children: React.ReactNode;
  className?: string;
}

export function ApplicationShell4({
  children,
  className,
}: ApplicationShell4Props) {
  const pathname = usePathname();

  return (
    <div className={cn("flex min-h-svh flex-col", className)}>
      {/* Top navigation bar */}
      <header className="sticky top-0 z-50 bg-background">
        <div className="flex h-14 items-center gap-4 border-b px-4 lg:px-6">
          {/* Mobile menu */}
          <MobileNav pathname={pathname} />

          {/* Logo */}
          <button type="button" className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-primary">
              <img
                src={sidebarData.logo.src}
                alt={sidebarData.logo.alt}
                className="size-6 text-primary-foreground invert dark:invert-0"
              />
            </div>
            <span className="font-semibold">{sidebarData.logo.title}</span>
          </button>

          {/* Desktop navigation - group tabs */}
          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {sidebarData.navGroups.map((group) => (
              <NavDropdown
                key={group.title}
                group={group}
                isActive={pathname === group.href}
              />
            ))}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="h-9 w-64 pl-8"
              />
            </div>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="size-5" />
            </Button>
            {sidebarData.user && <NavUser user={sidebarData.user} />}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
}

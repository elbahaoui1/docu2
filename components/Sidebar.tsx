"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/src/shared/utils/cn";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { 
  LayoutDashboard, 
  FileText, 
  Building2, 
  Users, 
  Link2, 
  Shield
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  hidden?: boolean;
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isCabinet = session?.user?.accountType === "CABINET";
  const isAdmin = isCabinet && session?.user?.role === "ADMIN";

  const commonNav: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/documents", label: "Documents", icon: FileText },
  ];

  const cabinetNav: NavItem[] = [
    { href: "/companies", label: "Companies", icon: Building2 },
    { href: "/cabinet/groups", label: "Groups", icon: Users },
    { href: "/cabinet/team", label: "Team", icon: Users },
    { href: "/cabinet/invitations", label: "Invitations", icon: Link2, hidden: !isAdmin },
  ];

  const navItems = isCabinet ? [...commonNav, ...cabinetNav] : commonNav;

  return (
    <div>
      {/* Mobile: horizontal nav */}
      <div className="md:hidden -mx-2 overflow-x-auto">
        <div className="flex items-center gap-1 px-2">
          {navItems.filter(i => !i.hidden).map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs",
                  active ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {label === "Invitations" && isAdmin && (
                  <Badge className="ml-1" variant="secondary">Admin</Badge>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop: vertical nav */}
      <nav className="hidden md:block">
        <div className="mb-3">
          <p className="text-xs text-muted-foreground">Navigation</p>
        </div>
        <ul className="space-y-1">
          {navItems.filter(i => !i.hidden).map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname?.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "group flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                    active ? "bg-muted font-medium" : "hover:bg-muted/60"
                  )}
                >
                  <Icon className={cn("h-4 w-4 text-muted-foreground", active && "text-foreground")} />
                  <span className="truncate">{label}</span>
                  {label === "Invitations" && isAdmin && (
                    <Shield className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {isCabinet && (
          <>
            <Separator className="my-4" />
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">Account</p>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant={isAdmin ? "default" : "secondary"}>
                  {isAdmin ? "Admin" : "Member"}
                </Badge>
                <span className="truncate">Cabinet</span>
              </div>
            </div>
          </>
        )}
      </nav>
    </div>
  );
}



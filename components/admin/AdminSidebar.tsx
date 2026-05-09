"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Calendar,
  ArrowRightLeft,
  Image,
  Trophy,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
  UserCog,
  Handshake,
  Menu,
} from "lucide-react";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  minRole?: "editor" | "admin" | "super_admin";
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    label: "Haberler",
    href: "/admin/news",
    icon: <Newspaper className="w-4 h-4" />,
  },
  {
    label: "Oyuncular",
    href: "/admin/players",
    icon: <Users className="w-4 h-4" />,
  },
  {
    label: "Teknik Ekip",
    href: "/admin/staff",
    icon: <UserCog className="w-4 h-4" />,
  },
  {
    label: "Maçlar",
    href: "/admin/matches",
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    label: "Puan Durumu",
    href: "/admin/standings",
    icon: <Trophy className="w-4 h-4" />,
  },
  {
    label: "Transferler",
    href: "/admin/transfers",
    icon: <ArrowRightLeft className="w-4 h-4" />,
  },
  {
    label: "Medya",
    href: "/admin/media",
    icon: <Image className="w-4 h-4" />,
  },
  {
    label: "Sponsorlar",
    href: "/admin/sponsors",
    icon: <Handshake className="w-4 h-4" />,
  },
  {
    label: "Kullanıcılar",
    href: "/admin/users",
    icon: <UserCog className="w-4 h-4" />,
    minRole: "admin",
  },
  {
    label: "Aktivite Logları",
    href: "/admin/activity",
    icon: <Activity className="w-4 h-4" />,
    minRole: "admin",
  },
  {
    label: "Ayarlar",
    href: "/admin/settings",
    icon: <Settings className="w-4 h-4" />,
    minRole: "admin",
  },
];

const ROLE_HIERARCHY: Record<string, number> = {
  viewer: 0,
  editor: 1,
  admin: 2,
  super_admin: 3,
};

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { appUser, signOut } = useAuthContext();

  const userLevel = ROLE_HIERARCHY[appUser?.role || "viewer"] ?? 0;

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.minRole) return true;
    return userLevel >= ROLE_HIERARCHY[item.minRole];
  });

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("flex items-center gap-3 p-4 border-b border-gray-800", collapsed && "justify-center")}>
        <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <Trophy className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-bold text-white text-sm truncate">
              {process.env.NEXT_PUBLIC_CLUB_NAME || "Konyaspor"}
            </div>
            <div className="text-xs text-gray-500">Admin Panel</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2" aria-label="Admin navigasyon">
        <ul className="space-y-0.5" role="list">
          {visibleItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary-700 text-white shadow-sm"
                      : "text-gray-400 hover:text-white hover:bg-gray-800",
                    collapsed && "justify-center px-2"
                  )}
                  aria-current={isActive ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="ml-auto bg-accent-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info & logout */}
      <div className="border-t border-gray-800 p-3">
        {!collapsed && appUser && (
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            <div className="w-7 h-7 bg-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {appUser.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-xs text-white font-medium truncate">
                {appUser.displayName || appUser.email}
              </div>
              <div className="text-xs text-gray-500 capitalize">{appUser.role?.replace("_", " ")}</div>
            </div>
          </div>
        )}
        <button
          onClick={signOut}
          className={cn(
            "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Çıkış Yap" : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Çıkış Yap</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 flex-shrink-0",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-20 -right-3 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors z-10"
          aria-label={collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </aside>

      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 w-10 h-10 bg-gray-900 border border-gray-700 rounded-lg flex items-center justify-center text-gray-300"
          aria-label="Menüyü aç"
        >
          <Menu className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 border-r border-gray-800 z-50"
              >
                <SidebarContent />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

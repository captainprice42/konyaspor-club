"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  X,
  Users,
  Calendar,
  Newspaper,
  Camera,
  Phone,
  ArrowRightLeft,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Kulüp",
    href: "/kulup",
    icon: <Trophy className="w-4 h-4" />,
    children: [
      { label: "Hakkımızda", href: "/kulup/hakkimizda" },
      { label: "Teknik Ekip", href: "/kulup/teknik-ekip" },
      { label: "Yönetim", href: "/kulup/yonetim" },
      { label: "Stadyum", href: "/kulup/stadyum" },
    ],
  },
  {
    label: "Kadro",
    href: "/kadro",
    icon: <Users className="w-4 h-4" />,
    children: [
      { label: "Futbolcular", href: "/kadro/futbolcular" },
      { label: "Teknik Ekip", href: "/kadro/teknik-ekip" },
      { label: "Transferler", href: "/kadro/transferler" },
    ],
  },
  {
    label: "Maçlar",
    href: "/maclar",
    icon: <Calendar className="w-4 h-4" />,
    children: [
      { label: "Fikstür", href: "/maclar/fikstür" },
      { label: "Puan Durumu", href: "/maclar/puan-durumu" },
      { label: "Sonuçlar", href: "/maclar/sonuclar" },
    ],
  },
  {
    label: "Haberler",
    href: "/haberler",
    icon: <Newspaper className="w-4 h-4" />,
  },
  {
    label: "Medya",
    href: "/medya",
    icon: <Camera className="w-4 h-4" />,
    children: [
      { label: "Fotoğraflar", href: "/medya/fotograflar" },
      { label: "Videolar", href: "/medya/videolar" },
    ],
  },
  {
    label: "Transferler",
    href: "/transferler",
    icon: <ArrowRightLeft className="w-4 h-4" />,
  },
  {
    label: "İletişim",
    href: "/iletisim",
    icon: <Phone className="w-4 h-4" />,
  },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-800/50"
          : "bg-transparent"
      )}
    >
      {/* Top bar */}
      <div className="bg-primary-700 text-white text-xs py-1.5 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <span className="font-medium">
            {process.env.NEXT_PUBLIC_LEAGUE_NAME || "Sanal Lig Sistemi"} —{" "}
            {process.env.NEXT_PUBLIC_CLUB_NAME || "Konyaspor"} Resmi Sitesi
          </span>
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="hover:text-accent-400 transition-colors">
              Admin Girişi
            </Link>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav
        className="container mx-auto px-4"
        role="navigation"
        aria-label="Ana navigasyon"
      >
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Ana sayfaya git"
          >
            <div className="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center group-hover:bg-primary-800 transition-colors">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div
                className={cn(
                  "font-bold text-lg leading-tight transition-colors",
                  isScrolled
                    ? "text-primary-700 dark:text-primary-400"
                    : "text-white"
                )}
              >
                {process.env.NEXT_PUBLIC_CLUB_NAME || "KONYASPOR"}
              </div>
              <div
                className={cn(
                  "text-xs transition-colors",
                  isScrolled
                    ? "text-gray-500 dark:text-gray-400"
                    : "text-white/70"
                )}
              >
                Resmi Web Sitesi
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.href)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    pathname.startsWith(item.href) && item.href !== "/"
                      ? "text-accent-500 bg-accent-500/10"
                      : isScrolled
                      ? "text-gray-700 dark:text-gray-200 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  )}
                  aria-current={
                    pathname === item.href ? "page" : undefined
                  }
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        activeDropdown === item.href && "rotate-180"
                      )}
                    />
                  )}
                </Link>

                {/* Dropdown */}
                <AnimatePresence>
                  {item.children && activeDropdown === item.href && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-950 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  isScrolled
                    ? "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
                aria-label={
                  theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"
                }
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className={cn(
                "lg:hidden p-2 rounded-md transition-colors",
                isScrolled
                  ? "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  : "text-white hover:bg-white/10"
              )}
              aria-label={isMobileOpen ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                      pathname.startsWith(item.href) && item.href !== "/"
                        ? "text-primary-700 bg-primary-50 dark:text-primary-400 dark:bg-primary-950"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

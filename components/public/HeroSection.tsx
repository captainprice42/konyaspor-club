"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Play, Calendar, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  cta: { label: string; href: string };
  badge?: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "1",
    title: "Yeşil-Beyaz Gurur",
    subtitle: "Sanal Lig Sistemi'nde mücadelemiz sürüyor. Takımımızı destekleyin!",
    cta: { label: "Fikstürü Gör", href: "/maclar/fikstür" },
    badge: "2024-2025 Sezonu",
  },
  {
    id: "2",
    title: "Kadromuz Hazır",
    subtitle: "Güçlü kadromuzla bu sezon şampiyonluğa oynuyoruz.",
    cta: { label: "Kadroyu İncele", href: "/kadro/futbolcular" },
    badge: "Yeni Transferler",
  },
  {
    id: "3",
    title: "Son Dakika Haberleri",
    subtitle: "Kulübümüzdeki tüm gelişmeleri takip edin.",
    cta: { label: "Haberlere Git", href: "/haberler" },
    badge: "Güncel",
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % DEFAULT_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const slide = DEFAULT_SLIDES[currentSlide];

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      aria-label="Ana hero bölümü"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-hero-pattern" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-800/20 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              {/* Badge */}
              {slide.badge && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 bg-accent-500/20 border border-accent-500/30 text-accent-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  {slide.badge}
                </motion.div>
              )}

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6"
              >
                {slide.title}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-white/70 max-w-2xl mb-10 leading-relaxed"
              >
                {slide.subtitle}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4"
              >
                <Button asChild size="lg" variant="accent">
                  <Link href={slide.cta.href}>
                    {slide.cta.label}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="glass">
                  <Link href="/haberler">
                    <Play className="w-4 h-4" />
                    Son Haberler
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Slide indicators */}
          <div className="flex items-center gap-2 mt-12">
            {DEFAULT_SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentSlide(index);
                  setIsAutoPlaying(false);
                }}
                className={cn(
                  "transition-all duration-300 rounded-full",
                  index === currentSlide
                    ? "w-8 h-2 bg-accent-500"
                    : "w-2 h-2 bg-white/30 hover:bg-white/50"
                )}
                aria-label={`Slayt ${index + 1}`}
                aria-current={index === currentSlide}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {[
              { label: "Kuruluş Yılı", value: "1922" },
              { label: "Lig Maçı", value: "0" },
              { label: "Gol", value: "0" },
              { label: "Puan", value: "0" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="px-6 py-4 text-center"
              >
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import Link from "next/link";
import {
  Trophy,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = {
  kulup: {
    title: "Kulüp",
    links: [
      { label: "Hakkımızda", href: "/kulup/hakkimizda" },
      { label: "Teknik Ekip", href: "/kulup/teknik-ekip" },
      { label: "Yönetim", href: "/kulup/yonetim" },
      { label: "Stadyum", href: "/kulup/stadyum" },
    ],
  },
  takim: {
    title: "Takım",
    links: [
      { label: "Futbolcular", href: "/kadro/futbolcular" },
      { label: "Transferler", href: "/kadro/transferler" },
      { label: "Fikstür", href: "/maclar/fikstür" },
      { label: "Puan Durumu", href: "/maclar/puan-durumu" },
    ],
  },
  medya: {
    title: "Medya",
    links: [
      { label: "Haberler", href: "/haberler" },
      { label: "Fotoğraflar", href: "/medya/fotograflar" },
      { label: "Videolar", href: "/medya/videolar" },
      { label: "Basın Odası", href: "/basin" },
    ],
  },
  diger: {
    title: "Diğer",
    links: [
      { label: "İletişim", href: "/iletisim" },
      { label: "Gizlilik Politikası", href: "/gizlilik" },
      { label: "Kullanım Koşulları", href: "/kosullar" },
      { label: "KVKK", href: "/kvkk" },
    ],
  },
};

export function Footer() {
  const currentYear = new Date().getFullYear();
  const clubName = process.env.NEXT_PUBLIC_CLUB_NAME || "Konyaspor";
  const leagueName = process.env.NEXT_PUBLIC_LEAGUE_NAME || "Sanal Lig Sistemi";

  return (
    <footer className="bg-gray-950 text-gray-300" role="contentinfo">
      {/* Main footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-700 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-xl text-white">{clubName}</div>
                <div className="text-xs text-gray-400">{leagueName}</div>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              {clubName}, {leagueName} bünyesinde mücadele eden köklü bir futbol
              kulübüdür. Yeşil-beyaz renklerimizle şehrimizin gururu olmaya
              devam ediyoruz.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { icon: <ExternalLink className="w-4 h-4" />, href: "#", label: "Twitter" },
                { icon: <ExternalLink className="w-4 h-4" />, href: "#", label: "Instagram" },
                { icon: <ExternalLink className="w-4 h-4" />, href: "#", label: "Facebook" },
                { icon: <ExternalLink className="w-4 h-4" />, href: "#", label: "YouTube" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 bg-gray-800 hover:bg-primary-700 rounded-lg flex items-center justify-center transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.values(FOOTER_LINKS).map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact info */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <Mail className="w-4 h-4 text-primary-400" />,
                label: "E-posta",
                value: "info@konyaspor.example",
              },
              {
                icon: <Phone className="w-4 h-4 text-primary-400" />,
                label: "Telefon",
                value: "+90 332 000 00 00",
              },
              {
                icon: <MapPin className="w-4 h-4 text-primary-400" />,
                label: "Adres",
                value: "Konya, Türkiye",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs text-gray-500">{item.label}</div>
                  <div className="text-sm text-gray-300">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>
            © {currentYear} {clubName}. Tüm hakları saklıdır.
          </p>
          <p>
            {leagueName} — Sanal Kulüp Yönetim Sistemi
          </p>
        </div>
      </div>
    </footer>
  );
}

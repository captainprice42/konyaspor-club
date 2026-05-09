import Link from "next/link";
import { Trophy, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-primary-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-10 h-10 text-primary-400" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <h2 className="text-xl font-semibold text-primary-300 mb-4">
          Sayfa Bulunamadı
        </h2>
        <p className="text-primary-400 mb-8 leading-relaxed">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="accent">
            <Link href="/">
              <Home className="w-4 h-4" />
              Ana Sayfaya Dön
            </Link>
          </Button>
          <Button asChild variant="glass">
            <Link href="/haberler">
              <ArrowLeft className="w-4 h-4" />
              Haberlere Git
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/public/SectionHeader";

export const metadata: Metadata = {
  title: "İletişim",
  description: `${process.env.NEXT_PUBLIC_CLUB_NAME || "Konyaspor"} iletişim bilgileri.`,
};

export default function ContactPage() {
  const clubName = process.env.NEXT_PUBLIC_CLUB_NAME || "Konyaspor";

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <SectionHeader
          title="İletişim"
          subtitle={`${clubName} ile iletişime geçin`}
          accent
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact info */}
          <div className="space-y-4">
            {[
              {
                icon: <Mail className="w-5 h-5 text-primary-600" />,
                title: "E-posta",
                lines: ["info@konyaspor.example", "basin@konyaspor.example"],
              },
              {
                icon: <Phone className="w-5 h-5 text-primary-600" />,
                title: "Telefon",
                lines: ["+90 332 000 00 00"],
              },
              {
                icon: <MapPin className="w-5 h-5 text-primary-600" />,
                title: "Adres",
                lines: ["Konya, Türkiye"],
              },
              {
                icon: <Clock className="w-5 h-5 text-primary-600" />,
                title: "Çalışma Saatleri",
                lines: ["Pazartesi – Cuma: 09:00 – 18:00"],
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-950 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    {item.lines.map((line) => (
                      <p key={line} className="text-sm text-muted-foreground">
                        {line}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact form */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-5">Mesaj Gönderin</h2>
              <form className="space-y-4" action="#" method="POST">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Ad</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Soyad</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">E-posta</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Konu</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Mesaj</label>
                  <textarea
                    name="message"
                    rows={5}
                    required
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-700"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-11 bg-primary-700 hover:bg-primary-800 text-white font-semibold rounded-md transition-colors"
                >
                  Gönder
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

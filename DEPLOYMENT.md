# Konyaspor Club CMS — Deployment Rehberi

## 1. Firebase Projesi Kurulumu

### Firebase Console'da yapılacaklar:

1. **Yeni proje oluştur** → https://console.firebase.google.com
2. **Authentication** → Sign-in methods → Email/Password aktif et
3. **Firestore Database** → Production mode'da oluştur
4. **Storage** → Production mode'da oluştur
5. **Project Settings** → Service accounts → Generate new private key (Admin SDK için)

### Firestore Security Rules deploy:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only firestore:indexes
```

---

## 2. Environment Variables

`.env.local.example` dosyasını `.env.local` olarak kopyala ve doldur:

```bash
cp .env.local.example .env.local
```

### Vercel'de environment variables:
- Vercel Dashboard → Project → Settings → Environment Variables
- Tüm değişkenleri Production + Preview + Development için ekle
- `FIREBASE_ADMIN_PRIVATE_KEY` değerini tırnak içinde ekle

---

## 3. İlk Admin Kullanıcısı Oluşturma

Firebase Authentication'da kullanıcı oluşturduktan sonra Firestore'da manuel kayıt:

```javascript
// Firebase Console → Firestore → users collection → Add document
{
  uid: "FIREBASE_AUTH_UID",
  email: "admin@example.com",
  displayName: "Admin",
  photoURL: null,
  role: "super_admin",
  isActive: true,
  permissions: [...tüm izinler...],
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  lastLoginAt: null
}
```

**Document ID = Firebase Auth UID olmalı.**

---

## 4. Vercel Deploy

```bash
# Vercel CLI ile
npm i -g vercel
vercel --prod

# veya GitHub entegrasyonu ile otomatik deploy
```

### Vercel ayarları:
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Node.js Version: 22.x

---

## 5. Domain & CORS

1. Vercel'de custom domain ekle
2. Firebase Console → Authentication → Authorized domains → domain ekle
3. `NEXT_PUBLIC_APP_URL` env var'ını production URL ile güncelle

---

## 6. Middleware Uyarısı

Next.js 16'da `middleware.ts` → `proxy.ts` olarak yeniden adlandırılmalı:

```bash
mv middleware.ts proxy.ts
```

---

## Production Checklist

### Güvenlik
- [ ] Firebase Security Rules deploy edildi
- [ ] Storage Rules deploy edildi
- [ ] Admin SDK private key güvenli şekilde saklandı
- [ ] `NEXT_PUBLIC_*` değişkenlerinde hassas veri yok
- [ ] Firebase Console'da authorized domains ayarlandı
- [ ] Rate limiting aktif (Firestore `rate_limits` collection)
- [ ] CSP headers `next.config.ts`'de tanımlı

### Firebase
- [ ] Firestore indexes deploy edildi (`firestore.indexes.json`)
- [ ] Firestore backup planı oluşturuldu
- [ ] Firebase Usage Alerts ayarlandı (budget alert)
- [ ] Firestore daily export aktif edildi

### Performance
- [ ] Next.js Image optimization aktif
- [ ] ISR/dynamic rendering doğru ayarlandı
- [ ] Firebase Storage CDN aktif

### Monitoring
- [ ] Vercel Analytics aktif
- [ ] Firebase Performance Monitoring aktif
- [ ] Error tracking (Sentry önerilir) entegre edildi

---

## Potansiyel Güvenlik Açıkları & Çözümleri

### 1. Firebase Quota Exhaustion (DoS)
**Risk:** Kötü niyetli kullanıcılar Firestore okuma/yazma limitlerini tüketebilir.
**Çözüm:**
- Rate limiting middleware aktif (Firestore-backed)
- Firebase App Check entegre et
- Firestore Security Rules'da `request.auth != null` zorunlu tut

### 2. File Upload Polyglot Attack
**Risk:** Zararlı dosya JPEG olarak yüklenebilir.
**Çözüm:** `app/api/upload/route.ts`'de magic byte validation uygulandı.

### 3. XSS via Rich Content
**Risk:** Haber içeriğinde script injection.
**Çözüm:** `lib/security/sanitize.ts`'de HTML sanitization uygulandı.

### 4. CSRF
**Risk:** Cross-site request forgery.
**Çözüm:** Middleware'de origin validation + Firebase ID token zorunluluğu.

### 5. Privilege Escalation
**Risk:** Editor rolündeki kullanıcı admin işlemi yapabilir.
**Çözüm:** Her API route'da `requirePermission()` / `requireRole()` kontrolü.

### 6. Firebase Admin Key Exposure
**Risk:** Private key client bundle'a sızabilir.
**Çözüm:** `lib/firebase/admin.ts` başında `import "server-only"` direktifi.

---

## Ölçeklenme Notları

### Firestore Limitleri
- Ücretsiz plan: 50K okuma/gün, 20K yazma/gün
- Paid plan: $0.06/100K okuma, $0.18/100K yazma
- Rate limiting için Redis (Upstash) kullanımı önerilir (yüksek trafik için)

### Çoklu Kulüp Desteği
Sistem çoklu kulüp için hazır:
- Her kulüp için ayrı Firebase project veya
- Tek project'te `clubId` field'ı ile tenant isolation
- `NEXT_PUBLIC_CLUB_NAME` env var ile branding değişimi

### CDN & Caching
- Vercel Edge Network otomatik CDN sağlar
- Static assets Firebase Storage CDN üzerinden serve edilir
- API routes `force-dynamic` ile her request'te fresh data

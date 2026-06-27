# Handover Checklist — Lodhi Brothers Housing Society Portal

> Maqsad: poora project (app, database, file storage, domain) **client ki apni IDs** par shift karna — saaf, mahfooz, aur sahi tarteeb mein.
> **Sab se aham:** yeh handover **asal data daalne se PEHLE** karna behtar hai. Abhi sab dummy hai — to client ka setup pehle banao, phir asal clients/documents seedha client ke system mein daalo. Isse koi data migration karni hi nahi paregi.

---

## 0. Pehle Faisla Karo — Maintain Kaun Karega?

Aage ka tareeqa is par thoda badalta hai:

- **Scenario A — Aap maintain karenge (technical partner):** ownership client ki, lekin aap har service mein **collaborator/member** rahein.
- **Scenario B — Client khud manage karega:** har account ka full access + 2FA recovery + saara documentation client ke pass.

> Recommended: **Scenario A** — non-technical client ke liye behtar, aur aap updates/maintenance kar sakte hain.

---

## 1. Client Se Yeh 3 Cheezein Lo (Pehle Din)

- [ ] **1 dedicated business Gmail** (client ki personal nahi — naya banao, jaise `lodhibrothers.portal@gmail.com`). Isi se saare accounts banenge.
- [ ] **1 phone number** — Cloudflare / GitHub / Hostinger 2FA aur verification maangte hain.
- [ ] **1 payment card (debit/credit)** — domain ke liye lazmi; Vercel Pro / paid plans ke liye bhi.
- [ ] Har account ka **strong password** set karo + jahan mumkin ho **2FA on** karo. Sab kuch ek **handover document** (ya password manager) mein likho.

---

## 2. Accounts Banao (Isi Tarteeb Mein)

### A. GitHub (code)
- [ ] Client Gmail se GitHub account banao (ya client ka mojooda use karo).
- [ ] **Scenario A:** repo client ke account par le jao — ya to **Transfer ownership**, ya naya repo bana kar code push karo. Phir **apne aap ko collaborator** add karo.
- [ ] **Scenario B:** repo client ke account par transfer karo, aap ko access ki zaroorat nahi.
- [ ] Confirm: `main` branch par latest code mojood hai.

### B. Cloudflare R2 (PDF storage)
- [ ] Client Gmail se Cloudflare account banao.
- [ ] **R2 enable** karo (card on file maang sakta hai — free tier mein bhi).
- [ ] Ek **private bucket** banao (public access OFF rakho).
- [ ] **R2 API token / S3 credentials** generate karo. Note karo:
  - `R2_ACCOUNT_ID`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET_NAME` (bucket ka naam)
  - `R2_ENDPOINT` → `https://<account-id>.r2.cloudflarestorage.com`

### C. Neon (PostgreSQL database)
- [ ] Client Gmail se Neon account banao.
- [ ] Naya **project/database** banao.
- [ ] **Connection string** lo → yeh `DATABASE_URL` aur `DIRECT_URL` dono ke liye use hogi.
- [ ] (Behtar) aisa plan chuno jo inactivity par pause na ho — live client demo ke liye.

### D. Vercel (app hosting)
- [ ] Client Gmail se Vercel account banao.
- [ ] Step A wale **GitHub repo se connect** karo (Import Project).
- [ ] **Saare environment variables** add karo (neeche Section 3).
- [ ] Commercial live use ke liye **Vercel Pro (~$20/mo)** lo (free Hobby plan non-commercial hai).

### E. Hostinger (domain) — sab se aakhir mein
- [ ] Client card se sirf **domain naam** khareedo (jaise `lodhibrothers.com`).
- [ ] Hostinger ki **shared hosting use NAHI karni**.
- [ ] Domain ka **DNS Vercel par point** karo (Vercel ke diye records add karke).

---

## 3. Environment Variables (Vercel Par Yeh Set Karo)

> Yeh exact naam project ke `.env.example` se hain. Vercel → Project → Settings → Environment Variables.

| Variable | Value kahan se |
|----------|----------------|
| `DATABASE_URL` | Neon connection string |
| `DIRECT_URL` | Neon connection string (wahi/direct) |
| `R2_ACCOUNT_ID` | Cloudflare R2 |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 |
| `R2_BUCKET_NAME` | Cloudflare R2 (bucket naam) |
| `R2_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` |
| `AUTH_SECRET` | **Naya** generate karo → `npx auth secret` (ya `openssl rand -base64 32`) |

- [ ] Sab variables **Production** (aur chahein to Preview) environment ke liye add kiye.
- [ ] `AUTH_SECRET` **naya** banaya (purana dev wala dobara use na karo).

---

## 4. Database Setup + Seed (Naye Neon Par)

- [ ] Vercel deploy par migrations khud chalti hain (`package.json` ka build: `prisma migrate deploy`). Confirm deploy logs mein migration successful.
- [ ] **Seed chalao** (sirf structural data — 1 admin user + 360 plots):
  ```
  npx prisma db seed
  ```
- [ ] Confirm: 360 plots (P-001 se P-360) aur admin user ban gaye.
- [ ] **Admin password badlo:** seed wala default password (`admin@portal.com`) sirf dev ke liye tha. Login karke **Settings → Change password** se naya password set karo (ya pehle admin ki email/password seed mein update karo).

---

## 5. Asal Data Daalo (Ab, Client Ke Live System Mein)

- [ ] Admin se login karo.
- [ ] Asal clients add karo (self-signup + link, ya admin-create-client).
- [ ] Har client ke asal **PDF documents upload** karo (sahi category ke saath).
- [ ] Spot-check: ek client se login karke confirm karo woh sirf **apne** documents dekhta hai.

---

## 6. Domain Live Karo

- [ ] Vercel project mein **custom domain** add karo (Hostinger wala).
- [ ] Hostinger DNS mein Vercel ke records daalo.
- [ ] DNS propagate hone ka intezar (kuch minute–ghante).
- [ ] Confirm: domain par site khulti hai, **HTTPS** (taala) chal raha hai.

---

## 7. Aakhri Verification (Sab Sahi Chal Raha Hai?)

- [ ] Home page khulta hai (domain par).
- [ ] Admin login → dashboard, clients, plots, settings sab theek.
- [ ] Naya document upload → R2 (client ke bucket) mein gaya.
- [ ] Client login → sirf apne documents → view/download link kaam karta hai aur expire hota hai.
- [ ] Light/dark theme, mobile view theek.
- [ ] Admin **change password** kaam karta hai.

---

## 8. Handover Document Client Ko Do

Ek file/sheet mein client ko yeh sab do:

- [ ] Saare account logins (Gmail, GitHub, Cloudflare, Neon, Vercel, Hostinger) — email + password + 2FA recovery codes.
- [ ] Domain ki maloomat aur renewal date.
- [ ] Admin portal ka login (email + password).
- [ ] Short note: kaun si service kis cheez ke liye hai (R2 = files, Neon = data, Vercel = app, Hostinger = domain).
- [ ] **Scenario A:** likho ke maintenance/updates aap (developer) karenge, aur aap har account mein collaborator hain.

---

## 9. Yaad Rakhne Wali Baatein

- **`.env` kabhi commit nahi** — secrets sirf Vercel ke environment variables mein.
- **Free tier:** R2 10 GB (+ free downloads), Neon 0.5 GB text — dono lambe arse kaafi. Recurring kharcha sirf domain (~$12/saal) aur (recommended) Vercel Pro (~$20/mo).
- **Storage swappable:** agar kabhi R2 chhodna ho, sirf `lib/storage.ts` badalna hoga.
- **Rebrand swappable:** naam/color/logo sirf `lib/branding.ts` (+ `public/logo.svg`) se.

---

*Prepared for: Lodhi Brothers Housing Society — Project Handover*

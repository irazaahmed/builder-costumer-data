# Lodhi Brothers Housing Society — Client Document Portal
### Project Delivery Summary

---

## 1. Yeh System Kya Hai? (Overview)

Yeh ek **secure online Document Portal** hai jo khaas Lodhi Brothers Housing Society ke liye banaya gaya hai.

Aap ka project: **Surjani Sector 12, Karachi** — 17 acre, **360 plots (sab SOLD)**, 360 clients.

Iska maqsad simple hai:

- Har client ke legal aur zaroori documents (PDF) ek mahfooz jagah par store hon.
- Har client sirf apne **apne** documents dekh aur download kar sake — kisi doosre client ke documents tak uski rasaai (access) bilkul na ho.
- Aap (Admin) ka poora control ho: kis client ko kaun se documents diye gaye hain.

Yeh **inventory ya sales system nahi** hai. Iska core kaam **mahfooz file storage aur sakht access control** hai — yaani sahi document sahi banday ko, aur kisi ghalat banday ko bilkul nahi.

---

## 2. Is System Mein 2 Tarah Ke Log Hain

### A) Admin (Aap / Office Staff)
Poora control. Admin yeh sab kar sakta hai:
- Naye clients banana / verify karna.
- Client ko uske plot ke saath link karna.
- Har client ke documents upload karna (PDF).
- Sab kuch dekhna — kaun sa client, kaun sa plot, kitne documents.

### B) Client (Plot Khareedne Wala)
Sirf **dekh aur download** kar sakta hai. Client:
- Apna account banata hai (ya admin uska account banata hai).
- Login karke **sirf apne** plot ki maloomat aur documents dekhta hai.
- Documents view ya download kar sakta hai — lekin upload, edit ya delete **nahi** kar sakta.

---

## 3. Documents Kaise Mahfooz Hain? (Security — Sab Se Aham)

Yeh system ki sab se badi taqat iski security hai:

1. **Files private bucket mein hain** — koi public link nahi. Internet par koi banda aise hi file nahi khol sakta.
2. **Har download ke liye ek temporary link** banta hai jo sirf 5–10 minute mein expire ho jaata hai. Permanent link kahin save nahi hota.
3. **Har request par dobara check** hota hai: "Kya yeh client waqai isi document ka maalik hai?" Agar nahi, to access deny.
4. **Naya signup foran documents nahi dekh sakta.** Pehle uska account "Pending" rehta hai. Jab tak Admin use verify karke plot se link na kare, use kuch nazar nahi aata. Isse koi anjaan banda kisi doosre ke documents tak nahi pohnch sakta.
5. **Sirf Admin** documents upload, delete ya link kar sakta hai.
6. **Documents khud database mein nahi rakhe jaate** — database mein sirf maloomat (kis ka, kaun sa plot) hoti hai, asal PDF alag mahfooz storage mein hoti hai. Yeh professional aur scalable tareeqa hai.

---

## 4. Account Aur Verification Ka Tareeqa

Do tareeqe se client account banta hai:

**Tareeqa 1 — Client khud signup kare:**
1. Client apna email, password, naam, phone aur CNIC/Plot number daal kar signup karta hai.
2. Account "Pending" (under verification) ho jaata hai — abhi kuch nazar nahi aata.
3. Admin ko dashboard par yeh pending request nazar aati hai.
4. Admin client ko sahi plot se link kar deta hai.
5. Ab client apne documents dekh sakta hai.

**Tareeqa 2 — Admin khud client banaye:**
- Admin seedha client ka account bana deta hai (naam, email, password, phone, CNIC, plot — sab ek saath) aur account foran active ho jaata hai. Useful jab client khud signup na karna chahe.

---

## 5. Admin Panel — Aap Ko Kya Milega

| Page | Kya Karta Hai |
|------|----------------|
| **Dashboard** | Total clients, total documents, recent uploads, aur pending verification list ek nazar mein |
| **Pending** | Naye signups jinhe verify karna hai — yahan se plot se link karein |
| **Clients** | Saare clients ki list — naam, plot number ya CNIC se search karein (pagination ke saath) |
| **Client Profile** | Ek client ki saari maloomat, uska plot, uske saare documents — yahan se naya document upload/delete karein |
| **Plots** | Saare 360 plots (P-001 se P-360) aur har plot ki status — kaun sa linked hai |

---

## 6. Client Panel — Client Ko Kya Milega

| Page | Kya Karta Hai |
|------|----------------|
| **Dashboard** | Apne plot ki maloomat aur category ke hisaab se document count |
| **Documents** | Apne saare documents — category (Legal, Payment, Allotment, CNIC, Other) se filter, view aur download |
| **Profile** | Apni zaati maloomat (read-only) |

Documents 5 categories mein munazzam (organized) hain taake dhoondhna aasaan ho:
**Legal, Payment, Allotment, CNIC, Other.**

---

## 7. Design Aur Branding (Look & Feel)

- **Naam aur Brand:** Lodhi Brothers Housing Society — apna logo (rooftop house badge) ke saath.
- **Colors:** Premium real-estate look — **Emerald Green (deep) + Gold accent**, jo trust aur luxury dono dikhaata hai.
- **Light + Dark dono themes:** User apni marzi se switch kar sakta hai; choice yaad rehti hai. By default site **dark mode** mein khulti hai.
- **Mobile + Desktop dono par** poori tarah responsive — phone, tablet, computer har jagah saaf nazar aata hai.
- Mukammal **landing/home page** project ki asal maloomat ke saath (17-acre, Surjani Sector 12, 360 plots), login/signup links, location aur contact section.

---

## 8. Ab Tak Status Aur Agla Qadam

- **Status:** System **functionally mukammal** hai. Abhi yeh **dummy (sample) data** par chal raha hai taake har feature test ho sake.
- **Agla qadam:** Ab is mein aap ka **asal data** (asli clients, plots, aur unke asal documents) daala jaayega. System is tarah banaya gaya hai ke real data daalne par **code change nahi** karna padta — sirf data badalta hai.
- **Deployment:** Pehle online (test) par, phir aap ki khareedi hui domain par live kiya jaayega.

---

## 9. Khulasa (Ek Line Mein)

> **"Aap ke 360 clients ke liye ek mahfooz online portal — jahan har client sirf apne documents dekh aur download kar sakta hai, aur aap (Admin) ka poora control rehta hai."**

---

# Technical Section (A to Z)

> Yeh hissa technical logon ke liye hai — kaun si cheez kis technology par bani hai, data kahan rehta hai, aur kaun si service free mein kitni limit tak chalti hai.

## 10. Poora Tech Stack (Kya Cheez Kis Par Bani Hai)

### Frontend (Jo User Ko Browser Mein Nazar Aata Hai)
| Cheez | Technology | Kaam |
|-------|-----------|------|
| Framework | **Next.js 16** (App Router) | Poori website ka dhaancha — pages, routing, server rendering |
| Language | **TypeScript** (strict) | Type-safe code — kam bugs, zyada bharosa |
| UI Library | **React 19** | Screen ke components banane ke liye |
| Styling | **Tailwind CSS v4** | Saara design, colors, spacing |
| Components | **shadcn/ui + Base UI** | Tayyar-shuda buttons, cards, tables, dropdowns |
| Tables | **TanStack Table** | Admin ki client/plot list (search, pagination) |
| Icons | **lucide-react** | Saare icons |
| Themes | **next-themes** | Light/Dark mode switch |
| Animations | **Motion** + **Three.js** | Home page ke smooth effects aur 3D scene |
| File upload UI | **react-dropzone** | Admin ka drag-and-drop document upload box |
| Notifications | **Sonner** | Success/error ke chhote popup messages |

### Backend (Jo Server Par Chalta Hai — User Ko Nazar Nahi Aata)
| Cheez | Technology | Kaam |
|-------|-----------|------|
| Server logic | **Next.js Server Actions** | Saari mutations (upload, link, delete, login) server par |
| Authentication | **Auth.js (NextAuth v5)** | Login, session, role aur status ka control |
| Password security | **bcryptjs** | Passwords hash karke (encrypt) rakhe jaate hain — kabhi plain text nahi |
| Validation | **Zod** | Har form/input server par check hota hai (galat data andar nahi aata) |
| Database layer | **Prisma ORM v7** | Database se baat karne ka mahfooz, structured tareeqa |

### Database (Text Data — Maloomat)
| Cheez | Technology | Kaam |
|-------|-----------|------|
| Database | **PostgreSQL** (Neon par hosted) | Sirf **text** data: users, clients, plots, document ki maloomat (kis ka, kaun sa plot, title, category, file ka reference) |

**Aham:** Database mein **PDF file nahi** rakhi jaati — sirf yeh maloomat ke "yeh document is client ka hai, aur asal file storage mein yahan padi hai." Isse database halka aur tez rehta hai.

### File Storage (Asal PDF Documents)
| Cheez | Technology | Kaam |
|-------|-----------|------|
| Storage | **Cloudflare R2** (private bucket) | Asal PDF files yahan mahfooz rehti hain |
| Access | **AWS S3 SDK + presigned URLs** | Temporary, expire hone wale links se hi access |

Saara storage ka kaam ek hi file `lib/storage.ts` se hota hai — agar future mein storage provider badalna ho to sirf yeh ek file change hogi, baaqi app waisi ki waisi rahegi.

### Deployment (Live Kahan Hoga)
| Hissa | Kahan |
|-------|-------|
| App (website) | **Vercel** |
| Database | **Neon** (PostgreSQL cloud) |
| File storage | **Cloudflare R2** |
| Domain | **Hostinger** (sirf domain naam — DNS Vercel par point hoga) |

> Yeh 4 alag cloud pieces hain. App Vercel par chalti hai, data Neon mein, files R2 mein, aur domain Hostinger se aata hai. Inhe alag rakhna professional aur scalable design hai.

---

## 11. Data Flow — Ek Document Upload/View Kaise Hota Hai

**Upload (Admin):**
1. Admin client choose karke PDF select karta hai.
2. Server check karta hai ke yeh waqai Admin hai.
3. Server ek temporary "upload link" banata hai.
4. File **seedha browser se R2 storage** mein chali jaati hai (server ki memory se nahi guzarti — isliye badi scanned PDFs bhi aaram se).
5. Kaamyaab upload ke baad database mein sirf document ki maloomat (reference) save hoti hai.

**View/Download (Client):**
1. Client apna document kholta hai.
2. Server check karta hai: "kya yeh document isi client ka hai?"
3. Haan to ek temporary link (5–10 min) banta hai.
4. Client us link se file dekhta/download karta hai. Link expire hone ke baad bekaar.

---

## 12. Free Tier Limits — Kaun Si Service Free Mein Kitni

> Shuruaat mein yeh poora system **bilkul free** chalaaya ja sakta hai. Neeche har service ki free limit di hai.

### Cloudflare R2 (PDF Storage) — Sab Se Faraakh Free Tier
| Cheez | Free Limit |
|-------|-----------|
| Storage | **10 GB free** har mahine |
| Download (egress) | **Bilkul free, unlimited** — clients jitni baar bhi document dekhein, koi kharcha nahi |
| Operations | 10 lakh (1M) writes + 1 crore (10M) reads / month free |

**Iska matlab aap ke liye:** Ek scanned legal PDF tipikal **0.5–2 MB** hoti hai. 10 GB mein **kai hazaar documents** aa jaati hain. 360 clients ke liye yeh free tier kaafi arsa kaafi rahega. 10 GB se upar sirf **$0.015 / GB / month** (yaani ~1 GB ka 4 rupay mahina) — bohat sasta.

### Neon (PostgreSQL Database) — Text Data
| Cheez | Free Limit |
|-------|-----------|
| Storage | **0.5 GB** free (sirf text — yeh bohat zyada rows ke liye kaafi hai) |
| Compute | Free tier kaafi hai is project ke load ke liye |

**Iska matlab:** Hum database mein sirf text rakhte hain (PDF nahi), isliye 0.5 GB mein **laakhon rows** aa sakti hain — 360 clients aur unke documents ke records ke liye yeh barson kaafi hai.

> **Note:** Free Postgres tiers inactivity ke baad "pause" ho jaate hain. Live client demo ke liye behtar hai ek aisa plan istemaal karein jo hamesha jaaga rahe (Neon par yeh aam tor par theek rehta hai), ya chhota paid plan le lein.

### Vercel (App Hosting)
| Cheez | Free (Hobby) Limit |
|-------|-----------|
| Bandwidth | **100 GB / month** free |
| Builds & hosting | Personal/chhote project ke liye free tier kaafi |

**Note:** Vercel ka free (Hobby) plan **non-commercial** use ke liye hai. Jab yeh asli paying client ke liye live ho, to behtar hai **Vercel Pro (~$20/month)** ya isi tarah ka plan — taake terms bhi sahi rahein aur performance bhi.

### Hostinger (Domain)
- Yahan se sirf **domain naam** khareedna hai (jaise lodhibrothers.com) — taqreeban **$10–15 / saal**.
- Hostinger ki shared hosting **use NAHI karni** — woh PHP/WordPress ke liye hai, yeh app uss par theek nahi chalegi. Domain ka DNS sirf Vercel par point hoga.

### Khulasa — Free Mein Kya Possible Hai
| Service | Free Limit | Aap Ke Liye Kaafi? |
|---------|-----------|---------------------|
| R2 (files) | 10 GB + unlimited free downloads | ✅ Lambe arse tak |
| Neon (database) | 0.5 GB text | ✅ Barson tak |
| Vercel (app) | 100 GB bandwidth | ✅ (commercial ke liye Pro behtar) |
| Hostinger (domain) | ~$10–15/saal | Domain ki ek choti annual cost |

> **Bottom line:** Testing aur shuruaati live demo poori tarah **free** ho sakta hai. Asli commercial live use ke liye sirf 2 chhoti recurring costs aati hain: **domain (~$12/saal)** aur (recommended) **Vercel Pro (~$20/mahina)**. Storage aur database lambe arse free tier mein rahenge.

---

## 13. Security & Code Quality (Technical Points)

- **Role + Status checks** har jagah — middleware mein bhi aur har server action mein bhi. Client kabhi trust nahi kiya jaata.
- **Har client query session se aaye `clientId`** par filter hoti hai — kabhi URL ya form ke parameter par nahi. Yaani koi URL badal kar doosre ka data nahi dekh sakta.
- **PENDING users ko kuch nazar nahi aata** jab tak Admin link na kare.
- **Files private bucket mein**, sirf expire hone wale signed URLs se access.
- **File type aur size server par validate** hoti hai (sirf PDF/allowed) — galat file save nahi hoti.
- **Har upload logged** hai — kis Admin ne, kab upload kiya.
- **Passwords hashed** (bcrypt), saare secrets environment variables mein — kabhi code mein hardcode nahi.
- **Saara branding ek file** `lib/branding.ts` se — naam/color/logo badalna ho to sirf ek edit.

---

*Prepared for: Lodhi Brothers Housing Society*
*System: Secure Client Document Vault & Portal*

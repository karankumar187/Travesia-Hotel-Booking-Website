# 🏨 Travesia — Premium Hotel Booking Platform

<div align="center">

![Travesia](https://img.shields.io/badge/Travesia-Hotel%20Booking-6366f1?style=for-the-badge&logo=airbnb&logoColor=white)
![React](https://img.shields.io/badge/React_19-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?style=for-the-badge&logo=redis&logoColor=white)

**A full-stack luxury hotel booking platform built on the MERN stack with dual-layer Redis + localStorage caching, AI-powered search, real-time payments, and a hotel owner analytics dashboard.**

[Live Demo](https://travesia-fawn.vercel.app) · [Backend API](https://travesia-hotel-booking-website-back-nine.vercel.app)

</div>

---

## ✨ Features

### Guest Experience
- 🔍 **Live Search & Filtering** — price range, amenities, location, and rating filters with instant sort
- 🗺️ **Interactive Mapbox Map** — visualize hotel locations with a "Get Directions" deep-link to Google Maps turn-by-turn routing
- ❤️ **Persistent Wishlist** — backend-synced favorites bound to user accounts
- ⭐ **Verified Reviews** — guests can review after checkout; hotel-level review aggregation across all room types
- 📧 **Booking Confirmations** — automated email receipts via Nodemailer (STARTTLS)
- 🤖 **AI Concierge** — Groq-powered assistant for room recommendations and queries
- 🏷️ **Coupon Discounts** — server-validated coupon codes with backend price integrity checks

### Hotel Owner Dashboard
- 📊 **Analytics** — revenue charts, occupancy trends, and booking metrics via Recharts
- 🏨 **Hotel Management** — register hotels, add room types, upload images to Cloudinary
- 📅 **Booking Management** — view and manage guest reservations in real time
- 🔔 **Real-Time Notifications** — Socket.io powered live updates for new bookings

### Performance & Infrastructure
- ⚡ **Dual-Layer Caching** — Server-side Redis (Upstash) + Client-side localStorage for instant loads
- 🔄 **Stale-While-Revalidate** — serves cached data instantly, refreshes silently in the background
- 🔌 **Serverless-Safe** — MongoDB cached connection + `ensureDB` middleware prevents cold-start timeouts on Vercel
- 📦 **Zero-Package Redis** — Upstash REST API called via native `fetch()` — no npm install, no bundling issues

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 (Vite), TailwindCSS 4, React Router DOM |
| **UI & Animation** | Framer Motion, Lucide React, React Hot Toast |
| **Mapping** | Mapbox GL / React Map GL |
| **Auth** | Clerk (user & owner), Clerk Webhooks |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose (cached connection) |
| **Cache** | Upstash Redis (REST API) + localStorage |
| **Payments** | Razorpay (with server-side signature verification) |
| **Uploads** | Cloudinary + Multer |
| **Email** | Nodemailer (Gmail STARTTLS, non-blocking) |
| **AI** | Groq SDK (Llama 3.3-70B) |
| **Realtime** | Socket.io |
| **Deployment** | Vercel (frontend + serverless backend) |

---

## ⚡ Caching Architecture

```
User opens Hotels tab
         ↓
1st: localStorage check       (0ms   — instant, zero network)
         ↓ stale or empty
2nd: Redis check (Upstash)    (~50ms — server-side, shared cache)
         ↓ cache miss
3rd: MongoDB query            (~500ms — only on first-ever request)
```

**What's cached:**

| Endpoint | Cache | TTL |
|---|---|---|
| `GET /api/rooms` | Redis + localStorage | 5 min |
| `GET /api/rooms/hotel/:id` | Redis | 5 min |
| `GET /api/reviews/room/:id` | Redis | 2 min |
| `GET /api/reviews/recent` | Redis | 1 min |
| `GET /api/reviews/hotel/:id/stats` | Redis | 2 min |
| User role (`isOwner`) | localStorage | 10 min |
| Wishlist | localStorage | 5 min |
| Searched cities | localStorage | Persistent |

Cache is automatically **invalidated** on writes (new room, new review, toggle availability).

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB connection URI
- Clerk Auth application
- Cloudinary account
- Razorpay account (test keys)
- Mapbox access token
- Upstash Redis database (free tier at [console.upstash.com](https://console.upstash.com))

### 1. Clone & Install

```bash
git clone https://github.com/karankumar187/Travesia-Hotel-Booking-Website.git
cd Travesia-Hotel-Booking-Website

# Server dependencies
cd server && npm install

# Client dependencies
cd ../client && npm install
```

### 2. Environment Variables

**`server/.env`**
```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# Clerk
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email (Gmail SMTP)
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
SENDER_EMAIL=your@gmail.com

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# Upstash Redis (get from console.upstash.com → REST API tab)
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# AI
GROQ_API_KEY=gsk_...
```

**`client/.env`**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_...
VITE_RAZORPAY_KEY_ID=rzp_test_...
VITE_MAPBOX_TOKEN=pk.eyJ1...
VITE_BACKEND_URL=http://localhost:3000
```

### 3. Seed the Database

Populate 30+ premium Indian hotels with verified imagery:

```bash
cd server
npm run seed-hotels
node scripts/seedRegions.js
node scripts/seedExtraHotels.js
node scripts/fixRegionalImages.js
```

### 4. Run Locally

```bash
# Terminal 1 — Backend
cd server && npm run server

# Terminal 2 — Frontend
cd client && npm run dev
```

Visit `http://localhost:5173`

---

## 🌐 Deployment (Vercel)

Both frontend and backend are deployed as separate Vercel projects.

**Backend project root:** `server/` — uses `server/vercel.json`  
**Frontend project root:** `client/` — standard Vite static build

Add all environment variables from the `.env` sections above to each Vercel project's **Settings → Environment Variables**.

---

## 📁 Project Structure

```
Travesia/
├── client/                      # React + Vite frontend
│   ├── src/
│   │   ├── components/          # Navbar, Footer, RoomCard, StarRating, Testimonial…
│   │   ├── context/             # AppContext (auth, rooms, wishlist, caching)
│   │   ├── pages/               # Home, AllRooms, RoomDetails, MyBookings…
│   │   │   └── hotelOwner/      # Dashboard, MyHotels, AddRoom, Analytics…
│   │   └── assets/              # Icons, images, static data
│   └── index.html
│
└── server/                      # Express.js API
    ├── configs/
    │   ├── db.js                # Cached MongoDB connection (serverless-safe)
    │   ├── redis.js             # Upstash REST client (pure fetch, no npm package)
    │   └── cloudinaryApi.js
    ├── controllers/             # roomController, reviewController, bookingController…
    ├── middleware/              # auth, upload, ensureDB
    ├── models/                  # Room, Hotel, Booking, Review, User
    ├── routes/                  # API routers
    ├── scripts/                 # Database seeders
    ├── utils/
    │   └── cache.js             # cacheGet / cacheSet / cacheDel helpers
    └── server.js                # Express app entry point
```

---

## 🔄 Recent Updates

| Date | Change |
|---|---|
| Apr 2026 | ⚡ Dual-layer caching: Upstash Redis (server) + localStorage (client) |
| Apr 2026 | 🐛 Fixed review visibility — now shows all hotel reviews on any room page |
| Apr 2026 | 🔧 Serverless DB fix — cached MongoDB connection + `ensureDB` middleware |
| Apr 2026 | 📧 Fixed TLS/SMTP errors — removed deprecated SSLv3, non-blocking verify |
| Apr 2026 | 🏨 Live testimonials — auto-refresh every 30s, smooth infinite marquee |
| Apr 2026 | 📰 Newsletter subscription with toast feedback |
| Apr 2026 | 🎨 Hotel owner dashboard — professional slate/gray card theme |

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/karankumar187">Karan Kumar</a>
</div>

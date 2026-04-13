# 🏨 Travesia - Premium Hotel Booking Platform

Travesia is a modern, full-stack luxury hotel booking application. Built with the **MERN** stack (MongoDB, Express, React, Node.js), it offers a seamless and responsive user experience for discovering, filtering, and securely booking premium accommodations.

## ✨ Key Features

- **Modern UI/UX**: Fully responsive, luxury-themed glassmorphism aesthetic built with TailwindCSS and Framer Motion.
- **Interactive Mapping**: Natively integrated Mapbox (`react-map-gl`) allowing users to visualize hotel locations, complete with deeply linked "Get Directions" utility bridging to Google Maps turn-by-turn routing.
- **Robust Authentication**: Powered by Clerk for secure, frictionless user and hotel owner logins.
- **Live Search & Filtering**: Advanced price, amenity, and location filtering algorithms combined with interactive dynamic sorting.
- **Secure Payment Gateway**: Fully integrated Razorpay checkout system, securely validating dynamic coupon discounts on the backend against base price corruption.
- **Wishlist Functionality**: Context-driven backend-synchronized persistent favorites ("Save") capabilities natively bound to the user's account.
- **Hotel Owner Dashboard**: Empower owners to list rooms, manage active bookings, and dynamically preview metrics using embedded Recharts logic.
- **Real-Time Notification System**: Socket.io backed real-time updates for administrative events.

## 🛠️ Technology Stack

**Frontend:**
- React 19 (Vite)
- TailwindCSS 4
- Mapbox GL / React Map GL
- Framer Motion (Animations)
- Lucide React (Icons)
- React Router DOM
- React Hot Toast

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- Razorpay (Payments)
- Cloudinary & Multer (Image Uploads)
- Nodemailer (Email verification/receipts)
- Socket.io (WebSockets)
- Clerk/Express (Auth Hooks)
- Groq SDK (AI Integration)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection URI
- Razorpay Account (Test API Keys)
- Clerk Auth application
- Cloudinary Account
- Mapbox Access Token

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/karankumar187/Travesia-Hotel-Booking-Website.git
   cd Travesia-Hotel-Booking-Website
   ```

2. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

### Configuration (.env)

**Server (`server/.env`)**
```env
MONGODB_URI=your_mongodb_cluster_uri
CLERK_SECRET_KEY=your_clerk_secret
RAZORPAY_KEY_ID=your_razorpay_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLOUDINARY_URL=your_cloudinary_url
SMTP_USER=your_smtp_email
SMTP_PASS=your_smtp_password
```

**Client (`client/.env`)**
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable
VITE_RAZORPAY_KEY_ID=your_razorpay_id
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_BACKEND_URL=http://localhost:3000
```

### Seeding Data

To instantly populate your local database with 30+ premium hotels across India with high-quality verified imagery, run the bundled data seeders:

```bash
cd server
npm run seed-hotels
node scripts/seedRegions.js
node scripts/seedExtraHotels.js
node scripts/fixRegionalImages.js
```

### Running the App

Execute both servers natively:

**Terminal 1 (Backend):**
```bash
cd server
npm run server
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 🤝 Roadmap / Recent Upgrades
- ✅ Centralized backend coupon validation strictly preventing `totalPrice` mutation.
- ✅ Dynamic 4-set Unsplash photography mapping to prevent layout duplication.
- ✅ Map directional bounding native to Google Maps URL execution.
- ✅ Floating Context-aware Wishlist mechanism.
- ✅ Deep layout restructuring to heavily prioritize mobile CSS-Flex responsivity.

import React from "react";
import { useAppContext } from "../context/AppContext1";

const Keyframes = () => (
  <style>{`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-in-up {
      animation: fadeInUp 650ms cubic-bezier(.25,.8,.25,1) both;
    }
  `}</style>
);

export default function About() {
  const { navigate } = useAppContext();

  const values = [
    {
      icon: "🏠",
      title: "Personal Touch",
      description: "Every stay feels like home with our carefully curated accommodations",
    },
    {
      icon: "✨",
      title: "Quality First",
      description: "We ensure every property meets our high standards for comfort and service",
    },
    {
      icon: "🌍",
      title: "Global Reach",
      description: "Discover unique stays in destinations around the world",
    },
    {
      icon: "💝",
      title: "Guest Focused",
      description: "Your satisfaction and memorable experiences are our top priority",
    },
  ];

  const stats = [
    { number: "10K+", label: "Happy Guests" },
    { number: "500+", label: "Properties" },
    { number: "50+", label: "Destinations" },
    { number: "4.8", label: "Average Rating" },
  ];

  return (
    <>
      <Keyframes />
      
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1600)",
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4 fade-in-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold playfair-font mb-4">
            About Travesía
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-200">
            Your trusted partner in finding the perfect stay, anywhere in the world
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 px-4 md:px-16 lg:px-24 xl:px-32 bg-white">
        <div className="max-w-4xl mx-auto fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold playfair-font text-gray-800 mb-6 text-center">
            Our Story
          </h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p className="text-lg">
              Travesía was born from a simple belief: every journey should feel personal, warm, and welcoming. 
              We understand that where you stay is more than just a place to sleep—it's an integral part of your travel experience.
            </p>
            <p>
              Founded with a passion for connecting travelers with unique accommodations, we've built a platform 
              that goes beyond traditional booking. We carefully curate each property to ensure it meets our standards 
              for comfort, quality, and authenticity.
            </p>
            <p>
              Whether you're seeking a cozy apartment in the heart of the city, a luxury suite with breathtaking views, 
              or a charming retreat in nature, Travesía helps you find spaces that feel like home, no matter where you are.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 px-4 md:px-16 lg:px-24 xl:px-32 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl md:text-5xl font-bold playfair-font text-indigo-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 px-4 md:px-16 lg:px-24 xl:px-32 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold playfair-font text-gray-800 mb-4">
              Our Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-lg transition-all duration-300 fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold playfair-font text-gray-800 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 px-4 md:px-16 lg:px-24 xl:px-32 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold playfair-font text-gray-800 mb-6">
            Our Mission
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            To make travel more accessible, personal, and memorable by connecting people with 
            exceptional accommodations that feel like home. We believe every traveler deserves 
            a space that reflects their unique style and enhances their journey.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Through innovation, care, and a deep understanding of what makes a stay special, 
            we're building a community of travelers and hosts who share our passion for authentic experiences.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 md:px-16 lg:px-24 xl:px-32 bg-white">
        <div className="max-w-4xl mx-auto text-center fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold playfair-font text-gray-800 mb-4">
            Join Us on This Journey
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Whether you're planning your next adventure or looking to share your space with travelers, 
            we're here to help make it happen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/rooms")}
              className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Explore Hotels
            </button>
            <button
              onClick={() => navigate("/")}
              className="border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </>
  );
}


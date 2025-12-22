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

const ExperienceCard = ({ title, description, image, delay }) => (
  <div
    className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 fade-in-up cursor-pointer"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="aspect-[4/3] overflow-hidden">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-2xl font-bold playfair-font mb-2">{title}</h3>
        <p className="text-sm text-gray-200">{description}</p>
      </div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-6 bg-white">
      <h3 className="text-xl font-semibold playfair-font text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

export default function Experience() {
  const { navigate } = useAppContext();

  const experiences = [
    {
      title: "Luxury Beach Escapes",
      description: "Discover pristine beaches and world-class resorts",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800",
    },
    {
      title: "Mountain Adventures",
      description: "Experience breathtaking mountain views and cozy retreats",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800",
    },
    {
      title: "Urban Exploration",
      description: "Immerse yourself in vibrant city life and culture",
      image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800",
    },
    {
      title: "Cultural Heritage",
      description: "Explore historic sites and traditional architecture",
      image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?q=80&w=800",
    },
    {
      title: "Nature Retreats",
      description: "Reconnect with nature in serene forest settings",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800",
    },
    {
      title: "Desert Oasis",
      description: "Experience the magic of desert landscapes and luxury",
      image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=800",
    },
  ];

  const activities = [
    {
      icon: "🏖️",
      title: "Beach Activities",
      description: "Swimming, snorkeling, and water sports",
    },
    {
      icon: "🏔️",
      title: "Mountain Hiking",
      description: "Guided trails and scenic viewpoints",
    },
    {
      icon: "🍽️",
      title: "Culinary Tours",
      description: "Local cuisine and cooking classes",
    },
    {
      icon: "🎨",
      title: "Cultural Events",
      description: "Festivals, art galleries, and performances",
    },
    {
      icon: "🚴",
      title: "Adventure Sports",
      description: "Cycling, kayaking, and outdoor activities",
    },
    {
      icon: "🧘",
      title: "Wellness Retreats",
      description: "Spa treatments and meditation sessions",
    },
  ];

  return (
    <>
      <Keyframes />
      
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1600)",
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4 fade-in-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold playfair-font mb-4">
            Discover Unique Experiences
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-200">
            From adventure to relaxation, find experiences that create lasting memories
          </p>
        </div>
      </div>

      {/* Experiences Grid */}
      <div className="py-16 px-4 md:px-16 lg:px-24 xl:px-32 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold playfair-font text-gray-800 mb-4">
              Curated Experiences
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Each destination offers unique experiences tailored to your preferences
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((exp, index) => (
              <ExperienceCard
                key={index}
                title={exp.title}
                description={exp.description}
                image={exp.image}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <div className="py-16 px-4 md:px-16 lg:px-24 xl:px-32 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold playfair-font text-gray-800 mb-4">
              Popular Activities
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore a wide range of activities during your stay
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-lg transition-all duration-300 fade-in-up cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl mb-4">{activity.icon}</div>
                <h3 className="text-xl font-semibold playfair-font text-gray-800 mb-2">
                  {activity.title}
                </h3>
                <p className="text-gray-600">{activity.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 md:px-16 lg:px-24 xl:px-32 bg-gradient-to-r from-indigo-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold playfair-font mb-4">
            Ready to Create Your Perfect Experience?
          </h2>
          <p className="text-lg text-indigo-100 mb-8">
            Start planning your next adventure and discover hotels that match your travel style
          </p>
          <button
            onClick={() => navigate("/rooms")}
            className="bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Explore Hotels
          </button>
        </div>
      </div>
    </>
  );
}


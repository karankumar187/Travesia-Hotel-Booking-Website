import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext1";
import Title from "./Title";

const Keyframes = () => (
  <style>{`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes countUp {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .fade-in-up {
      animation: fadeInUp 650ms cubic-bezier(.25,.8,.25,1) both;
    }
    .count-up {
      animation: countUp 1s ease-out both;
    }
  `}</style>
);

const StatCard = ({ icon, value, label, delay }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          animateValue();
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`stat-${label}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [isVisible, label]);

  const animateValue = () => {
    const isDecimal = typeof value === "number" && value % 1 !== 0;
    const target = isDecimal ? value : parseInt(value);
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      if (isDecimal) {
        setDisplayValue(Math.round(easeOutQuart * target * 10) / 10);
      } else {
        setDisplayValue(Math.floor(easeOutQuart * target));
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(target);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div
      id={`stat-${label}`}
      className="flex flex-col items-center p-4 sm:p-6 bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{icon}</div>
      <div className="text-3xl sm:text-4xl md:text-5xl font-bold playfair-font text-gray-800 mb-2 count-up">
        {typeof displayValue === "number" && displayValue % 1 !== 0
          ? displayValue.toFixed(1)
          : displayValue.toLocaleString()}
        {label === "Overall Rating" && <span className="text-xl sm:text-2xl text-gray-600">/5</span>}
      </div>
      <p className="text-gray-600 font-medium text-center text-xs sm:text-sm">{label}</p>
    </div>
  );
};

export default function Stats() {
  const { axios } = useAppContext();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalHotels: 0,
    overallRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("/api/stats");
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [axios]);

  if (loading) {
    return (
      <div className="px-6 md:px-16 lg:px-24 xl:px-32 pt-10 pb-30 bg-slate-50">
        <Keyframes />
        <Title
          align="center"
          title="Our Impact"
          subTitle="Loading statistics..."
        />
      </div>
    );
  }

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 pt-10 pb-30 bg-slate-50">
      <Keyframes />
      <Title
        align="center"
        title="Our Impact"
        subTitle="Join thousands of travelers and hotel owners who trust Travesía for their accommodation needs"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        <StatCard
          icon="👥"
          value={stats.totalUsers}
          label="Total Users"
          delay={0}
        />
        <StatCard
          icon="🏨"
          value={stats.totalHotels}
          label="Hotels Registered"
          delay={100}
        />
        <StatCard
          icon="📅"
          value={stats.totalBookings}
          label="Total Bookings"
          delay={200}
        />
        <StatCard
          icon="⭐"
          value={stats.overallRating}
          label="Overall Rating"
          delay={300}
        />
      </div>
    </div>
  );
}


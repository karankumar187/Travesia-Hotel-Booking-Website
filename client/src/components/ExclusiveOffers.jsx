import Title from "./Title";
import { useState } from "react";

export default function ExclusiveOffers() {
  const activeCoupons = [
    {
      code: "WELCOME10",
      discount: "10%",
      title: "Welcome Bonus",
      description: "Enjoy 10% off your very first stay with Travesía.",
      colorClass: "bg-indigo-50 border-indigo-100",
      textClass: "text-indigo-900",
      badgeClass: "bg-indigo-100 text-indigo-700 border-indigo-200",
      codeClass: "text-indigo-800 bg-white border-indigo-50"
    },
    {
      code: "SUMMER20",
      discount: "20%",
      title: "Summer Getaway",
      description: "Get 20% off exclusively on all summer bookings.",
      colorClass: "bg-amber-50 border-amber-100",
      textClass: "text-amber-900",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
      codeClass: "text-amber-800 bg-white border-amber-50"
    },
    {
      code: "TRAVESIA50",
      discount: "50%",
      title: "Half Price Special",
      description: "Massive 50% discount on select premium properties.",
      colorClass: "bg-emerald-50 border-emerald-100",
      textClass: "text-emerald-900",
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
      codeClass: "text-emerald-800 bg-white border-emerald-50"
    },
    {
      code: "WEEKEND15",
      discount: "15%",
      title: "Weekend Escape",
      description: "Take 15% off when you book a stay over the weekend.",
      colorClass: "bg-sky-50 border-sky-100",
      textClass: "text-sky-900",
      badgeClass: "bg-sky-100 text-sky-800 border-sky-200",
      codeClass: "text-sky-800 bg-white border-sky-50"
    },
    {
      code: "FIRSTSTAY5",
      discount: "5%",
      title: "First Stay",
      description: "A little 5% extra treat on your first luxury booking.",
      colorClass: "bg-rose-50 border-rose-100",
      textClass: "text-rose-900",
      badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
      codeClass: "text-rose-800 bg-white border-rose-50"
    },
    {
      code: "LUXURY25",
      discount: "25%",
      title: "Luxury Retreat",
      description: "Save 25% on our most exclusive luxury suites.",
      colorClass: "bg-slate-50 border-slate-200",
      textClass: "text-slate-900",
      badgeClass: "bg-slate-200 text-slate-800 border-slate-300",
      codeClass: "text-slate-800 bg-white border-slate-100"
    },
  ];

  const [copiedCode, setCopiedCode] = useState("");
  const [showAll, setShowAll] = useState(false);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const visibleCoupons = showAll ? activeCoupons : activeCoupons.slice(0, 3);

  return (
    <div className="px-4 sm:px-6 md:px-16 lg:px-24 xl:px-32 pt-8 sm:pt-10 pb-20 sm:pb-30">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4 sm:gap-6">
        <Title
          align="left"
          title="Exclusive Offers"
          subTitle="Discover unbeatable deals and special packages tailored just for you. Apply these promo codes at checkout for an instant discount!"
        />
        {activeCoupons.length > 3 && (
            <button 
              onClick={() => setShowAll(!showAll)}
              className="text-indigo-600 font-medium text-sm hover:text-indigo-800 transition-colors cursor-pointer border border-indigo-100 bg-indigo-50/50 px-4 py-2 rounded-full hidden md:block"
            >
              {showAll ? "View Less Offers" : "View All Offers"}
            </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 sm:mt-10 md:mt-12">
        {visibleCoupons.map((coupon, index) => (
          <div
            key={index}
            className={`group relative flex flex-col justify-between p-6 sm:p-8 rounded-xl border ${coupon.colorClass} shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 min-h-[220px]`}
          >
            <div className={`absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-semibold border ${coupon.badgeClass}`}>
              {coupon.discount} OFF
            </div>
            
            <div className={`mt-4 ${coupon.textClass}`}>
              <h3 className="text-xl sm:text-2xl playfair-font font-semibold mb-2">
                {coupon.title}
              </h3>
              <p className="text-sm opacity-90 leading-relaxed pr-8">
                {coupon.description}
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between gap-3">
              <div className={`px-4 py-1.5 font-mono tracking-wider text-sm font-semibold rounded-lg border shadow-sm ${coupon.codeClass}`}>
                {coupon.code}
              </div>
              <button
                onClick={() => handleCopy(coupon.code)}
                className={`bg-white hover:bg-gray-50 border border-gray-200 px-4 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm cursor-pointer ${coupon.textClass}`}
              >
                {copiedCode === coupon.code ? "Copied!" : "Copy Code"}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Mobile view 'View All' fallback */}
      {activeCoupons.length > 3 && (
        <div className="mt-8 flex justify-center md:hidden">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="text-indigo-600 font-medium text-sm hover:text-indigo-800 transition-colors cursor-pointer border border-indigo-100 bg-indigo-50/50 px-6 py-2.5 rounded-full w-full"
            >
              {showAll ? "View Less Offers" : "View All Offers"}
            </button>
        </div>
      )}
    </div>
  );
}
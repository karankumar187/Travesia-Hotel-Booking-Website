import { assets } from "../assets/assets";

export default function NewsLetter() {
  return (
    <div className="px-4 sm:px-6 md:px-16 lg:px-24 xl:px-32 py-12 sm:py-16 bg-bg-slate-50">
      <div className="w-full bg-slate-900 text-center text-white py-10 sm:py-12 md:py-14 px-4 sm:px-6 md:px-8 rounded-xl sm:rounded-2xl shadow-lg">

        <h1 className="max-w-xl mx-auto text-2xl sm:text-3xl md:text-4xl font-semibold mt-2 leading-tight playfair-font">
          Stay Inspired
        </h1>

        <p className="text-gray-500 text-xs sm:text-sm mt-2 sm:mt-3 px-2">
          Join our newsletter and be the first to know about new destinations, exclusive offers,
          travel tips, and the latest news from the world of hospitality.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center mt-6 sm:mt-8 md:mt-10 border border-slate-700 rounded-full sm:h-13 max-w-lg w-full mx-auto bg-slate-800/40 backdrop-blur-sm overflow-hidden">
          <input
            type="email"
            className="bg-transparent outline-none px-4 sm:px-5 py-3 sm:py-0 flex-1 text-xs sm:text-sm text-white placeholder-gray-400"
            placeholder="Enter your email"
          />

          <button className="bg-black hover:bg-gray-800 transition-all text-white rounded-full sm:h-11 h-12 sm:mr-1 px-5 sm:px-7 text-xs sm:text-sm flex items-center justify-center group cursor-pointer">
            Subscribe
            <img
              src={assets.arrowIcon}
              alt="arrow icon"
              className="w-3 sm:w-4 ml-2 group-hover:translate-x-1 transition invert"
            />
          </button>
        </div>

        <p className="text-gray-500 text-[0.7rem] sm:text-[0.8rem] px-4 sm:px-6 md:px-10 mt-4 sm:mt-6 font-light">
          By Subscribing you agree to our Privacy Policy and consent to recieve updates.
        </p>

      </div>
    </div>
  );
}

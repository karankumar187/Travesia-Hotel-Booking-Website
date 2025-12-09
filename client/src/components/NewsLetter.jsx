import { assets } from "../assets/assets";

export default function NewsLetter() {
  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 py-16 bg-white">
      <div className="w-full bg-slate-900 text-center text-white py-14 px-8 rounded-2xl shadow-lg">

        <h1 className="max-w-xl mx-auto text-3xl md:text-4xl font-semibold mt-2 leading-tight playfair-font">
          Stay Inspired
        </h1>

        <p className="text-gray-500 text-sm ">
          Join our newsletter and be the first to know about new destinations, exclusive offers,
          travel tips, and the <br></br>latest news from the world of hospitality.
        </p>

        <div className="flex items-center mt-10 border border-slate-700 rounded-full h-13 max-w-lg w-full mx-auto bg-slate-800/40 backdrop-blur-sm">
          <input
            type="email"
            className="bg-transparent outline-none px-5 flex-1 text-sm text-white placeholder-gray-400"
            placeholder="Enter your email"
          />

          <button className="bg-black hover:bg-gray-800 transition-all text-white rounded-full h-11 mr-1 px-7 text-sm flex items-center group cursor-pointer">
            Subscribe
            <img
              src={assets.arrowIcon}
              alt="arrow icon"
              className="w-4 ml-2 group-hover:translate-x-1 transition invert"
            />
          </button>
        </div>

        <p className="text-gray-500 text-[0.8rem] px-10 mt-6 font-light">
          By Subscribing you agree to our Privacy Policy and consent to recieve updates.
        </p>

      </div>
    </div>
  );
}

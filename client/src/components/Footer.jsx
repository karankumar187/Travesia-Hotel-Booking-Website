import { assets } from "../assets/assets";

export default function Footer() {
    return(
        <div>
            <div className='bg-[#F6F9FC] text-gray-500/80 pt-6 sm:pt-8 px-4 sm:px-6 md:px-16 lg:px-24 xl:px-32'>
            <div className='flex flex-wrap justify-between gap-8 sm:gap-10 md:gap-6'>
                <div className='w-full sm:max-w-80'>
                    <img src={assets.logo} alt="logo" className='mb-2 h-14 sm:h-16 w-28 sm:w-32 md:h-15' />
                    <p className='text-xs sm:text-sm'>
                        From cozy apartments to luxury suites, Travesía helps you find spaces that feel personal, warm, and welcoming.
                    </p>
                    <div className='flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4'>
                        <img src={assets.instagramIcon} className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer" alt="Instagram" />
                        <img src={assets.facebookIcon} className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer" alt="Facebook" />
                        <img src={assets.twitterIcon} className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer" alt="Twitter" />
                        <img src={assets.linkendinIcon} className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer" alt="LinkedIn" />
                    </div>
                </div>

                <div className='w-full sm:w-auto'>
                    <p className='text-base sm:text-lg text-gray-800 playfair-font'>COMPANY</p>
                    <ul className='mt-2 sm:mt-3 flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm'>
                        <li><a href="#" className="hover:text-gray-800 transition">About</a></li>
                        <li><a href="#" className="hover:text-gray-800 transition">Careers</a></li>
                        <li><a href="#" className="hover:text-gray-800 transition">Press</a></li>
                        <li><a href="#" className="hover:text-gray-800 transition">Blog</a></li>
                        <li><a href="#" className="hover:text-gray-800 transition">Partners</a></li>
                    </ul>
                </div>

                <div className='w-full sm:w-auto'>
                    <p className='text-base sm:text-lg text-gray-800 playfair-font'>SUPPORT</p>
                    <ul className='mt-2 sm:mt-3 flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm'>
                        <li><a href="#" className="hover:text-gray-800 transition">Help Center</a></li>
                        <li><a href="#" className="hover:text-gray-800 transition">Safety Information</a></li>
                        <li><a href="#" className="hover:text-gray-800 transition">Cancellation Options</a></li>
                        <li><a href="#" className="hover:text-gray-800 transition">Contact Us</a></li>
                        <li><a href="#" className="hover:text-gray-800 transition">Accessibility</a></li>
                    </ul>
                </div>

                <div className='w-full sm:max-w-80'>
                    <p className='text-base sm:text-lg text-gray-800 playfair-font'>STAY UPDATED</p>
                    <p className='mt-2 sm:mt-3 text-xs sm:text-sm'>
                        Subscribe to our newsletter for inspiration and special offers.
                    </p>
                    <div className='flex items-stretch sm:items-center mt-3 sm:mt-4'>
                        <input type="text" className='bg-white rounded-l border border-gray-300 h-9 sm:h-10 px-3 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 flex-1' placeholder='Your email' />
                        <button className='flex items-center justify-center bg-black h-9 sm:h-10 w-10 sm:w-11 aspect-square rounded-r cursor-pointer hover:bg-gray-800 transition'>
                            <img src={assets.arrowIcon} alt="arrow icon" className="invert w-3 sm:w-3.5" />
                        </button>
                    </div>
                </div>
            </div>
            <hr className='border-gray-300 mt-6 sm:mt-8' />
            <div className='flex flex-col sm:flex-row gap-3 sm:gap-2 items-center justify-between py-4 sm:py-5 text-xs sm:text-sm'>
                <p>© {new Date().getFullYear()} <a href="/" className="hover:text-gray-800 transition">Travesía</a>. All rights reserved.</p>
                <ul className='flex items-center gap-3 sm:gap-4'>
                    <li><a href="#" className="hover:text-gray-800 transition">Privacy</a></li>
                    <li><a href="#" className="hover:text-gray-800 transition">Terms</a></li>
                    <li><a href="#" className="hover:text-gray-800 transition">Sitemap</a></li>
                </ul>
            </div>
        </div>
        </div>
    )
}
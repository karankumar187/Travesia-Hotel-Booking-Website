import { assets } from "../assets/assets";
import { exclusiveOffers } from "../assets/assets";
import Title from "./Title";

export default function ExclusiveOffers(){
    return(
        <div className="px-4 sm:px-6 md:px-16 lg:px-24 xl:px-32 pt-8 sm:pt-10 pb-20 sm:pb-30">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4 sm:gap-6">
                <Title align="left" title="Exclusive Offers" subTitle="Discover unbeatable deals and special packages tailored just for you. Don't miss out on these limited-time offers to make your stay even more memorable!" />
                <button className="group flex items-center gap-2 text-sm sm:text-base font-medium cursor-pointer md:mt-0">
                    View all Offers
                    <img src={assets.arrowIcon} alt="arrow icon" className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-all"/>
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-8 sm:mt-10 md:mt-12">
                {exclusiveOffers.map((item) => (
                    <div key={item._id} className="group relative flex flex-col items-start justify-between gap-1 pt-10 sm:pt-12 md:pt-18 px-3 sm:px-4 rounded-lg sm:rounded-xl text-white bg-no-repeat bg-cover bg-center min-h-[200px] sm:min-h-[240px]" style={{backgroundImage: `url(${item.image})`}}>

                        <p className="px-2 py-1 absolute top-3 sm:top-4 left-3 sm:left-4 text-xs bg-white text-gray-800 font-medium rounded-full">
                            {item.priceOff}% OFF
                        </p>
                        <div className="mt-auto">
                            <p className="text-xl sm:text-2xl playfair-font font-medium">{item.title}</p>
                            <p className="text-xs sm:text-sm mt-1">{item.description}</p>
                            <p className="text-xs text-white/70 mt-2 sm:mt-3">Expires {item.expiryDate}</p>
                        </div>

                        <button className="flex items-center gap-2 text-sm sm:text-base font-medium cursor-pointer mt-3 sm:mt-4 mb-4 sm:mb-5">
                            View Offers
                            <img className="invert w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-all" src={assets.arrowIcon} alt="" />
                        </button>

                    </div>
                ))}
            </div>
        </div>
    )
}
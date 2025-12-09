import { useNavigate } from "react-router-dom"
import { roomsDummyData } from "../assets/assets"
import HotelCard from "./HotelCard"
import Title from "./Title"

export default function FeaturedDestination(){
    const navigate = useNavigate();
    return(
        <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 xl:px-32 bg-slate-50 py-12">
            <Title title="Featured Destination" subTitle="Every stay is crafted to feel personal, familiar, and relaxing.
                Because you deserve more than a room — you deserve a home away from home." />
            <div className="flex flex-wrap items-center justify-center gap-4 mt-20">
                {roomsDummyData.slice(0,4).map((room, index) => (
                    <HotelCard room={room} index={index} key={room._id}/>
                ))}
            </div>
            <button onClick={() => {navigate('/rooms'), scrollTo(0,0)}}
            className="my-16 px-4 py-2 text-sm font-medium border border-gray-300 rounded bg-white hover:bg-gray-50 transition-all cursor-pointer">
                View all Destinations
            </button>
        </div>
    )
}
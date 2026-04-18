import { assets } from "../assets/assets";
export default function StarRating({ rating = 4 }) {
    return(
        <div className="flex items-center gap-0.5">
            {Array(5).fill('').map((_, index) => (
                <img key={index} src={index < rating ? assets.starIconFilled : assets.starIconOutlined} className="h-4.5 w-4.5" />
            ))}
        </div>
    )
}
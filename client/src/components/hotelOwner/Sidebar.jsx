import { NavLink } from "react-router-dom"
import { assets } from "../../assets/assets"
import { useAppContext } from "../../context/AppContext1"
import { Building2, PlusCircle, LayoutDashboard, CalendarCheck, BarChart3 } from "lucide-react"

const cls = (isActive) =>
    `flex items-center py-3 px-4 md:px-6 gap-3 text-sm font-medium transition-colors duration-150 ${
        isActive
            ? "border-r-4 md:border-r-[5px] bg-indigo-50 border-indigo-600 text-indigo-600"
            : "hover:bg-gray-50 border-transparent text-gray-600"
    }`

export default function Sidebar() {
    const { setShowHotelReg } = useAppContext();

    return (
        <div className="md:w-56 w-14 border-r min-h-full border-gray-200 pt-6 flex flex-col gap-1 transition-all duration-300 bg-white">

            <NavLink to="/owner" end className={({ isActive }) => cls(isActive)}>
                <LayoutDashboard size={20} className="shrink-0" />
                <p className="md:block hidden">Dashboard</p>
            </NavLink>

            <NavLink to="/owner/my-hotels" className={({ isActive }) => cls(isActive)}>
                <Building2 size={20} className="shrink-0" />
                <p className="md:block hidden">My Hotels</p>
            </NavLink>

            <NavLink to="/owner/bookings" className={({ isActive }) => cls(isActive)}>
                <CalendarCheck size={20} className="shrink-0" />
                <p className="md:block hidden">Bookings</p>
            </NavLink>

            <NavLink to="/owner/analytics" className={({ isActive }) => cls(isActive)}>
                <BarChart3 size={20} className="shrink-0" />
                <p className="md:block hidden">Analytics</p>
            </NavLink>

            <div className="mt-auto mb-4 border-t border-gray-100 pt-3">
                <div
                    onClick={() => setShowHotelReg(true)}
                    className="flex items-center py-3 px-4 md:px-6 gap-3 cursor-pointer hover:bg-indigo-50 text-indigo-600 font-medium text-sm rounded-lg mx-2 transition-colors"
                >
                    <PlusCircle size={20} className="shrink-0" />
                    <p className="md:block hidden">Add New Hotel</p>
                </div>
            </div>
        </div>
    )
}
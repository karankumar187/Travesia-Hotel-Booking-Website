import { Outlet } from "react-router-dom";
import Navigation from "../../components/hotelOwner/Navigation";
import Sidebar from "../../components/hotelOwner/Sidebar";

export default function Layout() {
    return(
        <div className="flex flex-col h-screen">
            <Navigation></Navigation>
            <div className="flex h-full">
                <Sidebar />
                <div className="flex-1 p-4 pt-10 md:px-10 h-full">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
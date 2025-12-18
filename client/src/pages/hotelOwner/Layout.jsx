import { Outlet } from "react-router-dom";
import Navigation from "../../components/hotelOwner/Navigation";
import Sidebar from "../../components/hotelOwner/Sidebar";
import { useAppContext } from "../../context/AppContext1";
import { useEffect } from "react";

export default function Layout() {
    const {isOwner, navigate}=useAppContext()

    useEffect(()=>{
        if(!isOwner){
            navigate('/')
        }

    },[isOwner])


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
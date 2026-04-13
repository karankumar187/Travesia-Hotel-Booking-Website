import { Outlet } from "react-router-dom";
import Navigation from "../../components/hotelOwner/Navigation";
import Sidebar from "../../components/hotelOwner/Sidebar";
import { useAppContext } from "../../context/AppContext1";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";

export default function Layout() {
    const {isOwner, navigate, user}=useAppContext()
    
    useEffect(()=>{
        if(!isOwner){
            navigate('/')
        }
    },[isOwner])

    useEffect(() => {
        if(isOwner && user?.id) {
           const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3000");
           socket.on(`new_booking_${user.id}`, (data) => {
               toast.success(`${data.message} details: ${data.amount}`, {
                   duration: 6000,
                   icon: '🛎️'
               });
           });
           return () => socket.disconnect();
        }
    }, [isOwner, user?.id]);


    return(
        <div className="flex flex-col min-h-screen">
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
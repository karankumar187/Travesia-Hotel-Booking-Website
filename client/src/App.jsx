import Home from "./pages/Home";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AllRooms from "./pages/AllRooms";
import RoomDetails from "./pages/RoomDetails";
import MyBookings from "./pages/MyBookings";
import Experience from "./pages/Experience";
import About from "./pages/About";
import Wishlist from "./pages/Wishlist";
import HotelReg from "./components/HotelReg";
import Layout from "./pages/hotelOwner/Layout";
import Dashboard from "./pages/hotelOwner/Dashboard";
import AddRoom from "./pages/hotelOwner/AddRoom";
import ListRoom from "./pages/hotelOwner/ListRoom";
import MyHotels from "./pages/hotelOwner/MyHotels";
import HotelManage from "./pages/hotelOwner/HotelManage";
import Bookings from "./pages/hotelOwner/Bookings";
import Analytics from "./pages/hotelOwner/Analytics";
import AIConcierge from "./components/AIConcierge";
import{Toaster} from "react-hot-toast"
import { useAppContext } from "./context/AppContext1";

function App() {

  const isOwnerPath = useLocation().pathname.includes("owner");
  const {showHotelReg} =useAppContext()

  return (
    <div>
      <Toaster />
      {!isOwnerPath && <Navbar />}
      {showHotelReg && <HotelReg />}
      <div className="min-h-[70vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<AllRooms />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/about" element={<About />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/owner" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="add-room" element={<AddRoom />} />
            <Route path="list-room" element={<ListRoom />} />
            <Route path="my-hotels" element={<MyHotels />} />
            <Route path="hotel/:hotelId" element={<HotelManage />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </div>
      <Footer />
      <AIConcierge />
    </div>
  );
}

export default App;
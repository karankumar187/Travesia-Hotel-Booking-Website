import { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext1";
import toast from "react-hot-toast";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin } from "lucide-react";

export default function EditHotel({ hotel, onClose, onSaved }) {
    const { axios, getToken } = useAppContext();

    const [name, setName] = useState(hotel.name || "");
    const [address, setAddress] = useState(hotel.address || "");
    const [contact, setContact] = useState(hotel.contact || "");
    const [city, setCity] = useState(hotel.city || "");
    const [loading, setLoading] = useState(false);

    const defaultLat = hotel.location?.lat || 20.5937;
    const defaultLng = hotel.location?.lng || 78.9629;

    const [manualLat, setManualLat] = useState(defaultLat);
    const [manualLng, setManualLng] = useState(defaultLng);
    const [markerDragged, setMarkerDragged] = useState(false);
    const [viewState, setViewState] = useState({
        longitude: defaultLng,
        latitude: defaultLat,
        zoom: hotel.location?.lat ? 12 : 4,
    });

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                name, address, contact, city,
                manualLat: markerDragged ? manualLat : undefined,
                manualLng: markerDragged ? manualLng : undefined,
            };
            const { data } = await axios.put(`/api/hotels/${hotel._id}`, payload, {
                headers: { Authorization: `Bearer ${await getToken()}` },
            });
            if (data.success) {
                toast.success(data.message);
                onSaved(data.hotel);
                onClose();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to update hotel");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
        >
            <form
                onSubmit={onSubmitHandler}
                onClick={(e) => e.stopPropagation()}
                className="flex bg-white rounded-xl md:w-[900px] max-w-5xl max-md:mx-2 min-h-[500px] shadow-2xl"
            >
                {/* Interactive Map */}
                <div className="w-1/2 hidden md:block relative bg-gray-100 rounded-l-xl overflow-hidden border-r border-gray-200">
                    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm text-xs font-medium text-indigo-700 border border-indigo-100">
                        Drag pin to update hotel location
                    </div>
                    <Map
                        {...viewState}
                        onMove={(evt) => setViewState(evt.viewState)}
                        mapStyle="mapbox://styles/mapbox/streets-v12"
                        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                    >
                        <Marker
                            longitude={manualLng}
                            latitude={manualLat}
                            draggable
                            onDragEnd={(e) => {
                                setManualLng(e.lngLat.lng);
                                setManualLat(e.lngLat.lat);
                                setMarkerDragged(true);
                            }}
                        >
                            <MapPin
                                className="text-indigo-600 fill-indigo-100 hover:scale-110 transition cursor-pointer"
                                size={42}
                            />
                        </Marker>
                    </Map>
                    {markerDragged && (
                        <div className="absolute bottom-4 left-4 z-10 bg-white/90 px-3 py-1.5 rounded-lg shadow-sm text-xs text-gray-600 border border-gray-200">
                            📍 {manualLat.toFixed(4)}, {manualLng.toFixed(4)}
                        </div>
                    )}
                </div>

                {/* Form fields */}
                <div className="relative flex flex-col justify-center bg-white md:w-1/2 p-8 md:p-10 rounded-r-xl">
                    <img
                        src={assets.closeIcon}
                        onClick={onClose}
                        className="absolute top-4 right-4 h-4 w-4 cursor-pointer"
                        alt="close"
                    />
                    <p className="text-2xl font-semibold mt-4">Edit Hotel</p>
                    <p className="text-xs text-gray-400 mb-4">Update details for <span className="font-medium text-indigo-600">{hotel.name}</span></p>

                    <div className="mt-2 w-full">
                        <label className="font-medium text-gray-500 text-sm">Hotel Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            type="text"
                            placeholder="Hotel Name"
                            className="border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light text-sm"
                            required
                        />
                    </div>

                    <div className="mt-3 w-full">
                        <label className="font-medium text-gray-500 text-sm">Phone</label>
                        <input
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            type="text"
                            placeholder="Contact Number"
                            className="border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light text-sm"
                            required
                        />
                    </div>

                    <div className="mt-3 w-full">
                        <label className="font-medium text-gray-500 text-sm">Address</label>
                        <input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            type="text"
                            placeholder="Street Address"
                            className="border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light text-sm"
                            required
                        />
                    </div>

                    <div className="mt-3 w-full">
                        <label className="font-medium text-gray-500 text-sm">City</label>
                        <input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            type="text"
                            placeholder="City"
                            className="border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light text-sm"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-500 hover:bg-indigo-600 transition-all text-white mr-auto px-6 py-2 rounded cursor-pointer mt-6 text-sm disabled:opacity-60"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}

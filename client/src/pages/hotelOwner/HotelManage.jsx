import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext1";
import toast from "react-hot-toast";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Pencil, ToggleLeft, ToggleRight, PlusCircle, ArrowLeft, Building2, BedDouble, CheckCircle, XCircle, Image } from "lucide-react";
import { assets } from "../../assets/assets";

const TABS = ["Overview", "Rooms", "Add Room"];

export default function HotelManage() {
    const { hotelId } = useParams();
    const { axios, getToken, fetchOwnerHotels } = useAppContext();
    const nav = useNavigate();

    const [activeTab, setActiveTab] = useState("Overview");
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Overview edit fields ─────────────────────────────────────────────────
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [contact, setContact] = useState("");
    const [city, setCity] = useState("");
    const [saving, setSaving] = useState(false);
    const [manualLat, setManualLat] = useState(20.59);
    const [manualLng, setManualLng] = useState(78.96);
    const [markerDragged, setMarkerDragged] = useState(false);
    const [viewState, setViewState] = useState({ longitude: 78.96, latitude: 20.59, zoom: 4 });

    // ── Add Room fields ──────────────────────────────────────────────────────
    const [roomInputs, setRoomInputs] = useState({
        roomType: "", pricePerNight: 0,
        amenities: { "Free WiFi": false, "Free Breakfast": false, "Room Service": false, "Mountain View": false, "Pool Access": false },
    });
    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null });
    const [addingRoom, setAddingRoom] = useState(false);

    // ── Fetch hotel + rooms ──────────────────────────────────────────────────
    const fetchData = async () => {
        setLoading(true);
        try {
            const [{ data: hData }, { data: rData }] = await Promise.all([
                axios.get("/api/hotels/my", { headers: { Authorization: `Bearer ${await getToken()}` } }),
                axios.get(`/api/rooms/hotel/${hotelId}`),
            ]);
            const found = hData.hotels?.find(h => h._id === hotelId);
            if (!found) { toast.error("Hotel not found"); nav("/owner/my-hotels"); return; }
            setHotel(found);
            setName(found.name); setAddress(found.address); setContact(found.contact); setCity(found.city);
            const lat = found.location?.lat || 20.59;
            const lng = found.location?.lng || 78.96;
            setManualLat(lat); setManualLng(lng);
            setViewState({ longitude: lng, latitude: lat, zoom: found.location?.lat ? 12 : 4 });
            setRooms(rData.rooms || []);
        } catch (e) {
            toast.error("Failed to load hotel data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [hotelId]);

    // ── Save hotel details ───────────────────────────────────────────────────
    const saveDetails = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            const { data } = await axios.put(`/api/hotels/${hotelId}`, {
                name, address, contact, city,
                manualLat: markerDragged ? manualLat : undefined,
                manualLng: markerDragged ? manualLng : undefined,
            }, { headers: { Authorization: `Bearer ${await getToken()}` } });
            if (data.success) { toast.success("Hotel updated!"); setHotel(data.hotel); fetchOwnerHotels(); }
            else toast.error(data.message);
        } catch { toast.error("Failed to update hotel"); }
        finally { setSaving(false); }
    };

    // ── Toggle room availability ─────────────────────────────────────────────
    const toggleRoom = async (roomId) => {
        try {
            const { data } = await axios.post("/api/rooms/toggle-availability", { roomId }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });
            if (data.success) { toast.success(data.message); fetchData(); }
            else toast.error(data.message);
        } catch { toast.error("Failed to toggle room"); }
    };

    // ── Add room ─────────────────────────────────────────────────────────────
    const addRoom = async (e) => {
        e.preventDefault();
        if (!roomInputs.roomType || !roomInputs.pricePerNight || !Object.values(images).some(i => i)) {
            toast.error("Please fill all details and upload at least 1 image"); return;
        }
        setAddingRoom(true);
        try {
            const formData = new FormData();
            formData.append("hotelId", hotelId);
            formData.append("roomType", roomInputs.roomType);
            formData.append("pricePerNight", roomInputs.pricePerNight);
            formData.append("amenities", JSON.stringify(Object.keys(roomInputs.amenities).filter(k => roomInputs.amenities[k])));
            Object.values(images).forEach(img => img && formData.append("images", img));
            const { data } = await axios.post("/api/rooms", formData, { headers: { Authorization: `Bearer ${await getToken()}` } });
            if (data.success) {
                toast.success("Room added!");
                setRoomInputs({ roomType: "", pricePerNight: 0, amenities: { "Free WiFi": false, "Free Breakfast": false, "Room Service": false, "Mountain View": false, "Pool Access": false } });
                setImages({ 1: null, 2: null, 3: null, 4: null });
                setActiveTab("Rooms");
                fetchData();
            } else toast.error(data.message);
        } catch { toast.error("Failed to add room"); }
        finally { setAddingRoom(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="pb-32 max-w-5xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => nav("/owner/my-hotels")} className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                        <Building2 size={22} className="text-indigo-500" /> {hotel?.name}
                    </h1>
                    <p className="text-sm text-gray-500">{hotel?.city} · {rooms.length} room type{rooms.length !== 1 ? "s" : ""}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                            activeTab === tab
                                ? "border-indigo-600 text-indigo-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >{tab}</button>
                ))}
            </div>

            {/* ── Tab: Overview ─────────────────────────────────────────── */}
            {activeTab === "Overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Map */}
                    <div className="h-72 rounded-xl overflow-hidden border border-gray-200 relative">
                        <div className="absolute top-3 left-3 z-10 bg-white/90 px-2 py-1 rounded text-xs text-indigo-700 border border-indigo-100 shadow-sm">
                            Drag pin to update location
                        </div>
                        <Map
                            {...viewState}
                            onMove={evt => setViewState(evt.viewState)}
                            mapStyle="mapbox://styles/mapbox/streets-v12"
                            mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                        >
                            <Marker
                                longitude={manualLng} latitude={manualLat} draggable
                                onDragEnd={e => { setManualLng(e.lngLat.lng); setManualLat(e.lngLat.lat); setMarkerDragged(true); }}
                            >
                                <MapPin className="text-indigo-600 fill-indigo-100" size={36} />
                            </Marker>
                        </Map>
                        {markerDragged && (
                            <div className="absolute bottom-3 left-3 z-10 bg-white/90 px-2 py-1 rounded text-xs text-gray-600 border border-gray-200">
                                📍 {manualLat.toFixed(4)}, {manualLng.toFixed(4)}
                            </div>
                        )}
                    </div>

                    {/* Form */}
                    <form onSubmit={saveDetails} className="space-y-3">
                        {[
                            { label: "Hotel Name", val: name, set: setName },
                            { label: "Contact", val: contact, set: setContact },
                            { label: "Address", val: address, set: setAddress },
                            { label: "City", val: city, set: setCity },
                        ].map(({ label, val, set }) => (
                            <div key={label}>
                                <label className="text-xs font-medium text-gray-500">{label}</label>
                                <input
                                    value={val} onChange={e => set(e.target.value)}
                                    className="mt-1 border border-gray-200 rounded-lg w-full px-3 py-2 text-sm outline-indigo-500"
                                    required
                                />
                            </div>
                        ))}
                        <button
                            type="submit" disabled={saving}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            <Pencil size={14} /> {saving ? "Saving…" : "Save Changes"}
                        </button>
                    </form>
                </div>
            )}

            {/* ── Tab: Rooms ────────────────────────────────────────────── */}
            {activeTab === "Rooms" && (
                <div className="space-y-4">
                    {rooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center">
                            <BedDouble size={40} className="text-gray-300 mb-3" />
                            <p className="text-gray-500">No rooms yet. Go to "Add Room" to create one.</p>
                        </div>
                    ) : rooms.map(room => (
                        <div key={room._id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                            <img
                                src={room.images?.[0] || assets.uploadArea}
                                className="w-20 h-16 object-cover rounded-lg shrink-0"
                                alt={room.roomType}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800">{room.roomType}</p>
                                <p className="text-sm text-gray-500">₹{room.pricePerNight}/night</p>
                                <p className="text-xs text-gray-400 mt-0.5">{room.amenities?.join(" · ")}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${room.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                    {room.isAvailable ? "Available" : "Unavailable"}
                                </span>
                                <button
                                    onClick={() => toggleRoom(room._id)}
                                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer transition"
                                >
                                    {room.isAvailable
                                        ? <><ToggleRight size={16} className="text-green-500" /> Disable</>
                                        : <><ToggleLeft size={16} className="text-gray-400" /> Enable</>
                                    }
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Tab: Add Room ─────────────────────────────────────────── */}
            {activeTab === "Add Room" && (
                <form onSubmit={addRoom} className="max-w-xl space-y-4">
                    {/* Images */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"><Image size={14}/>Room Images</p>
                        <div className="flex gap-3 flex-wrap">
                            {Object.keys(images).map(key => (
                                <label key={key} htmlFor={`img-${key}`} className="cursor-pointer">
                                    <img
                                        className="h-16 w-20 object-cover rounded-lg border border-gray-200 opacity-80 hover:opacity-100 transition"
                                        src={images[key] ? URL.createObjectURL(images[key]) : assets.uploadArea}
                                        alt=""
                                    />
                                    <input type="file" accept="image/*" id={`img-${key}`} hidden
                                        onChange={e => setImages({ ...images, [key]: e.target.files[0] })} />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Room Type + Price */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-medium text-gray-500">Room Type</label>
                            <select
                                value={roomInputs.roomType}
                                onChange={e => setRoomInputs({ ...roomInputs, roomType: e.target.value })}
                                className="mt-1 border border-gray-200 p-2 rounded-lg w-full text-sm outline-indigo-500"
                            >
                                <option value="">Select Type</option>
                                {["Single Bed", "Double Bed", "Luxury Room", "Family Suite"].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Price/night (₹)</label>
                            <input
                                type="number" min={0} value={roomInputs.pricePerNight}
                                onChange={e => setRoomInputs({ ...roomInputs, pricePerNight: e.target.value })}
                                className="mt-1 border border-gray-200 p-2 rounded-lg w-28 text-sm outline-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Amenities */}
                    <div>
                        <label className="text-xs font-medium text-gray-500">Amenities</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {Object.keys(roomInputs.amenities).map(amenity => (
                                <button
                                    type="button" key={amenity}
                                    onClick={() => setRoomInputs({ ...roomInputs, amenities: { ...roomInputs.amenities, [amenity]: !roomInputs.amenities[amenity] } })}
                                    className={`px-3 py-1 rounded-full text-xs border transition cursor-pointer ${
                                        roomInputs.amenities[amenity]
                                            ? "bg-indigo-600 text-white border-indigo-600"
                                            : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                                    }`}
                                >{amenity}</button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit" disabled={addingRoom}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        <PlusCircle size={16} /> {addingRoom ? "Adding…" : "Add Room"}
                    </button>
                </form>
            )}
        </div>
    );
}

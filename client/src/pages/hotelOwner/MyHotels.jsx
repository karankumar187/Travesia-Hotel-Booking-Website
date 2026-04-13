import { useEffect, useState } from "react";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext1";
import { MapPin, Phone, MapIcon, Settings, Building2, BedDouble } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MyHotels() {
    const { user, ownerHotels, fetchOwnerHotels, axios, getToken } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [roomCounts, setRoomCounts] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setLoading(true);
            fetchOwnerHotels().finally(() => setLoading(false));
        }
    }, [user]);

    // Fetch room counts for each hotel
    useEffect(() => {
        if (!ownerHotels || ownerHotels.length === 0) return;
        Promise.all(
            ownerHotels.map(h =>
                axios.get(`/api/rooms/hotel/${h._id}`).then(r => ({ id: h._id, count: r.data.rooms?.length || 0 }))
            )
        ).then(results => {
            const map = {};
            results.forEach(({ id, count }) => (map[id] = count));
            setRoomCounts(map);
        });
    }, [ownerHotels]);

    return (
        <div className="pb-32">
            <Title
                align="left" font="outfit"
                title="My Hotels"
                subTitle="Click any hotel to manage its details, rooms, availability, and location."
            />

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : ownerHotels && ownerHotels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
                    {ownerHotels.map((hotel) => (
                        <div
                            key={hotel._id}
                            onClick={() => navigate(`/owner/hotel/${hotel._id}`)}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden group"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-5 py-4 flex items-center gap-3">
                                <div className="bg-white/20 rounded-full p-2">
                                    <Building2 className="text-white" size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-semibold text-base truncate">{hotel.name}</h3>
                                    <p className="text-indigo-100 text-xs truncate">{hotel.city}</p>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="px-5 py-4 space-y-2.5">
                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <MapPin size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                                    <span className="line-clamp-2">{hotel.address}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone size={14} className="text-indigo-400 shrink-0" />
                                    <span>{hotel.contact}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <BedDouble size={13} className="text-indigo-400" />
                                        <span className="text-gray-600">{roomCounts[hotel._id] ?? "—"} room type{roomCounts[hotel._id] !== 1 ? "s" : ""}</span>
                                    </div>
                                    {hotel.location?.lat ? (
                                        <span className="text-green-600 text-xs font-medium">📍 Located</span>
                                    ) : (
                                        <span className="text-amber-500 text-xs">⚠️ No pin</span>
                                    )}
                                </div>
                            </div>

                            {/* Footer CTA */}
                            <div className="px-5 pb-4">
                                <div className="w-full flex items-center justify-center gap-2 bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 font-medium text-sm py-2 rounded-lg border border-indigo-200 transition">
                                    <Settings size={14} /> Manage Hotel
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Building2 size={48} className="text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No hotels registered yet</p>
                    <p className="text-gray-400 text-sm mt-1">Use "Add New Hotel" in the sidebar to get started.</p>
                </div>
            )}
        </div>
    );
}

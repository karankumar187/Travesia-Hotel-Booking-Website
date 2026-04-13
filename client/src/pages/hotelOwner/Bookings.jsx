import { useState, useEffect } from "react";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext1";
import { CalendarDays, Building2, BedDouble, IndianRupee, Clock } from "lucide-react";

const STATUS = { all: "All", paid: "Paid", pending: "Pending" };

export default function Bookings() {
    const { axios, getToken, user, currency } = useAppContext();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const { data } = await axios.get("/api/bookings/hotel", {
                    headers: { Authorization: `Bearer ${await getToken()}` },
                });
                if (data.success) setBookings(data.dashboardData?.bookings || []);
            } catch {}
            finally { setLoading(false); }
        })();
    }, [user]);

    const filtered = bookings.filter(b => filter === "all" ? true : filter === "paid" ? b.isPaid : !b.isPaid);

    return (
        <div className="pb-32">
            <Title align="left" font="outfit" title="Bookings" subTitle="View all reservations across your properties." />

            {/* Filter pills */}
            <div className="flex gap-2 mt-6 mb-4">
                {Object.entries(STATUS).map(([key, label]) => (
                    <button
                        key={key} onClick={() => setFilter(key)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border cursor-pointer transition ${
                            filter === key ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                        }`}
                    >{label}</button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                    <CalendarDays size={40} className="text-gray-300 mb-3" />
                    <p className="text-gray-500">No bookings found.</p>
                </div>
            ) : (
                <div className="space-y-3 max-w-4xl">
                    {filtered.map((b, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Building2 size={14} className="text-indigo-400 shrink-0" />
                                    <span className="font-semibold text-gray-800 text-sm">{b.hotel?.name || "—"}</span>
                                    <span className="text-gray-400 text-xs">· {b.hotel?.city}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <BedDouble size={13} className="text-gray-400" />
                                    {b.room?.roomType || "—"}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><CalendarDays size={11} /> {b.checkInDate ? new Date(b.checkInDate).toLocaleDateString("en-IN") : "—"} → {b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString("en-IN") : "—"}</span>
                                    <span className="flex items-center gap-1 text-gray-700 font-medium"><IndianRupee size={11} />{b.totalPrice}</span>
                                </div>
                                <p className="text-xs text-gray-400">Guest: {b.user?.username || b.user?.email || "—"}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className={`px-3 py-1 text-xs rounded-full font-medium ${b.isPaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                    {b.isPaid ? "Paid" : "Pending"}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock size={10} />{new Date(b.createdAt).toLocaleDateString("en-IN")}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

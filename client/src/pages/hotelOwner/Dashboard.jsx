import { useState, useEffect } from "react";
import { assets } from "../../assets/assets";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext1";
import { useNavigate } from "react-router-dom";
import { Building2, CalendarCheck, IndianRupee, BarChart3, ArrowRight, BedDouble } from "lucide-react";

export default function Dashboard() {
    const { currency, user, getToken, toast, axios, ownerHotels, fetchOwnerHotels } = useAppContext();
    const nav = useNavigate();

    const [dashboardData, setDashboardData] = useState({ bookings: [], totalBookings: 0, totalRevenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const token = await getToken();
                const [{ data }] = await Promise.all([
                    axios.get("/api/bookings/hotel", { headers: { Authorization: `Bearer ${token}` } }),
                    fetchOwnerHotels(),
                ]);
                if (data.success) setDashboardData(data.dashboardData);
                else toast.error(data.message);
            } catch (e) {
                toast.error(e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    const recentBookings = (dashboardData.bookings || []).slice(0, 5);
    const paidCount = (dashboardData.bookings || []).filter(b => b.isPaid).length;

    const StatCard = ({ icon, label, value, color, onClick, sublabel }) => (
        <div
            onClick={onClick}
            className={`bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4 ${onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all" : ""}`}
        >
            <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
            <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
                {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
            </div>
            {onClick && <ArrowRight size={16} className="ml-auto text-gray-300" />}
        </div>
    );

    return (
        <div className="pb-32">
            <Title
                align="left" font="outfit"
                title="Dashboard"
                subTitle="Your portfolio at a glance — recent activity, key numbers, and quick links."
            />

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8 mb-8">
                <StatCard
                    icon={<Building2 size={22} className="text-indigo-600" />}
                    color="bg-indigo-50"
                    label="Total Properties"
                    value={ownerHotels?.length || 0}
                    sublabel="Registered hotels"
                    onClick={() => nav("/owner/my-hotels")}
                />
                <StatCard
                    icon={<CalendarCheck size={22} className="text-green-600" />}
                    color="bg-green-50"
                    label="Total Bookings"
                    value={dashboardData.totalBookings}
                    sublabel={`${paidCount} paid`}
                    onClick={() => nav("/owner/bookings")}
                />
                <StatCard
                    icon={<IndianRupee size={22} className="text-blue-600" />}
                    color="bg-blue-50"
                    label="Total Revenue"
                    value={`${currency}${(dashboardData.totalRevenue || 0).toLocaleString()}`}
                    sublabel="From paid bookings"
                />
                <StatCard
                    icon={<BarChart3 size={22} className="text-purple-600" />}
                    color="bg-purple-50"
                    label="Analytics"
                    value="View Charts"
                    sublabel="Revenue & demand"
                    onClick={() => nav("/owner/analytics")}
                />
            </div>

            {/* Recent Bookings */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Recent Bookings</h2>
                <button
                    onClick={() => nav("/owner/bookings")}
                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition"
                >
                    View all <ArrowRight size={14} />
                </button>
            </div>

            <div className="max-w-4xl border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                        <tr>
                            <th className="py-3 px-4 text-left font-medium">Guest</th>
                            <th className="py-3 px-4 text-left font-medium max-sm:hidden">Hotel</th>
                            <th className="py-3 px-4 text-left font-medium max-sm:hidden">Room</th>
                            <th className="py-3 px-4 text-left font-medium">Amount</th>
                            <th className="py-3 px-4 text-center font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentBookings.length > 0 ? recentBookings.map((b, i) => (
                            <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 text-gray-700 font-medium">{b.user?.username || "—"}</td>
                                <td className="py-3 px-4 text-gray-500 max-sm:hidden text-xs">{b.hotel?.name || "—"}</td>
                                <td className="py-3 px-4 text-gray-500 max-sm:hidden text-xs">
                                    <span className="flex items-center gap-1"><BedDouble size={12} />{b.room?.roomType || "—"}</span>
                                </td>
                                <td className="py-3 px-4 text-gray-800 font-semibold">{currency}{b.totalPrice}</td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${b.isPaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                        {b.isPaid ? "Paid" : "Pending"}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="py-10 text-center text-gray-400">
                                    No bookings yet. Once guests start booking, they'll appear here.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 max-w-xl">
                <button onClick={() => nav("/owner/my-hotels")}
                    className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 hover:bg-indigo-100 transition cursor-pointer text-sm font-medium">
                    <Building2 size={18} /> Manage Hotels
                </button>
                <button onClick={() => nav("/owner/analytics")}
                    className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-100 rounded-xl text-purple-700 hover:bg-purple-100 transition cursor-pointer text-sm font-medium">
                    <BarChart3 size={18} /> View Analytics
                </button>
            </div>
        </div>
    );
}
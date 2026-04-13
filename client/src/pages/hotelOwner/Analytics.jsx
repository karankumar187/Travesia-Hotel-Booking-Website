import { useState, useMemo, useEffect } from "react";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext1";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function Analytics() {
    const { axios, getToken, user, currency } = useAppContext();
    const [dashData, setDashData] = useState({ bookings: [], totalBookings: 0, totalRevenue: 0 });

    useEffect(() => {
        if (!user) return;
        (async () => {
            const { data } = await axios.get("/api/bookings/hotel", { headers: { Authorization: `Bearer ${await getToken()}` } });
            if (data.success) setDashData(data.dashboardData);
        })();
    }, [user]);

    const monthlyRevenue = useMemo(() => {
        const map = {};
        (dashData.bookings || []).filter(b => b.isPaid).forEach(b => {
            const m = new Date(b.createdAt).toLocaleString("default", { month: "short" });
            map[m] = (map[m] || 0) + b.totalPrice;
        });
        return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m => ({ name: m, Revenue: map[m] || 0 }));
    }, [dashData.bookings]);

    const roomDemand = useMemo(() => {
        const map = {};
        (dashData.bookings || []).forEach(b => { const t = b.room?.roomType || "Standard"; map[t] = (map[t] || 0) + 1; });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [dashData.bookings]);

    const hotelRevenue = useMemo(() => {
        const map = {};
        (dashData.bookings || []).filter(b => b.isPaid).forEach(b => {
            const name = b.hotel?.name || "Unknown";
            map[name] = (map[name] || 0) + b.totalPrice;
        });
        return Object.entries(map).map(([name, Revenue]) => ({ name: name.split(" ").slice(0, 2).join(" "), Revenue })).sort((a, b) => b.Revenue - a.Revenue).slice(0, 6);
    }, [dashData.bookings]);

    const StatCard = ({ label, value, color }) => (
        <div className={`bg-white border border-gray-100 rounded-xl p-5 shadow-sm`}>
            <p className={`text-sm font-medium ${color}`}>{label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
    );

    return (
        <div className="pb-32">
            <Title align="left" font="outfit" title="Analytics" subTitle="Revenue trends, room demand, and per-property performance." />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 mb-8">
                <StatCard label="Total Bookings" value={dashData.totalBookings} color="text-indigo-600" />
                <StatCard label="Total Revenue" value={`${currency}${dashData.totalRevenue?.toLocaleString()}`} color="text-green-600" />
                <StatCard label="Paid Bookings" value={(dashData.bookings || []).filter(b => b.isPaid).length} color="text-blue-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-medium text-gray-700 mb-4">Monthly Revenue</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={v => `${currency}${v}`} tick={{ fontSize: 11 }} />
                            <Tooltip formatter={v => [`${currency}${v}`, "Revenue"]} />
                            <Line type="monotone" dataKey="Revenue" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-medium text-gray-700 mb-4">Room Demand</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={roomDemand} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                {roomDemand.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {hotelRevenue.length > 0 && (
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-medium text-gray-700 mb-4">Revenue by Property</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={hotelRevenue} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                            <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={v => `${currency}${v}`} tick={{ fontSize: 11 }} />
                            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={90} />
                            <Tooltip formatter={v => [`${currency}${v}`, "Revenue"]} />
                            <Bar dataKey="Revenue" fill="#6366F1" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

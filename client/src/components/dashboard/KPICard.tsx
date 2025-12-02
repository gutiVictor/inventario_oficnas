import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: number;
    color?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, trend, color = "blue" }) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        red: "bg-red-50 text-red-600",
        yellow: "bg-yellow-50 text-yellow-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
    };

    const trendUp = trend !== undefined && trend > 0;
    const showTrend = trend !== undefined && trend !== 0;

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
                    {showTrend && (
                        <div className={`flex items-center gap-1 mt-2 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                            {trendUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            <span className="text-sm font-semibold">
                                {Math.abs(trend).toFixed(1)}% vs mes anterior
                            </span>
                        </div>
                    )}
                </div>
                <div className={`p-4 rounded-full ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
                    <Icon size={28} />
                </div>
            </div>
        </div>
    );
};

export default KPICard;

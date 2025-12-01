import React from 'react';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface StatusDistributionProps {
    data: { status: string; count: string }[];
}

export const StatusDistributionChart: React.FC<StatusDistributionProps> = ({ data }) => {
    const chartData = data.map(item => ({
        name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        value: parseInt(item.count)
    }));

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

interface AssetCountByCategoryProps {
    data: { name: string; count: string }[];
}

export const AssetCountByCategoryChart: React.FC<AssetCountByCategoryProps> = ({ data }) => {
    const chartData = data.map(item => ({
        name: item.name,
        count: parseInt(item.count)
    }));

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value} activos`} />
                    <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

interface MaintenanceCostsProps {
    data: { month: string; total: string }[];
}

export const MaintenanceCostsChart: React.FC<MaintenanceCostsProps> = ({ data }) => {
    const chartData = data.map(item => ({
        month: item.month,
        total: parseFloat(item.total)
    }));

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Line type="monotone" dataKey="total" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

interface AssetsByLocationProps {
    data: { name: string; count: string }[];
}

export const AssetsByLocationChart: React.FC<AssetsByLocationProps> = ({ data }) => {
    const chartData = data.map(item => ({
        name: item.name,
        count: parseInt(item.count)
    }));

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip formatter={(value) => `${value} activos`} />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

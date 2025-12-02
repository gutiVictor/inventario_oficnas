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

interface AssetValueTrendProps {
    data: { month: string; total_value: string; asset_count: string }[];
}

export const AssetValueTrendChart: React.FC<AssetValueTrendProps> = ({ data }) => {
    const chartData = data.map(item => ({
        month: item.month,
        value: parseFloat(item.total_value),
        count: parseInt(item.asset_count)
    }));

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="month"
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        formatter={(value: any, name: string) => {
                            if (name === 'value') return [`$${parseFloat(value).toLocaleString()}`, 'Valor Total'];
                            return [value, 'Activos Comprados'];
                        }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        name="Valor Total"
                    />
                    <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="Cantidad"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

interface TopSuppliersProps {
    data: { name: string; asset_count: string; total_value: string }[];
}

export const TopSuppliersChart: React.FC<TopSuppliersProps> = ({ data }) => {
    const chartData = data.map(item => ({
        name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
        fullName: item.name,
        count: parseInt(item.asset_count),
        value: parseFloat(item.total_value)
    }));

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="category" dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip
                        formatter={(value: any, name: string) => {
                            if (name === 'Activos Suministrados') return [value, 'Activos'];
                            return [`$${parseFloat(value).toLocaleString()}`, 'Valor Total'];
                        }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Activos Suministrados" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

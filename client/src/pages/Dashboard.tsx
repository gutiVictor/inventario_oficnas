import React, { useEffect, useState } from 'react';
import { DollarSign, Wrench, Users, AlertTriangle, Activity } from 'lucide-react';
import { dashboardAPI } from '../services/api';
import KPICard from '../components/dashboard/KPICard';
import { StatusDistributionChart, ValueByCategoryChart, MaintenanceCostsChart } from '../components/dashboard/DashboardCharts';

const Dashboard = () => {
    const [summary, setSummary] = useState<any>(null);
    const [statusData, setStatusData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [maintenanceData, setMaintenanceData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, statusRes, categoryRes, maintenanceRes] = await Promise.all([
                    dashboardAPI.getSummary(),
                    dashboardAPI.getStatusDistribution(),
                    dashboardAPI.getValueByCategory(),
                    dashboardAPI.getMaintenanceCosts()
                ]);

                setSummary(summaryRes.data.data);
                setStatusData(statusRes.data.data);
                setCategoryData(categoryRes.data.data);
                setMaintenanceData(maintenanceRes.data.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard General</h1>
                <div className="text-sm text-gray-500">
                    Última actualización: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Valor Total Activos"
                    value={`$${summary?.totalValue?.toLocaleString()}`}
                    icon={DollarSign}
                    color="blue"
                />
                <KPICard
                    title="Gasto Mantenimiento (YTD)"
                    value={`$${summary?.maintenanceCosts?.toLocaleString()}`}
                    icon={Wrench}
                    color="red"
                />
                <KPICard
                    title="Tasa de Asignación"
                    value={`${summary?.assignmentRate?.toFixed(1)}%`}
                    icon={Users}
                    color="green"
                />
                <KPICard
                    title="Equipos por Reemplazar"
                    value={summary?.assetsToReplace}
                    icon={AlertTriangle}
                    color="yellow"
                    trend="Atención requerida"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Activity size={20} className="text-blue-500" />
                        Estado del Inventario
                    </h3>
                    <StatusDistributionChart data={statusData} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Valor por Categoría</h3>
                    <ValueByCategoryChart data={categoryData} />
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Costos de Mantenimiento Mensual</h3>
                <MaintenanceCostsChart data={maintenanceData} />
            </div>
        </div>
    );
};

export default Dashboard;

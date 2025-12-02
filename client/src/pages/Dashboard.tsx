import React, { useEffect, useState } from 'react';
import { Package, Activity, Users, FolderTree, DollarSign, Clock, Wrench, RefreshCw } from 'lucide-react';
import { dashboardAPI } from '../services/api';
import KPICard from '../components/dashboard/KPICard';
import {
    StatusDistributionChart,
    AssetCountByCategoryChart,
    AssetsByLocationChart,
    MaintenanceCostsChart,
    AssetValueTrendChart,
    TopSuppliersChart
} from '../components/dashboard/DashboardCharts';
import RecentActivityTimeline from '../components/dashboard/RecentActivityTimeline';

const Dashboard = () => {
    const [summary, setSummary] = useState<any>(null);
    const [statusData, setStatusData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [locationData, setLocationData] = useState<any[]>([]);
    const [maintenanceData, setMaintenanceData] = useState<any[]>([]);
    const [assetValueData, setAssetValueData] = useState<any[]>([]);
    const [topSuppliersData, setTopSuppliersData] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [
                summaryRes,
                statusRes,
                categoryRes,
                locationRes,
                maintenanceRes,
                valueRes,
                suppliersRes,
                activityRes
            ] = await Promise.all([
                dashboardAPI.getSummary(),
                dashboardAPI.getStatusDistribution(),
                dashboardAPI.getCountByCategory(),
                dashboardAPI.getAssetsByLocation(),
                dashboardAPI.getMaintenanceCosts(),
                dashboardAPI.getAssetValueTrends(),
                dashboardAPI.getTopSuppliers(),
                dashboardAPI.getRecentActivity()
            ]);

            setSummary(summaryRes.data.data);
            setStatusData(statusRes.data.data);
            setCategoryData(categoryRes.data.data);
            setLocationData(locationRes.data.data);
            setMaintenanceData(maintenanceRes.data.data);
            setAssetValueData(valueRes.data.data);
            setTopSuppliersData(suppliersRes.data.data);
            setRecentActivity(activityRes.data.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard General</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Última actualización: {new Date().toLocaleString('es-ES', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                        })}
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'Actualizando...' : 'Actualizar'}
                </button>
            </div>

            {/* Enhanced KPIs - 4 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total de Activos"
                    value={summary?.totalAssets || 0}
                    icon={Package}
                    color="blue"
                    trend={summary?.totalAssetsTrend}
                />
                <KPICard
                    title="Activos Activos"
                    value={summary?.activeAssets || 0}
                    icon={Activity}
                    color="green"
                    trend={summary?.activeAssetsTrend}
                />
                <KPICard
                    title="Valor Total de Activos"
                    value={`$${summary?.totalAssetValue?.toLocaleString('es-ES', { maximumFractionDigits: 0 }) || 0}`}
                    icon={DollarSign}
                    color="purple"
                />
                <KPICard
                    title="Tasa de Asignación"
                    value={`${summary?.assignmentRate?.toFixed(1) || 0}%`}
                    icon={Users}
                    color="orange"
                />
            </div>

            {/* Secondary KPIs - 4 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Categorías Activas"
                    value={summary?.totalCategories || 0}
                    icon={FolderTree}
                    color="yellow"
                />
                <KPICard
                    title="Edad Promedio"
                    value={`${summary?.averageAssetAge?.toFixed(1) || 0} años`}
                    icon={Clock}
                    color="blue"
                />
                <KPICard
                    title="Necesitan Mantenimiento"
                    value={summary?.assetsNeedingMaintenance || 0}
                    icon={Wrench}
                    color="red"
                />
            </div>

            {/* Main Charts - 2x2 Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Activity size={20} className="text-blue-500" />
                        Estado del Inventario
                    </h3>
                    <StatusDistributionChart data={statusData} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FolderTree size={20} className="text-purple-500" />
                        Activos por Categoría
                    </h3>
                    <AssetCountByCategoryChart data={categoryData} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <DollarSign size={20} className="text-green-500" />
                        Tendencia de Valor de Activos
                    </h3>
                    <AssetValueTrendChart data={assetValueData} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Package size={20} className="text-orange-500" />
                        Top Proveedores
                    </h3>
                    <TopSuppliersChart data={topSuppliersData} />
                </div>
            </div>

            {/* Secondary Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Wrench size={20} className="text-red-500" />
                        Costos de Mantenimiento
                    </h3>
                    <MaintenanceCostsChart data={maintenanceData} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución por Ubicación</h3>
                    <AssetsByLocationChart data={locationData} />
                </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-gray-600" />
                    Actividad Reciente
                </h3>
                <RecentActivityTimeline data={recentActivity} />
            </div>
        </div>
    );
};

export default Dashboard;

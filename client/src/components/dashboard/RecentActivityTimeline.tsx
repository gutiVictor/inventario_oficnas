import React from 'react';
import { Clock, User, Package } from 'lucide-react';

interface Activity {
    action: string;
    table_name: string;
    created_at: string;
    user_name: string;
    user_email: string;
    asset_name: string | null;
}

interface RecentActivityTimelineProps {
    data: Activity[];
}

const RecentActivityTimeline: React.FC<RecentActivityTimelineProps> = ({ data }) => {
    const getActionColor = (action: string) => {
        switch (action.toLowerCase()) {
            case 'insert':
            case 'create':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'update':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'delete':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getActionText = (action: string) => {
        switch (action.toLowerCase()) {
            case 'insert':
                return 'Creó';
            case 'update':
                return 'Actualizó';
            case 'delete':
                return 'Eliminó';
            default:
                return action;
        }
    };

    const getTableName = (tableName: string) => {
        const tableNames: Record<string, string> = {
            'assets': 'Activo',
            'users': 'Usuario',
            'categories': 'Categoría',
            'suppliers': 'Proveedor',
            'locations': 'Ubicación',
            'asset_assignments': 'Asignación',
            'maintenance_orders': 'Orden de Mantenimiento',
        };
        return tableNames[tableName] || tableName;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Justo ahora';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-4">
            {data.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Package size={48} className="mx-auto mb-2 opacity-30" />
                    <p>No hay actividad reciente</p>
                </div>
            ) : (
                data.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0 mt-1">
                            <Clock size={20} className="text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-1 rounded text-xs font-semibold border ${getActionColor(activity.action)}`}>
                                    {getActionText(activity.action)}
                                </span>
                                <span className="text-sm text-gray-600">
                                    {getTableName(activity.table_name)}
                                </span>
                                {activity.asset_name && (
                                    <span className="text-sm font-medium text-gray-900">
                                        "{activity.asset_name}"
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <User size={14} />
                                <span>{activity.user_name || activity.user_email || 'Sistema'}</span>
                                <span>•</span>
                                <span>{formatDate(activity.created_at)}</span>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default RecentActivityTimeline;

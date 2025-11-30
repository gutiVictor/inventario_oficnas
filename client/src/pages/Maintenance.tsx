import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceAPI } from '../services/api';
import { Wrench, Search, Filter, AlertTriangle, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import MaintenanceForm from '../components/forms/MaintenanceForm';

export default function Maintenance() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['maintenance'],
        queryFn: () => maintenanceAPI.getAll(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => maintenanceAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenance'] });
        },
    });

    const maintenanceOrders = Array.isArray(data?.data?.data) ? data.data.data : (Array.isArray(data?.data) ? data.data : []);

    const filteredOrders = maintenanceOrders.filter((order: any) =>
        order.asset_name?.toLowerCase().includes(search.toLowerCase()) ||
        order.asset_tag?.toLowerCase().includes(search.toLowerCase()) ||
        order.technician_name?.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500/10 text-green-700 dark:text-green-400';
            case 'in_progress': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
            case 'scheduled': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
            default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Completado';
            case 'in_progress': return 'En Progreso';
            case 'scheduled': return 'Programado';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    const handleEdit = (order: any) => {
        setSelectedOrder(order);
        setIsFormOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar esta orden de mantenimiento?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setSelectedOrder(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Mantenimiento
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Órdenes de trabajo y mantenimiento preventivo/correctivo
                    </p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Wrench className="h-4 w-4" />
                    Nueva Orden
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por activo, técnico o etiqueta..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
                <button className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Filter className="h-4 w-4" />
                    Filtros
                </button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            ) : error ? (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                    <p className="text-sm text-destructive">
                        Error al cargar las órdenes de mantenimiento. Por favor, intenta de nuevo.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredOrders.map((order: any) => (
                        <div
                            key={order.id}
                            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${order.type === 'preventive' ? 'bg-blue-500/10 text-blue-600' : 'bg-orange-500/10 text-orange-600'
                                        }`}>
                                        {order.type === 'preventive' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">
                                            {order.type === 'preventive' ? 'Preventivo' : order.type === 'corrective' ? 'Correctivo' : 'Actualización'}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">ID: {order.id}</p>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-1 border-b border-border/50">
                                    <span className="text-muted-foreground">Activo:</span>
                                    <span className="font-medium text-right">{order.asset_name}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-border/50">
                                    <span className="text-muted-foreground">Técnico:</span>
                                    <span className="font-medium text-right">{order.technician_name || 'No asignado'}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-border/50">
                                    <span className="text-muted-foreground">Fecha Planificada:</span>
                                    <span className="font-medium text-right">
                                        {new Date(order.planned_date).toLocaleDateString()}
                                    </span>
                                </div>
                                {(order.cost_parts > 0 || order.cost_labor > 0) && (
                                    <div className="flex justify-between py-1">
                                        <span className="text-muted-foreground">Costo Total:</span>
                                        <span className="font-medium text-right">
                                            ${(parseFloat(order.cost_parts || 0) + parseFloat(order.cost_labor || 0)).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                    {order.notes || 'Sin notas'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(order)}
                                        className="p-1.5 rounded-md hover:bg-accent transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(order.id)}
                                        className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredOrders.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            No se encontraron órdenes de mantenimiento
                        </div>
                    )}
                </div>
            )}

            {/* Form Modal */}
            <MaintenanceForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                orderToEdit={selectedOrder}
            />
        </div>
    );
}

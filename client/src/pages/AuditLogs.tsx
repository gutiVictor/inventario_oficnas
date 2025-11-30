import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditAPI, usersAPI } from '../services/api';
import { FileText, Search, Filter, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';

export default function AuditLogs() {
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        table_name: '',
        action: '',
        changed_by: '',
        start_date: '',
        end_date: '',
    });
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const { data, isLoading, error } = useQuery({
        queryKey: ['audit-logs', filters],
        queryFn: () => auditAPI.getAll(filters),
    });

    const { data: usersData } = useQuery({
        queryKey: ['users'],
        queryFn: () => usersAPI.getAll(),
    });

    const logs = Array.isArray(data?.data?.data) ? data.data.data : (Array.isArray(data?.data) ? data.data : []);
    const users = Array.isArray(usersData?.data?.data) ? usersData.data.data : (Array.isArray(usersData?.data) ? usersData.data : []);

    const filteredLogs = logs.filter((log: any) =>
        log.table_name?.toLowerCase().includes(search.toLowerCase()) ||
        log.action?.toLowerCase().includes(search.toLowerCase()) ||
        log.changed_by_name?.toLowerCase().includes(search.toLowerCase())
    );

    const toggleRow = (id: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const getActionBadge = (action: string) => {
        const colors = {
            INSERT: 'bg-green-500/10 text-green-700 dark:text-green-400',
            UPDATE: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
            DELETE: 'bg-red-500/10 text-red-700 dark:text-red-400',
        };
        return colors[action as keyof typeof colors] || 'bg-gray-500/10 text-gray-700';
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            table_name: '',
            action: '',
            changed_by: '',
            start_date: '',
            end_date: '',
        });
    };

    const formatJSON = (json: any) => {
        if (!json) return 'N/A';
        return JSON.stringify(json, null, 2);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Auditoría del Sistema
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Historial completo de cambios en el sistema
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filtros
                    </h3>
                    <button
                        onClick={clearFilters}
                        className="text-xs text-muted-foreground hover:text-foreground"
                    >
                        Limpiar filtros
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Select
                        label="Tabla"
                        name="table_name"
                        value={filters.table_name}
                        onChange={handleFilterChange}
                        options={[
                            { value: '', label: 'Todas' },
                            { value: 'assets', label: 'Activos' },
                            { value: 'users', label: 'Usuarios' },
                            { value: 'locations', label: 'Ubicaciones' },
                            { value: 'categories', label: 'Categorías' },
                            { value: 'suppliers', label: 'Proveedores' },
                            { value: 'asset_assignments', label: 'Asignaciones' },
                            { value: 'asset_moves', label: 'Movimientos' },
                            { value: 'maintenance_orders', label: 'Mantenimiento' },
                        ]}
                    />
                    <Select
                        label="Acción"
                        name="action"
                        value={filters.action}
                        onChange={handleFilterChange}
                        options={[
                            { value: '', label: 'Todas' },
                            { value: 'INSERT', label: 'Creación' },
                            { value: 'UPDATE', label: 'Actualización' },
                            { value: 'DELETE', label: 'Eliminación' },
                        ]}
                    />
                    <Select
                        label="Usuario"
                        name="changed_by"
                        value={filters.changed_by}
                        onChange={handleFilterChange}
                        options={[
                            { value: '', label: 'Todos' },
                            ...users.map((user: any) => ({
                                value: user.id.toString(),
                                label: user.full_name,
                            })),
                        ]}
                    />
                    <Input
                        label="Desde"
                        name="start_date"
                        type="date"
                        value={filters.start_date}
                        onChange={handleFilterChange}
                    />
                    <Input
                        label="Hasta"
                        name="end_date"
                        type="date"
                        value={filters.end_date}
                        onChange={handleFilterChange}
                    />
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Buscar por tabla, acción o usuario..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            ) : error ? (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                    <p className="text-sm text-destructive">
                        Error al cargar los registros de auditoría. Por favor, intenta de nuevo.
                    </p>
                </div>
            ) : (
                <div className="rounded-lg border border-border bg-card">
                    <table className="w-full">
                        <thead className="border-b border-border">
                            <tr className="text-sm text-muted-foreground">
                                <th className="text-left p-4 font-medium w-8"></th>
                                <th className="text-left p-4 font-medium">Fecha/Hora</th>
                                <th className="text-left p-4 font-medium">Tabla</th>
                                <th className="text-left p-4 font-medium">ID</th>
                                <th className="text-left p-4 font-medium">Acción</th>
                                <th className="text-left p-4 font-medium">Usuario</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredLogs.map((log: any) => (
                                <>
                                    <tr
                                        key={log.id}
                                        className="text-sm text-foreground hover:bg-accent/50 cursor-pointer transition-colors"
                                        onClick={() => toggleRow(log.id)}
                                    >
                                        <td className="p-4">
                                            {expandedRows.has(log.id) ? (
                                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span>{new Date(log.changed_at).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                                {log.table_name}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-mono text-xs">{log.record_id}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getActionBadge(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span>{log.changed_by_name || 'Sistema'}</span>
                                        </td>
                                    </tr>
                                    {expandedRows.has(log.id) && (
                                        <tr key={`${log.id}-details`} className="bg-muted/30">
                                            <td colSpan={6} className="p-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    {log.old_values && (
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                                                                Valores Anteriores
                                                            </h4>
                                                            <pre className="text-xs bg-background p-3 rounded border border-border overflow-x-auto">
                                                                {formatJSON(log.old_values)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                    {log.new_values && (
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                                                                Valores Nuevos
                                                            </h4>
                                                            <pre className="text-xs bg-background p-3 rounded border border-border overflow-x-auto">
                                                                {formatJSON(log.new_values)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No se encontraron registros de auditoría
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {filteredLogs.length > 0 && (
                <div className="text-sm text-muted-foreground text-center">
                    Mostrando {filteredLogs.length} registro(s) (máximo 500 más recientes)
                </div>
            )}
        </div>
    );
}

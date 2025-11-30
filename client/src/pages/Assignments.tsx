import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsAPI } from '../services/api';
import { ClipboardList, Search, Filter, Calendar, User, Package, Edit2, Trash2 } from 'lucide-react';
import AssignmentForm from '../components/forms/AssignmentForm';

export default function Assignments() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['assignments'],
        queryFn: () => assignmentsAPI.getAll(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => assignmentsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
        },
    });

    const assignments = Array.isArray(data?.data?.data) ? data.data.data : (Array.isArray(data?.data) ? data.data : []);

    const filteredAssignments = assignments.filter((assignment: any) =>
        assignment.asset_name?.toLowerCase().includes(search.toLowerCase()) ||
        assignment.asset_tag?.toLowerCase().includes(search.toLowerCase()) ||
        assignment.user_name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (assignment: any) => {
        setSelectedAssignment(assignment);
        setIsFormOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar esta asignación?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setSelectedAssignment(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Asignaciones
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Control de asignación de activos a empleados
                    </p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <ClipboardList className="h-4 w-4" />
                    Nueva Asignación
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por activo, etiqueta o empleado..."
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
                        Error al cargar las asignaciones. Por favor, intenta de nuevo.
                    </p>
                </div>
            ) : (
                <div className="rounded-lg border border-border bg-card">
                    <table className="w-full">
                        <thead className="border-b border-border">
                            <tr className="text-sm text-muted-foreground">
                                <th className="text-left p-4 font-medium">Activo</th>
                                <th className="text-left p-4 font-medium">Empleado</th>
                                <th className="text-left p-4 font-medium">Fecha Asignación</th>
                                <th className="text-left p-4 font-medium">Fecha Retorno</th>
                                <th className="text-left p-4 font-medium">Estado</th>
                                <th className="text-right p-4 font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredAssignments.map((assignment: any) => (
                                <tr
                                    key={assignment.id}
                                    className="text-sm text-foreground hover:bg-accent/50 transition-colors"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">{assignment.asset_name}</div>
                                                <div className="text-xs text-muted-foreground">{assignment.asset_tag}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">{assignment.user_name}</div>
                                                <div className="text-xs text-muted-foreground">{assignment.user_department}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>{new Date(assignment.assigned_date).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {assignment.return_date ? (
                                            <span className="text-muted-foreground">
                                                {new Date(assignment.return_date).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">
                                                No retornado
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${assignment.status === 'active'
                                                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                                                : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                                                }`}
                                        >
                                            {assignment.status === 'active' ? 'Asignado' : 'Retornado'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(assignment)}
                                                className="p-1.5 rounded-md hover:bg-accent transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(assignment.id)}
                                                className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredAssignments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No se encontraron asignaciones
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Form Modal */}
            <AssignmentForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                assignmentToEdit={selectedAssignment}
            />
        </div>
    );
}

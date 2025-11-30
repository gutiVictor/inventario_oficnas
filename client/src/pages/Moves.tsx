import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movesAPI } from '../services/api';
import { TruckIcon, Search, Filter, Plus, ArrowRight, Edit2, Trash2 } from 'lucide-react';
import MoveForm from '../components/forms/MoveForm';

export default function Moves() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedMove, setSelectedMove] = useState<any>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['moves'],
        queryFn: () => movesAPI.getAll(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => movesAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['moves'] });
        },
    });

    const moves = Array.isArray(data?.data?.data) ? data.data.data : (Array.isArray(data?.data) ? data.data : []);

    const filteredMoves = moves.filter((move: any) =>
        move.asset_name?.toLowerCase().includes(search.toLowerCase()) ||
        move.asset_tag?.toLowerCase().includes(search.toLowerCase()) ||
        move.from_location?.toLowerCase().includes(search.toLowerCase()) ||
        move.to_location?.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (move: any) => {
        setSelectedMove(move);
        setIsFormOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar este movimiento?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setSelectedMove(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Movimientos de Activos
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Historial de movimientos de activos entre ubicaciones
                    </p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Nuevo Movimiento
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por activo, etiqueta o ubicación..."
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
                        Error al cargar los movimientos. Por favor, intenta de nuevo.
                    </p>
                </div>
            ) : (
                <div className="rounded-lg border border-border bg-card">
                    <table className="w-full">
                        <thead className="border-b border-border">
                            <tr className="text-sm text-muted-foreground">
                                <th className="text-left p-4 font-medium">Activo</th>
                                <th className="text-left p-4 font-medium">Ubicación</th>
                                <th className="text-left p-4 font-medium">Movido Por</th>
                                <th className="text-left p-4 font-medium">Fecha</th>
                                <th className="text-left p-4 font-medium">Razón</th>
                                <th className="text-right p-4 font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredMoves.map((move: any) => (
                                <tr
                                    key={move.id}
                                    className="text-sm text-foreground hover:bg-accent/50 transition-colors"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <TruckIcon className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">{move.asset_name || 'N/A'}</div>
                                                <div className="text-xs text-muted-foreground">{move.asset_tag || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">{move.from_location || 'N/A'}</span>
                                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                            <span className="font-medium">{move.to_location || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span>{move.moved_by_name || 'N/A'}</span>
                                    </td>
                                    <td className="p-4">
                                        <span>{move.move_date ? new Date(move.move_date).toLocaleDateString() : 'N/A'}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs text-muted-foreground truncate max-w-xs block">
                                            {move.reason || '-'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(move)}
                                                className="p-1.5 rounded-md hover:bg-accent transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(move.id)}
                                                className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredMoves.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No se encontraron movimientos
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Form Modal */}
            <MoveForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                moveToEdit={selectedMove}
            />
        </div>
    );
}

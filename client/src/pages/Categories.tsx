import { useQuery } from '@tanstack/react-query';
import { categoriesAPI } from '../services/api';
import { FolderTree, Search, Filter, ChevronRight, Folder, Plus, Edit2 } from 'lucide-react';
import { useState } from 'react';
import CategoryForm from '../components/forms/CategoryForm';
import Button from '../components/ui/Button';
import ExportButton from '../components/common/ExportButton';

export default function Categories() {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<any>(null);

    const handleEdit = (category: any) => {
        setCategoryToEdit(category);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setCategoryToEdit(null);
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoriesAPI.getAll(),
    });

    const categories = Array.isArray(data?.data?.data) ? data.data.data : (Array.isArray(data?.data) ? data.data : []);

    const filteredCategories = categories.filter((category: any) =>
        category.name?.toLowerCase().includes(search.toLowerCase()) ||
        category.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Categorías
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Clasificación de activos y equipos
                    </p>
                </div>
                <div className="flex gap-3">
                    <ExportButton module="categories" type="excel" />
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Categoría
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar categorías..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            ) : error ? (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                    <p className="text-sm text-destructive">
                        Error al cargar las categorías. Por favor, intenta de nuevo.
                    </p>
                </div>
            ) : (
                <div className="rounded-lg border border-border bg-card">
                    <div className="divide-y divide-border">
                        {filteredCategories.map((category: any) => (
                            <div
                                key={category.id}
                                className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        <Folder className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-foreground">{category.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {category.parent_id ? `Subcategoría de ID: ${category.parent_id}` : 'Categoría Principal'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${category.active
                                        ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                                        : 'bg-red-500/10 text-red-700 dark:text-red-400'
                                        }`}>
                                        {category.active ? 'Activo' : 'Inactivo'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        ID: {category.id}
                                    </span>
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                                    >
                                        <Edit2 className="h-3 w-3" />
                                        Editar
                                    </button>
                                </div>
                            </div>
                        ))}

                        {filteredCategories.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">
                                No se encontraron categorías
                            </div>
                        )}
                    </div>
                </div>
            )}

            <CategoryForm
                isOpen={isModalOpen}
                onClose={handleClose}
                categoryToEdit={categoryToEdit}
            />
        </div>
    );
}

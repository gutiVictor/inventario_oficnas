
import { useQuery } from '@tanstack/react-query';
import { assetsAPI } from '../services/api';
import { Package, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AssetForm from '../components/forms/AssetForm';
import Button from '../components/ui/Button';

export default function Assets() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['assets', { page, search }],
    queryFn: () => assetsAPI.getAll({ page, limit: 20, search }),
  });

  const handleEdit = (asset: any) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingAsset(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este activo?')) {
      try {
        await assetsAPI.delete(id);
        refetch();
      } catch (error) {
        console.error('Error deleting asset:', error);
        alert('Error al eliminar el activo');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Activos
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestión de activos de la empresa
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Package className="h-4 w-4 mr-2" />
          Nuevo Activo
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar activos..."
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
            Error al cargar los activos. Por favor, intenta de nuevo.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr className="text-sm text-muted-foreground">
                <th className="text-left p-4 font-medium">Etiqueta</th>
                <th className="text-left p-4 font-medium">Nombre</th>
                <th className="text-left p-4 font-medium">Categoría</th>
                <th className="text-left p-4 font-medium">Ubicación</th>
                <th className="text-left p-4 font-medium">Estado</th>
                <th className="text-left p-4 font-medium">Condición</th>
                <th className="text-right p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.data?.data?.map((asset: any) => (
                <tr
                  key={asset.id}
                  className="text-sm text-foreground hover:bg-accent/50 transition-colors"
                >
                  <td className="p-4 font-medium">{asset.asset_tag}</td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{asset.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {asset.brand} {asset.model}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">{asset.category_name}</td>
                  <td className="p-4">
                    <div>
                      <p>{asset.location_name}</p>
                      <p className="text-muted-foreground text-xs">
                        {asset.location_city}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${asset.status === 'active'
                        ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                        : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                        }`}
                    >
                      {asset.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(asset)}
                        className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(asset.id)}
                        className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {data?.data?.pagination && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Mostrando {data.data.data.length} de {data.data.pagination.total} activos
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm rounded border border-input disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.data.pagination.totalPages}
                  className="px-3 py-1 text-sm rounded border border-input disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <AssetForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAsset(null);
          refetch(); // Refetch data after form submission/closure
        }}
        assetToEdit={editingAsset}
      />
    </div>
  );
}


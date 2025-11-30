import { useQuery } from '@tanstack/react-query';
import { locationsAPI } from '../services/api';
import { MapPin, Search, Filter, Building2 } from 'lucide-react';
import { useState } from 'react';

export default function Locations() {
    const [search, setSearch] = useState('');

    const { data, isLoading, error } = useQuery({
        queryKey: ['locations'],
        queryFn: () => locationsAPI.getAll(),
    });

    const locations = Array.isArray(data?.data?.data) ? data.data.data : (Array.isArray(data?.data) ? data.data : []);

    const filteredLocations = locations.filter((location: any) =>
        location.name?.toLowerCase().includes(search.toLowerCase()) ||
        location.city?.toLowerCase().includes(search.toLowerCase()) ||
        location.address?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Ubicaciones
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Sedes y oficinas de la empresa
                    </p>
                </div>
                <button className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                    <MapPin className="h-4 w-4" />
                    Nueva Ubicación
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, ciudad o dirección..."
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
                        Error al cargar las ubicaciones. Por favor, intenta de nuevo.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredLocations.map((location: any) => (
                        <div
                            key={location.id}
                            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">{location.name}</h3>
                                        <p className="text-sm text-muted-foreground">Código: {location.code || 'N/A'}</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                                    Activo
                                </span>
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>{location.address}, {location.city}, {location.country}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">
                                    ID: {location.id}
                                </span>
                                <span className="text-xs font-medium text-primary group-hover:underline">
                                    Ver detalles →
                                </span>
                            </div>
                        </div>
                    ))}

                    {filteredLocations.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            No se encontraron ubicaciones
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

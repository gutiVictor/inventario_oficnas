import { useQuery } from '@tanstack/react-query';
import { suppliersAPI } from '../services/api';
import { Store, Search, Filter, Phone, Mail, Globe } from 'lucide-react';
import { useState } from 'react';

export default function Suppliers() {
    const [search, setSearch] = useState('');

    const { data, isLoading, error } = useQuery({
        queryKey: ['suppliers'],
        queryFn: () => suppliersAPI.getAll(),
    });

    const suppliers = Array.isArray(data?.data?.data) ? data.data.data : (Array.isArray(data?.data) ? data.data : []);

    const filteredSuppliers = suppliers.filter((supplier: any) =>
        supplier.name?.toLowerCase().includes(search.toLowerCase()) ||
        supplier.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Proveedores
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Gestión de proveedores y servicios externos
                    </p>
                </div>
                <button className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Store className="h-4 w-4" />
                    Nuevo Proveedor
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, contacto o email..."
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
                        Error al cargar los proveedores. Por favor, intenta de nuevo.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSuppliers.map((supplier: any) => (
                        <div
                            key={supplier.id}
                            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                    <Store className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">{supplier.name}</h3>
                                    <p className="text-sm text-muted-foreground">{supplier.contact_name || 'Sin contacto'}</p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                {supplier.email && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span className="truncate">{supplier.email}</span>
                                    </div>
                                )}
                                {supplier.phone && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span>{supplier.phone}</span>
                                    </div>
                                )}
                                {supplier.website && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Globe className="h-4 w-4" />
                                        <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate">
                                            {supplier.website}
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">
                                    ID: {supplier.id}
                                </span>
                                <span className="text-xs font-medium text-primary group-hover:underline">
                                    Ver detalles →
                                </span>
                            </div>
                        </div>
                    ))}

                    {filteredSuppliers.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            No se encontraron proveedores
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

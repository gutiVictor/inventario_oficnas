import { useQuery } from '@tanstack/react-query';
import { usersAPI } from '../services/api';
import { Users as UsersIcon, Search, Filter, Mail, Briefcase, Building, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import UserForm from '../components/forms/UserForm';
import Button from '../components/ui/Button';

export default function Users() {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['users', { search }],
        queryFn: () => usersAPI.getAll(),
    });

    const users = Array.isArray(data?.data?.data) ? data.data.data : (Array.isArray(data?.data) ? data.data : []);

    const filteredUsers = users.filter((user: any) =>
        user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.department?.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (user: any) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
            try {
                await usersAPI.delete(id);
                refetch();
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Error al eliminar el usuario');
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Usuarios
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Gestión de empleados y usuarios del sistema
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <UsersIcon className="h-4 w-4 mr-2" />
                    Nuevo Usuario
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o departamento..."
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
                        Error al cargar los usuarios. Por favor, intenta de nuevo.
                    </p>
                </div>
            ) : (
                <div className="rounded-lg border border-border bg-card">
                    <table className="w-full">
                        <thead className="border-b border-border">
                            <tr className="text-sm text-muted-foreground">
                                <th className="text-left p-4 font-medium">Nombre</th>
                                <th className="text-left p-4 font-medium">Contacto</th>
                                <th className="text-left p-4 font-medium">Departamento</th>
                                <th className="text-left p-4 font-medium">Cargo</th>
                                <th className="text-left p-4 font-medium">Estado</th>
                                <th className="text-right p-4 font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.map((user: any) => (
                                <tr
                                    key={user.id}
                                    className="text-sm text-foreground hover:bg-accent/50 cursor-pointer transition-colors"
                                >
                                    <td className="p-4">
                                        <div className="font-medium">{user.full_name}</div>
                                        <div className="text-xs text-muted-foreground">ID: {user.employee_id || user.id}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3 w-3 text-muted-foreground" />
                                            <span>{user.email}</span>
                                        </div>
                                        {user.phone && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {user.phone}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Building className="h-3 w-3 text-muted-foreground" />
                                            <span>{user.department || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-3 w-3 text-muted-foreground" />
                                            <span>{user.job_title || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${user.status === 'active'
                                                ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                                                : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                                                }`}
                                        >
                                            {user.status || 'active'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No se encontraron usuarios
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <UserForm
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                    refetch();
                }}
                userToEdit={editingUser}
            />
        </div>
    );
}

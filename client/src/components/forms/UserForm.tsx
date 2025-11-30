import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '../../services/api';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
    userToEdit?: any;
}

export default function UserForm({ isOpen, onClose, userToEdit }: UserFormProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        department: '',
        job_title: '',
        employee_id: '',
        status: 'active',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                full_name: userToEdit.full_name || '',
                email: userToEdit.email || '',
                phone: userToEdit.phone || '',
                department: userToEdit.department || '',
                job_title: userToEdit.job_title || '',
                employee_id: userToEdit.employee_id || '',
                status: userToEdit.status || 'active',
            });
        } else {
            setFormData({
                full_name: '',
                email: '',
                phone: '',
                department: '',
                job_title: '',
                employee_id: '',
                status: 'active',
            });
        }
        setError('');
    }, [userToEdit, isOpen]);

    const mutation = useMutation({
        mutationFn: (data: any) => {
            if (userToEdit) {
                return usersAPI.update(userToEdit.id, data);
            }
            return usersAPI.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Error al guardar el usuario');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={userToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                        {error}
                    </div>
                )}

                <Input
                    label="Nombre Completo"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Juan Pérez"
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="juan@empresa.com"
                    />
                    <Input
                        label="Teléfono"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+57 300 123 4567"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Departamento"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="Ej: TI, Ventas"
                    />
                    <Input
                        label="Cargo"
                        name="job_title"
                        value={formData.job_title}
                        onChange={handleChange}
                        placeholder="Ej: Desarrollador"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="ID Empleado"
                        name="employee_id"
                        value={formData.employee_id}
                        onChange={handleChange}
                        placeholder="Ej: EMP-001"
                    />
                    <Select
                        label="Estado"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        options={[
                            { value: 'active', label: 'Activo' },
                            { value: 'inactive', label: 'Inactivo' },
                        ]}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" isLoading={mutation.isPending}>
                        {userToEdit ? 'Actualizar' : 'Guardar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

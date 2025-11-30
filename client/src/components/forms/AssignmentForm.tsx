import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignmentsAPI, assetsAPI, usersAPI } from '../../services/api';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface AssignmentFormProps {
    isOpen: boolean;
    onClose: () => void;
    assignmentToEdit?: any;
}

export default function AssignmentForm({ isOpen, onClose, assignmentToEdit }: AssignmentFormProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        asset_id: '',
        user_id: '',
        assigned_date: new Date().toISOString().split('T')[0],
        expected_return_date: '',
        notes: '',
        status: 'active',
        created_by: 1, // TODO: Get from auth context
    });
    const [error, setError] = useState('');

    // Fetch assets and users for dropdowns
    const { data: assetsData } = useQuery({
        queryKey: ['assets'],
        queryFn: () => assetsAPI.getAll(),
    });

    const { data: usersData } = useQuery({
        queryKey: ['users'],
        queryFn: () => usersAPI.getAll(),
    });

    const assets = Array.isArray(assetsData?.data?.data) ? assetsData.data.data : (Array.isArray(assetsData?.data) ? assetsData.data : []);
    const users = Array.isArray(usersData?.data?.data) ? usersData.data.data : (Array.isArray(usersData?.data) ? usersData.data : []);

    // Filter only active/available assets (not already assigned)
    const availableAssets = assets.filter((asset: any) => asset.status === 'active');

    useEffect(() => {
        if (assignmentToEdit) {
            setFormData({
                asset_id: assignmentToEdit.asset_id || '',
                user_id: assignmentToEdit.user_id || '',
                assigned_date: assignmentToEdit.assigned_date ? new Date(assignmentToEdit.assigned_date).toISOString().split('T')[0] : '',
                expected_return_date: assignmentToEdit.expected_return_date ? new Date(assignmentToEdit.expected_return_date).toISOString().split('T')[0] : '',
                notes: assignmentToEdit.notes || '',
                status: assignmentToEdit.status || 'active',
                created_by: 1,
            });
        } else {
            setFormData({
                asset_id: '',
                user_id: '',
                assigned_date: new Date().toISOString().split('T')[0],
                expected_return_date: '',
                notes: '',
                status: 'active',
                created_by: 1,
            });
        }
        setError('');
    }, [assignmentToEdit, isOpen]);

    const mutation = useMutation({
        mutationFn: (data: any) => {
            if (assignmentToEdit) {
                return assignmentsAPI.update(assignmentToEdit.id, data);
            }
            return assignmentsAPI.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Error al guardar la asignación');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={assignmentToEdit ? 'Editar Asignación' : 'Nueva Asignación'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                        {error}
                    </div>
                )}

                <Select
                    label="Activo"
                    name="asset_id"
                    value={formData.asset_id}
                    onChange={handleChange}
                    required
                    options={[
                        { value: '', label: 'Seleccionar activo...' },
                        ...availableAssets.map((asset: any) => ({
                            value: asset.id.toString(),
                            label: `${asset.name} (${asset.asset_tag})`,
                        })),
                    ]}
                />

                <Select
                    label="Empleado"
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    required
                    options={[
                        { value: '', label: 'Seleccionar empleado...' },
                        ...users.map((user: any) => ({
                            value: user.id.toString(),
                            label: `${user.full_name} - ${user.department}`,
                        })),
                    ]}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Fecha de Asignación"
                        name="assigned_date"
                        type="date"
                        value={formData.assigned_date}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Fecha Retorno Esperada"
                        name="expected_return_date"
                        type="date"
                        value={formData.expected_return_date}
                        onChange={handleChange}
                    />
                </div>

                {assignmentToEdit && (
                    <Select
                        label="Estado"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        options={[
                            { value: 'active', label: 'Activo' },
                            { value: 'returned', label: 'Retornado' },
                        ]}
                    />
                )}

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Notas
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Notas adicionales sobre la asignación..."
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" isLoading={mutation.isPending}>
                        {assignmentToEdit ? 'Actualizar' : 'Guardar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { maintenanceAPI, assetsAPI, usersAPI } from '../../services/api';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface MaintenanceFormProps {
    isOpen: boolean;
    onClose: () => void;
    orderToEdit?: any;
}

export default function MaintenanceForm({ isOpen, onClose, orderToEdit }: MaintenanceFormProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        asset_id: '',
        type: 'preventive',
        status: 'scheduled',
        planned_date: new Date().toISOString().split('T')[0],
        start_date: '',
        end_date: '',
        cost_parts: '',
        cost_labor: '',
        technician_id: '',
        notes: '',
        created_by: 1, // TODO: Get from auth context
    });
    const [error, setError] = useState('');

    // Fetch assets and users (technicians) for dropdowns
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

    useEffect(() => {
        if (orderToEdit) {
            setFormData({
                asset_id: orderToEdit.asset_id || '',
                type: orderToEdit.type || 'preventive',
                status: orderToEdit.status || 'scheduled',
                planned_date: orderToEdit.planned_date ? new Date(orderToEdit.planned_date).toISOString().split('T')[0] : '',
                start_date: orderToEdit.start_date ? new Date(orderToEdit.start_date).toISOString().split('T')[0] : '',
                end_date: orderToEdit.end_date ? new Date(orderToEdit.end_date).toISOString().split('T')[0] : '',
                cost_parts: orderToEdit.cost_parts || '',
                cost_labor: orderToEdit.cost_labor || '',
                technician_id: orderToEdit.technician_id || '',
                notes: orderToEdit.notes || '',
                created_by: 1,
            });
        } else {
            setFormData({
                asset_id: '',
                type: 'preventive',
                status: 'scheduled',
                planned_date: new Date().toISOString().split('T')[0],
                start_date: '',
                end_date: '',
                cost_parts: '',
                cost_labor: '',
                technician_id: '',
                notes: '',
                created_by: 1,
            });
        }
        setError('');
    }, [orderToEdit, isOpen]);

    const mutation = useMutation({
        mutationFn: (data: any) => {
            if (orderToEdit) {
                return maintenanceAPI.update(orderToEdit.id, data);
            }
            return maintenanceAPI.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenance'] });
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Error al guardar la orden de mantenimiento');
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
            title={orderToEdit ? 'Editar Orden de Mantenimiento' : 'Nueva Orden de Mantenimiento'}
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
                        ...assets.map((asset: any) => ({
                            value: asset.id.toString(),
                            label: `${asset.name} (${asset.asset_tag})`,
                        })),
                    ]}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Tipo de Mantenimiento"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                        options={[
                            { value: 'preventive', label: 'Preventivo' },
                            { value: 'corrective', label: 'Correctivo' },
                            { value: 'upgrade', label: 'Actualización' },
                        ]}
                    />
                    <Select
                        label="Estado"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        options={[
                            { value: 'scheduled', label: 'Programado' },
                            { value: 'in_progress', label: 'En Progreso' },
                            { value: 'completed', label: 'Completado' },
                            { value: 'cancelled', label: 'Cancelado' },
                        ]}
                    />
                </div>

                <Select
                    label="Técnico Asignado"
                    name="technician_id"
                    value={formData.technician_id}
                    onChange={handleChange}
                    options={[
                        { value: '', label: 'Sin asignar' },
                        ...users.map((user: any) => ({
                            value: user.id.toString(),
                            label: `${user.full_name} - ${user.department}`,
                        })),
                    ]}
                />

                <div className="grid grid-cols-3 gap-4">
                    <Input
                        label="Fecha Planificada"
                        name="planned_date"
                        type="date"
                        value={formData.planned_date}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Fecha Inicio"
                        name="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={handleChange}
                    />
                    <Input
                        label="Fecha Fin"
                        name="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Costo Repuestos ($)"
                        name="cost_parts"
                        type="number"
                        step="0.01"
                        value={formData.cost_parts}
                        onChange={handleChange}
                        placeholder="0.00"
                    />
                    <Input
                        label="Costo Mano de Obra ($)"
                        name="cost_labor"
                        type="number"
                        step="0.01"
                        value={formData.cost_labor}
                        onChange={handleChange}
                        placeholder="0.00"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Notas
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Descripción del trabajo a realizar..."
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" isLoading={mutation.isPending}>
                        {orderToEdit ? 'Actualizar' : 'Guardar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

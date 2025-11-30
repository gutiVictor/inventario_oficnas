import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { movesAPI, assetsAPI, locationsAPI, usersAPI } from '../../services/api';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface MoveFormProps {
    isOpen: boolean;
    onClose: () => void;
    moveToEdit?: any;
}

export default function MoveForm({ isOpen, onClose, moveToEdit }: MoveFormProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        asset_id: '',
        from_location_id: '',
        to_location_id: '',
        moved_by: '',
        move_date: new Date().toISOString().split('T')[0],
        reason: '',
        created_by: 1, // TODO: Get from auth context
    });
    const [error, setError] = useState('');

    // Fetch assets, locations, and users for dropdowns
    const { data: assetsData } = useQuery({
        queryKey: ['assets'],
        queryFn: () => assetsAPI.getAll(),
    });

    const { data: locationsData } = useQuery({
        queryKey: ['locations'],
        queryFn: () => locationsAPI.getAll(),
    });

    const { data: usersData } = useQuery({
        queryKey: ['users'],
        queryFn: () => usersAPI.getAll(),
    });

    const assets = Array.isArray(assetsData?.data?.data) ? assetsData.data.data : (Array.isArray(assetsData?.data) ? assetsData.data : []);
    const locations = Array.isArray(locationsData?.data?.data) ? locationsData.data.data : (Array.isArray(locationsData?.data) ? locationsData.data : []);
    const users = Array.isArray(usersData?.data?.data) ? usersData.data.data : (Array.isArray(usersData?.data) ? usersData.data : []);

    useEffect(() => {
        if (moveToEdit) {
            setFormData({
                asset_id: moveToEdit.asset_id || '',
                from_location_id: moveToEdit.from_location_id || '',
                to_location_id: moveToEdit.to_location_id || '',
                moved_by: moveToEdit.moved_by || '',
                move_date: moveToEdit.move_date || new Date().toISOString().split('T')[0],
                reason: moveToEdit.reason || '',
                created_by: 1,
            });
        } else {
            setFormData({
                asset_id: '',
                from_location_id: '',
                to_location_id: '',
                moved_by: '',
                move_date: new Date().toISOString().split('T')[0],
                reason: '',
                created_by: 1,
            });
        }
        setError('');
    }, [moveToEdit, isOpen]);

    const mutation = useMutation({
        mutationFn: (data: any) => {
            if (moveToEdit) {
                return movesAPI.update(moveToEdit.id, data);
            }
            return movesAPI.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['moves'] });
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Error al guardar el movimiento');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: from and to locations must be different
        if (formData.from_location_id === formData.to_location_id) {
            setError('La ubicación de origen y destino deben ser diferentes');
            return;
        }

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
            title={moveToEdit ? 'Editar Movimiento' : 'Nuevo Movimiento'}
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
                        label="Desde Ubicación"
                        name="from_location_id"
                        value={formData.from_location_id}
                        onChange={handleChange}
                        required
                        options={[
                            { value: '', label: 'Seleccionar origen...' },
                            ...locations.map((location: any) => ({
                                value: location.id.toString(),
                                label: location.name,
                            })),
                        ]}
                    />
                    <Select
                        label="Hacia Ubicación"
                        name="to_location_id"
                        value={formData.to_location_id}
                        onChange={handleChange}
                        required
                        options={[
                            { value: '', label: 'Seleccionar destino...' },
                            ...locations.map((location: any) => ({
                                value: location.id.toString(),
                                label: location.name,
                            })),
                        ]}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Movido Por"
                        name="moved_by"
                        value={formData.moved_by}
                        onChange={handleChange}
                        required
                        options={[
                            { value: '', label: 'Seleccionar usuario...' },
                            ...users.map((user: any) => ({
                                value: user.id.toString(),
                                label: user.full_name,
                            })),
                        ]}
                    />
                    <Input
                        label="Fecha de Movimiento"
                        name="move_date"
                        type="date"
                        value={formData.move_date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Razón del Movimiento
                    </label>
                    <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Ej: Reubicación por cambio de departamento"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" isLoading={mutation.isPending}>
                        {moveToEdit ? 'Actualizar' : 'Guardar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

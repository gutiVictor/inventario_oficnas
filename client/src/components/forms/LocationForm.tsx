import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsAPI } from '../../services/api';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface LocationFormProps {
    isOpen: boolean;
    onClose: () => void;
    locationToEdit?: any;
}

export default function LocationForm({ isOpen, onClose, locationToEdit }: LocationFormProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        address: '',
        city: '',
        country: 'MX',
        active: true,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (locationToEdit) {
            setFormData({
                name: locationToEdit.name || '',
                code: locationToEdit.code || '',
                address: locationToEdit.address || '',
                city: locationToEdit.city || '',
                country: locationToEdit.country || 'MX',
                active: locationToEdit.active !== undefined ? locationToEdit.active : true,
            });
        } else {
            setFormData({
                name: '',
                code: '',
                address: '',
                city: '',
                country: 'MX',
                active: true,
            });
        }
        setError('');
    }, [locationToEdit, isOpen]);

    const mutation = useMutation({
        mutationFn: (data: any) => {
            const payload = {
                ...data,
                ...(locationToEdit ? { updated_by: 1 } : { created_by: 1 })
            };
            if (locationToEdit) {
                return locationsAPI.update(locationToEdit.id, payload);
            }
            return locationsAPI.create(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] });
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Error al guardar la ubicación');
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
            title={locationToEdit ? 'Editar Ubicación' : 'Nueva Ubicación'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                        {error}
                    </div>
                )}

                <Input
                    label="Nombre de la Sede"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Oficina Central"
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Código"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        required
                        placeholder="Ej: OC-001"
                    />
                    <Input
                        label="Ciudad"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        placeholder="Ej: Ciudad de México"
                    />
                </div>

                <Input
                    label="Dirección"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Ej: Av. Principal 123"
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="País"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        placeholder="Ej: MX"
                        maxLength={2}
                    />
                    <Select
                        label="Estado"
                        name="active"
                        value={formData.active ? 'true' : 'false'}
                        onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.value === 'true' }))}
                        options={[
                            { value: 'true', label: 'Activo' },
                            { value: 'false', label: 'Inactivo' },
                        ]}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" isLoading={mutation.isPending}>
                        {locationToEdit ? 'Actualizar' : 'Guardar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

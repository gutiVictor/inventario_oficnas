import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsAPI, categoriesAPI, locationsAPI, suppliersAPI } from '../../services/api';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface AssetFormProps {
    isOpen: boolean;
    onClose: () => void;
    assetToEdit?: any;
}

export default function AssetForm({ isOpen, onClose, assetToEdit }: AssetFormProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        asset_tag: '',
        name: '',
        brand: '',
        model: '',
        serial_number: '',
        category_id: '',
        location_id: '',
        supplier_id: '',
        status: 'active',
        condition: 'good',
        acquisition_date: '',
        acquisition_value: '',
        created_by: 1, // Hardcoded for now
    });
    const [error, setError] = useState('');

    // Fetch dependencies
    const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesAPI.getAll() });
    const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: () => locationsAPI.getAll() });
    const { data: suppliers } = useQuery({ queryKey: ['suppliers'], queryFn: () => suppliersAPI.getAll() });

    useEffect(() => {
        if (assetToEdit) {
            setFormData({
                ...assetToEdit,
                category_id: assetToEdit.category_id || '',
                location_id: assetToEdit.location_id || '',
                supplier_id: assetToEdit.supplier_id || '',
                acquisition_date: assetToEdit.acquisition_date ? new Date(assetToEdit.acquisition_date).toISOString().split('T')[0] : '',
            });
        } else {
            setFormData({
                asset_tag: '',
                name: '',
                brand: '',
                model: '',
                serial_number: '',
                category_id: '',
                location_id: '',
                supplier_id: '',
                status: 'active',
                condition: 'good',
                acquisition_date: new Date().toISOString().split('T')[0],
                acquisition_value: '',
                created_by: 1,
            });
        }
        setError('');
    }, [assetToEdit, isOpen]);

    const mutation = useMutation({
        mutationFn: (data: any) => {
            if (assetToEdit) {
                return assetsAPI.update(assetToEdit.id, data);
            }
            return assetsAPI.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Error al guardar el activo');
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

    // Extract data arrays handling different response structures
    const categoriesData = Array.isArray(categories?.data?.data) ? categories.data.data : (Array.isArray(categories?.data) ? categories.data : []);
    const locationsData = Array.isArray(locations?.data?.data) ? locations.data.data : (Array.isArray(locations?.data) ? locations.data : []);
    const suppliersData = Array.isArray(suppliers?.data?.data) ? suppliers.data.data : (Array.isArray(suppliers?.data) ? suppliers.data : []);

    const categoryOptions = [
        { value: '', label: 'Seleccionar categoría...' },
        ...categoriesData.map((c: any) => ({ value: c.id.toString(), label: c.name }))
    ];
    const locationOptions = [
        { value: '', label: 'Seleccionar ubicación...' },
        ...locationsData.map((l: any) => ({ value: l.id.toString(), label: l.name }))
    ];
    const supplierOptions = [
        { value: '', label: 'Seleccionar proveedor...' },
        ...suppliersData.map((s: any) => ({ value: s.id.toString(), label: s.name }))
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={assetToEdit ? 'Editar Activo' : 'Nuevo Activo'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Etiqueta (Tag)"
                        name="asset_tag"
                        value={formData.asset_tag}
                        onChange={handleChange}
                        required
                        placeholder="Ej: LAP-001"
                    />
                    <Input
                        label="Nombre"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Ej: Laptop Dell"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Marca"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                    />
                    <Input
                        label="Modelo"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                    />
                </div>

                <Input
                    label="Número de Serie"
                    name="serial_number"
                    value={formData.serial_number}
                    onChange={handleChange}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Categoría"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        options={categoryOptions}
                        required
                    />
                    <Select
                        label="Ubicación"
                        name="location_id"
                        value={formData.location_id}
                        onChange={handleChange}
                        options={locationOptions}
                        required
                    />
                </div>

                <Select
                    label="Proveedor"
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleChange}
                    options={supplierOptions}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Estado"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        options={[
                            { value: 'active', label: 'Activo' },
                            { value: 'in_storage', label: 'En Almacén' },
                            { value: 'maintenance', label: 'En Mantenimiento' },
                            { value: 'retired', label: 'Retirado' },
                        ]}
                    />
                    <Select
                        label="Condición"
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                        options={[
                            { value: 'new', label: 'Nuevo' },
                            { value: 'good', label: 'Bueno' },
                            { value: 'fair', label: 'Regular' },
                            { value: 'poor', label: 'Malo' },
                        ]}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Fecha Adquisición"
                        name="acquisition_date"
                        type="date"
                        value={formData.acquisition_date}
                        onChange={handleChange}
                    />
                    <Input
                        label="Valor"
                        name="acquisition_value"
                        type="number"
                        step="0.01"
                        value={formData.acquisition_value}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" isLoading={mutation.isPending}>
                        {assetToEdit ? 'Actualizar' : 'Guardar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

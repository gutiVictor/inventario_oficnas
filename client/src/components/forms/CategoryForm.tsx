import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesAPI } from '../../services/api';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface CategoryFormProps {
    isOpen: boolean;
    onClose: () => void;
    categoryToEdit?: any;
}

export default function CategoryForm({ isOpen, onClose, categoryToEdit }: CategoryFormProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: '',
        parent_id: '',
        active: true,
    });
    const [error, setError] = useState('');

    // Fetch categories for parent selection
    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoriesAPI.getAll(),
        enabled: isOpen, // Only fetch when modal is open
    });

    const categories = Array.isArray(categoriesData?.data?.data)
        ? categoriesData.data.data
        : (Array.isArray(categoriesData?.data) ? categoriesData.data : []);

    // Filter out current category to avoid self-parenting
    const parentOptions = categories
        .filter((cat: any) => !categoryToEdit || cat.id !== categoryToEdit.id)
        .map((cat: any) => ({
            value: cat.id.toString(),
            label: cat.name
        }));

    useEffect(() => {
        if (categoryToEdit) {
            setFormData({
                name: categoryToEdit.name || '',
                parent_id: categoryToEdit.parent_id ? categoryToEdit.parent_id.toString() : '',
                active: categoryToEdit.active !== undefined ? categoryToEdit.active : true,
            });
        } else {
            setFormData({
                name: '',
                parent_id: '',
                active: true,
            });
        }
        setError('');
    }, [categoryToEdit, isOpen]);

    const mutation = useMutation({
        mutationFn: (data: any) => {
            const payload = {
                ...data,
                parent_id: data.parent_id ? parseInt(data.parent_id) : null,
                ...(categoryToEdit ? { updated_by: 1 } : { created_by: 1 })
            };
            if (categoryToEdit) {
                return categoriesAPI.update(categoryToEdit.id, payload);
            }
            return categoriesAPI.create(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Error al guardar la categoría');
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
            title={categoryToEdit ? 'Editar Categoría' : 'Nueva Categoría'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                        {error}
                    </div>
                )}

                <Input
                    label="Nombre de la Categoría"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Laptops"
                />

                <Select
                    label="Categoría Padre (Opcional)"
                    name="parent_id"
                    value={formData.parent_id}
                    onChange={handleChange}
                    options={[
                        { value: '', label: 'Ninguna (Categoría Principal)' },
                        ...parentOptions
                    ]}
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

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" isLoading={mutation.isPending}>
                        {categoryToEdit ? 'Actualizar' : 'Guardar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersAPI } from '../../services/api';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface SupplierFormProps {
    isOpen: boolean;
    onClose: () => void;
    supplierToEdit?: any;
}

export default function SupplierForm({ isOpen, onClose, supplierToEdit }: SupplierFormProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: '',
        tax_id: '',
        email: '',
        phone: '',
        contact_person: '',
        active: true,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (supplierToEdit) {
            setFormData({
                name: supplierToEdit.name || '',
                tax_id: supplierToEdit.tax_id || '',
                email: supplierToEdit.email || '',
                phone: supplierToEdit.phone || '',
                contact_person: supplierToEdit.contact_person || '',
                active: supplierToEdit.active !== undefined ? supplierToEdit.active : true,
            });
        } else {
            setFormData({
                name: '',
                tax_id: '',
                email: '',
                phone: '',
                contact_person: '',
                active: true,
            });
        }
        setError('');
    }, [supplierToEdit, isOpen]);

    const mutation = useMutation({
        mutationFn: (data: any) => {
            const payload = {
                ...data,
                ...(supplierToEdit ? { updated_by: 1 } : { created_by: 1 })
            };
            if (supplierToEdit) {
                return suppliersAPI.update(supplierToEdit.id, payload);
            }
            return suppliersAPI.create(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Error al guardar el proveedor');
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
            title={supplierToEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                        {error}
                    </div>
                )}

                <Input
                    label="Nombre de la Empresa"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Ej: TecnoSoluciones S.A."
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="NIT / Tax ID"
                        name="tax_id"
                        value={formData.tax_id}
                        onChange={handleChange}
                        placeholder="Ej: 900.123.456-7"
                    />
                    <Input
                        label="Persona de Contacto"
                        name="contact_person"
                        value={formData.contact_person}
                        onChange={handleChange}
                        placeholder="Ej: Jorge Pérez"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="contacto@proveedor.com"
                    />
                    <Input
                        label="Teléfono"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+57 300 123 4567"
                    />
                </div>

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
                        {supplierToEdit ? 'Actualizar' : 'Guardar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

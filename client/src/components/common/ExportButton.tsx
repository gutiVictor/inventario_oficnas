import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import axios from 'axios';

interface ExportButtonProps {
    module: 'assets' | 'users' | 'categories' | 'suppliers' | 'dashboard';
    type: 'excel' | 'pdf';
    variant?: 'primary' | 'secondary';
}

const ExportButton: React.FC<ExportButtonProps> = ({ module, type, variant = 'secondary' }) => {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            let filename = '';

            if (type === 'excel') {
                endpoint = `http://localhost:3000/api/export/${module}/excel`;
                filename = `${module}_${new Date().toISOString().split('T')[0]}.xlsx`;
            } else {
                endpoint = `http://localhost:3000/api/export/${module}/pdf`;
                filename = `${module}_report_${new Date().toISOString().split('T')[0]}.pdf`;
            }

            const response = await axios.get(endpoint, {
                responseType: 'blob'
            });

            // Create blob link to download
            const blobType = type === 'excel'
                ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                : 'application/pdf';
            const url = window.URL.createObjectURL(new Blob([response.data], { type: blobType }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            // Small delay to ensure browser processes the download attribute
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

            // Success notification (you can replace this with your toast notification)
            console.log(`Exportación completada: ${filename}`);
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Error al exportar los datos. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const buttonStyles = variant === 'primary'
        ? 'bg-blue-600 hover:bg-blue-700 text-white'
        : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300';

    const Icon = type === 'excel' ? FileSpreadsheet : FileText;
    const label = type === 'excel' ? 'Excel' : 'PDF';

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyles}`}
        >
            {loading ? (
                <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Exportando...</span>
                </>
            ) : (
                <>
                    <Icon size={18} />
                    <span>Exportar {label}</span>
                </>
            )}
        </button>
    );
};

export default ExportButton;

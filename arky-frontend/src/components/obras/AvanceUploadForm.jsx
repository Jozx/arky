import React, { useState, useRef } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';

export default function AvanceUploadForm({ obraId, rubros, onUploadSuccess }) {
    const [selectedRubro, setSelectedRubro] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { addToast } = useToast();

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);

        // Validate total size (5MB)
        const totalSize = files.reduce((acc, file) => acc + file.size, 0);
        if (totalSize > 5 * 1024 * 1024) {
            addToast('El tamaño total de los archivos excede el límite de 5MB.', 'error');
            return;
        }

        setSelectedFiles(files);

        // Generate previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
    };

    const handleRemoveFile = (index) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]); // Cleanup
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRubro) {
            addToast('Por favor seleccione un rubro.', 'error');
            return;
        }
        if (selectedFiles.length === 0) {
            addToast('Por favor seleccione al menos una imagen.', 'error');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('rubro_id', selectedRubro);
        formData.append('descripcion', description);

        selectedFiles.forEach(file => {
            formData.append('images', file);
        });

        try {
            await api.post(`/obras/${obraId}/avances`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            addToast('Avance subido exitosamente.', 'success');

            // Reset form
            setSelectedRubro('');
            setDescription('');
            setSelectedFiles([]);
            setPreviews([]);
            if (fileInputRef.current) fileInputRef.current.value = '';

            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            console.error("Error uploading avance:", err);
            addToast('Error al subir el avance.', 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Upload className="h-5 w-5 mr-2 text-indigo-500" />
                Subir Avance
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rubro Selector */}
                <div>
                    <label htmlFor="rubro" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Seleccionar Rubro
                    </label>
                    <select
                        id="rubro"
                        required
                        className={clsx(
                            "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md",
                            selectedRubro === "" ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"
                        )}
                        value={selectedRubro}
                        onChange={(e) => setSelectedRubro(e.target.value)}
                    >
                        <option value="" disabled hidden>Seleccione un rubro...</option>
                        {rubros.map((rubro) => (
                            <option key={rubro.id} value={rubro.id}>
                                {rubro.descripcion}
                            </option>
                        ))}
                    </select>
                </div>

                {/* File Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Imágenes (Máx. 5MB total)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-indigo-500 transition-colors">
                        <div className="space-y-1 text-center">
                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                    <span>Subir archivos</span>
                                    <input
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        className="sr-only"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        ref={fileInputRef}
                                    />
                                </label>
                                <p className="pl-1">o arrastrar y soltar</p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                PNG, JPG, GIF hasta 5MB
                            </p>
                        </div>
                    </div>
                </div>

                {/* Previews */}
                {previews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {previews.map((url, index) => (
                            <div key={index} className="relative group aspect-w-1 aspect-h-1 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                <img src={url} alt={`Preview ${index}`} className="object-cover w-full h-full" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFile(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Descripción del Avance (Opcional)
                    </label>
                    <div className="mt-1">
                        <textarea
                            id="description"
                            rows={3}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2"
                            placeholder="Detalles sobre el progreso..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        disabled={uploading}
                        className={clsx(
                            "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                            uploading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {uploading ? 'Subiendo...' : 'Registrar Avance'}
                    </button>
                </div>
            </form>
        </div>
    );
}

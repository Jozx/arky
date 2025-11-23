import React, { useState } from 'react';
import { Calendar, User } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

export default function AvanceList({ groupedAvances }) {
    const [selectedImage, setSelectedImage] = useState(null);

    if (!groupedAvances || Object.keys(groupedAvances).length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No hay avances registrados para esta obra.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {Object.entries(groupedAvances).map(([rubroId, group]) => (
                <div key={rubroId} className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                            {group.rubro_descripcion}
                        </h3>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {group.avances.map((avance) => (
                                <div key={avance.id} className="group relative">
                                    <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                                        <img
                                            src={avance.image_url}
                                            alt={avance.descripcion || 'Avance de obra'}
                                            className="h-full w-full object-cover object-center group-hover:opacity-75 cursor-pointer transition-opacity"
                                            onClick={() => setSelectedImage(avance.image_url)}
                                        />
                                    </div>
                                    <div className="mt-2">
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {formatDate(avance.fecha_registro)}
                                            <span className="mx-1">•</span>
                                            <User className="h-3 w-3 mr-1" />
                                            {avance.uploaded_by_name}
                                        </div>
                                        {avance.descripcion && (
                                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                                {avance.descripcion}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-4xl w-full max-h-screen p-2">
                        <img
                            src={selectedImage}
                            alt="Full size"
                            className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                        />
                        <button
                            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
                            onClick={() => setSelectedImage(null)}
                        >
                            <span className="sr-only">Cerrar</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

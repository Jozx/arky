import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const colors = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
    textPrimary: 'text-indigo-600',
    borderFocus: 'focus:border-indigo-500 focus:ring-indigo-500',
};

export default function CreateObra() {
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        cliente_email: '',
        fecha_inicio_estimada: null,
        fecha_fin_estimada: null,
    });
    const [clients, setClients] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Cargar clientes al montar el componente
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await api.get('/users?rol=Cliente');
                setClients(response.data);
            } catch (err) {
                console.error('Error de conexión al cargar clientes', err);
            }
        };

        fetchClients();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const payload = {
                ...formData,
                fecha_inicio_estimada: formData.fecha_inicio_estimada ? formData.fecha_inicio_estimada.toISOString().split('T')[0] : null,
                fecha_fin_estimada: formData.fecha_fin_estimada ? formData.fecha_fin_estimada.toISOString().split('T')[0] : null,
            };

            await api.post('/obras', payload);

            setSuccess('Obra creada exitosamente.');
            setFormData({ nombre: '', direccion: '', cliente_email: '', fecha_inicio_estimada: null, fecha_fin_estimada: null });
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al crear la obra');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-200">
            <div className="max-w-2xl w-full p-8 space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl transition-colors duration-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Crear Nueva Obra</h2>
                    <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Volver</button>
                </div>

                {success && (
                    <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-200 px-4 py-3 rounded relative">
                        {success}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de la Obra</label>
                            <input
                                type="text"
                                required
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-lg ${colors.borderFocus} focus:outline-none sm:text-sm dark:bg-gray-700`}
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección</label>
                            <input
                                type="text"
                                required
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-lg ${colors.borderFocus} focus:outline-none sm:text-sm dark:bg-gray-700`}
                                value={formData.direccion}
                                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cliente</label>
                            <select
                                required
                                className={`mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg ${colors.borderFocus} focus:outline-none sm:text-sm`}
                                value={formData.cliente_email}
                                onChange={(e) => setFormData({ ...formData, cliente_email: e.target.value })}
                            >
                                <option value="">Seleccione un cliente</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.email}>
                                        {client.nombre} ({client.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Inicio Estimada</label>
                                <DatePicker
                                    selected={formData.fecha_inicio_estimada}
                                    onChange={(date) => setFormData({ ...formData, fecha_inicio_estimada: date })}
                                    dateFormat="yyyy-MM-dd"
                                    className={`mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-lg ${colors.borderFocus} focus:outline-none sm:text-sm dark:bg-gray-700`}
                                    wrapperClassName="w-full"
                                    placeholderText="Seleccionar fecha"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Fin Estimada</label>
                                <DatePicker
                                    selected={formData.fecha_fin_estimada}
                                    onChange={(date) => setFormData({ ...formData, fecha_fin_estimada: date })}
                                    dateFormat="yyyy-MM-dd"
                                    className={`mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-lg ${colors.borderFocus} focus:outline-none sm:text-sm dark:bg-gray-700`}
                                    wrapperClassName="w-full"
                                    placeholderText="Seleccionar fecha"
                                />
                            </div>
                        </div>
                    </div>

                    {error && <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${colors.primary}`}
                    >
                        {isLoading ? 'Creando...' : 'Crear Obra'}
                    </button>
                </form>
            </div>
        </div>
    );
}

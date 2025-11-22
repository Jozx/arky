import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import clsx from 'clsx';
import { Plus, Edit, Trash2, Save, X, Check, ChevronDown } from 'lucide-react';

export default function ObraDetails() {
    return (
        <MainLayout>
            <ObraDetailsContent />
        </MainLayout>
    );
}

function ObraDetailsContent() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [obra, setObra] = useState(null);
    const [presupuesto, setPresupuesto] = useState(null);
    const [rubros, setRubros] = useState([]);
    const [newRubro, setNewRubro] = useState({ descripcion: '', unidad_medida: '', cantidad_estimada: '', costo_unitario: '' });
    const [clientFeedback, setClientFeedback] = useState({});
    const [overallNotes, setOverallNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingRubro, setEditingRubro] = useState(null); // { id, descripcion, cantidad_estimada, costo_unitario }

    // Payment State
    const [activeTab, setActiveTab] = useState('presupuesto');
    const [payments, setPayments] = useState([]);
    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [newPayment, setNewPayment] = useState({ amountPaid: '', paymentDate: new Date().toISOString().split('T')[0], description: '' });

    // Calculations
    const totalGeneral = rubros.reduce((acc, curr) => acc + (curr.cantidad_estimada * curr.costo_unitario), 0);
    const totalPagado = payments.reduce((acc, curr) => acc + Number(curr.monto), 0);
    const saldoPendiente = totalGeneral - totalPagado;

    useEffect(() => {
        if (activeTab === 'pagos') {
            const fetchPayments = async () => {
                setPaymentsLoading(true);
                try {
                    const res = await api.get(`/obras/${id}/pagos`);
                    setPayments(res.data.data.payments);
                } catch (err) {
                    console.error("Error fetching payments:", err);
                } finally {
                    setPaymentsLoading(false);
                }
            };
            fetchPayments();
        }
    }, [id, activeTab]);

    const handleRegisterPayment = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/obras/${id}/pagos`, newPayment);
            setNewPayment({ amountPaid: '', paymentDate: new Date().toISOString().split('T')[0], description: '' });
            const res = await api.get(`/obras/${id}/pagos`);
            setPayments(res.data.data.payments);
            alert('Pago registrado exitosamente');
        } catch (err) {
            console.error("Error registering payment:", err);
            alert('Error al registrar el pago');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Obra
                const obraRes = await api.get(`/obras/${id}`);
                setObra(obraRes.data.data);

                // Fetch Presupuesto
                const presRes = await api.get(`/obras/${id}/presupuestos/latest`);
                // The API returns { status: 'success', data: { presupuesto: ..., rubros: ... } }
                const presData = presRes.data.data;
                setPresupuesto(presData.presupuesto);
                setRubros(presData.rubros);
                if (presData.presupuesto?.notas_generales) {
                    setOverallNotes(presData.presupuesto.notas_generales);
                }

                const initialFeedback = {};
                presData.rubros.forEach(r => {
                    if (r.observaciones) initialFeedback[r.id] = r.observaciones;
                });
                setClientFeedback(initialFeedback);

            } catch (err) {
                console.error("Error fetching data:", err);
                // Don't redirect immediately, just show error or empty state if needed
                // navigate('/dashboard'); 
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleCreatePresupuesto = async () => {
        try {
            await api.post(`/obras/${id}/presupuestos`);
            const presRes = await api.get(`/obras/${id}/presupuestos/latest`);
            setPresupuesto(presRes.data.data.presupuesto);
            setRubros(presRes.data.data.rubros);
        } catch (err) {
            console.error("Error creating presupuesto:", err);
        }
    };

    const handleAddRubro = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/presupuestos/${presupuesto.id}/rubros`, newRubro);
            setNewRubro({ descripcion: '', unidad_medida: '', cantidad_estimada: '', costo_unitario: '' });
            const presRes = await api.get(`/obras/${id}/presupuestos/latest`);
            setRubros(presRes.data.data.rubros);
        } catch (err) {
            console.error("Error adding rubro:", err);
        }
    };



    const handleStatusUpdate = async (status) => {
        if (!presupuesto) return;
        const rubroFeedbackArray = Object.entries(clientFeedback).map(([rid, text]) => ({
            id: parseInt(rid),
            observaciones: text
        }));

        try {
            await api.patch(`/presupuestos/${presupuesto.id}/status`, {
                status,
                overallNotes,
                rubroFeedback: rubroFeedbackArray
            });
            alert(`Presupuesto ${status} exitosamente.`);
            // Refresh
            const presRes = await api.get(`/obras/${id}/presupuestos/latest`);
            setPresupuesto(presRes.data.data.presupuesto);
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Error al actualizar el estado.");
        }
    };

    const handleUpdateRubroAvance = async (rubroId, field, value) => {
        try {
            const rubro = rubros.find(r => r.id === rubroId);

            // If changing estado to Terminado, auto-set porcentaje to 100
            let updatedEstado = field === 'estado' ? value : (rubro.avance_estado || 'No Iniciado');
            let updatedPorcentaje = field === 'porcentaje_avance' ? parseInt(value) : (rubro.porcentaje_avance || 0);

            if (field === 'estado' && value === 'Terminado') {
                updatedPorcentaje = 100;
            }

            // Optimistic update
            setRubros(prev => prev.map(r =>
                r.id === rubroId ? {
                    ...r,
                    avance_estado: updatedEstado,
                    porcentaje_avance: updatedPorcentaje
                } : r
            ));

            // Prepare payload
            const payload = {
                estado: updatedEstado,
                porcentaje_avance: updatedPorcentaje
            };

            await api.put(`/rubros/${rubroId}/avance`, payload);
        } catch (err) {
            console.error("Error updating rubro avance:", err);
            // Revert on error
            const presRes = await api.get(`/obras/${id}/presupuestos/latest`);
            setRubros(presRes.data.data.rubros);
        }
    };

    const handleDeleteRubro = async (rubroId) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este rubro? Esta acción no se puede deshacer.")) {
            return;
        }
        try {
            await api.delete(`/rubros/${rubroId}`);

            // Refresh data
            const presRes = await api.get(`/obras/${id}/presupuestos/latest`);
            setPresupuesto(presRes.data.data.presupuesto);
            setRubros(presRes.data.data.rubros);
        } catch (err) {
            console.error("Error deleting rubro:", err);
            alert("Error al eliminar el rubro.");
        }
    };

    const handleUpdateRubro = async (e) => {
        e.preventDefault();
        if (!editingRubro) return;
        try {
            await api.put(`/rubros/${editingRubro.id}`, {
                descripcion: editingRubro.descripcion,
                cantidad_estimada: editingRubro.cantidad_estimada,
                costo_unitario: editingRubro.costo_unitario
            });

            // Refresh data
            const presRes = await api.get(`/obras/${id}/presupuestos/latest`);
            setPresupuesto(presRes.data.data.presupuesto);
            setRubros(presRes.data.data.rubros);
            setEditingRubro(null); // Close modal
        } catch (err) {
            console.error("Error updating rubro:", err);
            alert("Error al actualizar el rubro.");
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando...</div>;
    if (!obra) return <div className="p-8 text-center">Obra no encontrada</div>;

    return (
        <div>
            <div className="mb-8">
                <button onClick={() => navigate('/dashboard')} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-4 flex items-center">
                    ← Volver al Dashboard
                </button>
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                            {obra.nombre}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                            {obra.direccion}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            {presupuesto && (
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('presupuesto')}
                            className={`${activeTab === 'presupuesto'
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Presupuesto
                        </button>
                        <button
                            onClick={() => setActiveTab('pagos')}
                            className={`${activeTab === 'pagos'
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Pagos
                        </button>
                    </nav>
                </div>
            )}

            {!presupuesto ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No hay presupuesto activo para esta obra.</p>
                    {user.rol === 'Arquitecto' && (
                        <button onClick={handleCreatePresupuesto} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Crear Presupuesto Inicial
                        </button>
                    )}
                </div>
            ) : activeTab === 'presupuesto' ? (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 shadow px-4 py-5 sm:rounded-lg sm:p-6 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Presupuesto (v{presupuesto.version_numero})</h2>
                        <span className={clsx(
                            "px-3 py-1 rounded-full text-sm font-medium",
                            presupuesto.estado === 'Aprobado' ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200" :
                                presupuesto.estado === 'Rechazado' ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200" :
                                    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
                        )}>
                            {presupuesto.estado}
                        </span>
                    </div>

                    {/* Rejection Handling */}
                    {presupuesto.estado === 'Rechazado' && (
                        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4 mb-6">
                            <div className="flex justify-between items-center">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400 dark:text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700 dark:text-red-200">
                                            Este presupuesto ha sido rechazado por el cliente.
                                        </p>
                                    </div>
                                </div>
                                {user.rol === 'Arquitecto' && (
                                    <button
                                        onClick={handleCreatePresupuesto}
                                        className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        Resubmitir Presupuesto (v{presupuesto.version_numero + 1})
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Add Rubro Form - Only visible in Borrador */}
                    {user.rol === 'Arquitecto' && presupuesto.estado === 'Borrador' && (
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Agregar Rubro</h3>
                                <form onSubmit={handleAddRubro} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                    <div className="sm:col-span-3">
                                        <input
                                            placeholder="Descripción"
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 border"
                                            value={newRubro.descripcion}
                                            onChange={e => setNewRubro({ ...newRubro, descripcion: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="sm:col-span-1">
                                        <select
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 border"
                                            value={newRubro.unidad_medida}
                                            onChange={e => setNewRubro({ ...newRubro, unidad_medida: e.target.value })}
                                            required
                                        >
                                            <option value="" disabled hidden>Unidad</option>
                                            <option value="m²">m² (metro cuadrado)</option>
                                            <option value="m³">m³ (metro cúbico)</option>
                                            <option value="kg">kg (kilogramo)</option>
                                            <option value="tn">tn (tonelada)</option>
                                            <option value="Un.">Un. (unidad)</option>
                                            <option value="m">m (metro lineal)</option>
                                            <option value="h">h (hora)</option>
                                            <option value="j">j (jornada)</option>
                                            <option value="kWh">kWh (kilovatio hora)</option>
                                            <option value="l">l (litro)</option>
                                            <option value="Gl">Gl (global)</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-1">
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Cantidad"
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 border"
                                            value={newRubro.cantidad_estimada}
                                            onChange={e => setNewRubro({ ...newRubro, cantidad_estimada: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="sm:col-span-1">
                                        <input
                                            type="text"
                                            placeholder="Costo (₲)"
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 border"
                                            value={newRubro.costo_unitario ? Number(newRubro.costo_unitario).toLocaleString('es-PY', { maximumFractionDigits: 0 }) : ''}
                                            onChange={e => {
                                                const value = e.target.value.replace(/\./g, '');
                                                if (value === '' || /^\d+$/.test(value)) {
                                                    setNewRubro({ ...newRubro, costo_unitario: value });
                                                }
                                            }}
                                            required
                                        />
                                    </div>
                                    <div className="sm:col-span-6">
                                        <button type="submit" className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                            Agregar Rubro
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Rubros Table */}
                    <div className="flex flex-col">
                        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                <div className="shadow overflow-hidden border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unidad</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cant.</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unitario</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                                                {presupuesto.estado === 'Aprobado' && (
                                                    <>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avance</th>
                                                    </>
                                                )}
                                                {user.rol === 'Cliente' && presupuesto.estado !== 'Aprobado' && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Observaciones</th>}
                                                {user.rol === 'Arquitecto' && (presupuesto.estado === 'Borrador' || presupuesto.estado === 'Rechazado') && (
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {rubros.map((rubro) => (
                                                <tr key={rubro.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{rubro.descripcion}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{rubro.unidad_medida}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{rubro.cantidad_estimada}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">₲ {Number(rubro.costo_unitario).toLocaleString('es-PY', { maximumFractionDigits: 0 })}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-bold">₲ {(rubro.cantidad_estimada * rubro.costo_unitario).toLocaleString('es-PY', { maximumFractionDigits: 0 })}</td>

                                                    {presupuesto.estado === 'Aprobado' && (
                                                        <>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                {user.rol === 'Arquitecto' ? (
                                                                    <select
                                                                        value={rubro.avance_estado || 'No Iniciado'}
                                                                        onChange={(e) => handleUpdateRubroAvance(rubro.id, 'estado', e.target.value)}
                                                                        className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                                    >
                                                                        <option value="No Iniciado">No Iniciado</option>
                                                                        <option value="En Proceso">En Proceso</option>
                                                                        <option value="Terminado">Terminado</option>
                                                                        <option value="Bloqueado">Bloqueado</option>
                                                                    </select>
                                                                ) : (
                                                                    <span className={clsx(
                                                                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                                                        rubro.avance_estado === 'Terminado' ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200" :
                                                                            rubro.avance_estado === 'En Proceso' ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200" :
                                                                                rubro.avance_estado === 'Bloqueado' ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200" :
                                                                                    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                                                    )}>
                                                                        {rubro.avance_estado || 'No Iniciado'}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                {user.rol === 'Arquitecto' ? (
                                                                    <select
                                                                        value={rubro.porcentaje_avance || 0}
                                                                        onChange={(e) => handleUpdateRubroAvance(rubro.id, 'porcentaje_avance', e.target.value)}
                                                                        disabled={rubro.avance_estado === 'Terminado'}
                                                                        className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        <option value="0">0%</option>
                                                                        <option value="25">25%</option>
                                                                        <option value="50">50%</option>
                                                                        <option value="75">75%</option>
                                                                        <option value="100">100%</option>
                                                                    </select>
                                                                ) : (
                                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 min-w-[100px]">
                                                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${rubro.porcentaje_avance || 0}%` }}></div>
                                                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block text-right">{rubro.porcentaje_avance || 0}%</span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </>
                                                    )}

                                                    {user.rol === 'Cliente' && presupuesto.estado !== 'Aprobado' && (
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {rubro.observaciones || '-'}
                                                        </td>
                                                    )}

                                                    {user.rol === 'Arquitecto' && (presupuesto.estado === 'Borrador' || presupuesto.estado === 'Rechazado') && (
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex items-center space-x-3">
                                                                <button onClick={() => setEditingRubro(rubro)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" title="Editar">
                                                                    <Edit className="h-5 w-5" />
                                                                </button>
                                                                <button onClick={() => handleDeleteRubro(rubro.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Eliminar">
                                                                    <Trash2 className="h-5 w-5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Total General Card */}
                        <div className="mt-4 bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
                            <div className="px-4 py-5 sm:p-6">
                                <dl>
                                    <div className="flex justify-between items-center">
                                        <dt className="text-lg font-medium text-gray-500 dark:text-gray-400">Total General</dt>
                                        <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                                            ₲ {rubros.reduce((acc, curr) => acc + (curr.cantidad_estimada * curr.costo_unitario), 0).toLocaleString('es-PY', { maximumFractionDigits: 0 })}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Revision Final Section */}
                        {user.rol === 'Cliente' && presupuesto.estado !== 'Aprobado' && (
                            <div className="mt-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Revisión Final</h3>
                                    <div className="max-w-xl">
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notas Generales</label>
                                        <div className="mt-1">
                                            <textarea
                                                id="notes"
                                                rows={3}
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2"
                                                placeholder="Comentarios generales sobre el presupuesto..."
                                                value={overallNotes}
                                                onChange={(e) => setOverallNotes(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-5 flex gap-4">
                                        <button
                                            onClick={() => handleStatusUpdate('Aprobado')}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            Aprobar Presupuesto
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate('Rechazado')}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            Rechazar / Devolver
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <EditRubroModal
                            rubro={editingRubro}
                            onClose={() => setEditingRubro(null)}
                            onSave={handleUpdateRubro}
                            setRubro={setEditingRubro}
                        />
                    </div>
                </div>
            ) : (
                /* Payment Tab Content */
                <div className="space-y-6">
                    {/* Summary Panel */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total de la Obra</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                                    ₲ {totalGeneral.toLocaleString('es-PY', { maximumFractionDigits: 0 })}
                                </dd>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Pagado Acumulado</dt>
                                <dd className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-400">
                                    ₲ {totalPagado.toLocaleString('es-PY', { maximumFractionDigits: 0 })}
                                </dd>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Saldo Pendiente</dt>
                                <dd className="mt-1 text-3xl font-semibold text-red-600 dark:text-red-400">
                                    ₲ {saldoPendiente.toLocaleString('es-PY', { maximumFractionDigits: 0 })}
                                </dd>
                            </div>
                        </div>
                    </div>

                    {/* Payment Registration Form (Architect Only) */}
                    {user.rol === 'Arquitecto' && presupuesto.estado === 'Aprobado' && (
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Registrar Nuevo Pago</h3>
                                <form onSubmit={handleRegisterPayment} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                    <div className="sm:col-span-2">
                                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monto Pagado</label>
                                        <input
                                            type="text"
                                            name="amount"
                                            id="amount"
                                            className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 border"
                                            value={newPayment.amountPaid ? Number(newPayment.amountPaid).toLocaleString('es-PY', { maximumFractionDigits: 0 }) : ''}
                                            onChange={e => {
                                                const val = e.target.value.replace(/\./g, '');
                                                if (/^\d*$/.test(val)) setNewPayment({ ...newPayment, amountPaid: val });
                                            }}
                                            required
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Pago</label>
                                        <input
                                            type="date"
                                            name="date"
                                            id="date"
                                            className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 border"
                                            value={newPayment.paymentDate}
                                            onChange={e => setNewPayment({ ...newPayment, paymentDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                                        <input
                                            type="text"
                                            name="description"
                                            id="description"
                                            className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 border"
                                            value={newPayment.description}
                                            onChange={e => setNewPayment({ ...newPayment, description: e.target.value })}
                                            placeholder="Ej. Primer desembolso"
                                        />
                                    </div>
                                    <div className="sm:col-span-6">
                                        <button type="submit" className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                            Registrar Pago
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Payment History List */}
                    <div className="flex flex-col">
                        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                <div className="shadow overflow-hidden border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Registrado Por</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {paymentsLoading ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Cargando pagos...</td>
                                                </tr>
                                            ) : payments.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No hay pagos registrados.</td>
                                                </tr>
                                            ) : (
                                                payments.map((payment) => (
                                                    <tr key={payment.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {new Date(payment.fecha_pago).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                            {payment.descripcion || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            ₲ {Number(payment.monto).toLocaleString('es-PY', { maximumFractionDigits: 0 })}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {payment.registrado_por || 'Desconocido'}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function EditRubroModal({ rubro, onClose, onSave, setRubro }) {
    if (!rubro) return null;

    return (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">Editar Rubro</h3>
                        <div className="mt-2">
                            <form onSubmit={onSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={rubro.descripcion}
                                        onChange={e => setRubro({ ...rubro, descripcion: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={rubro.cantidad_estimada}
                                        onChange={e => setRubro({ ...rubro, cantidad_estimada: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Costo Unitario (₲)</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={rubro.costo_unitario}
                                        onChange={e => setRubro({ ...rubro, costo_unitario: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                        onClick={onClose}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

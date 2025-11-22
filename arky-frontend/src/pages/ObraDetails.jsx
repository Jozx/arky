import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import clsx from 'clsx';
import { Plus, Edit, Trash2, Save, X, Check, ChevronDown } from 'lucide-react';
import ConfirmationModal from '../components/ui/ConfirmationModal';

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
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [obra, setObra] = useState(null);
    const [presupuesto, setPresupuesto] = useState(null);
    const [rubros, setRubros] = useState([]);
    const [newRubro, setNewRubro] = useState({ descripcion: '', unidad_medida: '', cantidad_estimada: '', costo_unitario: '' });
    const [clientFeedback, setClientFeedback] = useState({});
    const [overallNotes, setOverallNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingRubroId, setEditingRubroId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        descripcion: '',
        unidad_medida: '',
        cantidad_estimada: '',
        costo_unitario: ''
    }); // { id, descripcion, cantidad_estimada, costo_unitario }

    // Payment State
    const [activeTab, setActiveTab] = useState('presupuesto');
    const [payments, setPayments] = useState([]);
    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [newPayment, setNewPayment] = useState({ amountPaid: '', paymentDate: new Date().toISOString().split('T')[0], description: '' });
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [editingPaymentId, setEditingPaymentId] = useState(null);
    const [editPaymentFormData, setEditPaymentFormData] = useState({ monto: '', fecha_pago: '', descripcion: '' });
    const [showFinalizeModal, setShowFinalizeModal] = useState(false);

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

        // Validate that total payments don't exceed budget total
        const newAmount = Number(newPayment.amountPaid);
        if (totalPagado + newAmount > totalGeneral) {
            addToast(`El monto total de pagos (₲ ${(totalPagado + newAmount).toLocaleString('es-PY')}) excedería el total del presupuesto (₲ ${totalGeneral.toLocaleString('es-PY')})`, 'error');
            return;
        }

        try {
            await api.post(`/obras/${id}/pagos`, newPayment);
            setNewPayment({ amountPaid: '', paymentDate: new Date().toISOString().split('T')[0], description: '' });
            const res = await api.get(`/obras/${id}/pagos`);
            setPayments(res.data.data.payments);
            addToast('Pago registrado exitosamente', 'success');
        } catch (err) {
            console.error("Error registering payment:", err);
            addToast('Error al registrar el pago', 'error');
        }
    };

    const handleEditPayment = (payment) => {
        setEditingPaymentId(payment.id);
        setEditPaymentFormData({
            monto: payment.monto,
            fecha_pago: payment.fecha_pago.split('T')[0],
            descripcion: payment.descripcion || ''
        });
    };

    const handleCancelEditPayment = () => {
        setEditingPaymentId(null);
    };

    const handleSavePayment = async (paymentId) => {
        try {
            await api.put(`/pagos/${paymentId}`, editPaymentFormData);
            const res = await api.get(`/obras/${id}/pagos`);
            setPayments(res.data.data.payments);
            setEditingPaymentId(null);
            addToast('Pago actualizado exitosamente', 'success');
        } catch (err) {
            console.error("Error updating payment:", err);
            addToast('Error al actualizar el pago', 'error');
        }
    };

    const handleDeletePayment = async (paymentId) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este pago?")) {
            return;
        }
        try {
            await api.delete(`/pagos/${paymentId}`);
            const res = await api.get(`/obras/${id}/pagos`);
            setPayments(res.data.data.payments);
            addToast('Pago eliminado exitosamente', 'success');
        } catch (err) {
            console.error("Error deleting payment:", err);
            addToast('Error al eliminar el pago', 'error');
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
            addToast(`Presupuesto ${status} exitosamente.`, 'success');
            // Refresh
            const presRes = await api.get(`/obras/${id}/presupuestos/latest`);
            setPresupuesto(presRes.data.data.presupuesto);
        } catch (err) {
            console.error("Error updating status:", err);
            addToast("Error al actualizar el estado.", 'error');
        }
    };

    const handleFinalizeObra = async () => {
        try {
            await api.patch(`/obras/${id}/finalize`);
            addToast('Obra finalizada exitosamente', 'success');
            // Refresh obra data
            const obraRes = await api.get(`/obras/${id}`);
            setObra(obraRes.data.data);
            setShowFinalizeModal(false);
        } catch (err) {
            console.error("Error finalizing obra:", err);
            addToast('Error al finalizar la obra', 'error');
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
            addToast("Error al eliminar el rubro.", 'error');
        }
    };

    const handleEditClick = (rubro) => {
        setEditingRubroId(rubro.id);
        setEditFormData({
            descripcion: rubro.descripcion,
            unidad_medida: rubro.unidad_medida,
            cantidad_estimada: rubro.cantidad_estimada,
            costo_unitario: rubro.costo_unitario
        });
    };

    const handleCancelClick = () => {
        setEditingRubroId(null);
    };

    const handleSaveClick = async (id) => {
        try {
            await api.put(`/rubros/${id}`, {
                descripcion: editFormData.descripcion,
                unidad_medida: editFormData.unidad_medida,
                cantidad_estimada: editFormData.cantidad_estimada,
                costo_unitario: editFormData.costo_unitario
            });

            // Refresh data
            const presRes = await api.get(`/obras/${id}/presupuestos/latest`);
            setPresupuesto(presRes.data.data.presupuesto);
            setRubros(presRes.data.data.rubros);
            setEditingRubroId(null);
        } catch (err) {
            console.error("Error updating rubro:", err);
            addToast("Error al actualizar el rubro.", 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando datos...</p>
                </div>
            </div>
        );
    }
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
                        <div className="flex items-center space-x-4">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Presupuesto (v{presupuesto.version_numero})</h2>
                            <span className={clsx(
                                "px-3 py-1 rounded-full text-sm font-medium",
                                obra.status === 'Finalizada' ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200" :
                                    presupuesto.estado === 'Aprobado' ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200" :
                                        presupuesto.estado === 'Rechazado' ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200" :
                                            presupuesto.estado === 'Cancelado' ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" :
                                                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
                            )}>
                                {obra.status === 'Finalizada' ? 'Finalizada' : presupuesto.estado}
                            </span>
                        </div>
                        {user.rol === 'Arquitecto' && presupuesto.estado === 'Aprobado' && obra.status !== 'Finalizada' && (
                            <button
                                onClick={() => setShowFinalizeModal(true)}
                                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Finalizar Obra
                            </button>
                        )}
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
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => setShowCancelModal(true)}
                                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                        >
                                            Cancelar Presupuesto
                                        </button>
                                        <button
                                            onClick={handleCreatePresupuesto}
                                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            Reenviar Presupuesto (v{presupuesto.version_numero + 1})
                                        </button>
                                    </div>
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
                                            {rubros.map((rubro) => {
                                                const isEditing = editingRubroId === rubro.id;
                                                return (
                                                    <tr key={rubro.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-1 border"
                                                                    value={editFormData.descripcion}
                                                                    onChange={(e) => setEditFormData({ ...editFormData, descripcion: e.target.value })}
                                                                />
                                                            ) : (
                                                                rubro.descripcion
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {isEditing ? (
                                                                <select
                                                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-1 border"
                                                                    value={editFormData.unidad_medida}
                                                                    onChange={(e) => setEditFormData({ ...editFormData, unidad_medida: e.target.value })}
                                                                >
                                                                    <option value="m²">m²</option>
                                                                    <option value="m³">m³</option>
                                                                    <option value="kg">kg</option>
                                                                    <option value="tn">tn</option>
                                                                    <option value="Un.">Un.</option>
                                                                    <option value="m">m</option>
                                                                    <option value="h">h</option>
                                                                    <option value="j">j</option>
                                                                    <option value="kWh">kWh</option>
                                                                    <option value="l">l</option>
                                                                    <option value="Gl">Gl</option>
                                                                </select>
                                                            ) : (
                                                                rubro.unidad_medida
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {isEditing ? (
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-1 border"
                                                                    value={editFormData.cantidad_estimada}
                                                                    onChange={(e) => setEditFormData({ ...editFormData, cantidad_estimada: e.target.value })}
                                                                />
                                                            ) : (
                                                                rubro.cantidad_estimada
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-1 border"
                                                                    value={editFormData.costo_unitario ? Number(editFormData.costo_unitario).toLocaleString('es-PY', { maximumFractionDigits: 0 }) : ''}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value.replace(/\./g, '');
                                                                        if (/^\d*$/.test(val)) setEditFormData({ ...editFormData, costo_unitario: val });
                                                                    }}
                                                                />
                                                            ) : (
                                                                `₲ ${Number(rubro.costo_unitario).toLocaleString('es-PY', { maximumFractionDigits: 0 })}`
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-bold">
                                                            {isEditing ? (
                                                                `₲ ${(editFormData.cantidad_estimada * editFormData.costo_unitario).toLocaleString('es-PY', { maximumFractionDigits: 0 })}`
                                                            ) : (
                                                                `₲ ${(rubro.cantidad_estimada * rubro.costo_unitario).toLocaleString('es-PY', { maximumFractionDigits: 0 })}`
                                                            )}
                                                        </td>

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
                                                                    {isEditing ? (
                                                                        <>
                                                                            <button onClick={() => handleSaveClick(rubro.id)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300" title="Guardar">
                                                                                <Check className="h-5 w-5" />
                                                                            </button>
                                                                            <button onClick={handleCancelClick} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Cancelar">
                                                                                <X className="h-5 w-5" />
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <button onClick={() => handleEditClick(rubro)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" title="Editar">
                                                                                <Edit className="h-5 w-5" />
                                                                            </button>
                                                                            <button onClick={() => handleDeleteRubro(rubro.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Eliminar">
                                                                                <Trash2 className="h-5 w-5" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })}
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
                        {user.rol === 'Cliente' && presupuesto.estado === 'Borrador' && (
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
                                            max={new Date().toISOString().split('T')[0]}
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
                                                            {new Date(payment.fecha_pago).toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' })}
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
            <ConfirmationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={() => handleStatusUpdate('Cancelado')}
                title="Cancelar Presupuesto"
                message="¿Estás seguro de que deseas cancelar este presupuesto? Esta acción no se puede deshacer y el presupuesto quedará inhabilitado."
                confirmText="Sí, Cancelar"
                cancelText="No, Volver"
                type="danger"
            />
            <ConfirmationModal
                isOpen={showFinalizeModal}
                onClose={() => setShowFinalizeModal(false)}
                onConfirm={handleFinalizeObra}
                title="Finalizar Obra"
                message="¿Estás seguro de que deseas marcar esta obra como finalizada? Esta acción indica que todos los trabajos han sido completados."
                confirmText="Sí, Finalizar"
                cancelText="Cancelar"
                type="info"
            />
        </div>
    );
}



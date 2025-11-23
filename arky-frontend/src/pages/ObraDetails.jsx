import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import clsx from 'clsx';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import ObraHeader from '../components/obras/ObraHeader';
import RubroList from '../components/obras/RubroList';
import PaymentList from '../components/obras/PaymentList';
import useObra from '../hooks/useObra';

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

    // Use custom hook for data fetching
    const {
        obra,
        presupuesto,
        rubros,
        loading,
        setObra,
        setPresupuesto,
        setRubros,
        refreshPresupuesto,
        refreshObra
    } = useObra(id);

    const [newRubro, setNewRubro] = useState({ descripcion: '', unidad_medida: '', cantidad_estimada: '', costo_unitario: '' });
    const [clientFeedback, setClientFeedback] = useState({});
    const [overallNotes, setOverallNotes] = useState('');
    const [editingRubroId, setEditingRubroId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        descripcion: '',
        unidad_medida: '',
        cantidad_estimada: '',
        costo_unitario: ''
    });

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

    // Initialize feedback and notes when budget loads
    useEffect(() => {
        if (presupuesto) {
            if (presupuesto.notas_generales) {
                setOverallNotes(presupuesto.notas_generales);
            }
            const initialFeedback = {};
            rubros.forEach(r => {
                if (r.observaciones) initialFeedback[r.id] = r.observaciones;
            });
            setClientFeedback(initialFeedback);
        }
    }, [presupuesto, rubros]);

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

    const handleCreatePresupuesto = async () => {
        try {
            await api.post(`/obras/${id}/presupuestos`);
            refreshPresupuesto();
        } catch (err) {
            console.error("Error creating presupuesto:", err);
        }
    };

    const handleAddRubro = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/presupuestos/${presupuesto.id}/rubros`, newRubro);
            setNewRubro({ descripcion: '', unidad_medida: '', cantidad_estimada: '', costo_unitario: '' });
            refreshPresupuesto();
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
            refreshPresupuesto();
        } catch (err) {
            console.error("Error updating status:", err);
            addToast("Error al actualizar el estado.", 'error');
        }
    };

    const handleFinalizeObra = async () => {
        try {
            await api.patch(`/obras/${id}/finalize`);
            addToast('Obra finalizada exitosamente', 'success');
            refreshObra();
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
            refreshPresupuesto();
        }
    };

    const handleDeleteRubro = async (rubroId) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este rubro? Esta acción no se puede deshacer.")) {
            return;
        }
        try {
            await api.delete(`/rubros/${rubroId}`);
            refreshPresupuesto();
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
            refreshPresupuesto();
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
            <ObraHeader obra={obra} />

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
                                            className={clsx(
                                                "shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md p-2 border",
                                                newRubro.unidad_medida === "" ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"
                                            )}
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
                    <RubroList
                        rubros={rubros}
                        presupuesto={presupuesto}
                        user={user}
                        editingRubroId={editingRubroId}
                        editFormData={editFormData}
                        setEditFormData={setEditFormData}
                        handleEditClick={handleEditClick}
                        handleSaveClick={handleSaveClick}
                        handleCancelClick={handleCancelClick}
                        handleDeleteRubro={handleDeleteRubro}
                        handleUpdateRubroAvance={handleUpdateRubroAvance}
                    />

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
            ) : (
                /* Payment Tab Content */
                <PaymentList
                    payments={payments}
                    totalGeneral={totalGeneral}
                    totalPagado={totalPagado}
                    saldoPendiente={saldoPendiente}
                    user={user}
                    presupuesto={presupuesto}
                    newPayment={newPayment}
                    setNewPayment={setNewPayment}
                    handleRegisterPayment={handleRegisterPayment}
                    editingPaymentId={editingPaymentId}
                    editPaymentFormData={editPaymentFormData}
                    setEditPaymentFormData={setEditPaymentFormData}
                    handleEditPayment={handleEditPayment}
                    handleSavePayment={handleSavePayment}
                    handleCancelEditPayment={handleCancelEditPayment}
                    handleDeletePayment={handleDeletePayment}
                />
            )}

            {/* Modals */}
            <ConfirmationModal
                isOpen={showCancelModal}
                title="Cancelar Presupuesto"
                message="¿Estás seguro de que deseas cancelar este presupuesto? Esta acción no se puede deshacer."
                confirmText="Sí, cancelar"
                cancelText="No, volver"
                onConfirm={() => {
                    handleStatusUpdate('Cancelado');
                    setShowCancelModal(false);
                }}
                onCancel={() => setShowCancelModal(false)}
            />

            <ConfirmationModal
                isOpen={showFinalizeModal}
                title="Finalizar Obra"
                message="¿Estás seguro de que deseas finalizar esta obra? Esto indicará que todos los trabajos han concluido. Podrás seguir consultando la información, pero no se podrán realizar más cambios en el presupuesto."
                confirmText="Sí, finalizar obra"
                cancelText="Cancelar"
                onConfirm={handleFinalizeObra}
                onCancel={() => setShowFinalizeModal(false)}
            />
        </div>
    );
}

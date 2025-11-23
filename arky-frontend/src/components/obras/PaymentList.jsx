import React from 'react';
import { Edit, Trash2, Check, X } from 'lucide-react';

export default function PaymentList({
    payments,
    totalGeneral,
    totalPagado,
    saldoPendiente,
    user,
    presupuesto,
    newPayment,
    setNewPayment,
    handleRegisterPayment,
    editingPaymentId,
    editPaymentFormData,
    setEditPaymentFormData,
    handleEditPayment,
    handleSavePayment,
    handleCancelEditPayment,
    handleDeletePayment
}) {
    return (
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
                                <input
                                    type="text"
                                    placeholder="Monto (₲)"
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 border"
                                    value={newPayment.amountPaid ? Number(newPayment.amountPaid).toLocaleString('es-PY', { maximumFractionDigits: 0 }) : ''}
                                    onChange={e => {
                                        const value = e.target.value.replace(/\./g, '');
                                        if (value === '' || /^\d+$/.test(value)) {
                                            setNewPayment({ ...newPayment, amountPaid: value });
                                        }
                                    }}
                                    required
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <input
                                    type="date"
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 border"
                                    value={newPayment.paymentDate}
                                    onChange={e => setNewPayment({ ...newPayment, paymentDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <input
                                    type="text"
                                    placeholder="Descripción (opcional)"
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 border"
                                    value={newPayment.description}
                                    onChange={e => setNewPayment({ ...newPayment, description: e.target.value })}
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

            {/* Payment History Table */}
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
                                        {user.rol === 'Arquitecto' && (
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {payments.length === 0 ? (
                                        <tr>
                                            <td colSpan={user.rol === 'Arquitecto' ? 4 : 3} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                No hay pagos registrados.
                                            </td>
                                        </tr>
                                    ) : (
                                        payments.map((payment) => {
                                            const isEditing = editingPaymentId === payment.id;
                                            return (
                                                <tr key={payment.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {isEditing ? (
                                                            <input
                                                                type="date"
                                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-1 border"
                                                                value={editPaymentFormData.fecha_pago}
                                                                onChange={(e) => setEditPaymentFormData({ ...editPaymentFormData, fecha_pago: e.target.value })}
                                                            />
                                                        ) : (
                                                            new Date(payment.fecha_pago).toLocaleDateString('es-PY')
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-1 border"
                                                                value={editPaymentFormData.descripcion}
                                                                onChange={(e) => setEditPaymentFormData({ ...editPaymentFormData, descripcion: e.target.value })}
                                                            />
                                                        ) : (
                                                            payment.descripcion || '-'
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-1 border"
                                                                value={editPaymentFormData.monto ? Number(editPaymentFormData.monto).toLocaleString('es-PY', { maximumFractionDigits: 0 }) : ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value.replace(/\./g, '');
                                                                    if (/^\d*$/.test(val)) setEditPaymentFormData({ ...editPaymentFormData, monto: val });
                                                                }}
                                                            />
                                                        ) : (
                                                            `₲ ${Number(payment.monto).toLocaleString('es-PY', { maximumFractionDigits: 0 })}`
                                                        )}
                                                    </td>
                                                    {user.rol === 'Arquitecto' && (
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex items-center space-x-3">
                                                                {isEditing ? (
                                                                    <>
                                                                        <button onClick={() => handleSavePayment(payment.id)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300" title="Guardar">
                                                                            <Check className="h-5 w-5" />
                                                                        </button>
                                                                        <button onClick={handleCancelEditPayment} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Cancelar">
                                                                            <X className="h-5 w-5" />
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <button onClick={() => handleEditPayment(payment)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" title="Editar">
                                                                            <Edit className="h-5 w-5" />
                                                                        </button>
                                                                        <button onClick={() => handleDeletePayment(payment.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Eliminar">
                                                                            <Trash2 className="h-5 w-5" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

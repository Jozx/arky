import React from 'react';
import { Edit, Trash2, Save, X, Check } from 'lucide-react';
import clsx from 'clsx';

export default function RubroList({
    rubros,
    presupuesto,
    user,
    editingRubroId,
    editFormData,
    setEditFormData,
    handleEditClick,
    handleSaveClick,
    handleCancelClick,
    handleDeleteRubro,
    handleUpdateRubroAvance
}) {
    return (
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
        </div>
    );
}

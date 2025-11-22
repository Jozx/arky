const rubroModel = require('../models/rubroModel');
const presupuestoModel = require('../models/presupuestoModel');
const obraModel = require('../models/obraModel');
const AppError = require('../utils/AppError');

class RubroService {
    /**
     * Verifica si el usuario tiene acceso a la obra.
     * @param {number} obraId 
     * @param {object} user 
     */
    async checkObraAccess(obraId, user) {
        const obra = await obraModel.findById(obraId);

        if (!obra) {
            throw new AppError('Obra no encontrada.', 404);
        }

        // El usuario debe ser el arquitecto/encargado o el cliente de esta obra
        if (user.rol === 'Cliente' && user.id !== obra.cliente_id) {
            throw new AppError('No autorizado para acceder a esta obra.', 403);
        }

        return obra;
    }

    async createRubro(presupuestoId, rubroData, user) {
        if (user.rol === 'Cliente') {
            throw new AppError('Solo el personal del estudio puede añadir rubros.', 403);
        }

        const { descripcion, cantidad_estimada, costo_unitario } = rubroData;

        if (!descripcion || !cantidad_estimada || !costo_unitario) {
            throw new AppError('Faltan campos obligatorios para el rubro: descripción, cantidad_estimada y costo_unitario.', 400);
        }

        const result = await presupuestoModel.findWithRubros(presupuestoId);

        if (!result) {
            throw new AppError('Presupuesto no encontrado.', 404);
        }

        const presupuesto = result.presupuesto;
        await this.checkObraAccess(presupuesto.obra_id, user);

        if (presupuesto.estado !== 'Borrador' && presupuesto.estado !== 'Negociación') {
            throw new AppError(`No se pueden añadir rubros al presupuesto en estado: ${presupuesto.estado}.`, 400);
        }

        const nuevoRubro = await rubroModel.create(presupuestoId, rubroData);
        return nuevoRubro;
    }

    async updateRubroAvance(rubroId, avanceData, user) {
        if (user.rol === 'Cliente') {
            throw new AppError('Solo el personal del estudio puede actualizar el avance.', 403);
        }

        const { estado, porcentaje_avance } = avanceData;

        if (!estado || porcentaje_avance === undefined || porcentaje_avance === null) {
            throw new AppError('Faltan campos obligatorios: estado y porcentaje_avance.', 400);
        }

        const rubro = await rubroModel.findById(rubroId);

        if (!rubro) {
            throw new AppError('Rubro no encontrado.', 404);
        }

        const result = await presupuestoModel.findWithRubros(rubro.presupuesto_id);

        if (!result) {
            throw new AppError('El presupuesto asociado a este rubro no existe.', 404);
        }

        await this.checkObraAccess(result.presupuesto.obra_id, user);

        const avanceActualizado = await rubroModel.updateAvance(rubroId, estado, porcentaje_avance);
        return avanceActualizado;
    }

    async updateRubro(rubroId, rubroData, user) {
        if (user.rol === 'Cliente') {
            throw new AppError('Solo el personal del estudio puede modificar rubros.', 403);
        }

        const rubro = await rubroModel.findById(rubroId);
        if (!rubro) {
            throw new AppError('Rubro no encontrado.', 404);
        }

        const result = await presupuestoModel.findWithRubros(rubro.presupuesto_id);
        if (!result) {
            throw new AppError('Presupuesto no encontrado.', 404);
        }

        const presupuesto = result.presupuesto;
        // Allow editing in 'Borrador' or 'Rechazado' (for revisions)
        if (presupuesto.estado !== 'Borrador' && presupuesto.estado !== 'Rechazado') {
            throw new AppError(`No se puede editar rubros en estado: ${presupuesto.estado}.`, 400);
        }

        await this.checkObraAccess(presupuesto.obra_id, user);

        const rubroActualizado = await rubroModel.update(rubroId, rubroData);
        return rubroActualizado;
    }
    async deleteRubro(rubroId, user) {
        if (user.rol === 'Cliente') {
            throw new AppError('Solo el personal del estudio puede eliminar rubros.', 403);
        }

        const rubro = await rubroModel.findById(rubroId);
        if (!rubro) {
            throw new AppError('Rubro no encontrado.', 404);
        }

        const result = await presupuestoModel.findWithRubros(rubro.presupuesto_id);
        if (!result) {
            throw new AppError('Presupuesto no encontrado.', 404);
        }

        const presupuesto = result.presupuesto;
        // Allow deleting in 'Borrador' or 'Rechazado' (for revisions)
        if (presupuesto.estado !== 'Borrador' && presupuesto.estado !== 'Rechazado') {
            throw new AppError(`No se puede eliminar rubros en estado: ${presupuesto.estado}.`, 400);
        }

        await this.checkObraAccess(presupuesto.obra_id, user);

        const rubroEliminado = await rubroModel.deleteById(rubroId);
        return rubroEliminado;
    }
}

module.exports = new RubroService();

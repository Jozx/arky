const presupuestoModel = require('../models/presupuestoModel');
const obraModel = require('../models/obraModel');
const rubroModel = require('../models/rubroModel');
const AppError = require('../utils/AppError');

class PresupuestoService {
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

    async createPresupuesto(obraId, user) {
        if (user.rol === 'Cliente') {
            throw new AppError('Solo el personal del estudio puede crear presupuestos.', 403);
        }

        await this.checkObraAccess(obraId, user);

        const nuevoPresupuesto = await presupuestoModel.create(obraId);
        return nuevoPresupuesto;
    }

    async getLatestPresupuesto(obraId, user) {
        await this.checkObraAccess(obraId, user);

        const latestPresupuestoHeader = await presupuestoModel.findLatestByObraId(obraId);

        if (!latestPresupuestoHeader) {
            throw new AppError('No se encontró ningún presupuesto para esta obra.', 404);
        }

        const presupuestoCompleto = await presupuestoModel.findWithRubros(latestPresupuestoHeader.id);
        return presupuestoCompleto;
    }

    async updateStatus(presupuestoId, statusData, user) {
        const { status, overallNotes, rubroFeedback } = statusData;

        const result = await presupuestoModel.findWithRubros(presupuestoId);

        if (!result) {
            throw new AppError('Presupuesto no encontrado.', 404);
        }

        const presupuesto = result.presupuesto;
        await this.checkObraAccess(presupuesto.obra_id, user);

        if (user.rol === 'Cliente') {
            if (!['Aprobado', 'Rechazado'].includes(status)) {
                throw new AppError('Acción no válida para el cliente.', 400);
            }
        }

        if (overallNotes !== undefined) {
            await presupuestoModel.updateNotes(presupuestoId, overallNotes);
        }

        const updatedPresupuesto = await presupuestoModel.updateStatus(presupuestoId, status);

        if (rubroFeedback && Array.isArray(rubroFeedback)) {
            for (const item of rubroFeedback) {
                await rubroModel.updateObservaciones(item.id, item.observaciones);
            }
        }

        return updatedPresupuesto;
    }
}

module.exports = new PresupuestoService();

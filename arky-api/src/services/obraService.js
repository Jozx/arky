const obraModel = require('../models/obraModel');
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');

class ObraService {
    async createObra(obraData, user) {
        if (user.rol !== 'Arquitecto' && user.rol !== 'Encargado') {
            throw new AppError('Solo el personal del estudio puede crear obras.', 403);
        }

        const { nombre, direccion, cliente_email, fecha_inicio_estimada, fecha_fin_estimada } = obraData;

        if (!nombre || !direccion || !cliente_email || !fecha_inicio_estimada) {
            throw new AppError('Faltan campos obligatorios: nombre, dirección, email del cliente y fecha de inicio.', 400);
        }

        const cliente = await userModel.findByEmail(cliente_email);
        if (!cliente || cliente.rol !== 'Cliente') {
            throw new AppError('Cliente no encontrado o email no corresponde a un cliente.', 404);
        }

        const nuevaObra = await obraModel.create(
            nombre,
            direccion,
            user.id,
            cliente.id,
            fecha_inicio_estimada,
            fecha_fin_estimada
        );

        return nuevaObra;
    }

    async getObras(user) {
        const obras = await obraModel.findVisibleByUser(user.id, user.rol);
        return obras;
    }

    async getObraById(obraId, user) {
        const obra = await obraModel.findById(obraId);

        if (!obra) {
            throw new AppError('Obra no encontrada.', 404);
        }

        if (user.rol === 'Cliente' && user.id !== obra.cliente_id) {
            throw new AppError('No autorizado para ver esta obra.', 403);
        }

        return obra;
    }

    async finalizeObra(obraId, user) {
        // Only architects can finalize obras
        if (user.rol !== 'Arquitecto') {
            throw new AppError('Solo los arquitectos pueden finalizar obras.', 403);
        }

        const obra = await obraModel.findById(obraId);

        if (!obra) {
            throw new AppError('Obra no encontrada.', 404);
        }

        // Verify the architect owns this obra
        if (user.id !== obra.arquitecto_id) {
            throw new AppError('No autorizado para finalizar esta obra.', 403);
        }

        // Update obra status to 'Finalizada'
        const updatedObra = await obraModel.updateStatus(obraId, 'Finalizada');

        return updatedObra;
    }
}

module.exports = new ObraService();

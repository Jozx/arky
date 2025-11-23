import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function useObra(id) {
    const [obra, setObra] = useState(null);
    const [presupuesto, setPresupuesto] = useState(null);
    const [rubros, setRubros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToast } = useToast();

    const fetchObraData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch Obra
            const obraRes = await api.get(`/obras/${id}`);
            setObra(obraRes.data.data);

            // Fetch Presupuesto
            try {
                const presRes = await api.get(`/obras/${id}/presupuestos/latest`);
                const presData = presRes.data.data;

                if (presData) {
                    setPresupuesto(presData.presupuesto);
                    setRubros(presData.rubros);
                } else {
                    setPresupuesto(null);
                    setRubros([]);
                }
            } catch (presErr) {
                console.error("Error fetching presupuesto:", presErr);
                // If it's a real error (not 404), we might want to show it, 
                // but for now we just log it as the UI handles "no budget" state via null check
            }
        } catch (err) {
            console.error("Error fetching obra data:", err);
            setError(err);
            addToast("Error al cargar los datos de la obra", 'error');
        } finally {
            setLoading(false);
        }
    }, [id, addToast]);

    useEffect(() => {
        if (id) {
            fetchObraData();
        }
    }, [id, fetchObraData]);

    const refreshPresupuesto = async () => {
        try {
            const presRes = await api.get(`/obras/${id}/presupuestos/latest`);
            setPresupuesto(presRes.data.data.presupuesto);
            setRubros(presRes.data.data.rubros);
        } catch (err) {
            console.error("Error refreshing presupuesto:", err);
        }
    };

    const refreshObra = async () => {
        try {
            const obraRes = await api.get(`/obras/${id}`);
            setObra(obraRes.data.data);
        } catch (err) {
            console.error("Error refreshing obra:", err);
        }
    };

    return {
        obra,
        presupuesto,
        rubros,
        loading,
        error,
        setObra,
        setPresupuesto,
        setRubros,
        refreshPresupuesto,
        refreshObra
    };
}

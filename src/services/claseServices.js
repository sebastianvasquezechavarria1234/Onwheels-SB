import api from './api';

/**
 * Obtiene todas las clases disponibles.
 * @returns {Promise<Array>}
 */
export const getClases = async () => {
    try {
        const response = await api.get('/clases');
        return response.data;
    } catch (error) {
        console.error('Error fetching clases:', error);
        throw error;
    }
};

/**
 * Obtiene todos los planes de clases.
 * @returns {Promise<Array>}
 */
export const getPlanes = async () => {
    try {
        const response = await api.get('/planes');
        return response.data;
    } catch (error) {
        console.error('Error fetching planes:', error);
        throw error;
    }
};

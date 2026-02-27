// ================== CONFIG ==================
import api from "../../../../../services/api";
const API_URL = "/pedidos";

// ================== PEDIDOS ==================

export const getPedidos = async () => {
    const res = await api.get(API_URL);
    return res.data;
};

export const getPedidoById = async (id) => {
    const res = await api.get(`${API_URL}/${id}`);
    return res.data;
};

export const createPedido = async (data) => {
    const res = await api.post(API_URL, data);
    return res.data;
};

export const updatePedido = async (id, data) => {
    const res = await api.put(`${API_URL}/${id}`, data);
    return res.data;
};

export const deletePedido = async (id) => {
    const res = await api.delete(`${API_URL}/${id}`);
    return res.data;
};

export const updatePedidoStatus = async (id, data) => {
    const res = await api.put(`${API_URL}/${id}/status`, data);
    return res.data;
};

export const cancelPedido = async (id) => {
    const res = await api.put(`${API_URL}/${id}/cancel`);
    return res.data;
};

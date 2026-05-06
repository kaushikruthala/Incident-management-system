import axios from 'axios';
const API_BASE = "http://10.10.69.109:9595/api/v1";
const api = axios.create({ baseURL: API_BASE });

export const IncidentService = {
  getIncidents: async () => (await api.get('/incidents')).data,
  getIncidentSignals: async (id: string) => (await api.get(`/incidents/${id}/signals`)).data,
  updateStatus: async (id: string, status: string) => (await api.patch(`/incidents/${id}`, { status })).data
};

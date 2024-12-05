import axios from "axios";

const prestaBancoBackendServer = import.meta.env.VITE_PRESTABANCO_BACKEND_SERVER || 'gateway-server-service';
const prestaBancoBackendPort = import.meta.env.VITE_PRESTABANCO_BACKEND_PORT || '8080';

export default axios.create({
    baseURL: `http://${prestaBancoBackendServer}:${prestaBancoBackendPort}`,
    headers: {
        'Content-Type': 'application/json'
    }
});
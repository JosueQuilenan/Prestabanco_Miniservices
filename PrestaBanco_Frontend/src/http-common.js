import axios from "axios";

const prestaBancoBackendServer = import.meta.env.VITE_PRESTABANCO_BACKEND_SERVER;
const prestaBancoBackendPort = import.meta.env.VITE_PRESTABANCO_BACKEND_PORT;

export default axios.create({
    baseURL: `http://${prestaBancoBackendServer}:${prestaBancoBackendPort}`,
    headers: {
        'Content-Type': 'application/json'
    }
});

console.log(`http://${prestaBancoBackendServer}:${prestaBancoBackendPort}`);

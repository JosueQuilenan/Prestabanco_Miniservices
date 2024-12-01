import httpClient from "../http-common";

const getAll = () => {
    return httpClient.get('/api/client/');
}

const create = data => {
    return httpClient.post("/api/client/add", data);
}

const get = id => {
    return httpClient.get(`/api/client/${id}`);
}

const update = (id, data) => {
    return httpClient.put(`/api/client/update/${id}`, data);
}

const remove = id => {
    return httpClient.delete(`/api/client/delete/${id}`);
}


const getByRut = rut => {
    return httpClient.get(`/api/client/byRut?rut=${rut}`);
}

const getCreditApplications = id => {
    return httpClient.get(`/api/client/${id}/creditApplications`);
};

export default { getAll, create, get, update, remove, getByRut, getCreditApplications };

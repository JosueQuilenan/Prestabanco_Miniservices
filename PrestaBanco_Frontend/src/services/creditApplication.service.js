import httpClient from "../http-common";

const getAll = () => {
    return httpClient.get('/api/application/');
}

const create = data => {
    return httpClient.post("/api/application/add", data);
}

const get = id => {
    return httpClient.get(`/api/application/${id}`);
}

const update = (id, data) => {
    return httpClient.put(`/api/application/update/${id}`, data);
}

const updateState = (id, state) => {
    return httpClient.put(`/api/application/updateState/${id}?state=${state}`);
}

const remove = id => {
    return httpClient.delete(`/api/application/delete/${id}`);
}

const getByClientId = clientId => {
    return httpClient.get(`/api/application/byClient?clientId=${clientId}`);
}

export default { getAll, create, get, update, updateState, remove, getByClientId };

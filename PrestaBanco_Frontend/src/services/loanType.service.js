import httpClient from "../http-common";

const getAll = () => {
    return httpClient.get('/api/loanType/');
}

const create = data => {
    return httpClient.post("/api/loanType/add", data);
}

const get = id => {
    return httpClient.get(`/api/loanType/${id}`);
}

const update = (id, data) => {
    return httpClient.put(`/api/loanType/update/${id}`, data);
}

const remove = id => {
    return httpClient.delete(`/api/loanType/delete/${id}`);
}

const getByLoanTypeName = loanTypeName => {
    return httpClient.get(`/api/loanType/byLoanType?loanTypeName=${loanTypeName}`);
}

const calculateMonthlyPayment = (requestedAmount, requestedMonths, loanTypeName) => {
    return httpClient.post("/api/loanType/calculateMonthlyPayment", null, {
        params: { requestedAmount, requestedMonths, loanTypeName }
    });
}

const calculateTotalLoanCost = (requestedAmount, requestedMonths, loanTypeName) => {
    return httpClient.post("/api/loanType/calculateTotalLoanCost", null, {
        params: { requestedAmount, requestedMonths, loanTypeName }
    });
}

export default { getAll, create, get, update, remove, getByLoanTypeName, calculateMonthlyPayment,calculateTotalLoanCost };

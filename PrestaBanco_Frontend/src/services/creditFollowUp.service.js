import httpClient from "../http-common";

const cancelApplication = (id) => {
    return httpClient.put(`/api/creditFollowUp/cancelApplication/${id}`);
}

const finalApproveApplication = (id) => {
    return httpClient.put(`/api/creditFollowUp/finalApprove/${id}`);
}

export default {
    cancelApplication,
    finalApproveApplication,
};

import httpClient from "../http-common";

const preApprovedDecision = (creditApplication) => {
    return httpClient.post("/api/creditEvaluation/preApprovedDecision", creditApplication);
}

const evaluateSavingCapacity = (creditApplication, R72Decision, R73Decision, R75Decision) => {
    return httpClient.post(`/api/creditEvaluation/evaluateSavingCapacity?R72Decision=${R72Decision}&R73Decision=${R73Decision}&R75Decision=${R75Decision}`, creditApplication);
}

const evaluateJobStability = (creditApplication, executiveDecision) => {
    return httpClient.post(`/api/creditEvaluation/evaluateJobStability?executiveDecision=${executiveDecision}`, creditApplication);
}

const evaluateCreditHistory = (creditApplication) => {
    return httpClient.post("/api/creditEvaluation/evaluateCreditHistory", creditApplication);
}

export default { preApprovedDecision, evaluateSavingCapacity, evaluateJobStability, evaluateCreditHistory };

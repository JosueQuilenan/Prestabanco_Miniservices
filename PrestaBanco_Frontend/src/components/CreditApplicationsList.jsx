import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import creditApplicationService from '../services/creditApplication.service';
import creditEvaluationService from "../services/creditEvaluation.service.js";

const CreditApplicationList = () => {
    const [creditApplications, setCreditApplications] = useState([]);
    const navigate = useNavigate();

    const creditApplicationStates = {
        0: "En Revisión Inicial",
        1: "Pendiente de Documentación",
        2: "En Evaluación",
        3: "Pre-Aprobada",
        4: "En Aprobación Final",
        5: "Aprobada",
        6: "Rechazada",
        7: "Cancelada por el cliente",
        8: "En desembolso"
    };

    useEffect(() => {
        creditApplicationService.getAll().then(response => {
            const filteredApplications = response.data.filter(app => 
                app.applicationState !== 6 &&
                app.applicationState !== 1 &&
                app.applicationState !== 8 &&
                app.applicationState !== 7
            );
            setCreditApplications(filteredApplications);
            console.log(filteredApplications);
        }).catch(error => {
            console.error('Error al cargar las solicitudes de crédito:', error);
        });
    }, []);

    const handleEvaluate = (application, currentState) => {
        if (currentState === 0 ) {
            creditEvaluationService.preApprovedDecision(application)
                .then(() => {
                    navigate(`/creditApplication/evaluation/${application.id}`);
                })
                .catch(error => {
                    console.error('Error al actualizar el estado de la solicitud de crédito:', error);
                });
        }else{
            navigate(`/creditApplication/evaluation/${application.id}`);
        }
    };

    const handleReview = (applicationId) => {
        navigate(`/creditApplication/finalApproval/${applicationId}`);
    };

    const handleDisbursement = async (applicationId) =>{
        const confirmation = window.confirm("¿Estás seguro de que se firmó el contrato?");
        if(confirmation){
            await creditApplicationService.updateState(applicationId,8);
            navigate("/creditApplications")
        }
    }

    return (
        <div>
            <h2>Todas las solicitudes de Crédito</h2>
            {creditApplications.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Monto Solicitado</th>
                            <th>Tipo de Préstamo</th>
                            <th>Estado de la Aplicación</th>
                            <th>Fecha de Solicitud</th>
                            <th>Comentarios</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {creditApplications.map(app => (
                            <tr key={app.id}>
                                <td>{app.id}</td>
                                <td>{app.requestedAmount}</td>
                                <td>{app.loanTypeName}</td>
                                <td>{creditApplicationStates[app.applicationState]}</td>
                                <td>{app.applicationDate}</td>
                                <td>{app.comment ? app.comment : "Sin comentarios"}</td>
                                {app.applicationState !== 4 && app.applicationState !== 5?
                                <td>
                                <button onClick={() => handleEvaluate(app, app.applicationState)}>Evaluar</button>
                                </td> : app.applicationState === 5 ? 
                                <td>
                                <button onClick={() => handleDisbursement(app.id)}>Hacer Desembolso</button>
                                </td> :
                                <td>
                                <button onClick={() => handleReview(app.id)}>Revisión final</button>
                                </td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No hay solicitudes de crédito con los estados especificados.</p>
            )}
        </div>
    );
};

export default CreditApplicationList;

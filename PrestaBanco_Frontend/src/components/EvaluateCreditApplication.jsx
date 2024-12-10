import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import creditApplicationService from '../services/creditApplication.service';
import { useNavigate } from 'react-router-dom';
import creditEvaluationService from "../services/creditEvaluation.service.js";
import clientService from "../services/client.service.js";

const EvaluateCreditApplication = () => {
    const { id } = useParams();
    const [creditApplication, setCreditApplication] = useState(null);
    const [client, setClient] = useState(null);
    const [isJobStabilityOkay, setIsJobStabilityOkay] = useState(null);
    const [isCreditHistoryOkay, setIsCreditHistoryOkay] = useState(null);
    const [tempEvalSavingCapacity, setTempSavingCapacity] = useState(null);
    const [hasFinancialStability, setHasFinancialStability] = useState(false);
    const [showConfirmation, setShowApprovalContainer] = useState(false);
    const [showRejectionContainer, setShowRejectionContainer] = useState(false);
    const [rejectionComment, setRejectionComment] = useState("");
    const [showPendingDocsContainer, setShowPendingDocsContainer] = useState(false);
    const [pendingDocsComment, setPendingDocsComment] = useState("");
    const navigate = useNavigate();
    const [savingsQuestions, setSavingsQuestions] = useState({
        consistentHistory: false,
        periodicDeposits: false,
        largeWithdrawals: false
    });

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
        const loadCreditApplication = async () => {
            try {
                const response = await creditApplicationService.get(id);
                setCreditApplication(response.data);
                console.log(response.data);

                const clientResponse = await clientService.get(response.data.clientId);
                setClient(clientResponse.data);

                const isCreditHistoryOkay = await creditEvaluationService.evaluateCreditHistory(response.data);
                const tempEvalSavingCapacity = await creditEvaluationService.evaluateSavingCapacity(response.data,false,false,false);
                console.log(tempEvalSavingCapacity.data);
                const initialSavingsQuestions = {
                    consistentHistory: response.data.consistentHistory || false,
                    periodicDeposits: response.data.periodicDeposits || false,
                    largeWithdrawals: response.data.largeWithdrawals || false
                };

                setIsCreditHistoryOkay(isCreditHistoryOkay.data);
                setTempSavingCapacity(tempEvalSavingCapacity);
                setSavingsQuestions(initialSavingsQuestions);

                if (clientResponse.data.independentWorker) {
                    const jobStabilityEval = await creditEvaluationService.evaluateJobStability(response.data,false);
                    setIsJobStabilityOkay(jobStabilityEval.data);
                }
            } catch (error) {
                console.error('Error al cargar los detalles de la solicitud de crédito:', error);
            }
        };

        loadCreditApplication();
    }, [id]);


    if (!creditApplication || !client || !tempEvalSavingCapacity) {
        return <p>Cargando detalles de la solicitud de crédito...</p>;
    }

    const handleApproveClick = () => {
        setShowApprovalContainer(true);
    };

    const handleCloseConfirmation = () => {
        setShowApprovalContainer(false);
    };

    const handleConfirm = async () => {
        try {
            creditApplication.comment = rejectionComment;
            await creditEvaluationService.updateCommentAndState(creditApplication, rejectionComment, 3);
            navigate('/creditApplications'); 
        } catch (error) {
            console.error("Error al pre-aprobar la solicitud:", error);
        }
        console.log("Confirmación de pre-aprobación enviada");
        setShowApprovalContainer(false);
    };

    const handleRejectionCommentChange = (e) => {
        setRejectionComment(e.target.value);
    };

    const handleRejectClick = () => {
        setShowRejectionContainer(true);
    };

    const handleRejectClose = () => {
        setShowRejectionContainer(false);
    };

    const handleRejectConfirm = async () => {
        try {
            await creditEvaluationService.updateCommentAndState(creditApplication, "En espera de confirmación del usuario", 6);
            navigate('/creditApplications'); 
        } catch (error) {
            console.error("Error al rechazar la solicitud:", error);
        }
    };

    const handlePendingDocsChange = (e) => {
        setPendingDocsComment(e.target.value);
    }

    const handlePendingDocsClick = () => {
        setShowPendingDocsContainer(true);
    }

    const handlePendingDocsClose = () => {
        setShowPendingDocsContainer(false);
    };

    const handlePendingDocsConfirm = async () => {
        try {
            creditApplication.comment = pendingDocsComment; 
            await creditEvaluationService.updateCommentAndState(creditApplication, pendingDocsComment, 1);
            navigate('/creditApplications'); 
        } catch (error) {
            console.error("Error al cambiar solicitud a documentación pendiente:", error);
        }
    };


    const renderPDFLinks = (pdfFiles) => {
        if (!pdfFiles || pdfFiles.length === 0) {
            return <p>No hay archivos PDF asociados.</p>;
        }
    
        return (
            <ul>
                {pdfFiles.map((pdf, index) => {
                    if (!pdf.pdfFile) {
                        console.warn(`Archivo PDF en el índice ${index} está incompleto:`, pdf);
                        return null;
                    }
                    const pdfData = `data:application/pdf;base64,${pdf.pdfFile}`;
                    return (
                        <li key={index}>
                            <a 
                                href={pdfData} 
                                download={pdf.fileName || `Archivo_PDF_${index + 1}.pdf`}
                                rel="noopener noreferrer"
                            >
                                {pdf.fileName || `Archivo PDF ${index + 1}`}
                            </a>
                        </li>
                    );
                })}
            </ul>
        );
    };
    
    const handleCheckboxChange = async (event) => {
        const { name, checked } = event.target;
        
        const newSavingsQuestions = {
            ...savingsQuestions,
            [name]: checked
        };
        
        setSavingsQuestions(newSavingsQuestions);
        
        try {
            const { consistentHistory, periodicDeposits, largeWithdrawals } = newSavingsQuestions;
            
            const tempEvalSavingCapacity = await creditEvaluationService.evaluateSavingCapacity(
                creditApplication,
                consistentHistory,
                periodicDeposits,
                largeWithdrawals
            );
            
            setTempSavingCapacity(tempEvalSavingCapacity);
        } catch (error) {
            console.error("Error al evaluar la capacidad de ahorro:", error);
        }
    };
    
    const handleFinancialStabilityChange = (event) => {
        const { checked } = event.target;
        setHasFinancialStability(checked);
        console.log("El cliente independiente tiene estabilidad financiera:", checked);
    };

    return (
        <div>
            <h2>Detalles de la Solicitud de Crédito</h2>
            <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
                <h3>Tipo de Préstamo</h3>
                <p><strong>Nombre:</strong> {creditApplication.loanTypeName}</p>
                <h2>Estado de la solicitud</h2>
                <p>{creditApplicationStates[creditApplication.applicationState] || "Estado Desconocido"}</p>
                <p></p>
            <h2>Cliente</h2>
            <div style={{ marginBottom: '20px' }}>
                <p>Nombre: {client.name} {client.lastName}</p>
                <p>Correo: {client.email}</p>
                <p>¿Es trabajador independiente? <strong>{client.independentWorker ? "Si" : "No"}</strong></p>
                {client.independentWorker && (
                    <p>Por favor revise los ingresos de los últimos 2 o más años para evaluar su estabilidad financiera.</p>
                )}
            </div>
            <div style={{ marginBottom: '20px'}}>
                <h4>Se tiene un resultado de la evaluación de capacidad de ahorro temporal de: {tempEvalSavingCapacity.data}</h4>
                <h3>Cuenta de ahorros</h3>
                <p><strong>Detalles:</strong> </p>
                    <p>Fecha de apertura: {client.savingsAccount? client.savingsAccount.accountOpeningDate : 'No disponible'}</p>
                    <p>Monto total: {client.savingsAccount ? client.savingsAccount.balance : 'No disponible'}</p>
                    {client.savingsAccount ? renderPDFLinks(client.savingsAccount.pdfFiles) : <p>No hay archivos PDF asociados.</p>}
                    <div>
                        <h3>Preguntas sobre el historial de ahorros:</h3>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    name="consistentHistory"
                                    checked={savingsQuestions.consistentHistory}
                                    onChange={handleCheckboxChange}
                                />
                                ¿El cliente tiene un historial de ahorro Consistente?
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    name="periodicDeposits"
                                    checked={savingsQuestions.periodicDeposits}
                                    onChange={handleCheckboxChange}
                                />
                                ¿El cliente ha hecho depósitos periódicos? (Monto Mínimo: Los depósitos deben sumar al menos el 5% de sus ingresos mensuales.)
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    name="largeWithdrawals"
                                    checked={savingsQuestions.largeWithdrawals}
                                    onChange={handleCheckboxChange}
                                />
                                ¿El cliente ha realizado un retiro superior al 30% del saldo de su cuenta en los últimos 6 meses?
                            </label>
                        </div>
                    </div>
            </div>
            <h3>Documentos Comunes</h3>
            <div style={{ marginBottom: '20px' }}>
                <h4>Valuation Certificate</h4>
                <p><strong>Detalles:</strong></p>
                <p>Tasador: {creditApplication.valuationCertificate ? creditApplication.valuationCertificate.appraiser : 'No disponible'}</p>
                <p>Valor de la propiedad: {creditApplication.valuationCertificate ? creditApplication.valuationCertificate.propertyValue : 'No disponible'}</p>
                <p>Fecha de avalúo: {creditApplication.valuationCertificate ? creditApplication.valuationCertificate.valuationDate : 'No disponible'}</p>
                {creditApplication.valuationCertificate ? renderPDFLinks(creditApplication.valuationCertificate.pdfFiles) : <p>No hay archivos PDF asociados.</p>}
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h4>Income Proof</h4>
                <p><strong>Detalles:</strong> </p>
                <p>Monto promedio de ingreso: {creditApplication.incomeProof ? creditApplication.incomeProof.averageIncomeAmount : 'No disponible'}</p>
                <p>Fecha de inicio de trabajo: {creditApplication.incomeProof ? creditApplication.incomeProof.startDate : 'No disponible'}</p>
                <p>Fecha de emisión del último documento: {creditApplication.incomeProof ? creditApplication.incomeProof.dateIssued : 'No disponible'}</p>
                {creditApplication.incomeProof ? renderPDFLinks(creditApplication.incomeProof.pdfFiles) : <p>No hay archivos PDF asociados.</p>}
                {client.independentWorker && (
                        <div style={{ marginTop: '10px' }}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={hasFinancialStability}
                                    onChange={handleFinancialStabilityChange}
                                />
                                ¿El cliente independiente tiene estabilidad financiera?
                            </label>
                        </div>
                    )}
            </div>
            <h3>Documentos Específicos</h3>
            {creditApplication.loanTypeName === "First home" && (
                <div style={{ marginBottom: '20px' }}>
                    <h4>Credit History</h4>
                    <p><strong>Detalles:</strong> </p>
                    <p>Puntuación: {client.creditHistory ? client.creditHistory.creditRating : 'No disponible'}</p>
                    <p>Última fecha de crédito: {client.creditHistory ? client.creditHistory.lastCreditDate : 'No disponible'}</p>
                    <p>Monto pendiente: {client.creditHistory ? client.creditHistory.pendingAmount : 'No disponible'}</p>
                    <p>Monto total: {client.creditHistory ? client.creditHistory.totalAmount : 'No disponible'}</p>
                    <h4>{isCreditHistoryOkay ? "El historial crediticio está bien (Automático)" : "Se recomienda consultar al cliente por documentos asociados (Automático)"}</h4>
                    
                </div>
            )}

            {creditApplication.loanTypeName === "Second home" && (
                <>
                    <div style={{ marginBottom: '20px' }}>
                        <h4>First Home Deed</h4>
                        <p><strong>Detalles:</strong> </p>
                        <p>Número de escritura: {creditApplication.firstHomeDeed ? creditApplication.firstHomeDeed.deedNumber : 'No disponible'}</p>
                        <p>Dirección de la propiedad: {creditApplication.firstHomeDeed ? creditApplication.firstHomeDeed.propertyAddress : 'No disponible'}</p>
                        <p>Fecha de registro: {creditApplication.firstHomeDeed ? creditApplication.firstHomeDeed.registrationDate : 'No disponible'}</p>
                        {creditApplication.firstHomeDeed ? renderPDFLinks(creditApplication.firstHomeDeed.pdfFiles) : <p>No hay archivos PDF asociados.</p>}
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <h4>Credit History</h4>
                        <p><strong>Detalles:</strong></p>
                        <p>Puntuación: {client.creditHistory ? client.creditHistory.creditRating : 'No disponible'}</p>
                        <p>Última fecha de crédito: {client.creditHistory ? client.creditHistory.lastCreditDate : 'No disponible'}</p>
                        <p>Monto pendiente: {client.creditHistory ? client.creditHistory.pendingAmount : 'No disponible'}</p>
                        <p>Monto total: {client.creditHistory ? client.creditHistory.totalAmount : 'No disponible'}</p>
                        <h4>{isCreditHistoryOkay ? "El historial crediticio está bien (proceso automático)" : "Se recomienda consultar al cliente por documentos asociados"}</h4>
                    </div>
                </>
            )}

            {creditApplication.loanTypeName === "Commercial Properties" && (
                <>
                    <div style={{ marginBottom: '20px' }}>
                        <h4>Business Financial Statement</h4>
                        <p><strong>Detalles:</strong> </p>
                        <p>Ingreso neto: {creditApplication.businessFinancialStatement ? creditApplication.businessFinancialStatement.netIncome : 'No disponible'}</p>
                        <p>Total activos: {creditApplication.businessFinancialStatement ? creditApplication.businessFinancialStatement.totalAssets : 'No disponible'}</p>
                        <p>Total pasivos: {creditApplication.businessFinancialStatement ? creditApplication.businessFinancialStatement.totalLiabilities : 'No disponible'}</p>
                        {creditApplication.businessFinancialStatement ? renderPDFLinks(creditApplication.businessFinancialStatement.pdfFiles) : <p>No hay archivos PDF asociados.</p>}
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <h4>Business Plan</h4>
                        <p><strong>Detalles:</strong></p>
                        <p>Descripción: {creditApplication.businessPlan ? creditApplication.businessPlan.businessDescription : 'No disponible'}</p>
                        <p>Mercado objetivo: {creditApplication.businessPlan ? creditApplication.businessPlan.targetMarket : "No disponible"}</p>
                        <p>Ingresos proyectados: {creditApplication.businessPlan ? creditApplication.businessPlan.projectedRevenue : 'No disponible'}</p>
                        {creditApplication.businessPlan ? renderPDFLinks(creditApplication.businessPlan.pdfFiles) : <p>No hay archivos PDF asociados.</p>}
                    </div>
                </>
            )}
            {creditApplication.loanTypeName === "Remodeling" && (
                <>
                    <div style={{ marginBottom: '20px' }}>
                        <h4>Renovation Budget</h4>
                        <p><strong>Detalles:</strong> </p>
                        <p>Costo estimado: {creditApplication.renovationBudget ? creditApplication.renovationBudget.estimatedCost: 'No disponible'}</p>
                        <p>Fecha de completar esperada: {creditApplication.renovationBudget ? creditApplication.renovationBudget.expectedCompletionDate : 'No disponible'}</p>
                        {creditApplication.renovationBudget ? renderPDFLinks(creditApplication.renovationBudget.pdfFiles) : <p>No hay archivos PDF asociados.</p>}
                    </div>
                </>
            )}
            </div>
            <div style={{ marginTop: '20px' }}>
                    <button onClick={handleApproveClick}>Aprobar</button>
                    <button onClick={handleRejectClick}>Rechazar</button>
                    <button onClick={handlePendingDocsClick}>Falta documentación</button>
                </div>
            {showConfirmation && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        width: '400px',
                        background: '#888',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
                        textAlign: 'center'
                    }}>
                        <h3>¿Estás seguro de aprobar esta solicitud?</h3>
                        {!client.independentWorker ? <p><strong>Estabilidad Laboral:</strong> {isJobStabilityOkay ? "Si tiene" : "No tiene"}</p> : ""}
                        <p><strong>Historial Crediticio:</strong> {isCreditHistoryOkay ? "Bueno" : "Malo"}</p>
                        <p><strong>Capacidad de Ahorro Temporal:</strong> {tempEvalSavingCapacity?.data ?? "No disponible"}</p>
                        {client.independentWorker ? <p><strong>Estabilidad Financiera:</strong> {hasFinancialStability ? "Buena" : "Mala"}</p> : ""}
                        <p><strong>Preguntas de Ahorros:</strong></p>
                        <ul>
                            <li>{savingsQuestions.consistentHistory ? "Sí tiene un Historial Consistente" : "No tiene un Historial Consistente"}</li>
                            <li>{savingsQuestions.periodicDeposits ? "Sí ha hecho Depósitos Periódicos" : "No ha hecho Depósitos Periódicos"}</li>
                            <li>{savingsQuestions.largeWithdrawals ? "Sí ha hecho Retiros Grandes" : "No ha hecho Retiros Grandes"}</li>
                        </ul>
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-around' }}>
                            <button onClick={handleConfirm}>Confirmar</button>
                            <button onClick={handleCloseConfirmation}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
            {showRejectionContainer && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    padding: '20px',
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    color: 'black',
                    zIndex: 1000
                }}>
                    <h2>¿Estás seguro de rechazar esta aplicación?</h2>
                    <h3>Por favor describenos las razones del rechazo de la solicitud</h3>
                    <textarea
                        value={rejectionComment}
                        onChange={handleRejectionCommentChange}
                        rows="4"
                        placeholder="Ingrese las razones del rechazo"
                        style={{ resize: 'none', width: '100%', height: '80px' }}
                        required
                    />
                    <button onClick={handleRejectConfirm}>Confirmar rechazo</button>
                    <button onClick={handleRejectClose} style={{ marginLeft: '10px' }}>Cancelar</button>
                </div>
            )}
            {showPendingDocsContainer && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    padding: '20px',
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    color: 'black',
                    zIndex: 1000
                }}>
                    <h3>Por favor menciona los documentos que faltan o mande comentarios</h3>
                    <textarea
                        value={pendingDocsComment}
                        onChange={handlePendingDocsChange}
                        rows="4"
                        placeholder="Ingrese las documentos pendientes o comentarios"
                        style={{ resize: 'none', width: '100%', height: '80px' }}
                        required
                    />
                    <button onClick={handlePendingDocsConfirm}>Marcar solicitud</button>
                    <button onClick={handlePendingDocsClose} style={{ marginLeft: '10px' }}>Cancelar</button>
                </div>
            )}
        </div>
    );
};

export default EvaluateCreditApplication;

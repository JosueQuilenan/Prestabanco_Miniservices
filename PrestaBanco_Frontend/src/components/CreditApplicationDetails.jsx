import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import creditApplicationService from '../services/creditApplication.service';
import clientService from '../services/client.service';
import loanTypeService from "../services/loanType.service.js";

const CreditApplicationApproval = () => {
    const { id } = useParams();
    const [creditApplication, setCreditApplication] = useState(null);
    const [client, setClient] = useState(null);
    const [documents, setDocuments] = useState({});
    const creditApplicationStates = {
        0: "En Revisión Inicial",
        1: "Pendiente de Documentación",
        2: "En Evaluación",
        3: "Pre-Aprobada",
        4: "En Aprobación Final",
        5: "Aprobada",
        6: "Rechazada",
        7: "Cancelada por el Cliente",
        8: "En Desembolso"
    };

    useEffect(() => {
        const fetchCreditApplication = async () => {
            try {
                const response = await creditApplicationService.get(id);
                const responseData = response.data;
                setCreditApplication(responseData);

                const clientResponse = await clientService.get(responseData.clientId);
                setClient(clientResponse.data);
                const loanType = await loanTypeService.getByLoanTypeName(responseData.loanTypeName);
                // Inicializar documentos con la estructura según el tipo de préstamo
                initializeDocuments(loanType.data.loanTypeName, responseData);
            } catch (error) {
                console.error('Error fetching credit application details:', error);
            }
        };

        fetchCreditApplication();
    }, [id]);

    const initializeDocuments = (loanType, responseData) => {
        let docs = {};
        switch (loanType) {
            case "First home":
                docs = { incomeProof: {}, valuationCertificate: {} };
                break;
            case "Second home":
                docs = { incomeProof: {}, valuationCertificate: {}, firstHomeDeed: {} };
                break;
            case "Commercial Properties":
                docs = { incomeProof: {}, valuationCertificate: {}, businessFinancialStatement: {}, businessPlan: {} };
                break;
            case "Remodeling":
                docs = { incomeProof: {}, renovationBudget: {}, valuationCertificate: {} };
                break;
            default:
                docs = {};
        }

        // Cargar archivos PDF de cada documento
        for (const docType in docs) {
            if (responseData[docType] && responseData[docType].pdfFiles) {
                docs[docType] = {
                    ...responseData[docType],
                    pdfFiles: responseData[docType].pdfFiles || []
                };
            }
        }
        setDocuments(docs);
    };


    if (!creditApplication || !client) return <div>Cargando...</div>;

    return (
        <div>
            <h2>Detalles de la Solicitud de Crédito</h2>
            <p><strong>ID:</strong> {creditApplication.id}</p>
            <p><strong>Tipo de Préstamo:</strong> {creditApplication.loanTypeName}</p>
            <p><strong>Estado:</strong></p>
            <p>{creditApplicationStates[creditApplication.applicationState]}</p>
            <p><strong>Monto Solicitado:</strong> {creditApplication.requestedAmount}</p>
            <p><strong>Meses Solicitados:</strong> {creditApplication.requestedMonths}</p>
            <h3>Documentos</h3>
            {Object.keys(documents).map(docType => (
                <div key={docType}>
                    {docType === 'incomeProof' && documents[docType] && (
                        <>
                            <h4>Comprobante de Ingreso</h4>
                            <label>Monto promedio de ingreso: {documents[docType].averageIncomeAmount}</label><br/>
                            <label>Monto promedio de
                                ingreso: {creditApplication.incomeProof.averageIncomeAmount}</label><br/>
                            <label>Fecha de inicio de trabajo: {creditApplication.incomeProof.startDate}</label><br/>
                            <label>Fecha de emisión del último
                                documento: {creditApplication.incomeProof.dateIssued}</label><br/>
                            <ul>
                                {documents[docType].pdfFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`}
                                           download={`PDF_${index + 1}.pdf`}>
                                            PDF {index + 1}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {docType === 'valuationCertificate' && creditApplication.valuationCertificate && (
                        <>
                            <h4>Certificado de avalúo</h4>
                            <label>
                                Tasador: {creditApplication.valuationCertificate.appraiser}
                            </label><br/>
                            <label>
                                Valor de la propiedad: {creditApplication.valuationCertificate.propertyValue}
                            </label><br/>
                            <label>
                                Fecha de valoración: {creditApplication.valuationCertificate.valuationDate}
                            </label><br/>
                            <ul>
                                {documents[docType].pdfFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`}
                                           download={`PDF_${index + 1}.pdf`}>
                                            PDF {index + 1}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {docType === 'firstHomeDeed' && creditApplication.firstHomeDeed && (
                        <>
                            <h4>Escritura de la primera vivienda</h4>
                            <label>
                                Dirección de la Propiedad: {creditApplication.firstHomeDeed.propertyAddress}
                            </label><br/>
                            <label>
                                Número de certificado: value={creditApplication.firstHomeDeed.deedNumber}
                            </label><br/>
                            <label>
                                Fecha de registro: value={creditApplication.firstHomeDeed.registrationDate}
                            </label><br/>
                            <ul>
                                {documents[docType].pdfFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`}
                                           download={`PDF_${index + 1}.pdf`}>
                                            PDF {index + 1}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {docType === 'businessFinancialStatement' && creditApplication.businessFinancialStatement && (
                        <>
                            <h4>Estado financiero del negocio</h4>
                            <label>
                                Ingresos activos: {creditApplication.businessFinancialStatement.totalAssets}
                            </label><br/>
                            <label>
                                Ingresos pasivos: {creditApplication.businessFinancialStatement.totalLiabilities}
                            </label><br/>
                            <label>
                                Ingresos neto: {creditApplication.businessFinancialStatement.netIncome}
                            </label><br/>
                            <ul>
                                {documents[docType].pdfFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`}
                                           download={`PDF_${index + 1}.pdf`}>
                                            PDF {index + 1}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {docType === 'businessPlan' && creditApplication.businessPlan && (
                        <>
                            <h4>Plan de negocio</h4>
                            <label>
                                Mercado objetivo: {creditApplication.businessPlan.targetMarket}
                            </label><br/>
                            <label>
                                Descripción del negocio: {creditApplication.businessPlan.businessDescription}
                            </label><br/>
                            <label>
                                Ingresos esperados: {creditApplication.businessPlan.projectedRevenue}
                            </label><br/>
                            <ul>
                                {documents[docType].pdfFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`}
                                           download={`PDF_${index + 1}.pdf`}>
                                            PDF {index + 1}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {docType === 'renovationBudget' && creditApplication.renovationBudget && (
                        <>
                            <h4>Prosupuesto de remodelación</h4>
                            <label>
                                Costo estimado: {creditApplication.renovationBudget.estimatedCost}
                            </label><br/>
                            <label>
                                Fecha esperada de
                                finalización: {creditApplication.renovationBudget.expectedCompletionDate}
                            </label><br/>
                            <ul>
                                {documents[docType].pdfFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`}
                                           download={`PDF_${index + 1}.pdf`}>
                                            PDF {index + 1}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CreditApplicationApproval;

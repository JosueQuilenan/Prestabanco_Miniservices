import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import creditApplicationService from '../services/creditApplication.service';

const UpdateCreditApplication = () => {
    const [creditApplication, setCreditApplication] = useState('');
    const [requestedAmount, setRequestedAmount] = useState(0);
    const [requiredMonths, setRequestedMonths] = useState(0);
    const [documents, setDocuments] = useState({});
    const navigate = useNavigate();
    const { id } = useParams();
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
        fetchCreditApplication();
    }, []);

    const fetchCreditApplication = async () => {
        try {
            const response = await creditApplicationService.get(id);
            const applicationData = response.data;
            console.log(applicationData);
            setRequestedAmount(applicationData.requestedAmount);
            setRequestedMonths(applicationData.requiredMonths);
            setLoanDocuments(applicationData.loanTypeName);
            setCreditApplication(response.data);
            const loadedDocuments = {};
            for (const docType in applicationData) {
                if (applicationData[docType]?.pdfFiles) {
                    loadedDocuments[docType] = {
                        ...applicationData[docType],
                        pdfFiles: applicationData[docType].pdfFiles || []
                    };
                }
            }
            setDocuments(loadedDocuments);
        } catch (error) {
            console.error("Error al cargar la solicitud de crédito:", error);
        }
    };

    const setLoanDocuments = (loanType) => {
        let docs = {};
        switch (loanType) {
            case "First home":
                docs = { incomeProof: { pdfFiles: [] }, valuationCertificate: { pdfFiles: [] } };
                break;
            case "Second home":
                docs = { incomeProof: { pdfFiles: [] }, valuationCertificate: { pdfFiles: [] }, firstHomeDeed: { pdfFiles: [] } };
                break;
            case "Commercial Properties":
                docs = { incomeProof: { pdfFiles: [] }, valuationCertificate: { pdfFiles: [] }, businessFinancialStatement: { pdfFiles: [] }, businessPlan: { pdfFiles: [] } };
                break;
            case "Remodeling":
                docs = { incomeProof: { pdfFiles: [] }, renovationBudget: { pdfFiles: [] }, valuationCertificate: { pdfFiles: [] } };
                break;
            default:
                docs = {};
        }
        setDocuments((prev) => ({ ...prev, ...docs }));
    };

    const handleDocumentChange = (docType, field, value) => {
        setDocuments((prev) => ({
            ...prev,
            [docType]: {
                ...prev[docType],
                [field]: value,
            },
        }));
    };

    const handleFileUpload = async (docType, files) => {
        const newFiles = Array.from(files).filter(file => file.type === "application/pdf");
        const fileReaders = newFiles.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result.split(',')[1]);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        const uploadedFiles = await Promise.all(fileReaders);
        setDocuments((prev) => ({
            ...prev,
            [docType]: {
                ...prev[docType],
                pdfFiles: [
                    ...prev[docType].pdfFiles,
                    ...uploadedFiles.map(pdfFile => ({ pdfFile }))
                ],
            },
        }));
    };

    const handleFileRemove = (docType, index) => {
        setDocuments(prev => {
            const updatedFiles = prev[docType].pdfFiles.filter((_, i) => i !== index);
            return {
                ...prev,
                [docType]: {
                    ...prev[docType],
                    pdfFiles: updatedFiles,
                },
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(creditApplication.loanTypeName);
        try {
            let creditApplicationToUpdate = {
                id,
                applicationState: 0,
                clientId: creditApplication.clientId,
                requestedAmount,
                comment: "Documentos actualizados",
                applicationDate: creditApplication.applicationDate,
                requiredMonths,
                loanTypeName: creditApplication.loanTypeName,
            };
    
            for (const docType in documents) {
                if (documents[docType]) {
                    creditApplicationToUpdate[docType] = {
                        ...documents[docType],
                        pdfFiles: documents[docType].pdfFiles || []
                    };
                }
            }

            await creditApplicationService.update(id, creditApplicationToUpdate);
            console.log('Solicitud de crédito actualizada:', creditApplicationToUpdate);
    
            navigate('/creditApplications');
    
        } catch (error) {
            console.error('Error durante el proceso de actualización:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>ID de la solicitud:</label>
                <span>{creditApplication.id}</span>
            </div>
            
            <div>
                <label>Estado de la solicitud:</label>
                <span>{creditApplicationStates[creditApplication.applicationState]}</span>
            </div>

            <div>
                <label>Comentario:</label>
                <p>{creditApplication.comment || "Sin comentario"}</p>
            </div>
            <div>
                <label>Loan Type:</label>
                <p>{creditApplication.loanTypeName || "Cargando..."}</p>
            </div>

            <label>
                Monto solicitado:
                <input type="number" value={requestedAmount} onChange={(e) => setRequestedAmount(e.target.value)} required />
            </label>
            <label>
                Meses solicitados:
                <input type="number" value={requiredMonths} onChange={(e) => setRequestedMonths(e.target.value)} required />
            </label>
            {Object.keys(documents).map(docType => (
                <div key={docType}>
                    {docType === 'incomeProof' && creditApplication.incomeProof && (
                        <>
                            <h4>Comprobante de Ingreso</h4>
                            <label>
                                Monto promedio de ingreso:
                                <input type="number" onChange={(e) => handleDocumentChange(docType, 'averageIncomeAmount', e.target.value)} value={creditApplication.incomeProof.averageIncomeAmount} required/>
                            </label>
                            <label>
                                Fecha de inicio de trabajo:
                                <input type="date" onChange={(e) => handleDocumentChange(docType, 'startDate', e.target.value)} value={creditApplication.incomeProof.startDate} required/>
                            </label>
                            <label>
                                Fecha de emisión del último documento:
                                <input type="date" onChange={(e) => handleDocumentChange(docType, 'dateIssued', e.target.value)} value={creditApplication.incomeProof.dateIssued} required/>
                            </label>
                            <label>
                                Subir archivo comprobante::
                                <input type="file" accept="application/pdf" multiple onChange={(e) => handleFileUpload(docType, e.target.files)} />
                            </label>
                            <ul>
                                {documents[docType].pdfFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`} download={`PDF_${index + 1}.pdf`}>
                                            PDF {index + 1}
                                        </a>
                                        <button type="button" onClick={() => handleFileRemove(docType, index)}>Remove</button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {docType === 'valuationCertificate' && creditApplication.valuationCertificate && (
                        <>
                            <h4>Certificado de avalúo</h4>
                            <label>
                                Tasador:
                                <input type="text" onChange={(e) => handleDocumentChange(docType, 'appraiser', e.target.value)} value={creditApplication.valuationCertificate.appraiser} required/>
                            </label>
                            <label>
                                Valor de la propiedad:
                                <input type="number" onChange={(e) => handleDocumentChange(docType, 'propertyValue', e.target.value)} value={creditApplication.valuationCertificate.propertyValue} required/>
                            </label>
                            <label>
                                Fecha de valoración:
                                <input type="date" onChange={(e) => handleDocumentChange(docType, 'valuationDate', e.target.value)} value={creditApplication.valuationCertificate.valuationDate} required/>
                            </label>
                            <label>
                                Subir archivo comprobante::
                                <input type="file" accept="application/pdf" multiple onChange={(e) => handleFileUpload(docType, e.target.files)} />
                            </label>
                            <ul>
                                {documents[docType].pdfFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`} download={`PDF_${index + 1}.pdf`}>
                                            PDF {index + 1}
                                        </a>
                                        <button type="button" onClick={() => handleFileRemove(docType, index)}>Remove</button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {docType === 'firstHomeDeed' && creditApplication.firstHomeDeed && (
                        <>
                            <h4>Escritura de la primera vivienda</h4>
                            <label>
                                Dirección de la Propiedad:
                                <input type="text" onChange={(e) => handleDocumentChange(docType, 'propertyAddress', e.target.value)} value={creditApplication.firstHomeDeed.propertyAddress} required/>
                            </label>
                            <label>
                                Número de certificado:
                                <input type="number" onChange={(e) => handleDocumentChange(docType, 'deedNumber', e.target.value)} value={creditApplication.firstHomeDeed.deedNumber} required/>
                            </label>
                            <label>
                                Fecha de registro:
                                <input type="date" onChange={(e) => handleDocumentChange(docType, 'registrationDate', e.target.value)} value={creditApplication.firstHomeDeed.registrationDate} required />
                            </label>
                            <label>
                                Subir archivo comprobante:
                                <input type="file" accept="application/pdf" multiple onChange={(e) => handleFileUpload(docType, e.target.files)} />
                            </label>
                            <ul>
                                {documents[docType].pdfFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`} download={`PDF_${index + 1}.pdf`}>
                                            PDF {index + 1}
                                        </a>
                                        <button type="button" onClick={() => handleFileRemove(docType, index)}>Remove</button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {docType === 'businessFinancialStatement' && creditApplication.businessFinancialStatement && (
                        <>
                            <h4>Estado financiero del negocio</h4>
                            <label>
                                Ingresos activos:
                                <input type="number" onChange={(e) => handleDocumentChange(docType, 'totalAssets', e.target.value)} value={creditApplication.businessFinancialStatement.totalAssets} required/>
                            </label>
                            <label>
                                Ingresos pasivos:
                                <input type="number" onChange={(e) => handleDocumentChange(docType, 'totalLiabilities', e.target.value)} value={creditApplication.businessFinancialStatement.totalLiabilities} required/>
                            </label>
                            <label>
                                Ingresos neto:
                                <input type="number" onChange={(e) => handleDocumentChange(docType, 'netIncome', e.target.value)} value={creditApplication.businessFinancialStatement.netIncome} required/>
                            </label>
                            <label>
                                Subir archivo comprobante::
                                <input type="file" accept="application/pdf" multiple onChange={(e) => handleFileUpload(docType, e.target.files)} />
                            </label>
                            <ul>
                                {documents[docType].pdfFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`} download={`PDF_${index + 1}.pdf`}>
                                            PDF {index + 1}
                                        </a>
                                        <button type="button" onClick={() => handleFileRemove(docType, index)}>Remove</button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {docType === 'businessPlan' && creditApplication.businessPlan && (
                        <>
                            <h4>Plan de negocio</h4>
                            <label>
                                Mercado objetivo:
                                <input type="text" onChange={(e) => handleDocumentChange(docType, 'targetMarket', e.target.value)} value={creditApplication.businessPlan.targetMarket} required/>
                            </label>
                            <label>
                                Descripción del negocio:
                                <textarea onChange={(e) => handleDocumentChange(docType, 'businessDescription', e.target.value)} value={creditApplication.businessPlan.businessDescription} required />
                            </label>
                            <label>
                                Ingresos esperados:
                                <input type="number" onChange={(e) => handleDocumentChange(docType, 'projectedRevenue', e.target.value)} value={creditApplication.businessPlan.projectedRevenue} required/>
                            </label>
                            <label>
                                Subir archivo comprobante::
                                <input type="file" accept="application/pdf" multiple onChange={(e) => handleFileUpload(docType, e.target.files)} />
                            </label>
                            <ul>
                                {documents[docType].pdfFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`} download={`PDF_${index + 1}.pdf`}>
                                            PDF {index + 1}
                                        </a>
                                        <button type="button" onClick={() => handleFileRemove(docType, index)}>Remove</button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {docType === 'renovationBudget' && creditApplication.renovationBudget && (
                        <>  
                            <h4>Prosupuesto de remodelación</h4>
                            <label>
                                Costo estimado:
                                <input type="number" onChange={(e) => handleDocumentChange(docType, 'estimatedCost', e.target.value)} value={creditApplication.renovationBudget.estimatedCost} required/>
                            </label>
                            <label>
                                Fecha esperada de finalización:
                                <input type="date" onChange={(e) => handleDocumentChange(docType, 'expectedCompletionDate', e.target.value)} value={creditApplication.renovationBudget.expectedCompletionDate} required/>
                            </label>
                            <label>
                                Subir archivo comprobante::
                                <input type="file" accept="application/pdf" multiple onChange={(e) => handleFileUpload(docType, e.target.files)} />
                            </label>
                            <ul>
                                {documents[docType].pdfFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`} download={`PDF_${index + 1}.pdf`}>
                                            PDF {index + 1}
                                        </a>
                                        <button type="button" onClick={() => handleFileRemove(docType, index)}>Remove</button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            ))}

            <button type="submit">Actualizar Solicitud de Crédito</button>
        </form>
    );
};

export default UpdateCreditApplication;

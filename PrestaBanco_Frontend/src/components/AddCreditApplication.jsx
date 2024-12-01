import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import creditApplicationService from '../services/creditApplication.service';
import clientService from '../services/client.service';
import loanTypeService from '../services/loanType.service';

const CreateCreditApplication = () => {
    const [clients, setClients] = useState([]);
    const [loanType, setLoanType] = useState('');
    const [requestedAmount, setRequestedAmount] = useState(0);
    const [requestedMonths, setRequestedMonths] = useState(0);
    const [documents, setDocuments] = useState({});
    const [selectedClientId, setSelectedClientId] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        const response = await clientService.getAll();
        setClients(response.data);
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
        setDocuments(docs);
    };

    const handleLoanTypeChange = async (event) => {
        const selectedLoanType = event.target.value;
        setLoanType(selectedLoanType);
        setLoanDocuments(selectedLoanType); 
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
    
        try {
            const loanTypeResponse = await loanTypeService.getByLoanTypeName(loanType);
            console.log('Tipo de préstamo obtenido:', loanTypeResponse.data);
    
            let creditApplicationToSubmit = {
                clientId: selectedClientId,
                requestedAmount,
                requiredMonths: requestedMonths,
                applicationDate: new Date().toISOString().split('T')[0],
                loanTypeName: loanType,
            };
    
            for (const docType in documents) {
                if (documents[docType]) {
                    creditApplicationToSubmit[docType] = {
                        ...documents[docType],
                        pdfFiles: documents[docType].pdfFiles || []
                    };
                }
            }

            const createdApplication = await creditApplicationService.create(creditApplicationToSubmit);
            console.log('Solicitud de crédito creada:', createdApplication);
    
            navigate('/creditApplications');
    
        } catch (error) {
            console.error('Error durante el proceso de envío:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Client:
                <select onChange={(e) => setSelectedClientId(e.target.value)} value={selectedClientId} required>
                    <option value="" disabled>Select a client...</option>
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name} {client.lastName}</option>
                    ))}
                </select>
            </label>

            <label>
                Loan Type:
                <select onChange={handleLoanTypeChange} required>
                    <option value="">Select Loan Type</option>
                    <option value="First home">First home</option>
                    <option value="Second home">Second home</option>
                    <option value="Commercial Properties">Commercial Properties</option>
                    <option value="Remodeling">Remodeling</option>
                </select>
            </label>

            <label>
                Monto solicitado:
                <input type="number" value={requestedAmount} onChange={(e) => setRequestedAmount(e.target.value)}
                       required/>
            </label>

            <label>
                Meses pedidos:
                <input type="number" value={requestedMonths} onChange={(e) => setRequestedMonths(e.target.value)}
                       required/>
            </label>

            {/* Render fields for each document based on loan type */}
            {Object.keys(documents).map(docType => (
                <div key={docType}>
                    {docType === 'incomeProof' && (
                        <>
                            <h4>Comprobante de Ingreso</h4>
                            <label>
                                Monto promedio de ingreso:
                                <input type="number"
                                       onChange={(e) => handleDocumentChange(docType, 'averageIncomeAmount', e.target.value)}
                                       required/>
                            </label>
                            <label>
                                Fecha de inicio de trabajo:
                                <input type="date"
                                       onChange={(e) => handleDocumentChange(docType, 'startDate', e.target.value)}
                                       required/>
                            </label>
                            <label>
                                Fecha de emisión del último documento:
                                <input type="date"
                                       onChange={(e) => handleDocumentChange(docType, 'dateIssued', e.target.value)}
                                       required/>
                            </label>
                            <label>
                                Subir archivo comprobante::
                                <input type="file" accept="application/pdf" multiple
                                       onChange={(e) => handleFileUpload(docType, e.target.files)}/>
                            </label>
                            <ul>
                                {documents[docType].pdfFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`}
                                           download={`PDF_${index + 1}.pdf`}>
                                            PDF {index + 1}
                                        </a>
                                        <button type="button" onClick={() => handleFileRemove(docType, index)}>Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {docType === 'valuationCertificate' && (
                        <>
                            <h4>Certificado de avalúo</h4>
                            <label>
                                Tasador:
                                <input type="text"
                                       onChange={(e) => handleDocumentChange(docType, 'appraiser', e.target.value)}
                                       required/>
                            </label>
                            <label>
                                Valor de la propiedad:
                                <input type="number"
                                       onChange={(e) => handleDocumentChange(docType, 'propertyValue', e.target.value)}
                                       required/>
                            </label>
                            <label>
                                Fecha de valoración:
                                <input type="date"
                                       onChange={(e) => handleDocumentChange(docType, 'valuationDate', e.target.value)}
                                       required/>
                            </label>
                            <label>
                                Subir archivo comprobante::
                                <input type="file" accept="application/pdf" multiple
                                       onChange={(e) => handleFileUpload(docType, e.target.files)}/>
                            </label>
                            <ul>
                                {documents[docType].pdfFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`}
                                           download={`PDF_${index + 1}.pdf`}>
                                            PDF {index + 1}
                                        </a>
                                        <button type="button" onClick={() => handleFileRemove(docType, index)}>Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {docType === 'firstHomeDeed' && (
                        <>
                            <h4>Escritura de la primera vivienda</h4>
                            <label>
                                Dirección de la Propiedad:
                                <input type="text"
                                       onChange={(e) => handleDocumentChange(docType, 'propertyAddress', e.target.value)}
                                       required/>
                            </label>
                            <label>
                                Número de certificado:
                                <input type="number"
                                       onChange={(e) => handleDocumentChange(docType, 'deedNumber', e.target.value)}
                                       required/>
                            </label>
                            <label>
                                Fecha de registro:
                                <input type="date"
                                       onChange={(e) => handleDocumentChange(docType, 'registrationDate', e.target.value)}
                                       required/>
                            </label>
                            <label>
                                Subir archivo comprobante:
                                <input type="file" accept="application/pdf" multiple
                                       onChange={(e) => handleFileUpload(docType, e.target.files)}/>
                            </label>
                            <ul>
                                {documents[docType].pdfFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`}
                                           download={`PDF_${index + 1}.pdf`}>
                                            PDF {index + 1}
                                        </a>
                                        <button type="button" onClick={() => handleFileRemove(docType, index)}>Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {docType === 'businessFinancialStatement' && (
                        <>
                            <h4>Estado financiero del negocio</h4>
                            <label>
                                Ingresos activos:
                                <input type="number"
                                       onChange={(e) => handleDocumentChange(docType, 'totalAssets', e.target.value)}
                                       required/>
                            </label>
                            <label>
                                Ingresos pasivos:
                                <input type="number"
                                       onChange={(e) => handleDocumentChange(docType, 'totalLiabilities', e.target.value)}
                                       required/>
                            </label>
                            <label>
                                Ingresos neto:
                                <input type="number"
                                       onChange={(e) => handleDocumentChange(docType, 'netIncome', e.target.value)}
                                       required/>
                            </label>
                            <label>
                                Subir archivo comprobante::
                                <input type="file" accept="application/pdf" multiple
                                       onChange={(e) => handleFileUpload(docType, e.target.files)}/>
                            </label>
                            <ul>
                                {documents[docType].pdfFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`}
                                           download={`PDF_${index + 1}.pdf`}>
                                            PDF {index + 1}
                                        </a>
                                        <button type="button" onClick={() => handleFileRemove(docType, index)}>Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {docType === 'businessPlan' && (
                        <>
                            <h4>Plan de negocio</h4>
                            <label>
                                Mercado objetivo:
                                <input type="text"
                                       onChange={(e) => handleDocumentChange(docType, 'targetMarket', e.target.value)}
                                       required/>
                            </label>
                            <label>
                                Descripción del negocio:
                                <textarea
                                    onChange={(e) => handleDocumentChange(docType, 'businessDescription', e.target.value)}
                                    required/>
                            </label>
                            <label>
                                Ingresos esperados:
                                <input type="number"
                                       onChange={(e) => handleDocumentChange(docType, 'projectedRevenue', e.target.value)}
                                       required/>
                            </label>
                            <label>
                                Subir archivo comprobante::
                                <input type="file" accept="application/pdf" multiple
                                       onChange={(e) => handleFileUpload(docType, e.target.files)}/>
                            </label>
                            <ul>
                                {documents[docType].pdfFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`}
                                           download={`PDF_${index + 1}.pdf`}>
                                            PDF {index + 1}
                                        </a>
                                        <button type="button" onClick={() => handleFileRemove(docType, index)}>Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {docType === 'renovationBudget' && (
                        <>
                            <h4>Prosupuesto de remodelación</h4>
                            <label>
                                Costo estimado:
                                <input type="number"
                                       onChange={(e) => handleDocumentChange(docType, 'estimatedCost', e.target.value)}
                                       required/>
                            </label>
                            <label>
                                Fecha esperada de finalización:
                                <input type="date"
                                       onChange={(e) => handleDocumentChange(docType, 'expectedCompletionDate', e.target.value)}
                                       required/>
                            </label>
                            <label>
                                Subir archivo comprobante::
                                <input type="file" accept="application/pdf" multiple
                                       onChange={(e) => handleFileUpload(docType, e.target.files)}/>
                            </label>
                            <ul>
                                {documents[docType].pdfFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`}
                                           download={`PDF_${index + 1}.pdf`}>
                                            PDF {index + 1}
                                        </a>
                                        <button type="button" onClick={() => handleFileRemove(docType, index)}>Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            ))}

            <button type="submit">Submit</button>
        </form>
    );
};

export default CreateCreditApplication;
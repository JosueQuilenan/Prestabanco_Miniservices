import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import creditApplicationService from '../services/creditApplication.service';
import clientService from '../services/client.service';
import loanTypeService from '../services/loanType.service';
import '../assets/CreditSimulation.css';

const CreateCreditApplication = () => {
    const [requestedAmount, setRequestedAmount] = useState(0);
    const [requestedMonths, setRequestedMonths] = useState(0);
    const [selectedLoanType, setSelectedLoanType] = useState(null);
    const [loanType, setLoanType] = useState('');
    const [propertyValue, setPropertyValue] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessages, setErrorMessages] = useState({ amount: '', months: '', propertyValue: '' });
    const [inputError, setInputError] = useState({ amount: false, months: false, propertyValue: false });
    const [isFormValid, setIsFormValid] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [documents, setDocuments] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        const response = await clientService.getAll();
        setClients(response.data);
    };

    const loanTypeOptions = [
        { name: 'Primera vivienda', value: 'First home', documents: { incomeProof: {label : 'Comprobante de ingresos', pdfFiles: []}, valuationCertificate: { label: 'Certificado de avalúo', pdfFiles: []}} },
        { name: 'Segunda vivienda', value: 'Second home', documents: { incomeProof: {label : 'Comprobante de ingresos', pdfFiles: []}, valuationCertificate: { label: 'Certificado de avalúo', pdfFiles: []}}, firstHomeDeed: {label: 'Escritura de la primera vivienda', pdfFiles: []} },
        { name: 'Propiedades Comerciales', value: 'Commercial Properties', documents: { businessFinancialStatement: { label: 'Estado financiero del negocio', pdfFiles: []}, incomeProof: {label : 'Comprobante de ingresos', pdfFiles: []}, valuationCertificate: { label: 'Certificado de avalúo', pdfFiles: []}}, businessPlan : { label: 'Plan de negocios', pdfFiles: []} },
        { name: 'Remodelación', value: 'Remodeling', documents: {incomeProof: {label : 'Comprobante de ingresos', pdfFiles: []}, valuationCertificate: { label: 'Certificado de avalúo', pdfFiles: []}, renovationBudget: { label: 'Presupuesto para remodelación', pdfFiles: []}}} 
    ];

    const togglePopup = () => {
        setIsOpen(!isOpen);
    };

    const formatAmount = (value) => {
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const validateNumber = (value) => {
        const intValue = parseInt(value.replace(/\./g, ''), 10);
        return !isNaN(intValue) && intValue > 0 && intValue <= 2147483647;
    };
    
    const validateAmount = (value) => {
        if (!validateNumber(value)) return false;
        if (selectedLoanType && propertyValue) {
            const maxAmount = selectedLoanType.maxAmountFinancing * parseInt(propertyValue.replace(/\./g, ''), 10);
            return parseInt(value.replace(/\./g, ''), 10) <= maxAmount;
        }
        return true;
    };
    
    const validateMonths = (value) => {
        if (selectedLoanType) {
            return value <= selectedLoanType.maxTerm * 12;
        }
        return true;
    };
    
    const validatePropertyValue = (value) => {
        return validateNumber(value);
    };

    const validateDate = (field, value) => {
        const today = new Date();
        const dateValue = new Date(value);
        let minDate, maxDate;
    
        if (field === 'startDate') {
            minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
            maxDate = today;
        } else if (field === 'valuationDate' || field === 'registrationDate') {
            minDate = new Date(1800, 0, 1);
            maxDate = today;
        } else if (field === 'expectedCompletionDate') {
            minDate = today;
            maxDate = new Date(today.getFullYear() + 50, today.getMonth(), today.getDate());
        } else {
            minDate = new Date(1900, 0, 1);
            maxDate = today;
        }
    
        return dateValue >= minDate && dateValue <= maxDate;
    };

    const handleLoanTypeChange = async (e) => {
            const loanTypeName = e.target.value;
            setLoanType(loanTypeName);
            setErrorMessage(null);
    
            const selectedOption = loanTypeOptions.find(option => option.value === loanTypeName);
            setDocuments(selectedOption ? selectedOption.documents : []);
    
            if (loanTypeName) {
                setIsLoading(true);
                try {
                    const loanTypeResponse = await loanTypeService.getByLoanTypeName(loanTypeName);
                    setSelectedLoanType(loanTypeResponse.data);
                    console.log('Tipo de préstamo seleccionado:', loanTypeResponse.data);
                } catch (error) {
                    console.error('Error al obtener el tipo de préstamo:', error);
                    setErrorMessage('Hubo un error al obtener el tipo de préstamo.');
                } finally {
                    setIsLoading(false);
                }
            }
    };

    const handleInterestRateChange = (e) => {
        setInterestRate(e.target.value);
    };

    const checkFormValidity = () => {
        const isValid = 
            validateAmount(requestedAmount) && 
            validateMonths(requestedMonths) &&
            validatePropertyValue(propertyValue) &&
            loanType &&
            interestRate &&
            Object.keys(documents).every(docType => {
                const doc = documents[docType];
                return Object.keys(doc).every(field => {
                    if (['propertyValue', 'averageIncomeAmount', 'totalAssets', 'totalLiabilities', 'netIncome', 'projectedRevenue', 'estimatedCost'].includes(field)) {
                        return validateNumber(doc[field]);
                    } else if (['startDate', 'valuationDate', 'registrationDate', 'expectedCompletionDate'].includes(field)) {
                        return validateDate(field, doc[field]);
                    }
                    return true;
                });
            });
        setIsFormValid(isValid);
    };

    const handleDocumentChange = (docType, field, value) => {

        // Si el campo es numérico, eliminar caracteres no numéricos y limitar a 10 caracteres
        if (['propertyValue', 'averageIncomeAmount', 'totalAssets', 'totalLiabilities', 'netIncome', 'projectedRevenue', 'estimatedCost'].includes(field)) {
            value = value.replace(/[^0-9]/g, ''); // Eliminar caracteres no numéricos
            if (value.length > 10) {
                value = value.slice(0, 10); // Limitar la longitud del input a 10 caracteres
            }
        }
    
        // Validar el valor según el tipo de campo
        let isValid = true;
        if (field === 'propertyValue') {
            isValid = validatePropertyValue(value);
            setPropertyValue(value);
            setInputError(prev => ({ ...prev, propertyValue: !isValid }));
            setErrorMessages(prev => ({ ...prev, propertyValue: !isValid ? 'Valor de propiedad inválido' : '' }));
        } else if (['averageIncomeAmount', 'totalAssets', 'totalLiabilities', 'netIncome', 'projectedRevenue', 'estimatedCost'].includes(field)) {
            isValid = validateNumber(value);
            setInputError(prev => ({ ...prev, [field]: !isValid }));
            setErrorMessages(prev => ({ ...prev, [field]: !isValid ? 'Valor inválido' : '' }));
        } else if (['startDate', 'valuationDate', 'registrationDate', 'expectedCompletionDate'].includes(field)) {
            isValid = validateDate(field, value);
            setInputError(prev => ({ ...prev, [field]: !isValid }));
            setErrorMessages(prev => ({ ...prev, [field]: !isValid ? 'Fecha inválida' : '' }));
        }
    
        // Actualizar el estado de documentos
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
    
        try {
            const uploadedFiles = await Promise.all(fileReaders);
            setDocuments((prev) => ({
                ...prev,
                [docType]: {
                    ...prev[docType],
                    pdfFiles: [
                        ...(prev[docType]?.pdfFiles || []),
                        ...uploadedFiles.map(pdfFile => ({ pdfFile }))
                    ],
                },
            }));
        } catch (error) {
            console.error('Error al subir archivos:', error);
        }
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

    // Reiniciar formulario
    const resetForm = () => {
        setRequestedAmount('');
        setRequestedMonths('');
        setLoanType('');
        setSelectedLoanType(null);
        setPropertyValue('');
        setInterestRate('');
        setErrorMessage(null);
        setInputError({ amount: false, months: false, propertyValue: false });
        setErrorMessages({ amount: '', months: '', propertyValue: '' });
        setIsFormValid(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let creditApplicationToSubmit = {
            clientId: selectedClientId,
            requestedAmount,
            interestRate,
            requiredMonths: requestedMonths,
            applicationDate: new Date().toISOString().split('T')[0],
            loanTypeName: loanType,
        };

        for (const docType in documents) {
            if (documents[docType]) {
                const { label, ...docData } = documents[docType]; // Eliminar el campo 'label'
                creditApplicationToSubmit[docType] = {
                    ...docData,
                    pdfFiles: documents[docType].pdfFiles || []
                };
            }
        }
        console.log('Solicitud de crédito a enviar: ', creditApplicationToSubmit);
        try {

            const createdApplication = await creditApplicationService.create(creditApplicationToSubmit);
            console.log('Solicitud de crédito creada:', createdApplication);
    
            navigate('/creditApplications');
    
        } catch (error) {
            console.error('Error durante el proceso de envío:', error);
        }
    };

    const handleInputChange = (e, field) => {
        let value = e.target.value;

        // Si el campo es numérico, eliminar caracteres no numéricos y limitar a 10 caracteres
        if (field === 'amount' || field === 'months' || field === 'propertyValue') {
            value = value.replace(/[^0-9]/g, ''); // Eliminar caracteres no numéricos
            if (value.length > 10) return; // Limitar la longitud del input a 10 caracteres (máximo valor de int)
        }
        switch (field) {
            case 'amount':
                setRequestedAmount(value);
                setInputError(prev => ({ ...prev, amount: !validateAmount(value) }));
                setErrorMessages(prev => ({ ...prev, amount: !validateAmount(value) ? `Monto no puede exeder el ${selectedLoanType.maxAmountFinancing * 100}% del valor de la propiedad. ` : '' }));
                break;
            case 'months':
                setRequestedMonths(value);
                setInputError(prev => ({ ...prev, months: !validateMonths(value) }));
                setErrorMessages(prev => ({ ...prev, months: !validateMonths(value) ? 'Los meses no deben ser mayores que el máximo' : '' }));
                break;
            default:
                
                if (value.length > 10) return;
                break;
        }
        checkFormValidity();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <button type="button" onClick={togglePopup}>Ver información</button>
                {isOpen && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <h3>Información relevante</h3>
                            <p>- Completa todos los campos correctamente para habilitar el botón de cálculo.</p>
                            <h4>Detalles de los tipos de préstamos</h4>
                            <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                <thead>
                                    <tr>
                                        <th>Tipo de Préstamo</th>
                                        <th>Plazo Máximo</th>
                                        <th>Tasa de Interés (Anual)</th>
                                        <th>Monto Máximo de Financiamiento</th>
                                        <th>Requisitos Documentales</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Primera Vivienda</td>
                                        <td>30 años</td>
                                        <td>3.5% - 5.0%</td>
                                        <td>80% del valor de la propiedad</td>
                                        <td>
                                            - Comprobante de ingresos<br />
                                            - Certificado de avalúo<br />
                                            - Historial crediticio
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Segunda Vivienda</td>
                                        <td>20 años</td>
                                        <td>4.0% - 6.0%</td>
                                        <td>70% del valor de la propiedad</td>
                                        <td>
                                            - Comprobante de ingresos<br />
                                            - Certificado de avalúo<br />
                                            - Escritura de la primera vivienda<br />
                                            - Historial crediticio
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Propiedades Comerciales</td>
                                        <td>25 años</td>
                                        <td>5.0% - 7.0%</td>
                                        <td>60% del valor de la propiedad</td>
                                        <td>
                                            - Estado financiero del negocio<br />
                                            - Comprobante de ingresos<br />
                                            - Certificado de avalúo<br />
                                            - Plan de negocios
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Remodelación</td>
                                        <td>15 años</td>
                                        <td>4.5% - 6.0%</td>
                                        <td>50% del valor actual de la propiedad</td>
                                        <td>
                                            - Comprobante de ingresos<br />
                                            - Presupuesto de la remodelación<br />
                                            - Certificado de avalúo actualizado
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <button type="button" onClick={togglePopup}>Cerrar</button>
                        </div>
                    </div>
                )}
            </div>
            <label>
                Cliente:
                <select onChange={(e) => setSelectedClientId(e.target.value)} value={selectedClientId} required>
                    <option value="" disabled>Selecciona un cliente...</option>
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name} {client.lastName}</option>
                    ))}
                </select>
            </label>

            <div>
                <label>Tipo de préstamo:</label>
                <select value={loanType} onChange={handleLoanTypeChange}>
                    <option value="">Selecciona el tipo de préstamo</option>
                    {loanTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label> Plazo en meses {selectedLoanType && `(0 - ${selectedLoanType.maxTerm * 12})`}: </label>
                <input 
                type="number"
                value={requestedMonths}
                onChange={(e) => handleInputChange(e, 'months')}
                className={inputError.months ? 'input-error' : ''}
                placeholder={selectedLoanType && `máximo ${selectedLoanType.maxTerm * 12}`}
                disabled={!loanType}
                />
                {inputError.months && <p className="error-message">{errorMessages.months}</p>}
            </div>
            <div>
                <label>Tasa de interés {selectedLoanType ? `(${parseFloat(selectedLoanType.minInterestRate*100).toFixed(1)}% - ${parseFloat(selectedLoanType.maxInterestRate*100).toFixed(1)}%)` : ''}:</label>
                <input
                    type="range"
                    min={selectedLoanType ? selectedLoanType.minInterestRate*100 : 0}
                    max={selectedLoanType ? selectedLoanType.maxInterestRate*100 : 100}
                    step="0.01"
                    value={interestRate}
                    onChange={handleInterestRateChange}
                    disabled={!loanType}
                />
                <span>{interestRate}%</span>
            </div>
            <div>
                <label>Cantidad solicitado:</label>
                <input
                    type="text"
                    value={requestedAmount}
                    onChange={(e) => handleInputChange(e, 'amount')}
                    className={inputError.amount ? 'input-error' : ''}
                    disabled={!propertyValue || !loanType}
                    title="Recuerda completar el valor de la propiedad"
                />
                {inputError.amount && <p className="error-message">{errorMessages.amount}</p>}
            </div>
            {/* Render fields for each document based on loan type */}
            {loanTypeOptions.find(option => option.value === loanType)?.documents && Object.keys(loanTypeOptions.find(option => option.value === loanType).documents).map(docType => (
                <div key={docType} className="document-section">
                    {docType === 'incomeProof' && (
                        <>
                            <h4>{loanTypeOptions.find(option => option.value === loanType).documents[docType].label}</h4>
                            <div className="form-group">
                                <label>Monto promedio de ingreso:</label>
                                <input
                                    type="number"
                                    name="averageIncomeAmount"
                                    value={documents[docType]?.averageIncomeAmount || ''}
                                    onChange={(e) => handleDocumentChange(docType, 'averageIncomeAmount', e.target.value)}
                                    className={inputError.averageIncomeAmount ? 'input-error' : ''}
                                    required
                                />
                                {inputError.averageIncomeAmount && <p className="error-message">{errorMessages.averageIncomeAmount}</p>}
                            </div>
                            <div className="form-group">
                                <label>Fecha de inicio de trabajo:</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={documents[docType]?.startDate || ''}
                                    onChange={(e) => handleDocumentChange(docType, 'startDate', e.target.value)}
                                    className={inputError.startDate ? 'input-error' : ''}
                                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                />
                                {inputError.startDate && <p className="error-message">{errorMessages.startDate}</p>}
                            </div>
                            <div className="form-group">
                                <label>Fecha de emisión del último documento:</label>
                                <input
                                    type="date"
                                    name="dateIssued"
                                    value={documents[docType]?.dateIssued || ''}
                                    onChange={(e) => handleDocumentChange(docType, 'dateIssued', e.target.value)}
                                    className={inputError.dateIssued ? 'input-error' : ''}
                                    min="1900-01-01"
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                />
                                {inputError.dateIssued && <p className="error-message">{errorMessages.dateIssued}</p>}
                            </div>
                            <div className="form-group">
                                <label>Subir archivo comprobante:</label>
                                <input type="file" accept="application/pdf" multiple onChange={(e) => handleFileUpload(docType, e.target.files)} />
                            </div>
                            <ul>
                                {documents[docType]?.pdfFiles?.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`} download={`PDF_${index + 1}.pdf`}>PDF {index + 1}</a>
                                        <button type="button" onClick={() => handleFileRemove(docType, index)}>Remove</button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {docType === 'valuationCertificate' && (
                        <>
                            <h4>{loanTypeOptions.find(option => option.value === loanType).documents[docType].label}</h4>
                            <div className="form-group">
                                <label>Nombre del Tasador:</label>
                                <input type="text" name="appraiser" value={documents[docType]?.appraiser || ''} onChange={(e) => handleDocumentChange(docType, 'appraiser', e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Valor de la propiedad:</label>
                                <input
                                    type="number"
                                    name="propertyValue"
                                    value={documents[docType]?.propertyValue || ''}
                                    onChange={(e) => handleDocumentChange(docType, 'propertyValue', e.target.value)}
                                    className={inputError.propertyValue ? 'input-error' : ''}
                                    required
                                />
                                {inputError.propertyValue && <p className="error-message">{errorMessages.propertyValue}</p>}
                            </div>
                            <div className="form-group">
                                <label>Fecha de valoración:</label>
                                <input
                                    type="date"
                                    name="valuationDate"
                                    value={documents[docType]?.valuationDate || ''}
                                    onChange={(e) => handleDocumentChange(docType, 'valuationDate', e.target.value)}
                                    className={inputError.valuationDate ? 'input-error' : ''}
                                    min="1800-01-01"
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                />
                                {inputError.valuationDate && <p className="error-message">{errorMessages.valuationDate}</p>}
                            </div>
                            <div className="form-group">
                                <label>Subir archivo comprobante:</label>
                                <input type="file" accept="application/pdf" multiple onChange={(e) => handleFileUpload(docType, e.target.files)} />
                            </div>
                            <ul>
                                {documents[docType]?.pdfFiles?.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`} download={`PDF_${index + 1}.pdf`}>PDF {index + 1}</a>
                                        <button type="button" onClick={() => handleFileRemove(docType, index)}>Remove</button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {docType === 'firstHomeDeed' && (
                        <>
                            <h4>{loanTypeOptions.find(option => option.value === loanType).documents[docType].label}</h4>
                            <div className="form-group">
                                <label>Dirección de la Propiedad:</label>
                                <input type="text" name="propertyAddress" value={documents[docType]?.propertyAddress || ''} onChange={(e) => handleDocumentChange(docType, 'propertyAddress', e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Número de certificado:</label>
                                <input
                                    type="number"
                                    name="deedNumber"
                                    value={documents[docType]?.deedNumber || ''}
                                    onChange={(e) => handleDocumentChange(docType, 'deedNumber', e.target.value)}
                                    className={inputError.deedNumber ? 'input-error' : ''}
                                    required
                                />
                                {inputError.deedNumber && <p className="error-message">{errorMessages.deedNumber}</p>}
                            </div>
                            <div className="form-group">
                                <label>Fecha de registro:</label>
                                <input
                                    type="date"
                                    name="registrationDate"
                                    value={documents[docType]?.registrationDate || ''}
                                    onChange={(e) => handleDocumentChange(docType, 'registrationDate', e.target.value)}
                                    className={inputError.registrationDate ? 'input-error' : ''}
                                    min="1800-01-01"
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                />
                                {inputError.registrationDate && <p className="error-message">{errorMessages.registrationDate}</p>}
                            </div>
                            <div className="form-group">
                                <label>Subir archivo comprobante:</label>
                                <input type="file" accept="application/pdf" multiple onChange={(e) => handleFileUpload(docType, e.target.files)} />
                            </div>
                            <ul>
                                {documents[docType]?.pdfFiles?.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`} download={`PDF_${index + 1}.pdf`}>PDF {index + 1}</a>
                                        <button type="button" onClick={() => handleFileRemove(docType, index)}>Remove</button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {docType === 'businessFinancialStatement' && (
                        <>
                            <h4>{loanTypeOptions.find(option => option.value === loanType).documents[docType].label}</h4>
                            <div className="form-group">
                                <label>Ingresos activos:</label>
                                <input
                                    type="number"
                                    name="totalAssets"
                                    value={documents[docType]?.totalAssets || ''}
                                    onChange={(e) => handleDocumentChange(docType, 'totalAssets', e.target.value)}
                                    className={inputError.totalAssets ? 'input-error' : ''}
                                    required
                                />
                                {inputError.totalAssets && <p className="error-message">{errorMessages.totalAssets}</p>}
                            </div>
                            <div className="form-group">
                                <label>Ingresos pasivos:</label>
                                <input
                                    type="number"
                                    name="totalLiabilities"
                                    value={documents[docType]?.totalLiabilities || ''}
                                    onChange={(e) => handleDocumentChange(docType, 'totalLiabilities', e.target.value)}
                                    className={inputError.totalLiabilities ? 'input-error' : ''}
                                    required
                                />
                                {inputError.totalLiabilities && <p className="error-message">{errorMessages.totalLiabilities}</p>}
                            </div>
                            <div className="form-group">
                                <label>Ingresos neto:</label>
                                <input
                                    type="number"
                                    name="netIncome"
                                    value={documents[docType]?.netIncome || ''}
                                    onChange={(e) => handleDocumentChange(docType, 'netIncome', e.target.value)}
                                    className={inputError.netIncome ? 'input-error' : ''}
                                    required
                                />
                                {inputError.netIncome && <p className="error-message">{errorMessages.netIncome}</p>}
                            </div>
                            <div className="form-group">
                                <label>Subir archivo comprobante:</label>
                                <input type="file" accept="application/pdf" multiple onChange={(e) => handleFileUpload(docType, e.target.files)} />
                            </div>
                            <ul>
                                {documents[docType]?.pdfFiles?.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`} download={`PDF_${index + 1}.pdf`}>PDF {index + 1}</a>
                                        <button type="button" onClick={() => handleFileRemove(docType, index)}>Remove</button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {docType === 'businessPlan' && (
                        <>
                            <h4>{loanTypeOptions.find(option => option.value === loanType).documents[docType].label}</h4>
                            <div className="form-group">
                                <label>Mercado objetivo:</label>
                                <input type="text" name="targetMarket" value={documents[docType]?.targetMarket || ''} onChange={(e) => handleDocumentChange(docType, 'targetMarket', e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Descripción del negocio:</label>
                                <textarea name="businessDescription" value={documents[docType]?.businessDescription || ''} onChange={(e) => handleDocumentChange(docType, 'businessDescription', e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Ingresos esperados:</label>
                                <input
                                    type="number"
                                    name="projectedRevenue"
                                    value={documents[docType]?.projectedRevenue || ''}
                                    onChange={(e) => handleDocumentChange(docType, 'projectedRevenue', e.target.value)}
                                    className={inputError.projectedRevenue ? 'input-error' : ''}
                                    required
                                />
                                {inputError.projectedRevenue && <p className="error-message">{errorMessages.projectedRevenue}</p>}
                            </div>
                            <div className="form-group">
                                <label>Subir archivo comprobante:</label>
                                <input type="file" accept="application/pdf" multiple onChange={(e) => handleFileUpload(docType, e.target.files)} />
                            </div>
                            <ul>
                                {documents[docType]?.pdfFiles?.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`} download={`PDF_${index + 1}.pdf`}>PDF {index + 1}</a>
                                        <button type="button" onClick={() => handleFileRemove(docType, index)}>Remove</button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {docType === 'renovationBudget' && (
                        <>
                            <h4>{loanTypeOptions.find(option => option.value === loanType).documents[docType].label}</h4>
                            <div className="form-group">
                                <label>Costo estimado:</label>
                                <input
                                    type="number"
                                    name="estimatedCost"
                                    value={documents[docType]?.estimatedCost || ''}
                                    onChange={(e) => handleDocumentChange(docType, 'estimatedCost', e.target.value)}
                                    className={inputError.estimatedCost ? 'input-error' : ''}
                                    required
                                />
                                {inputError.estimatedCost && <p className="error-message">{errorMessages.estimatedCost}</p>}
                            </div>
                            <div className="form-group">
                                <label>Fecha esperada de finalización:</label>
                                <input
                                    type="date"
                                    name="expectedCompletionDate"
                                    value={documents[docType]?.expectedCompletionDate || ''}
                                    onChange={(e) => handleDocumentChange(docType, 'expectedCompletionDate', e.target.value)}
                                    className={inputError.expectedCompletionDate ? 'input-error' : ''}
                                    min={new Date().toISOString().split('T')[0]}
                                    max={new Date(new Date().setFullYear(new Date().getFullYear() + 50)).toISOString().split('T')[0]}
                                    required
                                />
                                {inputError.expectedCompletionDate && <p className="error-message">{errorMessages.expectedCompletionDate}</p>}
                            </div>
                            <div className="form-group">
                                <label>Subir archivo comprobante:</label>
                                <input type="file" accept="application/pdf" multiple onChange={(e) => handleFileUpload(docType, e.target.files)} />
                            </div>
                            <ul>
                                {documents[docType]?.pdfFiles?.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`} download={`PDF_${index + 1}.pdf`}>PDF {index + 1}</a>
                                        <button type="button" onClick={() => handleFileRemove(docType, index)}>Remove</button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            ))}

            <button type="submit" disabled={!isFormValid} title="Recuerda completar todos los campos correctamente.">Crear solicitud</button>
        </form>
    );
};

export default CreateCreditApplication;
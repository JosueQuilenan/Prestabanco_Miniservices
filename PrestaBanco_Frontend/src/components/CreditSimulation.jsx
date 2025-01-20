import React, { useState } from 'react';
import loanTypeService from '../services/loanType.service';
import { useNavigate } from 'react-router-dom';
import '../assets/CreditSimulation.css';

const CreditSimulation = () => {
    const [requestedAmount, setRequestedAmount] = useState('');
    const [requestedMonths, setRequestedMonths] = useState('');
    const [selectedLoanTypeName, setSelectedLoanTypeName] = useState('');
    const [selectedLoanType, setSelectedLoanType] = useState(null);
    const [monthlyPayment, setMonthlyPayment] = useState(null);
    const [totalPayment, setTotalPayment] = useState(null);
    const [propertyValue, setPropertyValue] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [inputError, setInputError] = useState({ amount: false, months: false, propertyValue: false });
    const [errorMessages, setErrorMessages] = useState({ amount: '', months: '', propertyValue: '' });
    const [isOpen, setIsOpen] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    
    const [requiredDocuments, setRequiredDocuments] = useState([]);

    const navigate = useNavigate();

    // Opciones de tipos de préstamos
    const loanTypeOptions = [
        { name: 'Primera vivienda', value: 'First home', documents: ['Comprobante de ingresos', 'Certificado de avalúo', 'Un historial crediticio con nuestro banco'] },
        { name: 'Segunda vivienda', value: 'Second home', documents: ['Comprobante de ingresos', 'Certificado de avalúo', 'Escritura de la primera vivienda', 'Un historial crediticio con nuestro banco'] },
        { name: 'Propiedades Comerciales', value: 'Commercial Properties', documents: ['Estado financiero del negocio', 'Comprobante de ingresos', 'Certificado de avalúo', 'Plan de negocios'] },
        { name: 'Remodelación', value: 'Remodeling', documents: ['Comprobante de ingresos', 'Presupuesto de la remodelación', 'Certificado de avalúo actualizado'] }
    ];

    const togglePopup = () => {
        setIsOpen(!isOpen);
    };

    const formatNumber = (value) => {
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Función para validar los inputs
    const validateNumber = (value) => {
        const intValue = parseInt(value, 10);
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
        if (!validateNumber(value)) return false;
        if (selectedLoanType) {
            return value <= selectedLoanType.maxTerm * 12;
        }
        return true;
    };
    
    const validatePropertyValue = (value) => {
        return validateNumber(value);
    };
    
    const handleInputChange = (e, type) => {
        const value = e.target.value.replace(/[^0-9]/g, ''); // Eliminar caracteres no numéricos
        if (value.length > 10) return; // Limitar la longitud del input a 10 caracteres (máximo valor de int)
        let isValid = true;
        let errorMessage = '';
    
        if (type === 'amount') {
            setRequestedAmount(formatNumber(value));
            isValid = validateAmount(value);
            errorMessage = isValid ? '' : `El monto solicitado no puede exceder el ${selectedLoanType.maxAmountFinancing * 100}% del valor de la propiedad.`;
        } else if (type === 'months') {
            setRequestedMonths(value);
            isValid = validateMonths(value);
            errorMessage = isValid ? '' : `El plazo no puede exceder los ${selectedLoanType.maxTerm * 12} meses.`;
        } else if (type === 'propertyValue') {
            setPropertyValue(formatNumber(value));
            isValid = validatePropertyValue(value);
            errorMessage = isValid ? '' : 'Por favor, ingrese un valor de propiedad válido.';
        }
    
        // Actualizar estados de error y mensajes
        setErrorMessages(prevState => ({ ...prevState, [type]: errorMessage }));
        setInputError(prevState => ({ ...prevState, [type]: !isValid }));
    
        // Validar formulario general
        checkFormValidity();
    };
    
    
    const checkFormValidity = () => {
        const isValid = 
            validateAmount(requestedAmount) && 
            validateMonths(requestedMonths) &&
            validatePropertyValue(propertyValue) &&
            selectedLoanTypeName &&
            interestRate;
        setIsFormValid(isValid);
    };
    
    const handleInterestRateChange = (e) => {
        setInterestRate(e.target.value);
    };

    const handleLoanTypeChange = async (e) => {
        const loanTypeName = e.target.value;
        setSelectedLoanTypeName(loanTypeName);
        setErrorMessage(null);

        const selectedOption = loanTypeOptions.find(option => option.value === loanTypeName);
        setRequiredDocuments(selectedOption ? selectedOption.documents : []);

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

    // Calcular pago mensual
    const handleCalculatePayment = async () => {
        if (!isFormValid) return;

        setIsLoading(true);
        try {
            console.log(requestedAmount.replace(/\./g, ''), requestedMonths, interestRate);
            const response = await loanTypeService.calculateMonthlyPayment(requestedAmount.replace(/\./g, ''), requestedMonths, interestRate);
            const response2 = await loanTypeService.calculateTotalLoanCost(requestedAmount.replace(/\./g, ''), requestedMonths, interestRate);
            setMonthlyPayment(response.data);
            setTotalPayment(response2.data);
        } catch (error) {
            console.error('Error al calcular el pago mensual o total:', error);
            setErrorMessage('Hubo un error al calcular el pago mensual.');
            setErrorMessage('Hubo un error al calcular el pago mensual o total.');
        } finally {
            setIsLoading(false);
        }
    };

    // Reiniciar formulario
    const resetForm = () => {
        setRequestedAmount('');
        setRequestedMonths('');
        setSelectedLoanTypeName('');
        setSelectedLoanType(null);
        setMonthlyPayment(null);
        setPropertyValue('');
        setInterestRate('');
        setErrorMessage(null);
        setInputError({ amount: false, months: false, propertyValue: false });
        setErrorMessages({ amount: '', months: '', propertyValue: '' });
        setIsFormValid(false);
    };

    return (
        <div>
            <h2>Simulación de crédito</h2>
            <div>
                <button onClick={togglePopup}>Ver información</button>
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
                            <button onClick={togglePopup}>Cerrar</button>
                        </div>
                    </div>
                )}
            </div>
            {errorMessage && (
                <div style={{ color: 'red', marginBottom: '20px' }}>
                    <strong>Error:</strong> {errorMessage}
                </div>
            )}
            <div>
                <label>Tipo de préstamo:</label>
                <select value={selectedLoanTypeName} onChange={handleLoanTypeChange}>
                    <option value="">Selecciona el tipo de préstamo</option>
                    {loanTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.name}
                        </option>
                    ))}
                </select>
            </div>
            
            <div>
            <label>Plazo en meses {selectedLoanType && `(0 - ${selectedLoanType.maxTerm * 12})`}:</label>
                <input
                    type="number"
                    value={requestedMonths}
                    onChange={(e) => handleInputChange(e, 'months')}
                    className={inputError.months ? 'input-error' : ''}
                    placeholder={selectedLoanType && `máximo ${selectedLoanType.maxTerm * 12}`}
                    disabled={!selectedLoanTypeName}
                />
                {inputError.months && <p className="error-message">{errorMessages.months}</p>}
            </div>

            <div>
                <label>Valor de la propiedad:</label>
                <input
                    type="text"
                    value={propertyValue}
                    onChange={(e) => handleInputChange(e, 'propertyValue')}
                    className={inputError.propertyValue ? 'input-error' : ''}
                    disabled={!selectedLoanTypeName}
                    placeholder='Ej: 1000000'
                    title="Ingrese el valor de la propiedad"
                />
                {inputError.propertyValue && <p className="error-message">{errorMessages.propertyValue}</p>}
            </div>

            <div>
                <label>Tasa de interés {selectedLoanType && `(${parseFloat(selectedLoanType.minInterestRate*100).toFixed(1)}% - ${parseFloat(selectedLoanType.maxInterestRate*100).toFixed(1)}%)`}:</label>
                <input
                    type="range"
                    min={selectedLoanType?.minInterestRate*100}
                    max={selectedLoanType?.maxInterestRate*100}
                    step="0.01"
                    value={interestRate}
                    onChange={handleInterestRateChange}
                    disabled={!selectedLoanTypeName}
                />
                <span>{interestRate}%</span>
            </div>
            <div>
                <label>Cantidad solicitada:</label>
                <input
                    type="text"
                    value={requestedAmount}
                    onChange={(e) => handleInputChange(e, 'amount')}
                    className={inputError.amount ? 'input-error' : ''}
                    disabled={!propertyValue || !selectedLoanTypeName}
                />
                {inputError.amount && <p className="error-message">{errorMessages.amount}</p>}
            </div>
            <button onClick={handleCalculatePayment} disabled={isLoading || !isFormValid}>Calcular Pagos</button>
            <button onClick={resetForm}>Reiniciar Formulario</button>
            {monthlyPayment && totalPayment && (
                <div>
                    <p>Pago mensual: ${formatNumber((parseFloat(monthlyPayment).toFixed(0)).toString())}</p>
                    <p>Pago total: ${formatNumber((parseFloat(totalPayment).toFixed(0)).toString())}</p>
                    <p>Nota: En una solicitud de crédito real necesitarás completar los documentos necesarios.</p>
                    <ul>
                        {requiredDocuments.map((doc, index) => (
                            <li key={index}>{doc}</li>
                        ))}
                    </ul>
                    <h4>¿Quieres hacer una solicitud de crédito real? ¡Haz click abajo!</h4>
                    <button onClick={() => navigate("/creditApplication/add")}>
                        Ir a solicitud de crédito
                    </button>
                </div>
            )}
            {isLoading && <p style={{ color: 'blue' }}>Cargando...</p>}
        </div>
    );
};

export default CreditSimulation;
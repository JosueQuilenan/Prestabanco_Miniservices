import React, { useState } from 'react';
import loanTypeService from '../services/loanType.service';
import { useNavigate } from "react-router-dom";

const CreditSimulation = () => {
    const [requestedAmount, setRequestedAmount] = useState(0);
    const [requestedMonths, setrequestedMonths] = useState(0);
    const [selectedLoanTypeName, setSelectedLoanTypeName] = useState('');
    const [selectedLoanType, setSelectedLoanType] = useState(null);
    const [monthlyPayment, setMonthlyPayment] = useState(null);
    const [requiredDocuments, setRequiredDocuments] = useState([]);
    const navigate = useNavigate();

    // Opciones de LoanType predefinidas con documentos requeridos
    const loanTypeOptions = [
        { name: 'Primera vivienda', value: 'First home', documents: ['Comprobante de ingresos', 'Certificado de avalúo', 'Un historial crediticio con nuestro banco'] },
        { name: 'Segunda vivienda', value: 'Second home', documents: ['Comprobante de ingresos', 'Certificado de avalúo', 'Escritura de la primera vivienda', 'Un historial crediticio con nuestro banco'] },
        { name: 'Propiedades Comerciales', value: 'Commercial Properties', documents: ['Estado financiero del negocio', 'Comprobante de ingresos', 'Certificado de avalúo', 'Plan de negocios'] },
        { name: 'Remodelación', value: 'Remodeling', documents: ['Comprobante de ingresos', 'Presupuesto de la remodelación', 'Certificado de avalúo actualizado'] }
    ];

    const handleLoanTypeChange = async (e) => {
        const loanTypeName = e.target.value;
        setSelectedLoanTypeName(loanTypeName);

        // Obtener los documentos requeridos localmente según el tipo de préstamo seleccionado
        const selectedOption = loanTypeOptions.find(option => option.value === loanTypeName);
        setRequiredDocuments(selectedOption ? selectedOption.documents : []);

        // Obtener el objeto completo del loanType usando el nombre seleccionado
        try {
            const loanTypeResponse = await loanTypeService.getByLoanTypeName(loanTypeName);
            setSelectedLoanType(loanTypeResponse.data);
            console.log("LoanType conseguido", loanTypeResponse.data);
        } catch (error) {
            console.error('Error fetching loan type by name:', error);
        }
    };

    const handleCalculatePayment = async () => {
        if (!selectedLoanType) {
            alert('Por favor selecciona un tipo de préstamo.');
            return;
        }

        try {
            const response = await loanTypeService.calculateMonthlyPayment(requestedAmount, requestedMonths, selectedLoanType.loanTypeName);
            setMonthlyPayment(response.data);
        } catch (error) {
            console.error('Error al calcular el pago mensual:', error);
            alert('Hubo un error al calcular el pago mensual.');
        }
    };

    const formatNumber = (number) => {
        return new Intl.NumberFormat('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number);
    };

    return (
        <div>
            <h2>Simulación de crédito</h2>
            <p>
            Préstamos Hipotecarios para Primera Vivienda: Ofrecen condiciones preferenciales
            para aquellos clientes que adquieren su primer hogar.
            </p>
            <p>
            Préstamos Hipotecarios para Segunda Vivienda: Diseñados para clientes que desean
            invertir en una segunda propiedad.
            </p>
            <p>Préstamos Hipotecarios para Propiedades Comerciales: Orientados a la compra de
            propiedades destinadas a actividades comerciales.</p>
            <p>Préstamos Hipotecarios para Remodelación: Ofrecen financiamiento para remodelar o
            ampliar propiedades existentes.</p>
            <div>
                <label>Monto solicitado:</label>
                <input
                    type="number"
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(e.target.value)}
                    placeholder="Ingresa monto solicitado"
                />
            </div>
            <div>
                <label>Tipo de préstamo:</label>
                <select value={selectedLoanTypeName} onChange={handleLoanTypeChange}>
                    <option value="">Selecciona el tipo de préstamo</option>
                    {loanTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label>¿Cúantos meses de plazo?</label>
                <input
                    type="number"
                    value={requestedMonths}
                    onChange={(e) => setrequestedMonths(e.target.value)}
                    placeholder="Ingrese los meses de plazo"
                />
            </div>
            <button onClick={handleCalculatePayment}>Calcular crédito</button>

            {monthlyPayment !== null && (
                <div>
                    <p><strong>Costo aproximado de la cuota mensual:</strong></p>

                    <div style={{ color: 'black', border: '2px solid green', padding: '10px', marginTop: '20px', borderRadius: '5px', backgroundColor: '#e6ffe6' }}>
                    <p> ${formatNumber(monthlyPayment)}</p>
                    </div>

                    <h3>Recuerda que si quieres hacer una solicitud de crédito real, necesitas subir ciertos documentos, para este tipo son:</h3>
                    <h4>Documentos requeridos</h4>
                    <ul>
                        {requiredDocuments.map((doc, index) => (
                            <li key={index}>{doc}</li>
                        ))}
                    </ul>
                    <h4>¿Quieres hacer una solicutd de crédito real? ¡Haz click abajo!</h4>
                    <button onClick={() => navigate("/creditApplication/add")}>
                        Ir a solicitud de crédito
                    </button>
                </div>
            )}
        </div>
    );
};

export default CreditSimulation;

import React, { useState, useEffect } from 'react';
import clientService from '../services/client.service';
import { useNavigate } from 'react-router-dom';
import Checkbox from '@mui/material/Checkbox';

const ClientForm = () => {
    const [client, setClient] = useState({
        name: '',
        lastName: '',
        email: '',
        phone: '',
        rut: '',
        birthDate: '',
        registrationDate: '',
        independentWorker: false
    });

    const [isIndependentWorker, setisIndependentWorker] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const currentDate = new Date();
        const minDate = new Date(currentDate.getFullYear() - 120, currentDate.getMonth(), currentDate.getDate()).toISOString().slice(0, 10);
        const maxDate = currentDate.toISOString().slice(0, 10);

        setClient((prevClient) => ({
            ...prevClient,
            registrationDate: maxDate
        }));

        setFormErrors((prevErrors) => ({
            ...prevErrors,
            minBirthDate: minDate,
            maxBirthDate: maxDate
        }));
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'name' || name === 'lastName') {
            // Asegurarse de que solo contenga letras
            const filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚ\s]/g, ''); 
            setClient((prevClient) => ({
                ...prevClient,
                [name]: filteredValue
            }));
        } else if (name === 'rut') {
            // Formatear el RUT
            const formattedRUT = formatRUT(value);
            setClient((prevClient) => ({
                ...prevClient,
                rut: formattedRUT
            }));
        } else {
            setClient((prevClient) => ({
                ...prevClient,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleCheckboxChange = (e) => {
        const { checked } = e.target;
        setisIndependentWorker(checked);
        console.log("Se guardó el valor de la checkbox", checked);
    };

    // Función para formatear el RUT
    const formatRUT = (rut) => {
        // Eliminar todos los caracteres no válidos (letras, números y espacio)
        const cleanedRUT = rut.replace(/[^0-9kK]/g, '');
        
        if (cleanedRUT.length > 8) {
            // Agregar puntos a los miles, pero sin afectar el dígito verificador
            const body = cleanedRUT.slice(0, -1);  // El cuerpo del RUT (sin el dígito verificador)
            const verifier = cleanedRUT.slice(-1).toUpperCase();  // El dígito verificador
            
            const formattedBody = body
                .split('')
                .reverse()
                .join('')
                .replace(/(\d{3})(?=\d)/g, '$1.')
                .split('')
                .reverse()
                .join('');  // Insertar puntos cada tres dígitos
            
            return `${formattedBody}-${verifier}`;
        }

        return cleanedRUT;  // Si no es un RUT válido, simplemente devolver lo que se haya escrito
    };

    const validateRUT = (rut) => {
        return rut.length <= 12; // El RUT no debe tener más de 9 caracteres
    };

    const validateBirthDate = (birthDate) => {
        const birthDateObj = new Date(birthDate);
        const today = new Date();
        const age = today.getFullYear() - birthDateObj.getFullYear();
        if (age < 0) return false;
        return age <= 120;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let clientToSubmit = { ...client };
        let errors = {};

        // Validar RUT
        if (!validateRUT(client.rut)) {
            errors.rut = "El RUT no puede tener más de 9 caracteres.";
        }

        // Validar fecha de nacimiento
        if (client.birthDate && !validateBirthDate(client.birthDate)) {
            errors.birthDate = "La edad no puede superar los 120 años.";
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        if (client.birthDate && client.birthDate.length === 10) {
            clientToSubmit.birthDate = `${client.birthDate}`;
        }

        window.alert("Se le creará una cuenta de ahorro al crear el cliente.");

        clientToSubmit.independentWorker = isIndependentWorker;

        console.log('Cliente a enviar (sin los documentos por ahora):', clientToSubmit);

        clientService.create(clientToSubmit).then(response => {
            console.log('Cliente creado:', response.data);
            navigate('/clients');
        }).catch(error => {
            console.error('Error al crear el cliente:', error);
        });
    };

    return (
        <div>
            <h2>Agregar Cliente</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre:</label>
                    <input
                        type="text"
                        name="name"
                        value={client.name}
                        onChange={handleChange}
                        placeholder='Ej: Juan'
                        required
                    />
                </div>
                <div>
                    <label>Apellido:</label>
                    <input
                        type="text"
                        name="lastName"
                        value={client.lastName}
                        onChange={handleChange}
                        placeholder='Ej: Pérez'
                        required
                    />
                </div>
                <div>
                    <label>Rut:</label>
                    <input
                        type="text"
                        name="rut"
                        value={client.rut}
                        onChange={handleChange}
                        placeholder='Ej: 12345678-9'
                        required
                    />
                    {formErrors.rut && <p style={{ color: 'red' }}>{formErrors.rut}</p>}
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={client.email}
                        onChange={handleChange}
                        placeholder='Ej: juanperez@email.com'
                        required
                    />
                </div>
                <div>
                    <label>Teléfono:</label>
                    <input
                        type="tel"
                        name="phone"
                        value={client.phone}
                        onChange={handleChange}
                        placeholder='Ej: +56912345678'
                        required
                    />
                </div>
                <div>
                    <label>Fecha de Nacimiento:</label>
                    <input
                        type="date"
                        name="birthDate"
                        value={client.birthDate}
                        onChange={handleChange}
                        min={formErrors.minBirthDate}
                        max={formErrors.maxBirthDate}
                    />
                    {formErrors.birthDate && <p style={{ color: 'red' }}>{formErrors.birthDate}</p>}
                </div>
                <div>
                    <label>¿Eres trabajador independiente?</label>
                    <Checkbox
                        checked={isIndependentWorker}
                        onChange={handleCheckboxChange}
                        name="isIndependentWorker"
                    />
                </div>
                <button type="submit">Crear Cliente</button>
            </form>
        </div>
    );
};

export default ClientForm;

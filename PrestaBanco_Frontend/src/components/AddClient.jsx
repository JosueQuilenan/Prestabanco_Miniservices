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
    const navigate = useNavigate();

    useEffect(() => {
        const currentDate = new Date().toISOString().slice(0, 10) + "T00:00:00"; 
        setClient((prevClient) => ({
            ...prevClient,
            registrationDate: currentDate
        }));
        
    }, []);
    

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setClient((prevClient) => ({
            ...prevClient,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCheckboxChange = (e) => {
        const { checked } = e.target;
        setisIndependentWorker(checked);
        console.log("Se guardó el valor de la checkbox", checked);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let clientToSubmit = { ...client };

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
            <h2>"Agregar Cliente"</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre:</label>
                    <input
                        type="text"
                        name="name"
                        value={client.name}
                        onChange={handleChange}
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
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={client.email}
                        onChange={handleChange}
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
                        required
                    />
                </div>
                <div>
                    <label>¿Eres trabajador independiente?</label>
                    <Checkbox
                        checked={isIndependentWorker}
                        onChange={handleCheckboxChange}
                        name="isIndependentWorker"
                    />
                </div>
                <div>
                    <label>Fecha de Nacimiento:</label>
                    <input
                        type="date"
                        name="birthDate"
                        value={client.birthDate}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">"Crear Cliente"</button>
            </form>
        </div>
    );
};

export default ClientForm;
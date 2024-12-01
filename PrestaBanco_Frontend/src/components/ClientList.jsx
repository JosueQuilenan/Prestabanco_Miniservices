import React, { useState, useEffect } from 'react';
import clientService from '../services/client.service';
import { Link } from 'react-router-dom';

const ClientList = () => {
    const [clients, setClients] = useState([]);

    useEffect(() => {
        // Cargar lista de clientes
        clientService.getAll().then(response => {
            console.log(response.data);
            setClients(response.data);
        }).catch(error => {
            console.error('Error al cargar la lista de clientes:', error);
        });
    }, []);

    return (
        <div>
            <h2>Lista de Clientes</h2>
            {clients.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>RUT</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map(client => (
                            <tr key={client.id}>
                                <td>{client.id}</td>
                                <td>
                                    <Link to={`/client/${client.id}`}>{client.name}</Link>
                                </td>
                                <td>{client.lastName}</td>
                                <td>{client.rut}</td>
                                <td>{client.email}</td>
                                <td>{client.phone}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No hay clientes disponibles.</p>
            )}
        </div>
    );
};

export default ClientList;

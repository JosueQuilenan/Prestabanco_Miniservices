import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clientService from '../services/client.service';

const EditClient = () => {
    const [client, setClient] = useState({});
    const [savingsAccount, setSavingsAccount] = useState({ pdfFiles: [] });
    const [creditHistory, setCreditHistory] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        fetchClient();
    }, []);

    const fetchClient = async () => {
        try {
            const response = await clientService.get(id);
            setClient(response.data);
            setSavingsAccount(response.data.savingsAccount || { pdfFiles: [] });
            setCreditHistory(response.data.creditHistory);
        } catch (error) {
            console.error("Error al cargar los detalles del cliente:", error);
        }
    };

    const handleFileUpload = async (files) => {
        const newFiles = Array.from(files).filter(file => file.type === "application/pdf");
        const fileReaders = newFiles.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result.split(',')[1]); // Base64
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        const uploadedFiles = await Promise.all(fileReaders);
        setSavingsAccount(prev => ({
            ...prev,
            pdfFiles: [
                ...prev.pdfFiles,
                ...uploadedFiles.map(pdfFile => ({ pdfFile }))
            ],
        }));
    };

    const handleFileRemove = (index) => {
        setSavingsAccount(prev => {
            const updatedFiles = prev.pdfFiles.filter((_, i) => i !== index);
            return { ...prev, pdfFiles: updatedFiles };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedClient = {
                ...client,
                ...creditHistory,
                savingsAccount: {
                    ...savingsAccount,
                    pdfFiles: savingsAccount.pdfFiles || []
                }
            };
            console.log(updatedClient);
            await clientService.update(id, updatedClient);
            console.log('Cliente actualizado exitosamente');
            navigate(`/client/${id}`);
        } catch (error) {
            console.error("Error al actualizar el cliente:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Editar Cliente</h2>

            <div>
                <label>Nombre:</label>
                <input
                    type="text"
                    value={client.name || ''}
                    onChange={(e) => setClient({ ...client, name: e.target.value })}
                    required
                />
            </div>

            <div>
                <label>Apellido:</label>
                <input
                    type="text"
                    value={client.lastName || ''}
                    onChange={(e) => setClient({ ...client, lastName: e.target.value })}
                    required
                />
            </div>

            <div>
                <label>Email:</label>
                <input
                    type="email"
                    value={client.email || ''}
                    onChange={(e) => setClient({ ...client, email: e.target.value })}
                    required
                />
            </div>

            <div>
                <label>Número:</label>
                <input
                    type="number"
                    value={client.phone || ''}
                    onChange={(e) => setClient({ ...client, phone: e.target.value })}
                    required
                />
            </div>

            <h3>Historial Crediticio</h3>
            <p><strong>Calificación:</strong> {creditHistory.creditRating}</p>
            <p><strong>Última fecha de crédito:</strong> {creditHistory.lastCreditDate}</p>
            <p><strong>Monto pendiente:</strong> {creditHistory.pendingAmount}</p>
            <p><strong>Monto total:</strong> {creditHistory.totalAmount}</p>

            <h3>Cuenta de Ahorros</h3>
            <p><strong>Número de Cuenta:</strong> {savingsAccount.id}</p>
            <p><strong>Saldo:</strong> {savingsAccount.balance}</p>
            <p><strong>Fecha de Apertura:</strong> {savingsAccount.accountOpeningDate}</p>
            <h3>Archivos PDF de la Cuenta de Ahorros</h3>
            <label>Subir archivos PDF:</label>
            <input type="file" accept="application/pdf" multiple onChange={(e) => handleFileUpload(e.target.files)} />
            
            <ul>
                {savingsAccount.pdfFiles.map((file, index) => (
                    <li key={index}>
                        <a href={`data:application/pdf;base64,${file.pdfFile}`} download={`SavingsAccount_PDF_${index + 1}.pdf`}>
                            PDF {index + 1}
                        </a>
                        <button type="button" onClick={() => handleFileRemove(index)}>Eliminar</button>
                    </li>
                ))}
            </ul>

            <button type="submit">Actualizar Cliente</button>
        </form>
    );
};

export default EditClient;

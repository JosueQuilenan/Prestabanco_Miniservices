import React, { useState, useEffect } from 'react';
import clientService from '../services/client.service';
import loanTypeService from '../services/loanType.service.js';
import creditFollowUpService from "../services/creditFollowUp.service.js";
import { useNavigate, useParams } from 'react-router-dom';

const ClientDetails = () => {
    const { id } = useParams();
    const [client, setClient] = useState({});
    const [creditHistory, setCreditHistory] = useState({});
    const [savingsAccount, setSavingsAccount] = useState({});
    const [creditApplications, setCreditApplications] = useState([]);
    const [showConditionsContainer, setShowConditionsContainer] = useState(false);
    const [selectedCreditApplication, setSelectedCreditApplication] = useState(null);
    const [monthlyPayment, setMonthlyPayment] = useState(null);
    const [totalCost, setTotalCost] = useState(null);
    const navigate = useNavigate();

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

    const formatNumber = (number) => {
        return new Intl.NumberFormat('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const clientResponse = await clientService.get(id);
                setClient(clientResponse.data);
                setCreditHistory(clientResponse.data.creditHistory);
                setSavingsAccount(clientResponse.data.savingsAccount);

                const creditApplicationsResponse = await clientService.getCreditApplications(id);
                setCreditApplications(creditApplicationsResponse.data);
                console.log(creditApplicationsResponse.data);
            } catch (error) {
                console.error('Error al cargar datos:', error);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (selectedCreditApplication) {
            calculateCosts();
        }
    }, [selectedCreditApplication]);

    const handleEdit = (applicationId) => {
        navigate(`/creditApplication/edit/${applicationId}`);
    };

    const handleEditClient = () => {
        navigate(`/client/edit/${id}`);
    };

    const handleCreditApplicationSee = (application) => {
        navigate(`/creditApplication/${application.id}`);
    }

    const handleCancel = async (applicationId) => {
        const confirmCancel = window.confirm("¿Está seguro de que desea cancelar esta solicitud de crédito?");
        if (confirmCancel) {
            try {
                await creditFollowUpService.cancelApplication(applicationId);
                alert('Solicitud de crédito cancelada exitosamente');
                navigate('/creditApplications');
            } catch (error) {
                console.error('Error al cancelar la solicitud de crédito:', error);
                alert('Hubo un error al cancelar la solicitud de crédito');
            }
        }
    };

    const handleConditionsClick = (application) => {
        setSelectedCreditApplication(application);
        setShowConditionsContainer(true);
    };

    const handleConditionsClose = () => {
        setShowConditionsContainer(false);
        setSelectedCreditApplication(null);
    };

    const handleConditionsConfirm = async () => {
        if (selectedCreditApplication) {
            try {
                await creditFollowUpService.finalApproveApplication(selectedCreditApplication.id);
                console.log('¡Solicitud de crédito pre aprobada!');
                navigate('/creditApplications');
            } catch (error) {
                console.error("Error al cambiar la solicitud a pre-aprobada:", error);
            }
        }
    };

    const calculateCosts = async () => {
        if (selectedCreditApplication) {
            try {
                const monthlyPaymentResult = await loanTypeService.calculateMonthlyPayment(selectedCreditApplication.requestedAmount,selectedCreditApplication.requiredMonths, selectedCreditApplication.loanTypeName);
                const totalCostResult = await loanTypeService.calculateTotalLoanCost(selectedCreditApplication.requestedAmount, selectedCreditApplication.requiredMonths,selectedCreditApplication.loanTypeName);
                
                setMonthlyPayment(monthlyPaymentResult.data);
                setTotalCost(totalCostResult.data);
            } catch (error) {
                console.error("Error al calcular costos:", error);
            }
        }
    };
    

    return (
        <div>
            <h2>Detalles del Cliente</h2>

            <div>
                <h3>Información Básica</h3>
                <p><strong>Nombre:</strong> {client.name}</p>
                <p><strong>Apellido:</strong> {client.lastName}</p>
                <p><strong>RUT:</strong> {client.rut}</p>
                <p><strong>Email:</strong> {client.email}</p>
                <p><strong>Teléfono:</strong> {client.phone}</p>
                <p>¿Es trabajador independiente? <strong>{client.independentWorker ? "Sí" : "No"}</strong></p>
            </div>
            <button onClick={handleEditClient}>Editar Usuario</button>
            <div>
                <h3>Historial Crediticio</h3>
                {creditHistory ? (
                    <>
                        <p><strong>Calificación:</strong> {creditHistory.creditRating}</p>
                        <p><strong>Última fecha de crédito:</strong> {creditHistory.lastCreditDate}</p>
                        <p><strong>Monto pendiente:</strong> {creditHistory.pendingAmount}</p>
                        <p><strong>Monto total:</strong> {creditHistory.totalAmount}</p>
                    </>
                ) : (
                    <p>No hay historial crediticio disponible.</p>
                )}
            </div>

            <div>
            <div>
                <h3>Cuenta de Ahorros</h3>
                {savingsAccount ? (
                    <>
                        <p><strong>Número de Cuenta:</strong> {savingsAccount.id}</p>
                        <p><strong>Saldo:</strong> {formatNumber(savingsAccount.balance)}</p>
                        <p><strong>Fecha de Apertura:</strong> {savingsAccount.accountOpeningDate}</p>
                        <h4>Documentos Asociados:</h4>
                        {savingsAccount.pdfFiles && savingsAccount.pdfFiles.length > 0 ? (
                            <ul>
                                {savingsAccount.pdfFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={`data:application/pdf;base64,${file.pdfFile}`} download={`SavingsAccount_PDF_${index + 1}.pdf`}>
                                            Descargar PDF {index + 1}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No hay documentos PDF disponibles.</p>
                        )}
                    </>
                ) : (
                    <p>No hay cuenta de ahorros disponible.</p>
                )}
            </div>

            </div>
            
            <div>
                <h3>Solicitudes de Crédito</h3>
                {creditApplications && creditApplications.length > 0 ? (
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Monto Solicitado</th>
                            <th>Meses Solicitados</th>
                            <th>Estado</th>
                            <th>Comentarios</th>
                            <th>Fecha de Solicitud</th>
                            <th>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                            {creditApplications.map(application => (
                                <tr key={application.id}>
                                    <td>{application.id}</td>
                                    <td>{application.requestedAmount}</td>
                                    <td>{application.requiredMonths}</td>
                                    <td>{creditApplicationStates[application.applicationState] || "Estado Desconocido"}</td>
                                    <td>{application.comment || "Sin comentarios"}</td>
                                    <td>{application.applicationDate}</td>
                                    <td>
                                        <button onClick={() => handleCreditApplicationSee(application)}>Ver Solicitud</button>
                                        {application.applicationState !== 6 && application.applicationState !== 3 && application.applicationState !== 8 && (
                                            <>
                                                <button onClick={() => handleEdit(application.id)}>Editar Solicitud</button>
                                                <button onClick={() => handleCancel(application.id)}>Cancelar Solicitud</button>
                                            </>
                                        )}
                                        {application.applicationState === 3 && (
                                            <button onClick={() => handleConditionsClick(application)}>Ver condiciones</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No hay solicitudes de crédito asociadas.</p>
                )}
            </div>

            {showConditionsContainer && selectedCreditApplication && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    padding: '20px',
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    color: 'black',
                    zIndex: 1000
                }}>
                    <button onClick={handleConditionsClose} style={{ position: "absolute", right: '5px', top: '5px' }}>X</button>
                    <h2>Términos y Condiciones del Préstamo {selectedCreditApplication.loanTypeName}</h2>
                    <p>Estimado(a) cliente {client.name} {client.lastName},</p>
                    <p>Nos complace presentarle las condiciones aplicables a su solicitud de préstamo {selectedCreditApplication.loanTypeName}. En PrestaBanco, trabajamos para ofrecerle transparencia y claridad en cada uno de nuestros productos financieros. Por ello, le detallamos a continuación las condiciones específicas de su préstamo:</p>
                    <p>Cuota mensual estimada: ${monthlyPayment ? formatNumber(monthlyPayment) : ""}</p>
                    <p>Costo total del préstamo: ${totalCost ? formatNumber(totalCost) : ""}</p>
                    <p>Estas condiciones han sido diseñadas para adaptarse a sus necesidades y brindarle la mejor experiencia en el manejo de su financiamiento. Es importante recordar que el cumplimiento de los plazos establecidos le permitirá disfrutar de todas las ventajas de su crédito, manteniendo un historial financiero sólido y en orden.</p>
                    <p>Para cualquier consulta adicional o información que necesite, nuestro equipo de ejecutivos está a su disposición.</p>
                    <p>Atentamente, <strong>PrestaBanco</strong></p>
                    <button onClick={handleConditionsConfirm}>Aceptar términos y condiciones</button>
                    <button onClick={handleConditionsClose} style={{ marginLeft: '10px' }}>Rechazar</button>
                </div>
            )}
        </div>
    );
};

export default ClientDetails;

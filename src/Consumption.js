import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Card, CardHeader, CardContent } from './components';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Consumption.css'; // Importar el archivo CSS para personalizaciones

// Registrar componentes de ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Consumption = () => {
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [consumptions, setConsumptions] = useState([]); // Estado para almacenar los registros encontrados
    const [totalSpent, setTotalSpent] = useState(0); // Estado para almacenar el total de gastos
    const [currency, setCurrency] = useState('USD'); // Moneda seleccionada (por defecto en dólares)
    const [exchangeRate, setExchangeRate] = useState(1); // Tasa de cambio (por defecto en dólares)
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // Estado para el mes actual (1-12)
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // Estado para el año actual

    const maxMonth = new Date().getMonth() + 1;
    const maxYear = new Date().getFullYear();

    const modelColors = {
        'gpt-3.5-turbo': 'rgba(75, 192, 192, 0.6)',
        'gpt-4.0': 'rgba(153, 102, 255, 0.6)',
    };

    useEffect(() => {
        fetchExchangeRate(currency); // Obtener la tasa de cambio cuando se selecciona una moneda
    }, [currency]);

    useEffect(() => {
        const fetchConsumptions = async () => {
            try {
                const companyId = localStorage.getItem('company_id');
                const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/consumptionsCompany`, {
                    company_id: companyId,
                    month: currentMonth,
                    year: currentYear,
                });

                const data = Array.isArray(response.data) ? response.data : [];

                if (data.length === 0) {
                    console.log('No se encontraron consumos para este mes.');
                    setChartData({ labels: [], datasets: [] });
                    setConsumptions([]); // No hay consumos
                    setTotalSpent(0);
                } else {
                    generateChartData(data);
                    setConsumptions(data); // Guardar los registros
                    calculateTotalSpent(data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchConsumptions();
    }, [currentMonth, currentYear, exchangeRate]);

    const fetchExchangeRate = async (currencyCode) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/currency/${currencyCode}`);
            const { exchangeRate } = response.data;
            setExchangeRate(exchangeRate);
        } catch (error) {
            console.error('Error al obtener la tasa de cambio:', error);
        }
    };

    const adjustPrecision = (value) => {
        if (value >= 0.1) {
            return value.toFixed(2);
        } else if (value >= 0.01) {
            return value.toFixed(3);
        } else {
            return value.toFixed(6);
        }
    };

    const calculateTotalSpent = (data) => {
        const total = data.reduce((acc, consumption) => acc + parseFloat(consumption.total_sales_value), 0);
        setTotalSpent(adjustPrecision(total * exchangeRate));
    };

    const generateChartData = (data) => {
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

        const consumptionPerDay = {};
        const models = new Set();

        for (let day = 1; day <= daysInMonth; day++) {
            consumptionPerDay[day] = {};
        }

        data.forEach((consumption) => {
            const queryDate = new Date(consumption.query_day);
            const day = queryDate.getDate();
            const model = consumption.model;

            models.add(model);

            if (!consumptionPerDay[day][model]) {
                consumptionPerDay[day][model] = 0;
            }
            consumptionPerDay[day][model] += parseFloat(consumption.total_sales_value) * exchangeRate;
        });

        const datasets = Array.from(models).map((model) => {
            const dailyData = [];
            for (let day = 1; day <= daysInMonth; day++) {
                dailyData.push(consumptionPerDay[day][model] || 0);
            }

            const hasData = dailyData.some(value => value > 0);
            if (!hasData) return null;

            return {
                label: `Consumo ${model}`,
                data: dailyData,
                backgroundColor: modelColors[model] || 'rgba(255, 159, 64, 0.6)',
                borderColor: modelColors[model] || 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
            };
        }).filter(dataset => dataset !== null);

        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        if (datasets.length === 0) {
            setChartData({ labels: [], datasets: [] });
        } else {
            setChartData({
                labels: days,
                datasets: datasets,
            });
        }
    };

    const handlePreviousMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear((prevYear) => prevYear - 1);
        } else {
            setCurrentMonth((prevMonth) => prevMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === maxMonth && currentYear === maxYear) return;

        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear((prevYear) => prevYear + 1);
        } else {
            setCurrentMonth((prevMonth) => prevMonth + 1);
        }
    };

    return (
        <div className="container">
            <Card className="p-6 shadow-md">
                <CardHeader>
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="text-xl font-semibold">Consumo de GPT - {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</h1>
                        <div className="text-right">
                            <h2 className="text-lg font-semibold">Total Gastado:</h2>
                            <p className="text-2xl font-bold">{currency} ${totalSpent}</p>
                        </div>
                    </div>
                    <div className="d-flex justify-content-end mt-4 space-x-4">
                        <button onClick={handlePreviousMonth} className="btn btn-primary">
                            Mes Anterior
                        </button>
                        <button onClick={handleNextMonth} className="btn btn-primary">
                            Mes Siguiente
                        </button>
                        <select 
                            value={currency} 
                            onChange={(e) => setCurrency(e.target.value)} 
                            className="form-select"
                        >
                            <option value="USD">Dólares</option>
                            <option value="COP">Pesos Colombianos</option>
                            <option value="ARS">Pesos Argentinos</option>
                        </select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="row">
                        {/* Columna de la gráfica de consumo */}
                        <div className="col-md-8">
                            {chartData && chartData.datasets.length > 0 ? (
                                <Bar 
                                    data={chartData} 
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false, // Asegurarse de que la gráfica se ajuste al contenedor
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                stacked: true,
                                                ticks: {
                                                    precision: 2,
                                                },
                                            },
                                            x: {
                                                stacked: true,
                                            },
                                        },
                                        plugins: {
                                            legend: { display: true },
                                            title: { display: true, text: `Consumo GPT en ${new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })}` },
                                        },
                                    }}
                                    height={400} // Altura de la gráfica para igualar a la tabla
                                />
                            ) : (
                                <p>No hay datos disponibles para este mes.</p>
                            )}
                        </div>
                        {/* Columna de la lista de registros con scroll */}
                        <div className="col-md-4">
                            {consumptions.length > 0 ? (
                                <div className="border p-4 rounded-md shadow-md overflow-auto custom-scroll" style={{ maxHeight: '400px' }}>
                                    <h3 className="text-lg font-semibold mb-4">Lista de Registros</h3>
                                    <ul className="list-group">
                                        {consumptions.map((consumption, index) => (
                                            <li key={index} className="list-group-item d-flex justify-content-between">
                                                <span>{new Date(consumption.query_day).toLocaleDateString()}</span>
                                                <span>{consumption.model}</span>
                                                <span>{currency} ${adjustPrecision(consumption.total_sales_value * exchangeRate)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p>No se encontraron registros para este mes.</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Consumption;

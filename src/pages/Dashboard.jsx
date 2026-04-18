import React from 'react';
import { useEffect, useState } from 'react';
import './Dashboard.css'; // Ensure to create this file for Tailwind CSS styles

const Dashboard = () => {
    const [metrics, setMetrics] = useState([]);
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMetrics = async () => {
        // Simulate fetching metrics
        setLoading(true);
        const response = await fetch('/api/metrics');
        const data = await response.json();
        setMetrics(data);
        setLoading(false);
    };

    const fetchSignals = async () => {
        // Simulate fetching live signals
        const response = await fetch('/api/signals');
        const data = await response.json();
        setSignals(data);
    };

    useEffect(() => {
        fetchMetrics();
        fetchSignals();
        const interval = setInterval(() => {
            fetchSignals();
        }, 10000); // Fetch live signals every 10 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-gradient-to-r from-blue-400 to-purple-600 min-h-screen p-10">
            <h1 className="text-white text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    metrics.map((metric) => (
                        <div key={metric.id} className="bg-white rounded-lg p-4 shadow">
                            <h2 className="text-xl font-semibold">{metric.title}</h2>
                            <p className="text-gray-700">{metric.value}</p>
                        </div>
                    ))
                )}
            </div>
            <h2 className="text-white text-2xl font-bold mt-8">Live Signals</h2>
            <div className="overflow-x-auto mt-4">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="py-2 px-4">Signal</th>
                            <th className="py-2 px-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {signals.map((signal) => (
                            <tr key={signal.id} className="hover:bg-gray-100">
                                <td className="py-2 px-4">{signal.name}</td>
                                <td className="py-2 px-4">
                                    <button className="bg-blue-500 text-white rounded px-4 py-2">Action</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
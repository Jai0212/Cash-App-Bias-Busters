import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import User_signup from './pages/User_signup.jsx'; // Adjust the import path as needed
import './App.css';

const App = () => {
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [data, setData] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${VITE_BACKEND_URL}/get-data`);
                setData(response.data);
            } catch (err) {
                setError('Error fetching data');
                console.error(err);
            }
        };

        fetchData();
    }, []);

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <div>
                            <h1>Data from Database</h1>
                            {error && <p>{error}</p>}
                            <ul>
                                {data.map((item, index) => (
                                    <li key={index}>{item.name}</li>
                                ))}
                            </ul>
                        </div>
                    }
                />
                <Route path="/signup" element={<User_signup />} />
            </Routes>
        </Router>
    );
};

export default App;

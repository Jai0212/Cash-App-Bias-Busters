import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/get-data')  // Replace with your Flask server's URL
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <h1>CashApp Data</h1>
      <ul>
        {data.map(item => (
          <li key={item.id}>
            {item.name}: ${item.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

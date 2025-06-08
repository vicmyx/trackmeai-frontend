import React from 'react';
import AIMechanicChat from './components/AIMechanicChat';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="header">
        <h1 style={{color: '#333', fontSize: '2.5rem', marginBottom: '0.5rem'}}>Radical Assistant</h1>
        <p style={{color: '#666', fontSize: '1.1rem', margin: 0}}>Your AI companion for Radical SR3 documentation</p>
      </div>
      <AIMechanicChat />
    </div>
  );
}

export default App;
import React from 'react';
import './App.css';
import LeafletMap from './components/LeafletMap';

function App() {
  return (
    <div className="App">
      <header className="App-header" style={{ padding: '20px' }}>
        <h1>Leaflet.js Quick Start Implementation</h1>
        <p>Following the official Leaflet.js tutorial</p>
      </header>
      <main style={{ padding: '20px' }}>
        <LeafletMap />
      </main>
    </div>
  );
}

export default App;

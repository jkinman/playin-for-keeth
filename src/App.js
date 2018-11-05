import React, { Component } from 'react';
import QRReader from 'react-qr-reader';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>
            Playing for keETHs
          </p>
        </header>
        <QRReader />
      </div>
    );
  }
}

export default App;

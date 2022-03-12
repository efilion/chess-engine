import React, {useState} from 'react';
import Axios from 'axios';
import './App.css';
import Chessboard from './chessboard/Chessboard';

function App() {

  return (
    <>
      <div className="App">
        <Chessboard />
      </div>
    </>
  );
}

export default App;

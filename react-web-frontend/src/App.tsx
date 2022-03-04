import React, {useState} from 'react';
import Axios from 'axios';
import './App.css';
import Chessboard from './chessboard/Chessboard';

function App() {

  const [msg, setMsg] = useState("");

  Axios.get('https://' + (process.env.REACT_APP_ENGINE_SERVICE as string))
    .then((res) => {
      setMsg(() => res.data);
    })
    .catch((err) => {
      console.log(err);
    });

  return (
    <>
      <p>{msg}</p>
      <div className="App">
        <Chessboard />
      </div>
    </>
  );
}

export default App;

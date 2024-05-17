import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Home';
import Attendance from './Components/Attendance';
import style from './App.css'
import Footer from "./Components/Footer";


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/attendance' element={<Attendance/>} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

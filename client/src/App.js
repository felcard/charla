import './App.css';
import { Route, Routes } from 'react-router-dom';
import Main from './Main';
import Dos from './Dos';

function App() {

  return (
    <div id="main-chat">
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/login' element={<Dos />} />
      </Routes>
    </div>
  );
}

export default App;


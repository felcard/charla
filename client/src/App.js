import './App.css';
import { Route, Routes } from 'react-router-dom';
import Main from './Main';

function App() {

  return (
    <div id="main-chat">
      <Routes>
        <Route path='/' element={<Main />} />
      </Routes>
    </div>
  );
}

export default App;


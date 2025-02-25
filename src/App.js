import { useState } from 'react';
import Home from './Components/Home';
import './styles/App.css';

function App() {
  const [bgcolor, setbgcolor] = useState('whitebackground');
  const [theme, settheme] = useState('Dark Mode');

  const changetheme = () => {
    if (bgcolor === 'whitebackground') {
      setbgcolor('blackbackground');
      settheme('Light Mode');
    } else {
      setbgcolor('whitebackground');
      settheme('Dark Mode');
    }
  };

  return (
      <div className={`app-container ${bgcolor}`}>
        <div className='switchdiv'>
          <div style={{ color: bgcolor === 'whitebackground' ? 'black' : 'white' }}>{theme}</div>
          <label className="switch">
            <input type="checkbox" onClick={changetheme} />
            <span className="slider round"></span>
          </label>
        </div>

       
         <Home background={bgcolor} />

      </div>
  );
}

export default App;

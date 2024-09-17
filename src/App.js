import Canvas from './Canvas';
import './input.css';
import DrawingCanvas from "./canvas2";

function App() {
  return (
      <div className="App">
          <div style={{
              width: '400px',
              height: '50vh',
              margin: '12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center'
          }}>
              <Canvas/ >

              <p> atelier canvus </p>
          </div>
      </div>


  );
}

export default App;
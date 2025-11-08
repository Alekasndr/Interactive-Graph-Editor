import './App.css';
import { ReactFlowProvider } from 'reactflow';
import GraphCanvas from './components/GraphCanvas';

function App() {
  return (
    <div className="App">
      <ReactFlowProvider>
        <GraphCanvas />
      </ReactFlowProvider>
    </div>
  );
}

export default App;

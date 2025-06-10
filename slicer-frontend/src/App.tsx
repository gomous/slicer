import { Sidebar } from './components/Sidebar';
import { ModelViewer } from './components/ModelViewer';

function App() {
  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="h-full">
          <ModelViewer />
        </div>
      </div>
    </div>
  );
}

export default App;
import { Sidebar } from './components/Sidebar';
import { ModelViewer } from './components/ModelViewer';
import GcodeViewer from './components/GcodeViewer';
import React, { useState, useEffect } from 'react';
import { useSlicerStore } from './hooks/useSlicerStore';
import { useGcodeStore } from './hooks/useGcodeStore';
import { Loader2, AlertCircle } from 'lucide-react';

function App() {
  const [tab, setTab] = useState<'prepare' | 'preview'>('prepare');
  const { fileState, parameters, startSlicing } = useSlicerStore();
  const { gcodeFile } = useGcodeStore();
  const [error, setError] = useState<string | null>(null);

  // Automatically slice when switching to preview tab
  useEffect(() => {
    if (tab === 'preview' && fileState.file) {
      startSlicing();
    }
  }, [tab, fileState.file, startSlicing]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.stl')) {
      setError('Please upload an STL file.');
      return;
    }

    setError(null);
    try {
      await startSlicing();
    } catch (err) {
      console.error('Error slicing file:', err);
      setError('Error slicing file. Please try again.');
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar always visible */}
      <Sidebar />
      <div className="flex-1 flex flex-col bg-white">
        {/* Tab Bar */}
        <div className="flex items-center bg-white border-b border-gray-200 px-8" style={{height: '56px'}}>
          <button
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${tab === 'prepare' ? 'border-green-600 text-green-600 bg-green-50' : 'border-transparent text-gray-500 hover:text-green-600'}`}
            onClick={() => setTab('prepare')}
          >
            Prepare
          </button>
          <button
            className={`ml-2 px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${tab === 'preview' ? 'border-green-600 text-green-600 bg-green-50' : 'border-transparent text-gray-500 hover:text-green-600'}`}
            onClick={() => setTab('preview')}
            disabled={!fileState.file}
          >
            Preview
          </button>
        </div>
        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-white">
          {tab === 'prepare' ? (
            <ModelViewer />
          ) : (
            <GcodeViewer />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
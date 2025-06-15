import { Sidebar } from './components/Sidebar';
import { ModelViewer } from './components/ModelViewer';
import GcodeViewer from './components/GcodeViewer';
import React, { useState, useEffect } from 'react';
import { useSlicerStore } from './hooks/useSlicerStore';
import { useGcodeStore } from './hooks/useGcodeStore';
import { Loader2, AlertCircle, Upload as UploadIcon, Home as HomeIcon } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ParameterForm } from './components/ParameterForm';

function App() {
  const [tab, setTab] = useState<'home' | 'prepare' | 'preview' | 'device' | 'project' | 'calibration'>('home');
  const { fileState, parameters, startSlicing, combinedStlFile } = useSlicerStore();
  const { gcodeFile } = useGcodeStore();
  const [error, setError] = useState<string | null>(null);

  // Automatically slice when switching to preview tab
  useEffect(() => {
    if (tab === 'preview' && (combinedStlFile || fileState.files.size > 0)) {
      startSlicing();
    }
  }, [tab, combinedStlFile, fileState.files, startSlicing]);

  // Top nav items (with Home first)
  const navItems = [
    { key: 'home', label: 'Home', icon: <HomeIcon className="h-5 w-5 mr-2" /> },
    { key: 'prepare', label: 'Prepare' },
    { key: 'preview', label: 'Preview', disabled: !(combinedStlFile || fileState.files.size > 0) },
    { key: 'device', label: 'Device' },
    { key: 'project', label: 'Project' },
    { key: 'calibration', label: 'Calibration' },
  ];

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
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Navigation Bar */}
      <div className="flex items-center bg-white border-b border-gray-200 px-6" style={{height: '56px'}}>
        <div className="flex space-x-1">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`flex items-center px-6 py-2 font-semibold text-sm border-b-2 transition-colors rounded-none focus:outline-none ${tab === item.key ? 'border-green-600 text-green-600 bg-green-50' : 'border-transparent text-gray-500 hover:text-green-600'} ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !item.disabled && setTab(item.key as typeof tab)}
              disabled={item.disabled}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button className="ml-4 px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition-colors flex items-center">
          <UploadIcon className="h-5 w-5 mr-2" />
          Upload
        </button>
      </div>
      {/* Main content area below top nav */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar (fixed width, not resizable) */}
        <div style={{ width: 450 }} className="flex flex-col h-full bg-white border-r border-gray-200">
          <div className="flex-1 overflow-y-auto">
            {tab === 'prepare' || tab === 'preview' ? (
              <div className="flex flex-col h-full p-6 space-y-8">
                <FileUpload />
                <ParameterForm />
              </div>
            ) : (
              <Sidebar tab={tab} />
            )}
          </div>
        </div>
        {/* Main content */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="flex-1 overflow-auto bg-white">
            {tab === 'prepare' ? (
              <ModelViewer />
            ) : tab === 'preview' ? (
              <GcodeViewer />
            ) : (
              <div className="flex items-center justify-center h-full text-2xl text-gray-400">Welcome to 3D Slicer!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
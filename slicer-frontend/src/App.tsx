import { Sidebar } from './components/Sidebar';
import { ModelViewer } from './components/ModelViewer';
import { GcodeViewer } from './components/GcodeViewer';
import React, { useState } from 'react';

function App() {
  const [tab, setTab] = useState<'prepare' | 'preview'>('prepare');

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
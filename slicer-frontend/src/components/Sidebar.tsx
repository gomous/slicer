import React from 'react';
import { FileUpload } from './FileUpload';
import { ParameterForm } from './ParameterForm';
import { SliceButton } from './SliceButton';

export const Sidebar: React.FC = () => {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">3D Slicer</h1>
            <p className="text-sm text-gray-500">Professional slicing tool</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <FileUpload />
        <ParameterForm />
      </div>

      <div className="p-6 border-t border-gray-200">
        <SliceButton />
      </div>
    </div>
  );
};
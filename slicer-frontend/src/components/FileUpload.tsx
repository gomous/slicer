import React, { useRef, useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import { useSlicerStore } from '../hooks/useSlicerStore';

export const FileUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { fileState, setFile, setPreview, setFileLoading } = useSlicerStore();

  const handleFileSelect = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.stl')) {
      alert('Please select an STL file');
      return;
    }

    setFileLoading(true);
    setFile(file);
    
    // Clear any previous preview URL
    if (fileState.preview) {
      URL.revokeObjectURL(fileState.preview);
    }
    
    // Create a preview URL for the file
    const url = URL.createObjectURL(file);
    setPreview(url);
    
    // The STLModel component will handle the actual loading and call setFileLoading(false)
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearFile = () => {
    if (fileState.preview) {
      URL.revokeObjectURL(fileState.preview);
    }
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Model File</h3>
      
      {!fileState.file ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Click to upload
            </button>
            <span className="text-gray-500"> or drag and drop</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">STL files only</p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".stl"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <File className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">{fileState.file.name}</p>
              <p className="text-sm text-gray-500">
                {(fileState.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={clearFile}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {fileState.isLoading && (
        <div className="flex items-center space-x-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Parsing STL file...</span>
        </div>
      )}
    </div>
  );
};
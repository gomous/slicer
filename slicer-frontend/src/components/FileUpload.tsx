import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSlicerStore } from '../hooks/useSlicerStore';
import { FileText, Upload, X } from 'lucide-react';

export const FileUpload: React.FC = () => {
  const { fileState, setFile, setPreview, setFileLoading } = useSlicerStore();
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.stl')) {
      setError('Please upload an STL file');
      return;
    }

    setError(null);
    setFileLoading(true);
    setFile(file);
    
    if (fileState.preview) {
      URL.revokeObjectURL(fileState.preview);
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
  }, [setFile, setPreview, setFileLoading, fileState.preview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'model/stl': ['.stl']
    },
    maxFiles: 1
  });

  const handleRemove = () => {
    if (fileState.preview) {
      URL.revokeObjectURL(fileState.preview);
    }
    setFile(null);
    setPreview(null);
    setError(null);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      {!fileState.file ? (
        <div
          {...getRootProps()}
          className={`w-full max-w-2xl h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-lg text-gray-600 mb-2">
            {isDragActive ? 'Drop the STL file here' : 'Drag and drop an STL file here'}
          </p>
          <p className="text-sm text-gray-500">or click to select a file</p>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      ) : (
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{fileState.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(fileState.file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemove}
                className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
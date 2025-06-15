import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSlicerStore } from '../hooks/useSlicerStore';
import { FileText, Upload, X } from 'lucide-react';

interface FileWithPreview {
  file: File;
  preview: string;
}

export const FileUpload: React.FC = () => {
  const { setFile, removeFile, setFileLoading } = useSlicerStore();
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const stlFiles = acceptedFiles.filter(file => file.name.toLowerCase().endsWith('.stl'));
    
    if (stlFiles.length === 0) {
      setError('Please upload STL files');
      return;
    }

    setError(null);
    setFileLoading(true);
    
    // Add each STL file
    stlFiles.forEach(file => {
    const url = URL.createObjectURL(file);
      setFiles(prev => [...prev, { file, preview: url }]);
      // Set the file in the store to trigger model loading
      setFile(file);
    });
  }, [setFile, setFileLoading]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'model/stl': ['.stl']
    },
    multiple: true
  });

  const handleRemove = (fileToRemove: File) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.file !== fileToRemove);
      // Revoke the URL for the removed file
      const removedFile = prev.find(f => f.file === fileToRemove);
      if (removedFile) {
        URL.revokeObjectURL(removedFile.preview);
    }
      return newFiles;
    });
    // Remove the file from the store
    removeFile(fileToRemove.name);
  };

  // Cleanup preview URLs when component unmounts
  React.useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      {files.length === 0 ? (
        <div
          {...getRootProps()}
          className={`w-full max-w-2xl h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-lg text-gray-600 mb-2">
            {isDragActive ? 'Drop the STL files here' : 'Drag and drop STL files here'}
          </p>
          <p className="text-sm text-gray-500">or click to select files</p>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      ) : (
        <div className="w-full max-w-2xl space-y-2">
          {files.map((fileWithPreview, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-blue-500" />
            <div>
                    <p className="text-sm font-medium text-gray-900">{fileWithPreview.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(fileWithPreview.file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
                  onClick={() => handleRemove(fileWithPreview.file)}
                  className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
          >
                  <X className="w-5 h-5" />
          </button>
              </div>
            </div>
          ))}
          <div
            {...getRootProps()}
            className="w-full border-2 border-dashed rounded-lg p-4 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-gray-50"
          >
            <input {...getInputProps()} />
            <Upload className="w-6 h-6 text-gray-400 mr-2" />
            <p className="text-sm text-gray-500">Drop more files here or click to select</p>
        </div>
        </div>
      )}
    </div>
  );
};
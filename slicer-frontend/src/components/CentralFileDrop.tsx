import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface CentralFileDropProps {
  accept: string;
  onFile: (file: File) => void;
  message: string;
}

export const CentralFileDrop: React.FC<CentralFileDropProps> = ({ accept, onFile, message }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFile(files[0]);
    }
  };

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center transition-colors border-2 border-dashed rounded-lg bg-white ${dragOver ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400'}`}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      style={{ cursor: 'pointer' }}
    >
      <Upload className="h-16 w-16 text-gray-300 mb-4" />
      <p className="text-lg text-gray-500 font-medium mb-2">{message}</p>
      <p className="text-sm text-gray-400">Click or drag and drop</p>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}; 
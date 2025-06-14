import React, { useRef, useState } from 'react';
import { Upload, File, X, Check } from 'lucide-react';
import { useSlicerStore } from '../hooks/useSlicerStore';
import { useFileUploadStore } from '../hooks/useFileUploadStore';

export const FileUpload: React.FC<{ onSelectFile?: (file: File) => void }> = ({ onSelectFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { fileState, setFile, setPreview, setFileLoading } = useSlicerStore();
  const { files, addFile } = useFileUploadStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileSelect = async (fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList).filter(f => f.name.toLowerCase().endsWith('.stl'));
    if (newFiles.length === 0) return;
    // Revoke previous preview URL if exists
    if (previewUrls[selectedIndex]) {
      URL.revokeObjectURL(previewUrls[selectedIndex]);
    }
    const newUrl = URL.createObjectURL(newFiles[0]);
    setPreviewUrls(prev => [...prev, newUrl]);
    addFile(newFiles[0]);
    setSelectedIndex(files.length); // select the last added
    setFile(newFiles[0]);
    if (onSelectFile) onSelectFile(newFiles[0]);
    setFileLoading(true);
    setPreview(newUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFileSelect(e.target.files);
  };

  const clearFile = (idx: number) => {
    // Revoke preview URL for this file
    if (previewUrls[idx]) {
      URL.revokeObjectURL(previewUrls[idx]);
    }
    // Remove file from the store
    const newFiles = files.filter((_, i) => i !== idx);
    useFileUploadStore.setState({ files: newFiles });
    setPreviewUrls(prev => prev.filter((_, i) => i !== idx));
    if (idx === selectedIndex) {
      setSelectedIndex(0);
      if (files[0]) {
        setFile(files[0]);
        if (onSelectFile) onSelectFile(files[0]);
        if (previewUrls[0]) setPreview(previewUrls[0]);
      } else {
        setFile(null);
        setPreview(null);
      }
    }
  };

  const selectFile = (idx: number) => {
    setSelectedIndex(idx);
    setFile(files[idx]);
    if (onSelectFile) onSelectFile(files[idx]);
    if (previewUrls[idx]) setPreview(previewUrls[idx]);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold text-gray-900">Model Files</h3>
      <div
        className={`relative border-2 border-dashed rounded-md p-3 text-center transition-colors ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
        style={{ minHeight: 60 }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-6 w-6 text-gray-400" />
        <div className="mt-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Click to upload
          </button>
          <span className="text-gray-500 text-sm"> or drag and drop</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">STL files only</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".stl"
          className="hidden"
          multiple
          onChange={handleFileInput}
        />
      </div>
      {/* File List */}
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {files.map((file, idx) => (
          <div key={file.name + idx} className={`flex items-center px-2 py-1 rounded cursor-pointer text-xs ${selectedIndex === idx ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            onClick={() => selectFile(idx)}>
            <File className="h-4 w-4 text-blue-600 mr-1" />
            <span className="truncate flex-1 max-w-[90px]">{file.name}</span>
            {selectedIndex === idx && <Check className="h-4 w-4 text-green-500 ml-1" />}
            <button className="ml-1 text-gray-400 hover:text-red-500" onClick={e => { e.stopPropagation(); clearFile(idx); }}>
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
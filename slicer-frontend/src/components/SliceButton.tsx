import React from 'react';
import { Play, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useSlicerStore } from '../hooks/useSlicerStore';

export const SliceButton: React.FC = () => {
  const { fileState, slicingState, startSlicing, resetSlicing } = useSlicerStore();

  const handleSlice = () => {
    if (slicingState.result) {
      resetSlicing();
    } else {
      startSlicing();
    }
  };

  const isDisabled = !fileState.file || fileState.isLoading;

  return (
    <div className="space-y-4">
      <button
        onClick={handleSlice}
        disabled={isDisabled}
        className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
          isDisabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : slicingState.result
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
        }`}
      >
        {slicingState.isSlicing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Slicing... {slicingState.progress}%</span>
          </>
        ) : slicingState.result ? (
          <>
            <CheckCircle className="h-5 w-5" />
            <span>Slice Again</span>
          </>
        ) : (
          <>
            <Play className="h-5 w-5" />
            <span>Start Slicing</span>
          </>
        )}
      </button>

      {slicingState.isSlicing && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${slicingState.progress}%` }}
          ></div>
        </div>
      )}

      {slicingState.result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Slicing Complete!</span>
          </div>
          <p className="text-sm text-green-600 mt-1">{slicingState.result}</p>
        </div>
      )}

      {slicingState.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Slicing Failed</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{slicingState.error}</p>
        </div>
      )}
    </div>
  );
};
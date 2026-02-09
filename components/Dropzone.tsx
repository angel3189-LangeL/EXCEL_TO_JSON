
import React, { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  isProcessing: boolean;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Explicitly cast to File[] to resolve 'unknown' type error when accessing properties like 'name'
    const files = (Array.from(e.dataTransfer.files) as File[]).filter(f => 
      f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv')
    );
    if (files.length > 0) onFilesAdded(files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdded(Array.from(e.target.files));
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative group cursor-pointer transition-all duration-300 rounded-xl border-2 border-dashed p-6 text-center
        ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
    >
      <input
        type="file"
        multiple
        accept=".xlsx,.xls,.csv"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleInputChange}
        disabled={isProcessing}
      />
      
      <div className="flex flex-col items-center">
        {isProcessing ? (
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
        ) : (
          <Upload className={`w-8 h-8 mb-2 transition-colors ${isDragging ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'}`} />
        )}
        <p className="text-sm font-semibold text-gray-700">Arrastra tus Excels</p>
        <p className="text-xs text-gray-500 mt-1">.xlsx, .xls o .csv soportados</p>
      </div>
    </div>
  );
};

export default Dropzone;

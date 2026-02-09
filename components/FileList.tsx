
import React from 'react';
import { FileText, Trash2, CheckCircle2 } from 'lucide-react';
import { ConvertedFile } from '../types';

interface FileListProps {
  files: ConvertedFile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

const FileList: React.FC<FileListProps> = ({ files, selectedId, onSelect, onRemove }) => {
  if (files.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-gray-400 italic">No hay archivos cargados</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {files.map((file) => (
        <div
          key={file.id}
          onClick={() => onSelect(file.id)}
          className={`group flex items-center gap-3 p-4 cursor-pointer transition-colors relative
            ${selectedId === file.id ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`}
        >
          {selectedId === file.id && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
          )}
          
          <div className={`p-2 rounded-lg ${selectedId === file.id ? 'bg-indigo-100' : 'bg-gray-100'}`}>
            <FileText className={`w-5 h-5 ${selectedId === file.id ? 'text-indigo-600' : 'text-gray-500'}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">{file.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
               <CheckCircle2 className="w-3 h-3 text-green-500" />
               <span className="text-xs text-gray-500 uppercase tracking-tight">Convertido</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(file.id);
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FileList;

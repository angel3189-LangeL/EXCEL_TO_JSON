
import React, { useState, useCallback } from 'react';
import { FileJson, Download, LayoutDashboard, Settings2, Edit3, Files } from 'lucide-react';
import { ConvertedFile } from './types';
import { parseExcelFile } from './services/excelParser';
import Dropzone from './components/Dropzone';
import FileList from './components/FileList';
import DataPreview from './components/DataPreview';
import ManualEditor from './components/ManualEditor';

const App: React.FC = () => {
  const [view, setView] = useState<'batch' | 'manual'>('batch');
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    setIsProcessing(true);
    const results: ConvertedFile[] = [];

    for (const file of newFiles) {
      try {
        const jsonData = await parseExcelFile(file);
        const converted: ConvertedFile = {
          id: Math.random().toString(36).substring(7),
          name: file.name,
          size: file.size,
          data: jsonData,
          jsonString: JSON.stringify(jsonData, null, 2),
          status: 'completed'
        };
        results.push(converted);
      } catch (err) {
        console.error(`Error parsing ${file.name}:`, err);
      }
    }

    setFiles(prev => [...prev, ...results]);
    if (results.length > 0 && !selectedFileId) {
      setSelectedFileId(results[0].id);
    }
    setIsProcessing(false);
  }, [selectedFileId]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFileId === id) setSelectedFileId(null);
  };

  const downloadAll = async () => {
    // @ts-ignore
    const zip = new window.JSZip();
    files.forEach(file => {
      zip.file(`${file.name.split('.')[0]}.json`, file.jsonString);
    });
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = "excel_conversions.zip";
    link.click();
  };

  const selectedFile = files.find(f => f.id === selectedFileId);

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header expanded to full width */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <FileJson className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-none">DataFlow Studio</h1>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Convertidor Profesional</p>
            </div>
          </div>

          <nav className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setView('batch')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'batch' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Files className="w-4 h-4" />
              Conversión Batch
            </button>
            <button
              onClick={() => setView('manual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Edit3 className="w-4 h-4" />
              Editor Manual
            </button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {view === 'batch' && files.length > 0 && (
            <button 
              onClick={downloadAll}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span className="font-medium text-sm">Descargar Todo ({files.length})</span>
            </button>
          )}
          <div className="h-8 w-[1px] bg-gray-200 mx-2" />
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {view === 'batch' ? (
          <>
            {/* File List Panel */}
            <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto flex flex-col shadow-sm">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <Dropzone onFilesAdded={handleFilesAdded} isProcessing={isProcessing} />
              </div>
              
              <div className="flex-1">
                <div className="p-4 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                  <span>Archivos Cargados</span>
                  <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{files.length}</span>
                </div>
                <FileList 
                  files={files} 
                  selectedId={selectedFileId} 
                  onSelect={setSelectedFileId} 
                  onRemove={removeFile} 
                />
              </div>
            </div>

            {/* Preview Panel */}
            <div className="flex-1 bg-gray-50 overflow-y-auto p-8">
              {selectedFile ? (
                <div className="max-w-5xl mx-auto space-y-6">
                  <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {selectedFile.name}
                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full uppercase tracking-wider">Completado</span>
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {(selectedFile.size / 1024).toFixed(2)} KB • 
                        <span className="ml-1 font-semibold text-gray-700">{selectedFile.data.length} filas detectadas</span>
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <a 
                        href={`data:text/json;charset=utf-8,${encodeURIComponent(selectedFile.jsonString)}`}
                        download={`${selectedFile.name.split('.')[0]}.json`}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 border border-transparent text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all shadow-sm active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        <span>Exportar JSON</span>
                      </a>
                    </div>
                  </div>

                  <DataPreview data={selectedFile.data} />
                  
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest">Código JSON Generado</h3>
                      </div>
                      <button 
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedFile.jsonString);
                          alert('Copiado al portapapeles');
                        }}
                      >
                        Copiar Código
                      </button>
                    </div>
                    <div className="relative group">
                      <pre className="p-8 overflow-x-auto text-sm text-green-400 bg-gray-900 font-mono leading-relaxed max-h-[500px] scrollbar-thin scrollbar-thumb-gray-700">
                        {selectedFile.jsonString}
                      </pre>
                      <div className="absolute top-4 right-4 text-[10px] text-gray-500 font-mono bg-gray-800/50 px-2 py-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        JSON FORMAT
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="bg-white p-10 rounded-3xl border border-dashed border-gray-300 shadow-sm max-w-md w-full animate-in fade-in zoom-in duration-500">
                    <div className="bg-gray-100 p-8 rounded-full mb-6 mx-auto w-fit">
                      <LayoutDashboard className="w-16 h-16 text-gray-300" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Centro de Conversión</h2>
                    <p className="text-gray-500 mt-3 text-sm leading-relaxed px-4">
                      Selecciona uno de los archivos cargados en el panel de la izquierda o arrastra nuevos archivos para comenzar el proceso de conversión.
                    </p>
                    <div className="mt-8 pt-8 border-t border-gray-100 flex justify-center gap-12">
                      <div className="text-center">
                        <div className="text-xl font-bold text-indigo-600">Batch</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Procesado</div>
                      </div>
                      <div className="w-[1px] bg-gray-200"></div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-indigo-600">JSON</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Exportación</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 bg-gray-50 overflow-y-auto">
            <ManualEditor />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

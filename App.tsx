
import React, { useState, useCallback } from 'react';
import { Upload, FileJson, Download, Trash2, Zap, LayoutDashboard, Settings2, Info } from 'lucide-react';
import { ConvertedFile } from './types';
import { parseExcelFile } from './services/excelParser';
import { generateDataInsights } from './services/geminiService';
import Dropzone from './components/Dropzone';
import FileList from './components/FileList';
import DataPreview from './components/DataPreview';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
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

  const getInsights = async (id: string) => {
    const file = files.find(f => f.id === id);
    if (!file || file.insights) return;

    try {
      const insights = await generateDataInsights(file.data, file.name);
      setFiles(prev => prev.map(f => f.id === id ? { ...f, insights } : f));
    } catch (err) {
      console.error("Error getting insights:", err);
    }
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <FileJson className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Excel2JSON Pro</h1>
              <p className="text-sm text-gray-500">Conversión masiva inteligente</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {files.length > 0 && (
              <button 
                onClick={downloadAll}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Todo ({files.length})</span>
              </button>
            )}
            <div className="h-8 w-[1px] bg-gray-200 mx-2" />
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings2 className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* File List Panel */}
          <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <Dropzone onFilesAdded={handleFilesAdded} isProcessing={isProcessing} />
            </div>
            
            <div className="flex-1">
              <div className="p-4 flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <span>Archivos Cargados</span>
                <span>{files.length}</span>
              </div>
              <FileList 
                files={files} 
                selectedId={selectedFileId} 
                onSelect={setSelectedFileId} 
                onRemove={removeFile} 
              />
            </div>
          </div>

          {/* Preview & Insights Panel */}
          <div className="flex-1 bg-gray-50 overflow-y-auto p-8">
            {selectedFile ? (
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      {selectedFile.name}
                      <span className="text-xs font-normal bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase">Completado</span>
                    </h2>
                    <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB • {selectedFile.data.length} filas detectadas</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => getInsights(selectedFile.id)}
                      disabled={!!selectedFile.insights}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${selectedFile.insights ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                      <Zap className={`w-4 h-4 ${selectedFile.insights ? 'fill-indigo-500' : ''}`} />
                      <span>{selectedFile.insights ? 'Insights Generados' : 'Smart Insights'}</span>
                    </button>
                    <a 
                      href={`data:text/json;charset=utf-8,${encodeURIComponent(selectedFile.jsonString)}`}
                      download={`${selectedFile.name.split('.')[0]}.json`}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exportar JSON</span>
                    </a>
                  </div>
                </div>

                {selectedFile.insights && (
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-xl text-white shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 fill-white/20" />
                      <h3 className="font-bold">Análisis Inteligente por Gemini</h3>
                    </div>
                    <p className="text-indigo-50 leading-relaxed whitespace-pre-wrap">{selectedFile.insights}</p>
                  </div>
                )}

                <DataPreview data={selectedFile.data} />
                
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-700">Código JSON Generado</h3>
                    <button 
                      className="text-xs text-indigo-600 hover:underline font-medium"
                      onClick={() => navigator.clipboard.writeText(selectedFile.jsonString)}
                    >
                      Copiar al Portapapeles
                    </button>
                  </div>
                  <pre className="p-6 overflow-x-auto text-sm text-gray-800 bg-gray-900 text-green-400 font-mono max-h-[400px]">
                    {selectedFile.jsonString}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <div className="bg-gray-200 p-6 rounded-full mb-4">
                  <LayoutDashboard className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-400">Selecciona un archivo para previsualizar</h2>
                <p className="text-gray-400 max-w-sm mt-2">Carga tus archivos Excel (.xlsx, .csv) en el panel izquierdo para comenzar la conversión.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

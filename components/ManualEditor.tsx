
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, Copy, RotateCcw, Columns, Type } from 'lucide-react';

interface Row {
  [key: string]: string;
}

const ManualEditor: React.FC = () => {
  const [headers, setHeaders] = useState<string[]>(['ID', 'Nombre', 'Descripción']);
  const [rows, setRows] = useState<Row[]>([{ 'ID': '', 'Nombre': '', 'Descripción': '' }]);
  const [jsonOutput, setJsonOutput] = useState('');

  // Actualizar el JSON cada vez que cambian los encabezados o las filas
  useEffect(() => {
    setJsonOutput(JSON.stringify(rows, null, 2));
  }, [headers, rows]);

  const addRow = () => {
    const newRow: Row = {};
    headers.forEach(h => newRow[h] = '');
    setRows([...rows, newRow]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) {
      const clearedRow: Row = {};
      headers.forEach(h => clearedRow[h] = '');
      setRows([clearedRow]);
      return;
    }
    setRows(rows.filter((_, i) => i !== index));
  };

  const addColumn = () => {
    const newHeaderName = `Columna ${headers.length + 1}`;
    setHeaders([...headers, newHeaderName]);
    setRows(rows.map(row => ({ ...row, [newHeaderName]: '' })));
  };

  const removeColumn = (headerToRemove: string) => {
    if (headers.length <= 1) return;
    setHeaders(headers.filter(h => h !== headerToRemove));
    setRows(rows.map(row => {
      const { [headerToRemove]: _, ...rest } = row;
      return rest;
    }));
  };

  const updateHeader = (index: number, newName: string) => {
    const oldName = headers[index];
    if (newName === oldName || !newName.trim()) return;

    // Actualizar lista de encabezados
    const newHeaders = [...headers];
    newHeaders[index] = newName;

    // Mapear los datos de las filas a la nueva clave
    const newRows = rows.map(row => {
      const newRow: Row = {};
      headers.forEach((h, i) => {
        const key = i === index ? newName : h;
        newRow[key] = row[h] || '';
      });
      return newRow;
    });

    setHeaders(newHeaders);
    setRows(newRows);
  };

  const updateCell = (rowIndex: number, header: string, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [header]: value };
    setRows(newRows);
  };

  const resetTable = () => {
    if (confirm('¿Estás seguro de que deseas limpiar toda la tabla?')) {
      setHeaders(['ID', 'Nombre', 'Descripción']);
      setRows([{ 'ID': '', 'Nombre': '', 'Descripción': '' }]);
    }
  };

  const copyJson = () => {
    navigator.clipboard.writeText(jsonOutput);
    alert('JSON copiado al portapapeles');
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
      {/* Panel de Control */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Type className="w-5 h-5 text-indigo-600" />
            Editor de Tabla a JSON
          </h2>
          <p className="text-sm text-gray-500 mt-1">Edita encabezados y celdas. El JSON se genera al instante.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={addColumn}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold shadow-sm active:scale-95"
          >
            <Columns className="w-4 h-4 text-indigo-500" />
            Nueva Columna
          </button>
          <button 
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-bold shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nueva Fila
          </button>
          <button 
            onClick={resetTable}
            className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Resetear tabla"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interfaz de Tabla Editable */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {headers.map((header, idx) => (
                  <th key={`header-${idx}`} className="px-4 py-3 group relative border-r border-gray-100 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => updateHeader(idx, e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-500 rounded px-1 text-xs font-bold text-gray-600 uppercase tracking-widest outline-none transition-all"
                        placeholder="Encabezado..."
                      />
                      <button 
                        onClick={() => removeColumn(header)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                        title="Eliminar columna"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </th>
                ))}
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`} className="hover:bg-gray-50/50 transition-colors">
                  {headers.map((header) => (
                    <td key={`cell-${rowIndex}-${header}`} className="px-4 py-2 border-r border-gray-100 last:border-r-0">
                      <input
                        type="text"
                        value={row[header] || ''}
                        onChange={(e) => updateCell(rowIndex, header, e.target.value)}
                        placeholder="Escribir..."
                        className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-700 placeholder-gray-300 outline-none"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-2 text-center">
                    <button 
                      onClick={() => removeRow(rowIndex)}
                      className="p-1 text-gray-200 hover:text-red-400 transition-colors"
                      title="Eliminar fila"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="p-8 text-center text-gray-400 italic text-sm">
            La tabla está vacía. Añade una fila para empezar.
          </div>
        )}
      </div>

      {/* Vista Previa del JSON */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest">JSON Resultante (En Vivo)</h3>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={copyJson}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all active:scale-95"
            >
              <Copy className="w-3.5 h-3.5" />
              Copiar JSON
            </button>
            <a 
              href={`data:text/json;charset=utf-8,${encodeURIComponent(jsonOutput)}`}
              download="datos_manuales.json"
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar .json
            </a>
          </div>
        </div>
        <div className="relative group">
          <pre className="p-8 overflow-x-auto text-sm text-green-400 bg-gray-900 font-mono leading-relaxed max-h-[500px] scrollbar-thin scrollbar-thumb-gray-700">
            {jsonOutput}
          </pre>
          <div className="absolute top-4 right-4 text-[10px] text-gray-500 font-mono bg-gray-800/50 px-2 py-1 rounded backdrop-blur-sm opacity-50">
            {rows.length} {rows.length === 1 ? 'objeto' : 'objetos'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualEditor;

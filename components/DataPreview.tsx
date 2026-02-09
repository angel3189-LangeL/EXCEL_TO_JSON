
import React from 'react';

interface DataPreviewProps {
  data: any[];
}

const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const headers = Object.keys(data[0]);
  const previewData = data.slice(0, 10);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-bold text-gray-700">Previsualización (Primeros 10 registros)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              {headers.map((header) => (
                <th key={header} className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {previewData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                {headers.map((header) => (
                  <td key={header} className="px-6 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {String(row[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 10 && (
        <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
          <p className="text-xs text-gray-500">Y {data.length - 10} filas más...</p>
        </div>
      )}
    </div>
  );
};

export default DataPreview;

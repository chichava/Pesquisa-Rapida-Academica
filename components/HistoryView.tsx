
import React from 'react';
import { ResearchResult } from '../types';

interface Props {
  history: ResearchResult[];
  onSelect: (result: ResearchResult) => void;
  onDownload: (result: ResearchResult) => void;
  onClear: () => void;
}

export const HistoryView: React.FC<Props> = ({ history, onSelect, onDownload, onClear }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
        <div className="text-5xl mb-4">📂</div>
        <h3 className="text-lg font-bold text-gray-900">Histórico Vazio</h3>
        <p className="text-gray-500">Os seus trabalhos gerados aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Meus Trabalhos</h2>
        <button 
          onClick={onClear}
          className="text-sm text-red-600 hover:underline font-medium"
        >
          Limpar Tudo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.sort((a, b) => b.timestamp - a.timestamp).map((item) => (
          <div 
            key={item.id} 
            className="bg-white border p-5 rounded-2xl hover:shadow-lg transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded">
                  {item.request.type}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(item.timestamp).toLocaleDateString('pt-MZ')}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-green-700 transition-colors">
                {item.request.topic}
              </h3>
            </div>
            
            <div className="flex items-center space-x-3 mt-4">
              <button 
                onClick={() => onSelect(item)}
                className="flex-grow py-2 text-sm font-bold text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Ver/Editar
              </button>
              <button 
                onClick={() => onDownload(item)}
                className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                title="Descarregar Word"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

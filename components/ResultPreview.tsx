
import React, { useState } from 'react';
import { ResearchResult } from '../types';
import { RichTextEditor } from './RichTextEditor';

interface Props {
  result: ResearchResult;
  onUpdate: (updatedContent: string) => void;
  onDownload: () => void;
}

export const ResultPreview: React.FC<Props> = ({ result, onUpdate, onDownload }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-green-50 p-6 rounded-2xl border border-green-100">
        <div>
          <h2 className="text-lg font-bold text-green-900">Edite e Personalize</h2>
          <p className="text-sm text-green-700">Pode fazer alterações no texto abaixo antes de descarregar o ficheiro Word.</p>
        </div>
        <button
          onClick={onDownload}
          className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-700 flex items-center justify-center space-x-2 transition-all shadow-lg shadow-green-200 transform active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Finalizar e Baixar Word</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Editor de Trabalho Académico</span>
          <span className="text-xs text-gray-400">Formatação Automática: {result.request.norm}</span>
        </div>
        
        <RichTextEditor 
          initialContent={result.content} 
          onChange={onUpdate} 
        />
      </div>

      {result.sources.length > 0 && (
        <div className="bg-white rounded-2xl border p-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Fontes Bibliográficas Fidedignas</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.sources.map((source, idx) => (
              <li key={idx} className="text-sm">
                <a 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 border rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center space-x-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <span className="truncate flex-grow font-medium text-gray-700">{source.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

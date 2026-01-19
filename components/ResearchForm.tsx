
import React, { useState, useEffect } from 'react';
import { MaterialType, TechnicalNorm, EducationLevel, ResearchRequest } from '../types';

interface Props {
  onSubmit: (data: ResearchRequest) => void;
  isLoading: boolean;
}

export const ResearchForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ResearchRequest>({
    topic: '',
    type: MaterialType.TRABALHO_PESQUISA,
    norm: TechnicalNorm.MOZAMBIQUE,
    level: EducationLevel.SUPERIOR
  });

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timeZone.includes('Maputo')) {
          setFormData(prev => ({ ...prev, norm: TechnicalNorm.MOZAMBIQUE }));
        } else if (timeZone.includes('Sao_Paulo') || timeZone.includes('Brasilia')) {
          setFormData(prev => ({ ...prev, norm: TechnicalNorm.BRAZIL }));
        } else if (timeZone.includes('Lisbon')) {
          setFormData(prev => ({ ...prev, norm: TechnicalNorm.PORTUGAL }));
        } else if (timeZone.includes('Luanda')) {
          setFormData(prev => ({ ...prev, norm: TechnicalNorm.ANGOLA }));
        }
      } catch (e) {
        console.warn("Location detection failed", e);
      }
    };
    detectLocation();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 lg:p-12 space-y-8">
      <div className="space-y-3">
        <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">Tema da Pesquisa Científica</label>
        <input
          type="text"
          required
          placeholder="Ex: 'O Impacto da Inteligência Artificial na Educação Superior'"
          className="w-full px-6 py-5 rounded-3xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-xl font-medium placeholder:text-gray-300 bg-gray-50"
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Formato Académico</label>
          <select
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 outline-none bg-gray-50 font-bold text-gray-700"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as MaterialType })}
          >
            {Object.values(MaterialType).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
            Norma Técnica
            <span className="text-[10px] text-indigo-500 lowercase bg-indigo-50 px-2 py-0.5 rounded-full">sugerida</span>
          </label>
          <select
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 outline-none bg-gray-50 font-bold text-gray-700"
            value={formData.norm}
            onChange={(e) => setFormData({ ...formData, norm: e.target.value as TechnicalNorm })}
          >
            {Object.values(TechnicalNorm).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Complexidade</label>
          <select
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 outline-none bg-gray-50 font-bold text-gray-700"
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value as EducationLevel })}
          >
            {Object.values(EducationLevel).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !formData.topic}
        className={`w-full py-6 rounded-[2rem] font-black text-white text-xl transition-all transform active:scale-95 flex items-center justify-center space-x-3 shadow-2xl ${
          isLoading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Gerando Pesquisa Exaustiva...</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Iniciar Processamento Científico</span>
          </>
        )}
      </button>
    </form>
  );
};

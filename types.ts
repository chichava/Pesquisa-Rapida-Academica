
export enum MaterialType {
  RESUMO = 'Resumo',
  TRABALHO_PESQUISA = 'Trabalho de Pesquisa',
  FICHA_ESTUDO = 'Ficha de Estudo',
  ARTIGO = 'Artigo Científico'
}

export enum TechnicalNorm {
  MOZAMBIQUE = 'Moçambique',
  BRAZIL = 'Brasil (ABNT)',
  PORTUGAL = 'Portugal (ISO 690)',
  ANGOLA = 'Angola'
}

export enum EducationLevel {
  BASICO = 'Ensino Básico',
  SECUNDARIO = 'Ensino Secundário',
  SUPERIOR = 'Ensino Superior'
}

export interface ResearchRequest {
  topic: string;
  type: MaterialType;
  norm: TechnicalNorm;
  level: EducationLevel;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ResearchResult {
  id: string;
  content: string; 
  sources: GroundingSource[];
  request: ResearchRequest;
  timestamp: number;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isStudent: boolean;
}

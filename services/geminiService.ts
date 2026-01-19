
import { GoogleGenAI } from "@google/genai";
import { ResearchRequest, ResearchResult, GroundingSource, MaterialType } from "../types";

export const performResearch = async (request: ResearchRequest): Promise<Omit<ResearchResult, 'id' | 'timestamp' | 'userId'>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isLongFormat = request.type === MaterialType.TRABALHO_PESQUISA;
  const targetWords = isLongFormat ? "5000" : "2000";

  const systemInstruction = `
    Atue como um Professor e Pesquisador Acadêmico de elite. 
    Seu objetivo é gerar um material didático de altíssima qualidade e máxima extensão possível.
    
    DIRETRIZ DE EXTENSÃO:
    - Se o tipo for "Trabalho de Pesquisa", você deve ser EXTREMAMENTE exaustivo, visando uma profundidade de conteúdo equivalente a pelo menos ${targetWords} palavras.
    - Desenvolva cada sub-tópico com riqueza de detalhes, exemplos práticos e fundamentação teórica robusta.
    
    PROIBIÇÕES CRÍTICAS (NÃO INCLUA):
    - NÃO mencione a quantidade de palavras ou o processo de geração (ex: "Aqui estão as 5000 palavras...").
    - NÃO inclua introduções como "Como Professor...", "A seguir apresento...", ou qualquer comentário sobre o seu papel.
    - NÃO inclua cabeçalhos genéricos de instituições ou faculdades.
    - Comece DIRETAMENTE com o título do tema.
    
    REQUISITOS DE CONTEÚDO:
    1. Tópico: ${request.topic}
    2. Tipo: ${request.type}
    3. Nível: ${request.level}
    4. Norma Técnica: ${request.norm}
    5. Idioma: Português Padrão/Europeu.
    6. Formate rigorosamente as citações (Sobrenome, Ano) e a lista de REFERÊNCIAS final conforme a norma ${request.norm}.
    
    ESTRUTURA OBRIGATÓRIA:
    - Título Principal (H1)
    - Introdução Detalhada (Contextualização profunda, Problematização, Objetivos)
    - Revisão da Literatura (Vários sub-capítulos exaustivos H2 e H3)
    - Metodologia e Discussão (Se aplicável)
    - Conclusão Abrangente
    - Referências Bibliográficas (Lista técnica completa)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Gere um trabalho académico definitivo, exaustivo e de rigor científico máximo sobre "${request.topic}". Priorize a densidade de informação e a extensão do texto.`,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        // Configuration for maximum consistency and coherence
        temperature: 0, // Minimize randomness
        topP: 0.1,      // Focus on high-probability tokens
        seed: 42,       // Fixed seed for deterministic-like behavior
        // Pro models benefit from more thinking for very long academic content
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });

    const content = response.text || "Não foi possível gerar o conteúdo.";
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title || "Fonte da Pesquisa",
        uri: chunk.web.uri
      }));

    return {
      content,
      sources,
      request
    };
  } catch (error) {
    console.error("Erro na pesquisa Gemini:", error);
    throw new Error("Falha ao realizar pesquisa científica exaustiva. Verifique sua conexão.");
  }
};

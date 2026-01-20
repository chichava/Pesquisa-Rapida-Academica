
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ResearchForm } from './components/ResearchForm';
import { ResultPreview } from './components/ResultPreview';
import { HistoryView } from './components/HistoryView';
import { LiveAssistant } from './components/LiveAssistant';
import { performResearch } from './services/geminiService';
import { exportToWord } from './services/exportService';
import { User, ResearchRequest, ResearchResult } from './types';

type ViewMode = 'home' | 'history';
type AuthMode = 'login' | 'signup';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewMode>('home');
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<ResearchResult | null>(null);
  const [history, setHistory] = useState<ResearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' });

  useEffect(() => {
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (user) {
      const savedHistory = localStorage.getItem(`history_${user.id}`);
      setHistory(savedHistory ? JSON.parse(savedHistory) : []);
    }
  }, [user]);

  const saveHistory = (newHistory: ResearchResult[]) => {
    if (!user) return;
    setHistory(newHistory);
    localStorage.setItem(`history_${user.id}`, JSON.stringify(newHistory));
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (authForm.password.length < 6) return alert("A palavra-passe deve ter pelo menos 6 caracteres.");
    
    const usersKey = 'pesquisa_rapida_users';
    const users = JSON.parse(localStorage.getItem(usersKey) || '[]');
    
    if (authMode === 'login') {
      const foundUser = users.find((u: any) => u.username === authForm.username);
      
      if (!foundUser) {
        // Pop-up específico quando o utilizador não está cadastrado
        return alert("Utilizador não cadastrado no sistema. Por favor, mude para a aba 'Registo' e crie a sua conta para aceder à plataforma.");
      }

      if (foundUser.password !== authForm.password) {
        return alert("Palavra-passe incorreta. Por favor, tente novamente.");
      }

      const { password, ...userToSet } = foundUser;
      setUser(userToSet);
      localStorage.setItem('current_user', JSON.stringify(userToSet));
      
      // Tracking simulado de login
      if ((window as any).gtag) {
        (window as any).gtag('event', 'login', { method: 'local_storage' });
      }

    } else {
      if (users.some((u: any) => u.username === authForm.username || u.email === authForm.email)) {
        return alert("Este nome de utilizador ou e-mail já está registado. Tente fazer login.");
      }
      
      const newUser = { 
        id: btoa(authForm.email || authForm.username + Date.now()), 
        name: authForm.username, 
        email: authForm.email, 
        password: authForm.password, 
        isStudent: true 
      };
      
      users.push(newUser);
      localStorage.setItem(usersKey, JSON.stringify(users));
      
      const { password, ...userToSet } = newUser;
      setUser(userToSet);
      localStorage.setItem('current_user', JSON.stringify(userToSet));

      // Tracking simulado de registro
      if ((window as any).gtag) {
        (window as any).gtag('event', 'sign_up', { method: 'local_storage' });
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('current_user');
    setView('home');
    setCurrentResult(null);
  };

  const handleResearch = async (request: ResearchRequest) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setCurrentResult(null);
    
    // Tracking do início da pesquisa
    if ((window as any).gtag) {
      (window as any).gtag('event', 'start_research', { topic: request.topic, type: request.type });
    }

    try {
      const data = await performResearch(request);
      const htmlContent = data.content.split('\n').map(p => {
        const trimmed = p.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('# ')) return `<h1 style="color: #0f172a; font-weight: 800; font-size: 2.25rem; margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem;">${trimmed.replace('# ', '')}</h1>`;
        if (trimmed.startsWith('## ')) return `<h2 style="color: #1e293b; font-weight: 700; font-size: 1.75rem; margin-top: 2rem; margin-bottom: 1.25rem;">${trimmed.replace('## ', '')}</h2>`;
        if (trimmed.startsWith('### ')) return `<h3 style="color: #334155; font-weight: 600; font-size: 1.25rem; margin-top: 1.5rem; margin-bottom: 1rem;">${trimmed.replace('### ', '')}</h3>`;
        return `<p style="color: #1a202c; font-size: 1.125rem; margin-bottom: 1.5rem; line-height: 1.8; text-align: justify;">${trimmed}</p>`;
      }).join('');
      
      const newResult: ResearchResult = { ...data, id: Math.random().toString(36).substr(2, 9), content: htmlContent, timestamp: Date.now(), userId: user.id };
      setCurrentResult(newResult);
      saveHistory([...history, newResult]);
    } catch (err: any) {
      setError(err.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (resultToDownload?: ResearchResult) => {
    const target = resultToDownload || currentResult;
    if (target) {
      exportToWord(target);
      if ((window as any).gtag) {
        (window as any).gtag('event', 'download_word', { topic: target.request.topic });
      }
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-10 p-10 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
              {authMode === 'login' ? 'Aceder à Plataforma' : 'Criar Nova Conta'}
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Pesquisa Académica em Moçambique</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
            <button onClick={() => setAuthMode('login')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${authMode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>Login</button>
            <button onClick={() => setAuthMode('signup')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${authMode === 'signup' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>Registo</button>
          </div>
          <form onSubmit={handleAuth} className="space-y-5">
            <input type="text" required placeholder="Nome de Utilizador" className="w-full px-5 py-4 rounded-2xl border bg-gray-50 font-semibold" value={authForm.username} onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })} />
            {authMode === 'signup' && <input type="email" required placeholder="E-mail" className="w-full px-5 py-4 rounded-2xl border bg-gray-50 font-semibold" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />}
            <input type="password" required placeholder="Palavra-passe" className="w-full px-5 py-4 rounded-2xl border bg-gray-50 font-semibold" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
            <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl text-lg mt-4 shadow-lg shadow-indigo-100">
              {authMode === 'login' ? 'Entrar Agora' : 'Finalizar Cadastro'}
            </button>
          </form>
          <div className="mt-6 text-center">
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Utilização exclusiva para fins académicos</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        <nav className="flex items-center space-x-2 bg-indigo-50 p-1.5 rounded-2xl w-fit shadow-sm border border-indigo-100">
          <button onClick={() => setView('home')} className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${view === 'home' ? 'bg-white text-indigo-700 shadow-md' : 'text-gray-500'}`}>Nova Pesquisa</button>
          <button onClick={() => setView('history')} className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${view === 'history' ? 'bg-white text-indigo-700 shadow-md' : 'text-gray-500'}`}>Trabalhos ({history.length})</button>
        </nav>

        {view === 'home' ? (
          <>
            <section className="text-center lg:text-left space-y-4">
              <h1 className="text-4xl lg:text-6xl font-black text-gray-900 leading-tight tracking-tight">Pesquisa Académica <span className="text-indigo-600">Fidedigna</span></h1>
              <p className="text-xl text-gray-600 max-w-3xl font-medium">Geração de material didático exaustivo e rigoroso para estudantes moçambicanos.</p>
            </section>
            <ResearchForm onSubmit={handleResearch} isLoading={loading} />
            {error && <div className="p-6 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-center font-bold">{error}</div>}
            {currentResult && <ResultPreview result={currentResult} onUpdate={(c) => {
              const updated = { ...currentResult, content: c };
              setCurrentResult(updated);
              saveHistory(history.map(item => item.id === updated.id ? updated : item));
            }} onDownload={() => handleDownload()} />}
          </>
        ) : (
          <HistoryView history={history} onSelect={(item) => { setCurrentResult(item); setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onDownload={handleDownload} onClear={() => { if (confirm('Deseja limpar o histórico?')) saveHistory([]); }} />
        )}
      </div>

      <button 
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform voice-pulse z-50"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>

      <LiveAssistant 
        contextTopic={currentResult?.request.topic || "Pesquisa Académica"}
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </Layout>
  );
};

export default App;

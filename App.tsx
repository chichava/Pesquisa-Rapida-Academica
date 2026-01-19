
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ResearchForm } from './components/ResearchForm';
import { ResultPreview } from './components/ResultPreview';
import { HistoryView } from './components/HistoryView';
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

  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' });

  // Persistence: Load session and user database
  useEffect(() => {
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Load user-specific history
  useEffect(() => {
    if (user) {
      const savedHistory = localStorage.getItem(`history_${user.id}`);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      } else {
        setHistory([]);
      }
    }
  }, [user]);

  const saveHistory = (newHistory: ResearchResult[]) => {
    if (!user) return;
    setHistory(newHistory);
    localStorage.setItem(`history_${user.id}`, JSON.stringify(newHistory));
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authForm.password.length < 6) {
      alert("A palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }

    const usersKey = 'pesquisa_rapida_users';
    const users = JSON.parse(localStorage.getItem(usersKey) || '[]');
    
    if (authMode === 'login') {
      const foundUser = users.find((u: any) => u.username === authForm.username && u.password === authForm.password);
      if (!foundUser) {
        alert("Credenciais inválidas ou utilizador inexistente.");
        return;
      }
      const { password, ...userToSet } = foundUser;
      setUser(userToSet);
      localStorage.setItem('current_user', JSON.stringify(userToSet));
    } else {
      const userExists = users.some((u: any) => u.username === authForm.username || u.email === authForm.email);
      if (userExists) {
        alert("Utilizador ou e-mail já registado.");
        return;
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
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('current_user');
    setView('home');
    setCurrentResult(null);
    setAuthForm({ username: '', email: '', password: '' });
  };

  const handleResearch = async (request: ResearchRequest) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setCurrentResult(null);
    try {
      const data = await performResearch(request);
      
      // Formatting for high contrast visibility in the editor
      const htmlContent = data.content
        .split('\n')
        .map(p => {
          const trimmed = p.trim();
          if (!trimmed) return '';
          if (trimmed.startsWith('# ')) return `<h1 style="color: #0f172a; font-weight: 800; font-size: 2.25rem; margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem;">${trimmed.replace('# ', '')}</h1>`;
          if (trimmed.startsWith('## ')) return `<h2 style="color: #1e293b; font-weight: 700; font-size: 1.75rem; margin-top: 2rem; margin-bottom: 1.25rem;">${trimmed.replace('## ', '')}</h2>`;
          if (trimmed.startsWith('### ')) return `<h3 style="color: #334155; font-weight: 600; font-size: 1.25rem; margin-top: 1.5rem; margin-bottom: 1rem;">${trimmed.replace('### ', '')}</h3>`;
          return `<p style="color: #1a202c; font-size: 1.125rem; margin-bottom: 1.5rem; line-height: 1.8; text-align: justify;">${trimmed}</p>`;
        })
        .join('');
      
      const newResult: ResearchResult = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        content: htmlContent,
        timestamp: Date.now(),
        userId: user.id
      };
      
      setCurrentResult(newResult);
      saveHistory([...history, newResult]);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContent = (updatedHtml: string) => {
    if (currentResult && user) {
      const updated = { ...currentResult, content: updatedHtml };
      setCurrentResult(updated);
      const newHistory = history.map(item => item.id === updated.id ? updated : item);
      saveHistory(newHistory);
    }
  };

  const handleDownload = (resultToDownload?: ResearchResult) => {
    const target = resultToDownload || currentResult;
    if (target) {
      exportToWord(target);
    }
  };

  const handleSelectHistoryItem = (item: ResearchResult) => {
    setCurrentResult(item);
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // The application is completely blocked until the user is authenticated.
  if (!user) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-10 p-10 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
              {authMode === 'login' ? 'Bem-vindo de Volta' : 'Criar Nova Conta'}
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Aceda à sua plataforma académica</p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
            <button 
              onClick={() => { setAuthMode('login'); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${authMode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Login
            </button>
            <button 
              onClick={() => { setAuthMode('signup'); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${authMode === 'signup' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Registo
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Nome de Utilizador</label>
              <input
                type="text"
                required
                className="w-full mt-2 px-5 py-4 rounded-2xl border border-gray-200 outline-none focus:ring-4 focus:ring-indigo-50 bg-gray-50 transition-all font-semibold text-gray-800"
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
              />
            </div>
            {authMode === 'signup' && (
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">E-mail Académico</label>
                <input
                  type="email"
                  required
                  className="w-full mt-2 px-5 py-4 rounded-2xl border border-gray-200 outline-none focus:ring-4 focus:ring-indigo-50 bg-gray-50 transition-all font-semibold text-gray-800"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Palavra-passe</label>
              <input
                type="password"
                required
                className="w-full mt-2 px-5 py-4 rounded-2xl border border-gray-200 outline-none focus:ring-4 focus:ring-indigo-50 bg-gray-50 transition-all font-semibold text-gray-800"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 transform active:scale-95 text-lg mt-4"
            >
              {authMode === 'login' ? 'Entrar Agora' : 'Finalizar Registo'}
            </button>
          </form>
          
          <p className="mt-8 text-center text-xs text-gray-400 font-medium">
            Sistema restrito para estudantes e investigadores.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="max-w-5xl mx-auto space-y-12">
        <nav className="flex items-center space-x-2 bg-indigo-50 p-1.5 rounded-2xl w-fit mx-auto lg:mx-0 shadow-sm border border-indigo-100">
          <button 
            onClick={() => setView('home')}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${view === 'home' ? 'bg-white text-indigo-700 shadow-md' : 'text-gray-500 hover:text-indigo-600'}`}
          >
            Nova Pesquisa Científica
          </button>
          <button 
            onClick={() => setView('history')}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${view === 'history' ? 'bg-white text-indigo-700 shadow-md' : 'text-gray-500 hover:text-indigo-600'}`}
          >
            Os Meus Trabalhos ({history.length})
          </button>
        </nav>

        {view === 'home' ? (
          <>
            <section className="text-center lg:text-left space-y-4">
              <h1 className="text-4xl lg:text-6xl font-black text-gray-900 leading-tight tracking-tight">
                Pesquisa Académica <span className="text-indigo-600">Global</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl font-medium">
                Geração de trabalhos científicos exaustivos, fidedignos e prontos para submissão académica.
              </p>
            </section>

            <ResearchForm onSubmit={handleResearch} isLoading={loading} />

            {error && (
              <div className="p-6 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-center font-bold">
                {error}
              </div>
            )}

            {currentResult && (
              <ResultPreview 
                result={currentResult} 
                onUpdate={handleUpdateContent}
                onDownload={() => handleDownload()} 
              />
            )}
          </>
        ) : (
          <HistoryView 
            history={history} 
            onSelect={handleSelectHistoryItem} 
            onDownload={handleDownload}
            onClear={() => {
              if (confirm('Tem a certeza que deseja limpar o seu histórico permanente?')) saveHistory([]);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default App;

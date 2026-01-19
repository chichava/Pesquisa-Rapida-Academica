
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode, onLogout?: () => void, user?: any }> = ({ children, onLogout, user }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">Pesquisa Rápida <span className="text-indigo-600">Académica</span></span>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-gray-900">{user.name}</span>
                <span className="text-xs text-gray-500 uppercase tracking-tighter">Estudante</span>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Sair"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-white border-t py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} Pesquisa Rápida Académica - Lusofonia
          </p>
          <div className="flex justify-center space-x-4 mt-3 text-xs text-gray-400">
            <span>Moçambique</span>
            <span>Angola</span>
            <span>Brasil</span>
            <span>Portugal</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

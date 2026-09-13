import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { TasteProvider } from './state/TasteContext';
import { SelectionTray } from './features/taste/components/SelectionTray';
import { TasteBuilderPage } from './pages/TasteBuilderPage';

export const App: React.FC = () => {
  return (
    <TasteProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4">
        <nav className="p-4 bg-slate-900 mb-6 rounded flex gap-4 border border-slate-800">
          <Link to="/" className="text-amber-400 font-bold hover:underline">Home</Link>
          <Link to="/taste" className="text-amber-400 font-bold hover:underline">Taste Builder (/taste)</Link>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <div className="text-center py-20">
                <h1 className="text-2xl font-bold mb-4">Welcome to Flashback</h1>
                <Link to="/taste" className="bg-amber-500 text-slate-950 px-4 py-2 rounded font-bold">
                  Open Taste Builder Page
                </Link>
              </div>
            }
          />
          <Route path="/taste" element={<TasteBuilderPage />} />
        </Routes>

        <SelectionTray />
      </div>
    </TasteProvider>
  );
};

export default App;
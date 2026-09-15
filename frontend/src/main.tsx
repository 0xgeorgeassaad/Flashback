import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LibraryProvider } from './features/library/LibraryContext'
import { CatalogProvider } from './state/CatalogContext'
import { TasteProvider } from './state/TasteContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CatalogProvider>
        <TasteProvider>
          <LibraryProvider>
            <App />
          </LibraryProvider>
        </TasteProvider>
      </CatalogProvider>
    </BrowserRouter>
  </StrictMode>,
)

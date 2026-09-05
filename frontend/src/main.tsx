import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CatalogProvider } from './state/CatalogContext'
import { TasteProvider } from './state/TasteContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CatalogProvider>
        <TasteProvider>
          <App />
        </TasteProvider>
      </CatalogProvider>
    </BrowserRouter>
  </StrictMode>,
)

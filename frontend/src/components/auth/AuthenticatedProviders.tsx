import { Outlet } from 'react-router-dom'
import { LibraryProvider } from '../../features/library/LibraryContext'
import { CatalogProvider } from '../../state/CatalogContext'
import { TasteProvider } from '../../state/TasteContext'

export function AuthenticatedProviders() {
  return (
    <CatalogProvider>
      <TasteProvider>
        <LibraryProvider>
          <Outlet />
        </LibraryProvider>
      </TasteProvider>
    </CatalogProvider>
  )
}

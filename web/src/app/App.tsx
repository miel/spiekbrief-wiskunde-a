import { Navigate, Route, Routes } from 'react-router-dom'
import { Shell } from './Shell'
import { BrowseView } from '../features/browse/BrowseView'
import { TopicView } from '../features/topic/TopicView'
import { SearchView } from '../features/search/SearchView'
import { FavoritesView } from '../features/favorites/FavoritesView'
import { PracticeView } from '../features/flashcards/PracticeView'
import { SessionView } from '../features/flashcards/SessionView'
import { AboutView } from '../features/about/AboutView'

export function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<BrowseView />} />
        <Route path="/onderwerp/:topicId" element={<TopicView />} />
        <Route path="/zoeken" element={<SearchView />} />
        <Route path="/favorieten" element={<FavoritesView />} />
        <Route path="/oefenen" element={<PracticeView />} />
        <Route path="/oefenen/sessie" element={<SessionView />} />
        <Route path="/over" element={<AboutView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  )
}

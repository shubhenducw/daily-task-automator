import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import TaskCollectionPage from './pages/TaskCollectionPage';
import SettingsPage from './pages/SettingsPage';
import { ThemeProvider } from "@/components/theme-provider"
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme" attribute="class">
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <TaskCollectionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MainLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;

import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import { Sidebar } from "./components/Sidebar";
import { AuthProvider, useAuth } from "./context/AuthContext";

const Main = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      <Sidebar />
      <main className="flex-1 overflow-auto w-full pt-16 md:pt-0">
        <Dashboard />
      </main>
    </div>
  ) : <LoginPage />;
};

function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}

export default App;

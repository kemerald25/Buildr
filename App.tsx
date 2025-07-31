import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Wish } from "./types";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { WishProvider } from "./hooks/useWishes";
import Header from "./components/Header";
import Wishlist from "./components/Wishlist";
import WishPage from "./components/WishPage";
import CreateWishModal from "./components/CreateWishModal";
import ContributeModal from "./components/ContributeModal";
import FrameMeta from "./components/FrameMeta";
import { sdk } from "@farcaster/miniapp-sdk";
import HomePage from "./pages/HomePage";
import BuildersPage from "./pages/BuildersPage";
import IdeasPage from "./pages/IdeasPage";
import IdeaDetailPage from "./pages/IdeaDetailPage";
import UserProfilePage from "./pages/UserProfilePage";
import CreateIdeaPage from "./pages/CreateIdeaPage";
import ChatPage from "./pages/ChatPage";
import EditProfilePage from "./pages/EditProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import EditIdeaPage from "./pages/EditIdeaPage";

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isContributeModalOpen, setContributeModalOpen] = useState(false);
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);

  useEffect(() => {
    const notifySDKReady = async () => {
      try {
        console.log("Notifying Farcaster SDK that app is ready...");
        console.log("Current location:", location.pathname);
        await sdk.actions.ready();
        console.log("Farcaster SDK ready signal sent!");
      } catch (error) {
        console.error("Failed to notify Farcaster SDK:", error);
      }
    };

    notifySDKReady();
  }, [location.pathname]);

  const handleOpenContributeModal = (wish: Wish) => {
    setSelectedWish(wish);
    setContributeModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    if (user) {
      setCreateModalOpen(true);
    } else {
      alert("Please sign in to create a wish.");
    }
  };

  return (
    <div className="min-h-screen bg-brand-light">
      <Header onCreateWish={handleOpenCreateModal} />
      <main className="container mx-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/builders" element={<BuildersPage />} />
          <Route path="/ideas" element={<IdeasPage />} />
          <Route path="/ideas/create" element={<CreateIdeaPage />} />
          <Route path="/ideas/:id" element={<IdeaDetailPage />} />
          <Route path="/ideas/edit/:id" element={<EditIdeaPage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/profile/:uid" element={<UserProfilePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <CreateWishModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
      <ContributeModal
        isOpen={isContributeModalOpen}
        onClose={() => setContributeModalOpen(false)}
        wish={selectedWish}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <WishProvider>
          <AppContent />
        </WishProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;

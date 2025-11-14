
import React, { useState, useCallback, useEffect } from 'react';
import type { View, User } from './types';
import { DataProvider, useData } from './contexts/DataContext';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import ServosView from './components/ServosView';
import EventsView from './components/EventsView';
import ReportsView from './components/ReportsView';
import AdminView from './components/AdminView';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import ProfileModal from './components/ProfileModal';
import SettingsModal from './components/SettingsModal';
import UserModal from './components/UserModal';

const AppContent: React.FC = () => {
  const { currentUser } = useData();
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // State for UserModal, lifted from AdminView
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditingSelf, setIsEditingSelf] = useState(false);

  // State to pass a specific date to the calendar view
  const [contextualDate, setContextualDate] = useState<Date | null>(null);

  // Handle deep linking from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') as View;
    const validViews: View[] = ['dashboard', 'escala', 'servos', 'eventos', 'relatorios', 'admin'];
    if (view && validViews.includes(view)) {
        setActiveView(view);
    }
  }, []);


  const handleOpenUserModal = (user: User | null, isSelf: boolean) => {
    setEditingUser(user);
    setIsEditingSelf(isSelf);
    setIsUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setEditingUser(null);
    setIsEditingSelf(false);
  };

  const handleViewEventSchedule = (dateString: string) => {
    const targetDate = new Date(dateString + 'T00:00:00');
    if (!isNaN(targetDate.getTime())) {
      setContextualDate(targetDate);
      setActiveView('escala');
    } else {
      console.error("Invalid date string provided to handleViewEventSchedule:", dateString);
    }
  };


  const renderView = useCallback(() => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard setActiveView={setActiveView} />;
      case 'escala':
        return <CalendarView initialDate={contextualDate} onClearInitialDate={() => setContextualDate(null)} />;
      case 'servos':
        return <ServosView />;
      case 'eventos':
        return <EventsView onViewSchedule={handleViewEventSchedule} />;
      case 'relatorios':
        return <ReportsView />;
      case 'admin':
        return <AdminView onAddUser={() => handleOpenUserModal(null, false)} onEditUser={(user) => handleOpenUserModal(user, false)} />;
      default:
        return <Dashboard setActiveView={setActiveView} />;
    }
  }, [activeView, contextualDate]);

  return (
    <div key={currentUser.id} className="min-h-screen bg-bordeaux text-white flex flex-col">
      <Header 
        view={activeView} 
        onProfileClick={() => setIsProfileModalOpen(true)}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
      />
      <main className="flex-grow container mx-auto p-4 pb-24">
        {renderView()}
      </main>
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
      
      {isProfileModalOpen && (
        <ProfileModal 
          onClose={() => setIsProfileModalOpen(false)}
          onEditProfile={() => {
            setIsProfileModalOpen(false);
            handleOpenUserModal(currentUser, true);
          }}
        />
      )}

      {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />}

      {isUserModalOpen && (
        <UserModal 
          userToEdit={editingUser} 
          onClose={handleCloseUserModal} 
          isEditingSelf={isEditingSelf}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;

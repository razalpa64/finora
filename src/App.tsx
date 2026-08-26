import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { QuickAddModal } from './components/layout/QuickAddModal';
import { CommandPalette } from './components/layout/CommandPalette';
import { ToastContainer } from './components/layout/Toast';

// Auth Screen
import { AuthView } from './components/pages/AuthView';

// Pages
import { OverviewPage } from './components/pages/OverviewPage';
import { IncomePage } from './components/pages/IncomePage';
import { TransactionsPage } from './components/pages/TransactionsPage';
import { PlanPage } from './components/pages/PlanPage';
import { DebtPage } from './components/pages/DebtPage';
import { GoalsPage } from './components/pages/GoalsPage';
import { CalendarPage } from './components/pages/CalendarPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { BrainPage } from './components/pages/BrainPage';
import { SettingsPage } from './components/pages/SettingsPage';

const AppContent: React.FC = () => {
  const { currentProfile, page } = useApp();

  // If not signed in, show Auth / Sign In screen
  if (!currentProfile) {
    return (
      <>
        <AuthView />
        <ToastContainer />
      </>
    );
  }

  const renderActivePage = () => {
    switch (page) {
      case 'overview':
        return <OverviewPage />;
      case 'income':
        return <IncomePage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'plan':
        return <PlanPage />;
      case 'debt':
        return <DebtPage />;
      case 'goals':
        return <GoalsPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'reports':
        return <ReportsPage />;
      case 'brain':
        return <BrainPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#191c27] flex flex-col lg:flex-row antialiased selection:bg-[#5a42e8] selection:text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {renderActivePage()}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />

      {/* Modals & Popovers */}
      <QuickAddModal />
      <CommandPalette />
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;

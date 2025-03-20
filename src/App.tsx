import React, { useState } from 'react';
import { useAuth } from './auth/AuthProvider';
import { AuthForm } from './components/AuthForm';
import { GoalPage } from './components/GoalPage';
import { ActivityPage } from './components/ActivityPage';

function App() {
  const [showGoalPage, setShowGoalPage] = useState(false);
  const { user, signOut, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (showGoalPage) {
    return <GoalPage onBack={() => setShowGoalPage(false)} />;
  }

  return (
    <ActivityPage 
      onGoalClick={() => setShowGoalPage(true)}
      onSignOut={signOut}
    />
  );
}

export default App;
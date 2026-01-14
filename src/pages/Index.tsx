import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSetupComplete, getNightState } from '@/lib/storage';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check where to redirect
    const nightState = getNightState();
    
    if (!isSetupComplete()) {
      navigate('/setup');
    } else if (nightState.prepStartedAt) {
      // If prep was started, go to prep flow
      navigate('/prep');
    } else {
      navigate('/home');
    }
  }, [navigate]);

  // Loading state while redirecting
  return (
    <div className="min-h-screen bg-night-sky flex items-center justify-center">
      <div className="w-2 h-2 bg-foreground-dim rounded-full animate-slow-pulse" />
    </div>
  );
};

export default Index;

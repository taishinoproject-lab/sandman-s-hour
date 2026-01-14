import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarField } from '@/components/StarField';
import { 
  getPrepTasks, 
  getNightState,
} from '@/lib/storage';
import { 
  calculatePrepMinutes,
  calculatePrepEndTime,
  isPrepComplete,
} from '@/lib/sleepCalculations';
import { Moon } from 'lucide-react';

export default function PrepFlow() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [scrollOffset, setScrollOffset] = useState(0);
  
  const tasks = getPrepTasks().filter(t => t.enabled);
  const prepMinutes = calculatePrepMinutes(tasks);
  const nightState = getNightState();
  
  const isComplete = useMemo(() => {
    return isPrepComplete(nightState, prepMinutes);
  }, [nightState, prepMinutes, now]);

  // Check if prep was not started, redirect back
  useEffect(() => {
    if (!nightState.prepStartedAt) {
      navigate('/night');
    }
  }, [nightState, navigate]);

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Very slow auto-scroll effect for task list
  useEffect(() => {
    if (isComplete) return;
    
    const interval = setInterval(() => {
      setScrollOffset(prev => (prev + 0.5) % (tasks.length * 40));
    }, 100);
    return () => clearInterval(interval);
  }, [tasks.length, isComplete]);

  const message = isComplete 
    ? 'おやすみ' 
    : '準備をして、寝るだけ。';

  return (
    <div className="min-h-screen bg-night-sky relative overflow-hidden">
      <StarField count={20} className="opacity-50" />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-10 max-w-md mx-auto">
        {/* Moon icon */}
        <Moon 
          className={`w-8 h-8 text-foreground-dim mb-8 ${isComplete ? 'animate-gentle-float' : ''}`} 
        />
        
        {/* Message */}
        <h1 className="text-xl font-serif text-foreground-muted text-center mb-12 animate-slow-pulse">
          {message}
        </h1>

        {/* Task List - non-interactive, slowly scrolling */}
        {!isComplete && (
          <div className="w-full max-w-xs overflow-hidden h-48 relative">
            <div 
              className="space-y-3 transition-transform duration-100 ease-linear"
              style={{ transform: `translateY(-${scrollOffset}px)` }}
            >
              {[...tasks, ...tasks].map((task, index) => (
                <div 
                  key={`${task.id}-${index}`}
                  className="flex items-center justify-between text-sm text-foreground-dim/60 px-4 py-2"
                >
                  <span>{task.name}</span>
                  <span>{task.minutes}分</span>
                </div>
              ))}
            </div>
            
            {/* Gradient overlays */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </div>
        )}

        {/* Goodnight message decoration */}
        {isComplete && (
          <div className="flex gap-2 mt-4">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className="w-1 h-1 rounded-full bg-foreground-dim animate-twinkle"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarField } from '@/components/StarField';
import { Hourglass } from '@/components/Hourglass';
import { Button } from '@/components/ui/button';
import { 
  getSettings, 
  getPrepTasks,
  isSetupComplete,
} from '@/lib/storage';
import { 
  calculatePrepMinutes,
  calculateNightModeStart,
  calculateIdealBedTime,
  isNightModeTime,
  timeToMinutes,
  formatTimeDiff,
} from '@/lib/sleepCalculations';
import { Settings, Moon, Clock } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  const settings = getSettings();
  const tasks = getPrepTasks();
  const prepMinutes = calculatePrepMinutes(tasks);
  const nightModeStart = calculateNightModeStart(settings.wakeTime, settings.targetSleepMin, prepMinutes);
  const idealBedTime = calculateIdealBedTime(settings.wakeTime, settings.targetSleepMin);

  // Check if setup is complete
  useEffect(() => {
    if (!isSetupComplete()) {
      navigate('/setup');
    }
  }, [navigate]);

  // Update time every minute and check for night mode
  useEffect(() => {
    const checkTime = () => {
      const currentTime = new Date();
      setNow(currentTime);
      
      if (isNightModeTime(currentTime, nightModeStart)) {
        navigate('/night');
      }
    };

    checkTime(); // Check immediately
    const interval = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [nightModeStart, navigate]);

  // Calculate time until night mode
  const timeUntilNightMode = useMemo(() => {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const nightMinutes = timeToMinutes(nightModeStart);
    
    let diff = nightMinutes - nowMinutes;
    if (diff < 0) diff += 24 * 60;
    
    return diff;
  }, [now, nightModeStart]);

  const sleepHours = settings.targetSleepMin / 60;

  return (
    <div className="min-h-screen bg-night-sky relative overflow-hidden">
      <StarField count={25} className="opacity-70" />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center px-6 py-10 max-w-md mx-auto">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-10">
          <div>
            <h1 className="text-lg font-serif text-foreground">Sandglass Night</h1>
          </div>
          <Button 
            variant="night-ghost" 
            size="icon"
            onClick={() => navigate('/setup')}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Current Time */}
        <div className="text-center mb-8 animate-fade-in-up">
          <p className="text-foreground-dim text-sm mb-1">現在</p>
          <p className="text-4xl font-serif text-foreground">
            {now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Hourglass - empty state */}
        <div className="flex-1 flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="opacity-40">
            <Hourglass 
              lostMinutes={0} 
              maxMinutes={settings.targetSleepMin}
              size="md"
            />
          </div>
        </div>

        {/* Night Mode Info */}
        <div className="w-full space-y-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-card/50 rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-3 mb-3">
              <Moon className="w-5 h-5 text-accent" />
              <span className="text-foreground">夜モード開始まで</span>
            </div>
            <p className="text-2xl font-serif text-accent">
              {formatTimeDiff(timeUntilNightMode)}
            </p>
            <p className="text-foreground-dim text-sm mt-1">
              {nightModeStart} に準備開始
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 bg-secondary/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-foreground-dim text-xs mb-1">
                <Clock className="w-3 h-3" />
                起床
              </div>
              <p className="text-foreground">{settings.wakeTime}</p>
            </div>
            <div className="flex-1 bg-secondary/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-foreground-dim text-xs mb-1">
                <Moon className="w-3 h-3" />
                目標
              </div>
              <p className="text-foreground">{sleepHours}時間</p>
            </div>
            <div className="flex-1 bg-secondary/30 rounded-lg p-3">
              <div className="text-foreground-dim text-xs mb-1">理想就寝</div>
              <p className="text-foreground">{idealBedTime}</p>
            </div>
          </div>
        </div>

        {/* Dev: Manual Night Mode Trigger */}
        <Button 
          variant="dimmed" 
          size="sm"
          onClick={() => navigate('/night')}
          className="opacity-50 hover:opacity-100"
        >
          夜モードを確認
        </Button>
      </div>
    </div>
  );
}

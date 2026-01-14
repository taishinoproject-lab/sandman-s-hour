import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarField } from '@/components/StarField';
import { Hourglass } from '@/components/Hourglass';
import { Button } from '@/components/ui/button';
import { 
  getSettings, 
  getPrepTasks, 
  getNightState,
  saveNightState,
} from '@/lib/storage';
import { 
  calculatePrepMinutes,
  calculateIdealBedTime,
  calculateLostSleepMinutes,
  calculateActualSleepTime,
  formatTimeDiff,
} from '@/lib/sleepCalculations';
import { Bed, Clock, Moon, Timer } from 'lucide-react';

export default function Night() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  
  const settings = getSettings();
  const tasks = getPrepTasks();
  const prepMinutes = calculatePrepMinutes(tasks);
  const idealBedTime = calculateIdealBedTime(settings.wakeTime, settings.targetSleepMin);
  
  const lostSleepMinutes = useMemo(() => {
    return calculateLostSleepMinutes(now, idealBedTime, prepMinutes);
  }, [now, idealBedTime, prepMinutes]);
  
  const actualSleepTime = useMemo(() => {
    return calculateActualSleepTime(now, prepMinutes);
  }, [now, prepMinutes]);

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleStartPrep = () => {
    const state = getNightState();
    saveNightState({
      ...state,
      prepStartedAt: new Date().toISOString(),
    });
    navigate('/prep');
  };

  const sleepHours = settings.targetSleepMin / 60;
  const hasLostSleep = lostSleepMinutes > 0;

  return (
    <div className="min-h-screen bg-night-sky relative overflow-hidden">
      <StarField count={40} />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center px-6 py-10 max-w-md mx-auto">
        {/* Main Message */}
        <div className="text-center mt-8 mb-6 animate-fade-in-up">
          <h1 className="text-2xl font-serif text-foreground mb-2 leading-relaxed">
            今、寝る準備を
            <br />
            始める時間
          </h1>
        </div>

        {/* Hourglass */}
        <div className="flex-1 flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative">
            <Hourglass 
              lostMinutes={lostSleepMinutes} 
              maxMinutes={settings.targetSleepMin}
              size="lg"
            />
            {hasLostSleep && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center">
                <span className="text-warning/80 text-sm">
                  -{formatTimeDiff(lostSleepMinutes)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="w-full space-y-3 mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between text-sm text-foreground-muted">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              起床
            </span>
            <span className="text-foreground">{settings.wakeTime}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-foreground-muted">
            <span className="flex items-center gap-2">
              <Moon className="w-4 h-4" />
              目標睡眠
            </span>
            <span className="text-foreground">{sleepHours}時間</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-foreground-muted">
            <span className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              準備時間
            </span>
            <span className="text-foreground">{formatTimeDiff(prepMinutes)}</span>
          </div>

          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground-muted">今始めると寝られる時刻</span>
              <span className={hasLostSleep ? 'text-warning' : 'text-success'}>
                {actualSleepTime}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Button 
            variant="night" 
            size="xl" 
            className="w-full"
            onClick={handleStartPrep}
          >
            <Bed className="w-5 h-5 mr-2" />
            寝る準備を始める
          </Button>
        </div>
      </div>
    </div>
  );
}

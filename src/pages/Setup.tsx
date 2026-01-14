import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarField } from '@/components/StarField';
import { Button } from '@/components/ui/button';
import { 
  getSettings, 
  saveSettings, 
  getPrepTasks, 
  savePrepTasks,
  getBathMode,
  updateBathMode,
  setSetupComplete,
  type Settings,
  type PrepTask,
  type BathMode 
} from '@/lib/storage';
import { calculatePrepMinutes, formatTimeDiff } from '@/lib/sleepCalculations';
import { Moon, Clock, Droplets, ShowerHead, Check } from 'lucide-react';

export default function Setup() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>(getSettings);
  const [tasks, setTasks] = useState<PrepTask[]>(getPrepTasks);
  const [bathMode, setBathMode] = useState<BathMode>(getBathMode);

  const totalPrepMinutes = calculatePrepMinutes(tasks);

  const handleWakeTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSettings = { ...settings, wakeTime: e.target.value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleSleepHoursChange = (hours: number) => {
    const newSettings = { ...settings, targetSleepMin: hours * 60 };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleBathModeChange = (mode: BathMode) => {
    setBathMode(mode);
    updateBathMode(mode);
    // Reload tasks to reflect the change
    setTasks(getPrepTasks());
  };

  const handleTaskToggle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task?.group === 'bath') return; // Bath tasks are controlled by bath mode
    
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, enabled: !t.enabled } : t
    );
    setTasks(updatedTasks);
    savePrepTasks(updatedTasks);
  };

  const handleComplete = () => {
    setSetupComplete(true);
    navigate('/');
  };

  const sleepHours = settings.targetSleepMin / 60;

  return (
    <div className="min-h-screen bg-night-sky relative overflow-hidden">
      <StarField count={30} />
      
      <div className="relative z-10 min-h-screen flex flex-col px-6 py-10 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <Moon className="w-10 h-10 text-accent mx-auto mb-4 animate-gentle-float" />
          <h1 className="text-3xl font-serif text-foreground mb-2">Sandglass Night</h1>
          <p className="text-foreground-muted text-sm">あなたの夜を静かに守る</p>
        </div>

        {/* Wake Time */}
        <section className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <label className="flex items-center gap-2 text-foreground-muted text-sm mb-3">
            <Clock className="w-4 h-4" />
            起床時刻
          </label>
          <input
            type="time"
            value={settings.wakeTime}
            onChange={handleWakeTimeChange}
            className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground text-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </section>

        {/* Sleep Hours */}
        <section className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <label className="flex items-center gap-2 text-foreground-muted text-sm mb-3">
            <Moon className="w-4 h-4" />
            目標睡眠時間
          </label>
          <div className="flex gap-2">
            {[6, 7, 8, 9].map(hours => (
              <button
                key={hours}
                onClick={() => handleSleepHoursChange(hours)}
                className={`flex-1 py-3 rounded-lg text-sm transition-all ${
                  sleepHours === hours
                    ? 'bg-accent/20 text-accent border border-accent/30'
                    : 'bg-secondary/30 text-foreground-muted border border-transparent hover:bg-secondary/50'
                }`}
              >
                {hours}時間
              </button>
            ))}
          </div>
        </section>

        {/* Bath Mode */}
        <section className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <label className="flex items-center gap-2 text-foreground-muted text-sm mb-3">
            <Droplets className="w-4 h-4" />
            入浴スタイル
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => handleBathModeChange('shower')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm transition-all ${
                bathMode === 'shower'
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'bg-secondary/30 text-foreground-muted border border-transparent hover:bg-secondary/50'
              }`}
            >
              <ShowerHead className="w-4 h-4" />
              シャワー 10分
            </button>
            <button
              onClick={() => handleBathModeChange('bath')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm transition-all ${
                bathMode === 'bath'
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'bg-secondary/30 text-foreground-muted border border-transparent hover:bg-secondary/50'
              }`}
            >
              <Droplets className="w-4 h-4" />
              お風呂 30分
            </button>
          </div>
        </section>

        {/* Prep Tasks */}
        <section className="mb-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex justify-between items-center mb-3">
            <label className="text-foreground-muted text-sm">準備タスク</label>
            <span className="text-foreground-dim text-xs">
              合計 {formatTimeDiff(totalPrepMinutes)}
            </span>
          </div>
          <div className="space-y-2">
            {tasks.filter(t => t.group !== 'bath').map(task => (
              <button
                key={task.id}
                onClick={() => handleTaskToggle(task.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all ${
                  task.enabled
                    ? 'bg-secondary/50 text-foreground'
                    : 'bg-secondary/20 text-foreground-dim'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    task.enabled 
                      ? 'bg-accent/20 border-accent/50 text-accent' 
                      : 'border-border'
                  }`}>
                    {task.enabled && <Check className="w-3 h-3" />}
                  </span>
                  {task.name}
                </span>
                <span className="text-foreground-dim">{task.minutes}分</span>
              </button>
            ))}
          </div>
        </section>

        {/* Complete Button */}
        <div className="mt-auto animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <Button 
            variant="night" 
            size="xl" 
            className="w-full"
            onClick={handleComplete}
          >
            始める
          </Button>
        </div>
      </div>
    </div>
  );
}

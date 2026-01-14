export interface PrepTask {
  id: string;
  name: string;
  minutes: number;
  enabled: boolean;
  group?: 'bath'; // For mutually exclusive tasks
}

export interface Settings {
  wakeTime: string; // "HH:MM" format
  targetSleepMin: number; // in minutes
}

export interface NightState {
  prepStartedAt?: string; // ISO date string
  lastShownDate?: string; // YYYY-MM-DD
}

export type BathMode = 'shower' | 'bath';

const STORAGE_KEYS = {
  SETTINGS: 'sandglass_settings',
  PREP_TASKS: 'sandglass_prep_tasks',
  BATH_MODE: 'sandglass_bath_mode',
  NIGHT_STATE: 'sandglass_night_state',
  SETUP_COMPLETE: 'sandglass_setup_complete',
} as const;

// Default values
export const DEFAULT_SETTINGS: Settings = {
  wakeTime: '07:00',
  targetSleepMin: 480, // 8 hours
};

export const DEFAULT_PREP_TASKS: PrepTask[] = [
  { id: 'shower', name: 'シャワー', minutes: 10, enabled: true, group: 'bath' },
  { id: 'bath', name: 'お風呂', minutes: 30, enabled: false, group: 'bath' },
  { id: 'skincare', name: 'スキンケア', minutes: 10, enabled: true },
  { id: 'teeth', name: '歯磨き', minutes: 5, enabled: true },
  { id: 'rice', name: '米を研ぐ', minutes: 5, enabled: true },
  { id: 'bag', name: 'カバンの準備', minutes: 5, enabled: true },
  { id: 'futon', name: '布団を敷く', minutes: 3, enabled: true },
  { id: 'duolingo', name: 'Duolingo', minutes: 5, enabled: true },
];

export const DEFAULT_BATH_MODE: BathMode = 'shower';

export const DEFAULT_NIGHT_STATE: NightState = {};

// Storage functions
export function getSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function getPrepTasks(): PrepTask[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREP_TASKS);
    return stored ? JSON.parse(stored) : DEFAULT_PREP_TASKS;
  } catch {
    return DEFAULT_PREP_TASKS;
  }
}

export function savePrepTasks(tasks: PrepTask[]): void {
  localStorage.setItem(STORAGE_KEYS.PREP_TASKS, JSON.stringify(tasks));
}

export function getBathMode(): BathMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BATH_MODE);
    return stored ? JSON.parse(stored) : DEFAULT_BATH_MODE;
  } catch {
    return DEFAULT_BATH_MODE;
  }
}

export function saveBathMode(mode: BathMode): void {
  localStorage.setItem(STORAGE_KEYS.BATH_MODE, JSON.stringify(mode));
}

export function getNightState(): NightState {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.NIGHT_STATE);
    return stored ? JSON.parse(stored) : DEFAULT_NIGHT_STATE;
  } catch {
    return DEFAULT_NIGHT_STATE;
  }
}

export function saveNightState(state: NightState): void {
  localStorage.setItem(STORAGE_KEYS.NIGHT_STATE, JSON.stringify(state));
}

export function isSetupComplete(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETUP_COMPLETE);
    return stored === 'true';
  } catch {
    return false;
  }
}

export function setSetupComplete(complete: boolean): void {
  localStorage.setItem(STORAGE_KEYS.SETUP_COMPLETE, complete.toString());
}

export function clearNightState(): void {
  saveNightState({});
}

// Update bath mode and toggle task enablement
export function updateBathMode(mode: BathMode): void {
  saveBathMode(mode);
  const tasks = getPrepTasks();
  const updatedTasks = tasks.map(task => {
    if (task.group === 'bath') {
      return { ...task, enabled: task.id === mode };
    }
    return task;
  });
  savePrepTasks(updatedTasks);
}

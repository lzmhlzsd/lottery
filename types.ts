
export interface Participant {
  id: string;
  name: string;
  studentId?: string;
  group?: string;
}

export interface Round {
  id: string;
  name: string;
  winnerCount: number;
  isEnabled: boolean;
  winners: Participant[];
  presetWinnerIds?: string[]; // 预设中奖者ID列表（可选，通过 studentId 或 id 匹配）
}

export interface AppState {
  participants: Participant[];
  rounds: Round[];
  currentRoundId: string | null;
  history: Round[];
  isDark: boolean;
}

export type ThemeType = 'dark' | 'light';

export interface SoundConfig {
  volume: number;
  isBgmEnabled: boolean;
  isSfxEnabled: boolean;
}

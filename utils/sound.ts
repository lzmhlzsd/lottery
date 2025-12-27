// 导入音频文件，让 Vite 能够正确打包
import rollMp3 from '../assets/roll.mp3';

class SoundManager {
  private bgm: HTMLAudioElement | null = null;
  private rollingBgm: HTMLAudioElement | null = null;
  private sounds: Record<string, HTMLAudioElement> = {};
  private config = { volume: 0.5, bgm: true, sfx: true };

  constructor() {
    // 预载音效
    this.sounds = {
      click: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
      // roll: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
      roll: new Audio(rollMp3),
      win: new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'),
    };
    
    // 普通背景音乐
    this.bgm = new Audio('https://assets.mixkit.co/active_storage/sfx/123/123-preview.mp3');
    if (this.bgm) this.bgm.loop = true;

    // 抽奖进行中的悬念音乐 (更换为节奏感更强的 Drum Beat)
    this.rollingBgm = new Audio(rollMp3);
    if (this.rollingBgm) {
      this.rollingBgm.loop = true;
    }
  }

  updateConfig(volume: number, bgm: boolean, sfx: boolean) {
    this.config = { volume, bgm, sfx };
    Object.values(this.sounds).forEach(s => s.volume = volume);
    
    if (this.bgm) {
      this.bgm.volume = volume * 0.4;
      if (bgm) this.bgm.play().catch(() => {});
      else this.bgm.pause();
    }

    if (this.rollingBgm) {
      this.rollingBgm.volume = volume * 0.9; // 增强节奏音乐音量
    }
  }

  playSfx(name: string) {
    if (!this.config.sfx) return;
    const sound = this.sounds[name];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
  }

  startRollingMusic() {
    if (!this.config.sfx || !this.rollingBgm) return;
    this.rollingBgm.currentTime = 0;
    this.rollingBgm.play().catch(() => {});
  }

  stopRollingMusic() {
    if (this.rollingBgm) {
      this.rollingBgm.pause();
      this.rollingBgm.currentTime = 0;
    }
  }

  startBgm() {
    if (this.config.bgm && this.bgm) {
      this.bgm.play().catch(() => {});
    }
  }

  stopBgm() {
    if (this.bgm) this.bgm.pause();
  }
}

export const soundManager = new SoundManager();

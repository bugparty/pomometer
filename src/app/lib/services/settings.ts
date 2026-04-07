import { getDb } from '../database';
import type { UserSettings, SyncOperation } from '../../types/api';

// Settings相关操作
export class SettingsService {
  // 获取用户设置
  async getUserSettings(userId: string): Promise<UserSettings> {
    const db = await getDb();

    const settings = await db.userSettings.findUnique({
      where: { userId }
    });

    if (!settings) {
      // 返回默认设置
      return {
        pomodoro_duration: 1500,
        short_break_duration: 300,
        long_break_duration: 1500,
        ticking_sound_enabled: true,
        rest_ticking_sound_enabled: false,
        language: 'en-US'
      };
    }

    return {
      pomodoro_duration: settings.pomodoroDuration,
      short_break_duration: settings.shortBreakDuration,
      long_break_duration: settings.longBreakDuration,
      ticking_sound_enabled: settings.tickingSoundEnabled,
      rest_ticking_sound_enabled: settings.restTickingSoundEnabled,
      language: settings.language
    };
  }

  // 更新用户设置
  async updateUserSettings(userId: string, settingsData: UserSettings): Promise<UserSettings> {
    const db = await getDb();

    await db.userSettings.upsert({
      where: { userId },
      update: {
        pomodoroDuration: settingsData.pomodoro_duration,
        shortBreakDuration: settingsData.short_break_duration,
        longBreakDuration: settingsData.long_break_duration,
        tickingSoundEnabled: settingsData.ticking_sound_enabled,
        restTickingSoundEnabled: settingsData.rest_ticking_sound_enabled,
        language: settingsData.language,
        updatedAt: new Date()
      },
      create: {
        userId,
        pomodoroDuration: settingsData.pomodoro_duration,
        shortBreakDuration: settingsData.short_break_duration,
        longBreakDuration: settingsData.long_break_duration,
        tickingSoundEnabled: settingsData.ticking_sound_enabled,
        restTickingSoundEnabled: settingsData.rest_ticking_sound_enabled,
        language: settingsData.language
      }
    });

    return await this.getUserSettings(userId);
  }

  // 根据操作类型更新设置
  async applySettingsOperation(userId: string, operation: SyncOperation): Promise<UserSettings> {
    const { type, payload } = operation;
    const currentSettings = await this.getUserSettings(userId);

    switch (type) {
      case 'UPDATE_POMODORO_DURATION':
        currentSettings.pomodoro_duration = (payload as { value: number }).value;
        break;
      case 'UPDATE_SHORT_BREAK_DURATION':
        currentSettings.short_break_duration = (payload as { value: number }).value;
        break;
      case 'UPDATE_LONG_BREAK_DURATION':
        currentSettings.long_break_duration = (payload as { value: number }).value;
        break;
      case 'UPDATE_TICKING_SOUND':
        currentSettings.ticking_sound_enabled = (payload as { value: boolean }).value;
        break;
      case 'UPDATE_REST_TICKING_SOUND':
        currentSettings.rest_ticking_sound_enabled = (payload as { value: boolean }).value;
        break;
      case 'UPDATE_LANGUAGE':
        currentSettings.language = (payload as { value: string }).value;
        break;
      default:
        throw new Error(`Unknown settings operation type: ${type}`);
    }

    return await this.updateUserSettings(userId, currentSettings);
  }
}


import React from 'react';
import { message } from 'antd';
import { createIntl, createIntlCache, IntlShape } from 'react-intl';

// Alias for react-intl message values type
export type ToastMessageValues = Parameters<IntlShape['formatMessage']>[1];
import en_US from '../../locales/en-US';
import zh_CN from '../../locales/zh-CN';
import de_DE from '../../locales/de-DE';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastOptions {
  duration?: number;
  onClose?: () => void;
  className?: string;
}

// i18n setup for non-React components
const cache = createIntlCache();

function getMessages() {
  if (typeof navigator === 'undefined') return en_US.messages;

  switch (navigator.language.split("-")[0]) {
    case "en":
      return en_US.messages;
    case "zh":
      return zh_CN.messages;
    case "de":
      return de_DE.messages;
    default:
      return en_US.messages;
  }
}

function getLocale() {
  if (typeof navigator === 'undefined') return 'en';
  return navigator.language;
}

function createIntlInstance(): IntlShape {
  return createIntl({
    locale: getLocale(),
    defaultLocale: 'en',
    messages: getMessages(),
  }, cache);
}

class ToastManager {
  private static instance: ToastManager;
  private intl: IntlShape;
  // (no static placeholders needed)

  private formatToString(messageId: string, values?: ToastMessageValues): string {
    const result = this.intl.formatMessage({ id: messageId }, values);
    return Array.isArray(result) ? result.join('') : String(result);
  }

  private constructor() {
    this.intl = createIntlInstance();
  }

  public static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  /**
   * 获取默认显示时间
   * 开发环境：3分钟（180秒）
   * 生产环境：3-4秒
   */
  private getDefaultDuration(): number {
    if (process.env.NODE_ENV === 'development') {
      return 180; // 开发环境：3分钟
    }
    return 3; // 生产环境：3秒
  }

  /**
   * 获取自定义样式类名
   */
  private getCustomClassName(type: ToastType, customClassName?: string): string {
    const baseClass = 'custom-toast';
    const typeClass = `custom-toast-${type}`;
    const additionalClass = customClassName ? ` ${customClassName}` : '';
    return `${baseClass} ${typeClass}${additionalClass}`;
  }

  /**
   * 显示成功消息
   */
  public success(content: string, options?: ToastOptions): void {
    const duration = options?.duration || this.getDefaultDuration();
    const className = this.getCustomClassName('success', options?.className);
    message.success({
      content,
      duration,
      onClose: options?.onClose,
      className,
    });
  }

  /**
   * 显示带有i18n翻译的成功消息
   */
  public successIntl(
    messageId: string,
    values?: ToastMessageValues,
    options?: ToastOptions
  ): void {
    const content = this.formatToString(messageId, values);
    this.success(content, options);
  }

  /**
   * 显示错误消息
   */
  public error(content: string, options?: ToastOptions): void {
    const duration = options?.duration || this.getDefaultDuration();
    const className = this.getCustomClassName('error', options?.className);
    message.error({
      content,
      duration,
      onClose: options?.onClose,
      className,
    });
  }

  /**
   * 显示带有i18n翻译的错误消息
   */
  public errorIntl(messageId: string, values?: ToastMessageValues, options?: ToastOptions): void {
    const content = this.formatToString(messageId, values);
    this.error(content, options);
  }

  /**
   * 显示警告消息
   */
  public warning(content: string, options?: ToastOptions): void {
    const duration = options?.duration || this.getDefaultDuration();
    const className = this.getCustomClassName('warning', options?.className);
    message.warning({
      content,
      duration,
      onClose: options?.onClose,
      className,
    });
  }

  /**
   * 显示带有i18n翻译的警告消息
   */
  public warningIntl(messageId: string, values?: ToastMessageValues, options?: ToastOptions): void {
    const content = this.formatToString(messageId, values);
    this.warning(content, options);
  }

  /**
   * 显示信息消息
   */
  public info(content: string, options?: ToastOptions): void {
    const duration = options?.duration || this.getDefaultDuration();
    const className = this.getCustomClassName('info', options?.className);
    message.info({
      content,
      duration,
      onClose: options?.onClose,
      className,
    });
  }

  /**
   * 显示带有i18n翻译的信息消息
   */
  public infoIntl(messageId: string, values?: ToastMessageValues, options?: ToastOptions): void {
    const content = this.formatToString(messageId, values);
    this.info(content, options);
  }

  /**
   * 显示加载消息
   */
  public loading(content: string, options?: ToastOptions): void {
    const duration = options?.duration || 0;
    const className = this.getCustomClassName('loading', options?.className);
    message.loading({
      content,
      duration,
      onClose: options?.onClose,
      className,
    });
  }

  /**
   * 显示带有i18n翻译的加载消息
   */
  public loadingIntl(messageId: string, values?: ToastMessageValues, options?: ToastOptions): void {
    const content = this.formatToString(messageId, values);
    this.loading(content, options);
  }



  /**
   * 清除所有消息
   */
  public destroy(): void {
    message.destroy();
  }

  /**
   * 显示谷歌登录相关消息
   */
  public showGoogleLoginMessage(type: 'success' | 'error', content: string): void {
    if (type === 'success') {
      this.success(content, { duration: 3 }); // 登录成功消息保持3秒
    } else {
      this.error(content, { duration: 4 }); // 登录错误消息保持4秒
    }
  }

  /**
   * 显示同步状态消息
   */
  public showSyncMessage(type: 'success' | 'error' | 'warning', content: string): void {
    switch (type) {
      case 'success':
        this.success(content, { duration: 2 });
        break;
      case 'error':
        this.error(content, { duration: 4 });
        break;
      case 'warning':
        this.warning(content, { duration: 3 });
        break;
    }
  }
}

export const toastManager = ToastManager.getInstance();
export default ToastManager;

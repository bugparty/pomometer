import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { clearError } from '../auth/authSlice';
import { toastManager } from './ToastManager';
import './Toast.css';

/**
 * Survives React Strict Mode remount (refs reset). Avoid duplicate toasts when the same
 * auth error or the same logged-in user triggers effects twice.
 */
let lastAuthErrorToastKey: string | null = null;
let lastLoginSuccessUserId: string | null = null;

/** Same-tab session: full reload resets JS module vars but keeps sessionStorage — skip "login success" on refresh. */
const LOGIN_SUCCESS_TOAST_SESSION_KEY = 'pomometer_login_success_toast_uid';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ToastProps {
  // 可以添加自定义配置
}

const Toast: React.FC<ToastProps> = () => {
  const dispatch = useDispatch();
  const { error, isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!error) {
      lastAuthErrorToastKey = null;
      return;
    }

    if (lastAuthErrorToastKey !== error) {
      lastAuthErrorToastKey = error;
      toastManager.error(error);
    }

    const timer = setTimeout(() => {
      dispatch(clearError());
      lastAuthErrorToastKey = null;
    }, 180000);

    return () => clearTimeout(timer);
  }, [error, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (typeof window !== 'undefined') {
        const alreadyToastedThisTab =
          sessionStorage.getItem(LOGIN_SUCCESS_TOAST_SESSION_KEY) === user.id;
        if (alreadyToastedThisTab) {
          lastLoginSuccessUserId = user.id;
          return;
        }
      }
      if (lastLoginSuccessUserId !== user.id) {
        lastLoginSuccessUserId = user.id;
        sessionStorage.setItem(LOGIN_SUCCESS_TOAST_SESSION_KEY, user.id);
        toastManager.successIntl('toast.login.success', undefined, { dismissOnClick: true });
      }
    } else if (!isAuthenticated) {
      lastLoginSuccessUserId = null;
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(LOGIN_SUCCESS_TOAST_SESSION_KEY);
      }
    }
  }, [isAuthenticated, user]);

  return null;
};

export default Toast;

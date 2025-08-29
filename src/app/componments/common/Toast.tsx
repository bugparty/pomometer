import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../rootReducer';
import { clearError } from '../auth/authSlice';
import { toastManager } from './ToastManager';
import './Toast.css';
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ToastProps {
  // 可以添加自定义配置
}

const Toast: React.FC<ToastProps> = () => {
  const dispatch = useDispatch();
  const { error, isLoading, isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (error) {
      // 显示错误 toast
      toastManager.error(error);
      
      // 自动清除错误状态（延迟 3 分钟，方便调试）
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 180000); // 3分钟 = 180秒 = 180000毫秒

      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // 使用 ref 来跟踪登录成功状态，避免重复显示
  const loginSuccessShownRef = React.useRef(false);

  // 监听登录状态变化，显示成功消息
  useEffect(() => {
    if (isAuthenticated && user && !loginSuccessShownRef.current) {
      // 显示成功登录消息，并标记已显示
      toastManager.successIntl('toast.login.success');
      loginSuccessShownRef.current = true;
    } else if (!isAuthenticated) {
      // 用户登出时重置状态
      loginSuccessShownRef.current = false;
    }
  }, [isAuthenticated, user]);

  // 这个组件不渲染任何 UI，只负责监听状态变化并显示 toast
  return null;
};

export default Toast;

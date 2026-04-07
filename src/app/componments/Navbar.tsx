import React from "react";
import  Settings  from "./Settings";
import ModernGoogleLogin from "./auth/ModernGoogleLogin";
import UserProfile from "./auth/UserProfile";
import SyncStatusIndicator from "./todo/SyncStatusIndicator";
import { FormattedMessage } from "react-intl";
import ReactGA from 'react-ga';
import { useSelector } from "react-redux";
import { RootState } from "./store";
import "./navigation/Navigation.css";

interface NavBarState{
  isOpenSettings: boolean
}

// Google Client ID - 从环境变量获取
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"

// 检查 Google Client ID 配置
if (GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com") {
  console.error('🔴 [Auth] Google Client ID is not configured properly. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable.');
  console.error('🔴 [Auth] Current value:', GOOGLE_CLIENT_ID);
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface NavbarProps {
  // 如果没有特定的props，可以留空或添加需要的属性
}

export class Navbar extends React.Component<NavbarProps, NavBarState> {
  constructor(props : NavbarProps) {
    super(props);
    this.state = { isOpenSettings: false };
    this.openSettings = this.openSettings.bind(this);
    this.closeSettingModal = this.closeSettingModal.bind(this);
  }

  openSettings() {
    ReactGA.pageview(window.location.pathname + "settings",undefined, "settings");
    this.setState({ isOpenSettings: true });
  }

  closeSettingModal() {
    this.setState({ isOpenSettings: false });
  }

  render() {
    return (
      <div>
        <nav className="bg-white shadow-sm border-b border-gray-200 px-2 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 左侧标题 - 移动端缩短 */}
            <div className="navbar-item text-base sm:text-lg font-semibold flex-shrink-0">
              <span className="hidden sm:inline">
                <FormattedMessage
                  id="navi.title"
                  defaultMessage="AA Pomodoro Clock"
                />
              </span>
              <span className="sm:hidden">
                <FormattedMessage
                  id="navi.title.short"
                  defaultMessage="AA Pomodoro"
                />
              </span>
            </div>
            
            {/* 右侧内容区域 */}
            <div className="flex items-center space-x-1 sm:space-x-4 flex-shrink-0">
              {/* 同步状态指示器 */}
              <div className="navbar-item hidden sm:block">
                <SyncStatusIndicator />
              </div>
              
              {/* 认证区域 */}
              <AuthSection />
              
              {/* Settings按钮 */}
              <div
                   data-testid="settings-button"
                   className="navbar-item cursor-pointer hover:text-blue-600 transition-colors px-2 py-1 text-sm sm:text-base"
                   onClick={this.openSettings}>
                <FormattedMessage id="navi.settings" defaultMessage="Settings" />
              </div>
            </div>
          </div>
        </nav>
        <Settings
          isOpenSettings={this.state.isOpenSettings}
          closeModal={this.closeSettingModal}
        />
      </div>
    );
  }
}

// 认证区域组件
const AuthSection: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  return (
    <div className="auth-section">
      {isAuthenticated ? (
        <UserProfile />
      ) : (
        <ModernGoogleLogin clientId={GOOGLE_CLIENT_ID} />
      )}
    </div>
  )
}

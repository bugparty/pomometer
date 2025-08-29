import React from "react";
import { FormattedMessage } from "react-intl";
import "./navigation/Navigation.css";
import Link from "next/link";

export const Footer: React.FC = () => {
    return (
      <footer className="footer bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-t border-gray-200 py-3 mt-auto shadow-sm h-[60px] flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* 左侧版权信息 */}
            <div className="flex items-center space-x-2 mb-1 md:mb-0">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <span className="text-gray-700 font-medium text-sm">
                <FormattedMessage
                  id="footer.copyright"
                  defaultMessage="© 2025 AA Pomodoro. All rights reserved."
                />
              </span>
            </div>
            
            {/* 右侧链接和社交信息 */}
            <div className="flex items-center space-x-4">
              <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-xs font-medium">
                <FormattedMessage
                  id="footer.privacyPolicy"
                  defaultMessage="Privacy Policy"
                />
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-xs font-medium"
              >
                <FormattedMessage
                  id="footer.termsOfService"
                  defaultMessage="Terms of Service"
                />
              </Link>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 text-xs">
                  <FormattedMessage
                    id="footer.madeWith"
                    defaultMessage="Made with"
                  />
                </span>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-gray-500 text-xs">
                  <FormattedMessage
                    id="footer.forProductivity"
                    defaultMessage="for productivity"
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
}

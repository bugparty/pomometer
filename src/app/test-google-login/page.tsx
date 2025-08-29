'use client'

import React from 'react';
import ModernGoogleLogin from '../componments/auth/ModernGoogleLogin';
import SimpleGoogleLogin from './SimpleGoogleLogin';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

export default function GoogleLoginTest() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Google Login Test Page</h1>
      <p>Client ID: {GOOGLE_CLIENT_ID}</p>
      <p>Current URL: {typeof window !== 'undefined' ? window.location.origin : 'Unknown'}</p>
      <p>Environment variables loaded:</p>
      <ul>
        <li>NEXT_PUBLIC_GOOGLE_CLIENT_ID: {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? '✓' : '✗'}</li>
        <li>NEXT_PUBLIC_API_BASE_URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'Not set'}</li>
      </ul>
      
      <div style={{ marginTop: '30px', border: '1px solid #4285f4', padding: '20px', borderRadius: '8px' }}>
        <h2>🚀 现代化Google登录</h2>
        <ModernGoogleLogin clientId={GOOGLE_CLIENT_ID} />
      </div>
      
      <SimpleGoogleLogin clientId={GOOGLE_CLIENT_ID} />
      
      <div style={{ marginTop: '20px' }}>
        <h3>测试步骤:</h3>
        <ol>
          <li>打开浏览器开发者工具 (F12)</li>
          <li>转到 Console 标签</li>
          <li><strong>使用现代化登录</strong> - 这应该能正常工作</li>
          <li>如果需要Google Tasks权限，点击绿色按钮</li>
          <li>检查控制台日志了解详细信息</li>
        </ol>
        
        <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
          <h4>💡 提示:</h4>
          <p>现在只使用ModernGoogleLogin组件，使用Google OAuth 2.0实现稳定可靠的登录体验。</p>
        </div>
      </div>
    </div>
  );
}

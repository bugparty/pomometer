'use client'

import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../rootReducer'
import { FormattedMessage } from 'react-intl'
import { toastManager } from '../common/ToastManager'
import './Auth.css'

interface ModernGoogleLoginProps {
  clientId: string
}

const ModernGoogleLogin: React.FC<ModernGoogleLoginProps> = ({ clientId }) => {
  const dispatch = useDispatch()
  const { isLoading, isAuthenticated } = useSelector((state: RootState) => state.auth)

  // Check Client ID configuration
  React.useEffect(() => {
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
      console.error('🔴 [ModernGoogleLogin] Invalid Google Client ID:', clientId);
      console.error('🔴 [ModernGoogleLogin] Please configure NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable');
    } else {
      console.log('✅ [ModernGoogleLogin] Google Client ID configured:', clientId);
    }
  }, [clientId]);

  // OAuth login (for Google Tasks permissions)
  const handleOAuthLogin = () => {
    // Check Client ID
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
      console.error('🔴 [ModernGoogleLogin] Cannot proceed with OAuth login - Google Client ID not configured');
      toastManager.errorIntl('toast.googleLogin.configError');
      return;
    }

    console.log('Attempting OAuth login for Google Tasks...')
    
    // Create the OAuth URL
    const currentOrigin = window.location.origin
    console.log('Current origin:', currentOrigin)
    
    const oauthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    oauthUrl.searchParams.set('client_id', clientId)
    oauthUrl.searchParams.set('redirect_uri', `${currentOrigin}/auth/google/callback`)
    oauthUrl.searchParams.set('response_type', 'code')
    oauthUrl.searchParams.set('scope', 'openid email profile https://www.googleapis.com/auth/tasks')
    oauthUrl.searchParams.set('access_type', 'offline') // Change back to offline
    oauthUrl.searchParams.set('prompt', 'consent') // Re-add prompt
    
    console.log('OAuth parameters:', {
      client_id: clientId,
      redirect_uri: `${currentOrigin}/auth/google/callback`,
      scope: 'openid email profile https://www.googleapis.com/auth/tasks',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    })
    console.log('Complete OAuth URL:', oauthUrl.toString())
    
    window.location.href = oauthUrl.toString()
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="google-login-container">
      <button 
        onClick={handleOAuthLogin}
        className="google-login-button"
        disabled={isLoading}
        style={{
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '12px 24px',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '0 auto',
          fontWeight: 500,
          minWidth: '200px',
          justifyContent: 'center',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#357ae8'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#4285f4'
        }}
      >
        <FormattedMessage
          id="auth.login.signInWithGoogle"
          defaultMessage="Sign in with Google"
        />
      </button>

      {isLoading && (
        <p style={{ textAlign: 'center', margin: '10px 0', fontSize: '14px', color: '#666' }}>
          <FormattedMessage id="auth.login.loading" defaultMessage="Loading..." />
        </p>
      )}
      
      {/* 错误提示现在通过 Toast 组件显示，不再在这里显示 */}
    </div>
  )
}

export default ModernGoogleLogin

'use client'

import React, { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../../componments/store'
import { toastManager } from '../../../componments/common/ToastManager'

interface AuthResponse {
  success: boolean;
  token?: string;
  googleAccessToken?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    picture: string;
  };
  error?: string;
}

/** Survives Strict Mode remount; OAuth codes are single-use — start at most one exchange per code. */
const oauthCodeExchangeStarted = new Set<string>()

export default function GoogleAuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      toastManager.errorIntl('toast.googleLogin.oauthFailed', { error })
      router.push('/')
      return
    }

    if (code) {
      if (oauthCodeExchangeStarted.has(code)) {
        return
      }
      oauthCodeExchangeStarted.add(code)
      console.log('OAuth code received:', code)
      
      // Send the authorization code to the backend for token exchange
      const currentOrigin = window.location.origin
      fetch(`${currentOrigin}/api/auth/google/oauth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code,
          redirectUri: `${currentOrigin}/auth/google/callback`
        }),
      })
      .then(response => response.json())
      .then((data: unknown) => {
        const authResponse = data as AuthResponse
        if (authResponse.success && authResponse.token && authResponse.user) {
          console.log('OAuth login successful, updating Redux store...')
          
          // Manually update localStorage (since this isn't through a Redux action)
          localStorage.setItem('auth_token', authResponse.token)
          if (authResponse.googleAccessToken) {
            localStorage.setItem('google_access_token', authResponse.googleAccessToken)
          }
          
          // Manually dispatch to update Redux store state
          dispatch({
            type: 'auth/googleLogin/fulfilled',
            payload: {
              success: true,
              token: authResponse.token,
              user: authResponse.user,
              googleAccessToken: authResponse.googleAccessToken
            }
          })
          
          console.log('Redux store updated, redirecting to home...')
          // Use router.push instead of window.location.href to maintain the SPA experience
          router.push('/')
        } else {
          console.error('Token exchange failed:', authResponse.error)
          toastManager.errorIntl('toast.googleLogin.processFailed', {
            error: authResponse.error || '未知错误'
          })
          router.push('/')
        }
      })
      .catch(error => {
        console.error('Token exchange request failed:', error)
        toastManager.errorIntl('toast.googleLogin.requestFailed')
        router.push('/')
      })
      .finally(() => {
        oauthCodeExchangeStarted.delete(code)
      })
    } else {
      console.error('No authorization code received')
      router.push('/')
    }
  }, [searchParams, router, dispatch])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>
          <FormattedMessage
            id="auth.callback.title"
            defaultMessage="Processing Google sign-in..."
          />
        </h2>
        <p>
          <FormattedMessage
            id="auth.callback.description"
            defaultMessage="Please wait while we verify your identity."
          />
        </p>
        <div style={{ 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 2s linear infinite',
          margin: '20px auto'
        }}></div>
      </div>
      {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx -- styled-jsx CSS template, not user-visible copy */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

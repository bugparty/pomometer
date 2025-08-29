'use client'

import React, { useEffect } from 'react';

interface SimpleGoogleLoginProps {
  clientId: string;
}

const SimpleGoogleLogin: React.FC<SimpleGoogleLoginProps> = ({ clientId }) => {
  useEffect(() => {
    // 使用 Google Identity Services (更简单，更稳定)
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Identity Services loaded');
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        const buttonElement = document.getElementById('simple-google-signin');
        if (buttonElement) {
          window.google.accounts.id.renderButton(buttonElement, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: 250,
          });
        }
      }
    };
    script.onerror = (error) => {
      console.error('Failed to load Google Identity Services:', error);
    };
    
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [clientId]);

  const handleCredentialResponse = (response: { credential: string }) => {
    console.log('Google Identity Services response:', response);
    if (response.credential) {
      console.log('ID Token received:', response.credential.substring(0, 50) + '...');
      // 这里可以处理token
    }
  };

  const handleGAPILogin = () => {
    console.log('Attempting GAPI OAuth login...');
    
    if (!window.gapi) {
      console.error('GAPI not loaded');
      alert('Google API not loaded. Please reload the page.');
      return;
    }

    if (!window.gapi.auth2) {
      console.error('GAPI auth2 not loaded');
      alert('Google Auth2 not loaded. Please reload the page.');
      return;
    }

    const authInstance = window.gapi.auth2.getAuthInstance();
    if (!authInstance) {
      console.error('No auth instance');
      alert('Google Auth instance not found. Please reload the page.');
      return;
    }

    console.log('Starting sign-in process...');
    // 类型断言，因为我们知道authInstance有signIn方法
    (authInstance as { signIn: (options: { scope: string }) => Promise<{ getAuthResponse: () => unknown }> }).signIn({
      scope: 'openid email profile'  // 只请求基本权限
    }).then((googleUser: { getAuthResponse: () => unknown }) => {
      console.log('Sign-in successful:', googleUser);
      const authResponse = googleUser.getAuthResponse();
      console.log('Auth response:', authResponse);
    }).catch((error: { error: string }) => {
      console.error('GAPI sign-in error:', error);
      alert('Sign-in failed: ' + error.error);
    });
  };

  const loadGAPIAndInit = () => {
    console.log('Loading GAPI...');
    
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      console.log('GAPI loaded');
      if (window.gapi) {
        window.gapi.load('auth2', () => {
          console.log('Auth2 module loaded');
          if (window.gapi?.auth2) {
            window.gapi.auth2.init({
              client_id: clientId,
              scope: 'openid email profile'
            }).then(() => {
              console.log('Auth2 initialized successfully');
              alert('GAPI OAuth ready! You can now try the GAPI login button.');
            }).catch((error: unknown) => {
              console.error('Auth2 init error:', error);
              alert('GAPI OAuth initialization failed: ' + error);
            });
          }
        });
      }
    };
    script.onerror = (error) => {
      console.error('Failed to load GAPI:', error);
      alert('Failed to load Google API');
    };
    
    document.head.appendChild(script);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '10px 0' }}>
      <h3>Simple Google Login Test</h3>
      <p>Client ID: {clientId}</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Option 1: Google Identity Services (Recommended)</h4>
        <div id="simple-google-signin"></div>
        <p><small>This uses Google&apos;s latest sign-in method</small></p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Option 2: GAPI OAuth (For extended permissions)</h4>
        <button onClick={loadGAPIAndInit} style={{ marginRight: '10px' }}>
          1. Initialize GAPI OAuth
        </button>
        <button onClick={handleGAPILogin}>
          2. Sign In with GAPI
        </button>
        <p><small>This is needed for Google Tasks permissions</small></p>
      </div>
    </div>
  );
};

export default SimpleGoogleLogin;

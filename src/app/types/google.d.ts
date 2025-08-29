// Google Identity Services API types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfiguration) => void
          renderButton: (element: HTMLElement, config: GoogleButtonConfiguration) => void
          prompt: () => void
        }
      }
    }
    gapi?: {
      load: (api: string, callback: () => void) => void
      auth2: {
        init: (config: GoogleAuth2Config) => Promise<unknown>
        getAuthInstance: () => unknown
      }
    }
  }
}

interface GoogleIdConfiguration {
  client_id: string
  callback: (response: GoogleCallbackResponse) => void
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
}

interface GoogleCallbackResponse {
  credential: string
  select_by?: string
}

interface GoogleAuth2Config {
  client_id: string
  scope: string
}

interface GoogleButtonConfiguration {
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  logo_alignment?: 'left' | 'center'
  width?: number | string
  locale?: string
}

export {}

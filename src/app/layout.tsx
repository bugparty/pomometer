'use client';
import '@ant-design/v5-patch-for-react-19';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./App.css"; // make App.css global so Tailwind utilities are available for @apply
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import store from "./componments/store";
import * as Sentry from "@sentry/react";
import { initUnifiedSyncIntegration } from "./componments/sync/unifiedSyncIntegration";
import en_US from "./locales/en-US";
import zh_CN from "./locales/zh-CN";
import de_DE from "./locales/de-DE";
import { useEffect, useState } from "react";
import Script from "next/script";
import Head from "next/head";
import { SyncInitializer } from "./componments/sync/SyncInitializer";
import Toast from "./componments/common/Toast";

// Since we're using 'use client', we can't export metadata directly
// Instead, we'll handle meta tags in the component itself

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Initialize Sentry
Sentry.init({
  dsn: "https://a2a8db40e6b34807ad64804b47e1ceed@o157982.ingest.sentry.io/6557759",
  integrations: [],
  tracesSampleRate: 1.0,
});

// intl
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []); // Empty dependency array to ensure it runs only once

  if (!isClient) {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <div>Loading...</div>
        </body>
      </html>
    );
  }

  return (
    <html lang={getLocale()}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="ia0q6RF4khhqOwYJwSBW2PuB99CyzHUM4UVLpIqhjvc" />
        <meta name="description" content="AA Pomodoro is an online Pomodoro timer tool that follows the Pomodoro Technique" />
        <meta name="keywords" content="Pomodoro, online Pomodoro, Pomodoro timer, Pomodoro Technique, Pomodoro app, productivity tool, time management, time management software" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <title>AA Pomodoro, a free online Pomodoro timer based on the Pomodoro Technique</title>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <noscript>
          You need to enable JavaScript to run this app. Introduction to Pomodoro Technique: The Pomodoro Technique is a time management method that was founded in the 1980s by Francesco Cirillo. The method uses a timer to segment a typical 25-minute working time and a short 5-minute break, while those periods are called pomodoros, with 4 pomodoros per break, for a long break of 15-30 minutes.
        </noscript>
        <Provider store={store}>
          <IntlProvider 
            locale={getLocale()}
            defaultLocale="en"
            messages={getMessages()}
          >
            <SyncInitializer />
            {children}
            <Toast />
          </IntlProvider>
        </Provider>
        
        {/* Google Identity Services */}
        <Script 
          src="https://accounts.google.com/gsi/client" 
          strategy="afterInteractive"
          async 
          defer 
        />
        
        {/* Language Content Script */}
        <Script 
          src="/language-content.js" 
          strategy="afterInteractive"
        />
        
        {/* Google Analytics */}
        <Script 
          src="https://www.google-analytics.com/analytics.js" 
          strategy="afterInteractive"
          async 
          defer 
        />
      </body>
    </html>
  );
}

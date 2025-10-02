/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export async function configureStatusBar(isDark: boolean): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const platform = Capacitor.getPlatform();
    
    if (platform === 'android') {
      // webview below status bar
      await StatusBar.setOverlaysWebView({ overlay: false });
      // Match your AppBar color
      await StatusBar.setBackgroundColor({ color: isDark ? '#0B0F1A' : '#FFFFFF' });
    }
    await StatusBar.setStyle({ style: isDark ? Style.Light : Style.Dark });
  } catch (error) {
    // Silently fail if StatusBar is not available
    console.warn('StatusBar configuration failed:', error);
  }
}
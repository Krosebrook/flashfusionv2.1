import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';

export function useMobileOptimizations() {
  useEffect(() => {
    const initMobile = async () => {
      try {
        // Hide splash screen after app loads
        await SplashScreen.hide();

        // Configure status bar
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#1e293b' });

        // Handle keyboard
        Keyboard.addListener('keyboardWillShow', () => {
          document.body.classList.add('keyboard-open');
        });

        Keyboard.addListener('keyboardWillHide', () => {
          document.body.classList.remove('keyboard-open');
        });

        // Handle app state changes
        App.addListener('appStateChange', ({ isActive }) => {
          console.log('App state changed. Is active:', isActive);
        });

        // Handle back button on Android
        App.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            App.exitApp();
          } else {
            window.history.back();
          }
        });

      } catch (error) {
        console.log('Mobile optimizations not available (running in browser)');
      }
    };

    initMobile();

    return () => {
      Keyboard.removeAllListeners();
      App.removeAllListeners();
    };
  }, []);
}

export default useMobileOptimizations;
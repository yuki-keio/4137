import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWAInstall = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // PWAがすでにインストールされているかチェック
        const checkInstalled = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            const isInWebAppiOS = (window.navigator as any).standalone === true;
            setIsInstalled(isStandalone || isInWebAppiOS);
        };

        checkInstalled();

        // beforeinstallpromptイベントをリッスン
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
        };

        // appinstalledイベントをリッスン
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            setIsInstallable(false);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const installPWA = async () => {
        if (!deferredPrompt) return false;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setIsInstallable(false);
                return true;
            }
            return false;
        } catch (error) {
            console.error('PWA installation failed:', error);
            return false;
        }
    };

    const canInstall = isInstallable && !isInstalled && deferredPrompt !== null;

    return {
        canInstall,
        isInstalled,
        installPWA
    };
};

import React from 'react';

interface PWAInstallPromptProps {
    isVisible: boolean;
    onInstall: () => void;
    onCancel: () => void;
    onNeverShow?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
    isVisible,
    onInstall,
    onCancel,
    onNeverShow
}) => {
    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
            <div className="p-6 rounded-xl shadow-2xl text-center border-2 border-cyan-400/50 shadow-cyan-500/20 w-11/12 max-w-md m-4 transition-all duration-300"
                style={{ backgroundColor: 'var(--bg-secondary)' }}>

                <div className="mb-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(to right, var(--ui-gradient-start), var(--ui-gradient-end))' }}>
                        <span className="text-3xl font-bold text-white">📱</span>
                    </div>

                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        4137をインストール
                    </h3>

                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                        ホーム画面にアプリを追加して、いつでも簡単にアクセスできます
                    </p>

                    <div className="flex flex-col space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <div className="flex items-center justify-center space-x-2">
                            <span>⚡</span>
                            <span>高速起動</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                            <span>📶</span>
                            <span>オフライン対応</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                            <span>🎮</span>
                            <span>フルスクリーン体験</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col space-y-3">
                    <div className="flex space-x-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-200 hover:opacity-80"
                            style={{
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-secondary)',
                                backgroundColor: 'transparent'
                            }}
                        >
                            後で
                        </button>

                        <button
                            onClick={onInstall}
                            className="flex-1 px-4 py-2 text-sm font-bold text-white rounded-lg transition-all duration-200 hover:opacity-90"
                            style={{ background: 'linear-gradient(to right, var(--ui-gradient-start), var(--ui-gradient-end))' }}
                        >
                            インストール
                        </button>
                    </div>

                    {onNeverShow && (
                        <button
                            onClick={onNeverShow}
                            className="w-full px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 hover:opacity-60"
                            style={{
                                color: 'var(--text-secondary)',
                                backgroundColor: 'transparent'
                            }}
                        >
                            今後表示しない
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

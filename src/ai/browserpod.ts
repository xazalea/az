
import { AIEnchancer } from './index';

// Dynamic import for BrowserPod from CDN
const loadBrowserPod = async () => {
    // @ts-ignore
    const module = await import(/* @vite-ignore */ "https://rt.browserpod.io/0.9.2/browserpod.js");
    return module.BrowserPod;
};

export class BrowserPodManager {
    private static instance: BrowserPodManager;
    private pod: any = null;
    private terminal: any = null;
    
    // Portals for our services
    public aiClientUrl: string | null = null;
    public deepSeekUrl: string | null = null;
    public qwenUrl: string | null = null;

    public isReady = false;

    public static getInstance(): BrowserPodManager {
        if (!BrowserPodManager.instance) {
            BrowserPodManager.instance = new BrowserPodManager();
        }
        return BrowserPodManager.instance;
    }

    private constructor() {}

    public async initialize(terminalContainer?: HTMLElement) {
        if (this.pod) return;

        // Create Worker for off-thread execution
        const workerUrl = new URL('./worker.ts', import.meta.url);
        const worker = new Worker(workerUrl, { type: 'module' });
        
        worker.onmessage = (e) => {
            const { type, payload } = e.data;
            
            if (type === 'PORTAL') {
                const portal = payload;
                console.log(`[BrowserPod Worker] Portal: ${portal.url} -> :${portal.port}`);
                
                if (portal.port === 3000) this.aiClientUrl = portal.url;
                if (portal.port === 3001) this.deepSeekUrl = portal.url;
                if (portal.port === 3002) this.qwenUrl = portal.url;
                
                AIEnchancer.getInstance().updateProxyUrls({
                    claude: this.aiClientUrl,
                    deepseek: this.deepSeekUrl,
                    qwen: this.qwenUrl
                });
                
                if (this.aiClientUrl && this.deepSeekUrl && this.qwenUrl) {
                    this.isReady = true;
                }
            } else if (type === 'ERROR') {
                console.error("[BrowserPod Worker Error]", payload);
            }
        };

        // Start the worker
        worker.postMessage({ type: 'BOOT', payload: { apiKey: "your-api-key" } });
    }

    // Removed old deployAndStart as it is now in worker

}


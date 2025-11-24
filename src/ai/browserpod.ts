
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

        console.log("[BrowserPod] Initializing in background...");
        
        // Yield to main thread to prevent UI freeze immediately
        await new Promise(r => setTimeout(r, 100));

        try {
            const BrowserPod = await loadBrowserPod();
            
            // Boot the Pod
            console.log("[BrowserPod] Booting WASM VM...");
            this.pod = await BrowserPod.boot({ apiKey: "your-api-key" }); 
            console.log("[BrowserPod] VM Booted.");

            if (terminalContainer) {
                this.terminal = await this.pod.createDefaultTerminal(terminalContainer);
            }

            // Setup Portals listener
            this.pod.onPortal((portal: { url: string, port: number }) => {
                console.log(`[BrowserPod] Portal opened: ${portal.url} -> :${portal.port}`);
                if (portal.port === 3000) this.aiClientUrl = portal.url;
                if (portal.port === 3001) this.deepSeekUrl = portal.url;
                if (portal.port === 3002) this.qwenUrl = portal.url;
                
                // Notify AI Enhancer to update URLs
                AIEnchancer.getInstance().updateProxyUrls({
                    claude: this.aiClientUrl,
                    deepseek: this.deepSeekUrl,
                    qwen: this.qwenUrl
                });
                
                if (this.aiClientUrl && this.deepSeekUrl && this.qwenUrl) {
                    this.isReady = true;
                    console.log("[BrowserPod] All AI Services Ready!");
                }
            });

            // Start the deployment process WITHOUT awaiting the long-running server
            // This prevents blocking the initialization flow if run() waits for exit
            this.deployAndStart().catch(e => console.error("[BrowserPod] Deployment failed:", e));

        } catch (e) {
            console.error("[BrowserPod] Critical Boot Error:", e);
        }
    }

    private async deployAndStart() {
        console.log("[BrowserPod] Deploying AI Proxies...");
        
        // Yield again
        await new Promise(r => setTimeout(r, 100));

        // Optimized single-file server that handles all routes with real functionality
        // This reduces the overhead of running multiple heavy node processes while keeping functionality
        const bootScript = `
        const http = require('http');
        const https = require('https');
        const fs = require('fs');
        const { exec } = require('child_process');
        
        console.log("Starting Unified AI Proxy Server...");

        // Config for real upstream services
        // In a real local deployment, these would be the localhost ports if we ran them.
        // To keep it "Instant" and "Fast", we will implement a lightweight forwarder 
        // that can either use the local code (if installed) or fallback to a direct API call if keys are present.
        
        // Since we can't easily run 'npm install' instantly for the complex submodules,
        // we will use a direct proxy approach where possible, or start the installation in background.
        
        let isInstalling = false;
        let isReady = false;

        // Try to start the real AIClient if dependencies exist
        if (fs.existsSync('/app/ai-client/node_modules')) {
            console.log("Found dependencies, starting AIClient...");
            const child = exec('node src/api-server.js --port 3005', { cwd: '/app/ai-client' });
            child.stdout.on('data', d => console.log('[AIClient]', d.toString()));
            child.stderr.on('data', d => console.error('[AIClient]', d.toString()));
            isReady = true;
        } else {
            console.log("Dependencies missing. Starting background install...");
            // We will accept requests and hold them or proxy them differently while installing
            // But for "Fast", we might need a lighter path.
        }

        const createHandler = (name, targetPort) => (req, res) => {
            // CORS
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', '*');
            
            if (req.method === 'OPTIONS') {
                res.writeHead(204);
                res.end();
                return;
            }

            if (req.url === '/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok', service: name }));
                return;
            }
            
            if (req.url === '/v1/chat/completions' && req.method === 'POST') {
                // Forward to the real local server if ready
                // If not ready, we return a "warming up" message or queue it.
                
                const proxyReq = http.request({
                    hostname: 'localhost',
                    port: 3005, // The internal port where we run the real AIClient
                    path: req.url,
                    method: req.method,
                    headers: req.headers
                }, (proxyRes) => {
                    res.writeHead(proxyRes.statusCode, proxyRes.headers);
                    proxyRes.pipe(res);
                });
                
                proxyReq.on('error', (e) => {
                    // Fallback if server is not up yet
                     res.writeHead(503, { 'Content-Type': 'application/json' });
                     res.end(JSON.stringify({ error: "AI Service Warming Up... Please try again in a moment." }));
                });
                
                req.pipe(proxyReq);
                return;
            }
            
            res.writeHead(404);
            res.end();
        };

        // We expose 3 ports externally via BrowserPod Portals
        // But internally they all proxy to our main logic or specific services.
        // AIClient (3005) handles most providers.

        const server1 = http.createServer(createHandler('AIClient-Claude', 3005));
        server1.listen(3000, () => console.log('AIClient-Claude listening on 3000'));

        const server2 = http.createServer(createHandler('DeepSeek', 3005));
        server2.listen(3001, () => console.log('DeepSeek listening on 3001'));

        const server3 = http.createServer(createHandler('Qwen', 3005));
        server3.listen(3002, () => console.log('Qwen listening on 3002'));
        
        // Trigger background install if needed
        if (!fs.existsSync('/app/ai-client/node_modules') && !isInstalling) {
            isInstalling = true;
            console.log("Starting background npm install...");
            // This takes time, but the UI is responsive. 
            // Users might see "Warming Up" for the first minute.
            const p = exec('npm install --production --no-audit', { cwd: '/app/ai-client' });
            p.stdout.on('data', d => console.log('[npm]', d.toString()));
            p.stderr.on('data', d => console.error('[npm]', d.toString()));
            p.on('exit', (code) => {
                console.log("Install finished with code", code);
                // Start server now
                const child = exec('node src/api-server.js --port 3005', { cwd: '/app/ai-client' });
                child.stdout.on('data', d => console.log('[AIClient]', d.toString()));
                isReady = true;
            });
        }
        `;
        
        await this.pod.createFile("/boot.js", bootScript);
        
        console.log("[BrowserPod] Running boot script...");
        // Do NOT await this, let it run indefinitely
        this.pod.run("node", ["boot.js"], { terminal: this.terminal });
    }
}


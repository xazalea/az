// AI Enhancer using Local AI Proxy (BrowserPod)
// Integrates AIClient-2-API, DeepSeek-Free-API, and Qwen-Free-API via in-browser virtualization

export type AIProvider = 'claude' | 'deepseek' | 'qwen';

export class AIEnchancer {
    private static instance: AIEnchancer;
    
    // Dynamic URLs from BrowserPod Portals
    private proxyUrls: Record<AIProvider, string | null> = {
        claude: null,
        deepseek: null,
        qwen: null
    };

    public static getInstance(): AIEnchancer {
        if (!AIEnchancer.instance) {
            AIEnchancer.instance = new AIEnchancer();
        }
        return AIEnchancer.instance;
    }

    private constructor() {}

    private userPreferences: Record<string, any> = {};
    private currentProvider: AIProvider = 'claude'; // Default

    public setProvider(provider: AIProvider) {
        this.currentProvider = provider;
        console.log(`[AI] Switched provider to ${provider}`);
    }
    
    public updateProxyUrls(urls: { claude: string | null, deepseek: string | null, qwen: string | null }) {
        this.proxyUrls = urls;
        console.log("[AI] Updated Proxy URLs:", urls);
    }

    public async preload() {
        console.log(`[AI] Waiting for BrowserPod to initialize...`);
        // The App component triggers BrowserPodManager.initialize()
    }

    /**
     * STREAMING GENERATION ENGINE
     */
    public async streamGenerate(
        prompt: string, 
        onDelta: (chunk: string) => void,
        contextType: 'coding' | 'creative' | 'general' = 'coding'
    ): Promise<string> {
        
        const systemPrompt = contextType === 'coding' 
            ? `You are an expert AI coding assistant for Azalea.
Language: Azalea (Indentation-based, Python-like structure, UI primitives: box, text, button).
Rules:
1. Output ONLY valid code. No markdown blocks unless explicitly requested.
2. Be extremely concise.
3. Use best practices.
4. If fixing code, return the fixed code directly.`
            : `You are a helpful, concise AI assistant.`;

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
        ];

        // Get current URL
        const baseUrl = this.proxyUrls[this.currentProvider];
        
        if (!baseUrl) {
            console.warn(`[AI] Provider ${this.currentProvider} is not ready yet (BrowserPod starting).`);
            return "// Error: AI System Starting... Please wait.";
        }

        const endpoint = `${baseUrl}/v1/chat/completions`;
        // Models (can be anything for the mock/proxy)
        const model = "default-model"; 

        return this.generateLocalProxy(endpoint, model, messages, onDelta);
    }

    private async generateLocalProxy(endpoint: string, model: string, messages: any[], onDelta: (chunk: string) => void): Promise<string> {
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer sk-dummy"
                },
                body: JSON.stringify({
                    model: model,
                    messages,
                    stream: true
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`AI Proxy Error (${this.currentProvider}): ${response.status} - ${errorText}`);
            }

            return this.processStream(response, onDelta);

        } catch (e) {
            console.error(`AI Generation Error (${this.currentProvider}):`, e);
            return `// Error: AI Proxy Connection Failed. (${e instanceof Error ? e.message : String(e)})`;
        }
    }

    private async processStream(response: Response, onDelta: (chunk: string) => void): Promise<string> {
        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            
            const lines = buffer.split('\n');
            buffer = lines.pop() || ""; 

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed === "data: [DONE]") continue;
                if (trimmed.startsWith("data: ")) {
                    try {
                        const jsonStr = trimmed.slice(6);
                        const json = JSON.parse(jsonStr);
                        
                        // OpenAI format compatible
                        const content = json.choices?.[0]?.delta?.content || "";

                        if (content) {
                            fullText += content;
                            onDelta(content);
                        }
                    } catch (e) {
                        // Ignore partial JSON parse errors
                    }
                }
            }
        }
        return fullText;
    }



    // --- Public Interface ---

    public async enhance(code: string, onUpdate?: (partial: string) => void): Promise<string> {
        let buffer = "";
        return this.streamGenerate(
            `Optimize this Azalea code:\n\n${code}\n\nReturn ONLY the optimized code.`,
            (delta) => {
                buffer += delta;
                if (onUpdate) onUpdate(buffer);
            },
            'coding'
        );
    }

    public async generateFunction(name: string, params: string[], description: string, onUpdate?: (partial: string) => void): Promise<string> {
        let buffer = "";
        return this.streamGenerate(
            `Write a function '${name}' with params (${params.join(', ')}) that ${description}.`,
            (delta) => {
                buffer += delta;
                if (onUpdate) onUpdate(buffer);
            },
            'coding'
        );
    }

    public async optimizeBlock(code: string, onUpdate?: (partial: string) => void): Promise<string> {
        let buffer = "";
        return this.streamGenerate(
            `Optimize this Azalea code block:\n\n${code}\n\nReturn ONLY the optimized code.`,
            (delta) => {
                buffer += delta;
                if (onUpdate) onUpdate(buffer);
            },
            'coding'
        );
    }

    public async process(instruction: string, contextCode: string, onUpdate?: (partial: string) => void): Promise<string> {
        let buffer = "";
        return this.streamGenerate(
            `Instruction: ${instruction}\n\nContext Code:\n${contextCode}`,
            (delta) => {
                buffer += delta;
                if (onUpdate) onUpdate(buffer);
            },
            'general'
        );
    }
    
    public learnPreference(key: string, value: any) {
        this.userPreferences[key] = value;
    }

    public async generateModule(moduleName: string): Promise<string> {
        return this.streamGenerate(
            `Generate a purely functional module named "${moduleName}" in Azalea syntax. Include exported functions.`,
            () => {},
            'coding'
        );
    }

    public async ragSearch(query: string, context: string[], onUpdate?: (partial: string) => void): Promise<string> {
        const contextBlock = context.slice(0, 10).join('\n---\n');
        let buffer = "";
        return this.streamGenerate(
            `Context:\n${contextBlock}\n\nQuery: ${query}\n\nAnswer the query using the context provided. Be concise.`,
            (delta) => {
                buffer += delta;
                if (onUpdate) onUpdate(buffer);
            },
            'general'
        );
    }

    public async inspectVariable(value: any, onUpdate?: (partial: string) => void): Promise<string> {
        let buffer = "";
        return this.streamGenerate(
            `Analyze this data structure:\n${JSON.stringify(value, null, 2)}\n\nExplain what it is and how to access its data in Azalea.`,
             (delta) => {
                buffer += delta;
                if (onUpdate) onUpdate(buffer);
            },
            'general'
        );
    }

    public async runAgentStep(agentName: string, history: string[], onUpdate?: (partial: string) => void): Promise<string> {
        const historyBlock = history.slice(-10).join('\n'); 
        let buffer = "";
        return this.streamGenerate(
            `You are an autonomous agent named ${agentName}.
        History:
        ${historyBlock}
        
            Decide the next action. Output concise thought and action.`,
            (delta) => {
                buffer += delta;
                if (onUpdate) onUpdate(buffer);
            },
            'general'
        );
    }
}

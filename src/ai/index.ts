import { CreateMLCEngine, MLCEngine, type AppConfig, prebuiltAppConfig, type InitProgressCallback } from "@mlc-ai/web-llm";

// Define the ultra-lightweight models requested by the user
// Default model is the 460M Llama2 XS
const PRIMARY_MODEL_ID = "llama2-xs-460m";

const CUSTOM_MODELS = [
    {
        model: "https://huggingface.co/afrideva/llama2_xs_460M_uncensored-GGUF",
        model_id: "llama2-xs-460m",
        model_lib: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/Llama-2-7b-chat-hf-q4f32_1-ctx4k_cs1k-webgpu.wasm", 
        vram_required_MB: 512,
        low_resource_required: true,
    },
    {
        model: "https://huggingface.co/LiquidAI/LFM2-350M-GGUF",
        model_id: "lfm2-350m",
        model_lib: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/Llama-2-7b-chat-hf-q4f32_1-ctx4k_cs1k-webgpu.wasm", // Attempting generic Llama lib
        vram_required_MB: 512,
        low_resource_required: true,
    },
    {
        model: "https://huggingface.co/unsloth/Qwen3-0.6B-GGUF",
        model_id: "qwen3-0.6b",
        model_lib: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/Qwen2-0.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 512,
        low_resource_required: true,
    },
    {
        model: "https://huggingface.co/jantxu/nano-llama",
        model_id: "nano-llama",
        model_lib: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/Llama-2-7b-chat-hf-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 256,
        low_resource_required: true,
    },
    {
        model: "https://huggingface.co/bartowski/SmolLM2-135M-Instruct-GGUF",
        model_id: "smollm2-135m",
        model_lib: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/Llama-3-8B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm", 
        vram_required_MB: 256,
        low_resource_required: true,
    },
    {
        model: "https://huggingface.co/afrideva/TinyMistral-248M-GGUF",
        model_id: "tinymistral-248m",
        model_lib: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/Mistral-7B-Instruct-v0.2-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 512,
        low_resource_required: true,
    },
    {
        model: "https://huggingface.co/afrideva/beecoder-220M-python-GGUF",
        model_id: "beecoder-220m",
        model_lib: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/Llama-2-7b-chat-hf-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 512,
        low_resource_required: true,
    },
    {
        model: "https://huggingface.co/afrideva/zephyr-220m-sft-full-GGUF",
        model_id: "zephyr-220m",
        model_lib: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/Mistral-7B-Instruct-v0.2-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 512,
        low_resource_required: true,
    },
    // Note: Non-LLM models (FLUX, TTS, etc.) are excluded from this config as WebLLM is strictly for text generation LLMs.
    // To support Image/Audio generation, we would need a different inference engine (e.g. Transformers.js or specialized WASM).
];

const appConfig: AppConfig = {
    useIndexedDBCache: true,
    model_list: [
        ...CUSTOM_MODELS,
        // Include prebuilts as fallback
        ...prebuiltAppConfig.model_list.filter(m => m.model_id !== PRIMARY_MODEL_ID)
    ]
};

export class AIEnchancer {
    private static instance: AIEnchancer;

    public static getInstance(): AIEnchancer {
        if (!AIEnchancer.instance) {
            AIEnchancer.instance = new AIEnchancer();
        }
        return AIEnchancer.instance;
    }

    private constructor() {
        // Eagerly load the model to ensure instant response when user clicks
        this.preload();
    }

    private engine: MLCEngine | null = null;
    private currentModelId: string = PRIMARY_MODEL_ID;
    private initPromise: Promise<MLCEngine> | null = null;
    private userPreferences: Record<string, any> = {};

    public async preload() {
        if (this.engine || this.initPromise) return;
        console.log("[AI] Preloading lightweight model...");
        await this.ensureEngine();
    }

    private async ensureEngine(onProgress?: InitProgressCallback) {
        if (this.engine) return this.engine;
        if (this.initPromise) return this.initPromise;

        console.log(`[AI] Initializing ${this.currentModelId}...`);

        this.initPromise = CreateMLCEngine(
            this.currentModelId,
            {
                appConfig: appConfig,
                initProgressCallback: onProgress || ((info) => {
                    console.log(`[AI Init]: ${info.text}`);
                }),
                logLevel: "INFO"
            }
        );

        this.engine = await this.initPromise;
        this.initPromise = null;
        return this.engine;
    }

    /**
     * STREAMING GENERATION ENGINE
     */
    public async streamGenerate(
        prompt: string, 
        onDelta: (chunk: string) => void,
        contextType: 'coding' | 'creative' | 'general' = 'coding'
    ): Promise<string> {
        const engine = await this.ensureEngine();

        // Specialized System Prompts
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
            { role: "system" as const, content: systemPrompt },
            { role: "user" as const, content: prompt }
        ];

        try {
            const completion = await engine.chat.completions.create({
                messages,
                temperature: 0.1, // Low temperature for precise code
                stream: true,
                max_tokens: 1024, // Lower token limit for speed/small models
            });

            let fullText = "";
            for await (const chunk of completion) {
                const delta = chunk.choices[0]?.delta?.content || "";
                if (delta) {
                    fullText += delta;
                    onDelta(delta);
                }
            }
            return fullText;
        } catch (e) {
            console.error("AI Generation Error:", e);
            throw e;
        }
    }

    // --- Public Interface (Enhanced for Streaming) ---

    // Classic one-shot enhance (backward compatibility, but uses streaming internally)
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

    // --- Advanced Capabilities ---

    public async generateModule(moduleName: string): Promise<string> {
        return this.streamGenerate(
            `Generate a purely functional module named "${moduleName}" in Azalea syntax. Include exported functions.`,
            () => {},
            'coding'
        );
    }

    public async ragSearch(query: string, context: string[], onUpdate?: (partial: string) => void): Promise<string> {
        const keywords = query.toLowerCase().replace(/[?.,!]/g, '').split(' ').filter(w => w.length > 3);
        
        let relevantContext = context;
        if (keywords.length > 0) {
             relevantContext = context.filter(c => 
                keywords.some(k => c.toLowerCase().includes(k))
            );
        }
        
        if (relevantContext.length === 0) relevantContext = context.slice(0, 5);
        const contextBlock = relevantContext.slice(0, 5).join('\n---\n');

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
        const historyBlock = history.slice(-5).join('\n'); // Reduced context for smaller models
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

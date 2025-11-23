import { CreateMLCEngine, MLCEngine, type AppConfig, prebuiltAppConfig } from "@mlc-ai/web-llm";

// Merge our custom models with the prebuilt list to ensure standard models work correctly
const CUSTOM_MODELS = [
    {
        model: "https://huggingface.co/afrideva/llama2_xs_460M_uncensored-GGUF",
        model_id: "llama2-xs-460m",
        model_lib: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/Llama-2-7b-chat-hf-q4f32_1-ctx4k_cs1k-webgpu.wasm", // Attempting to use generic Llama 2 lib
        vram_required_MB: 1024,
        low_resource_required: true,
    },
    {
        model: "https://huggingface.co/unsloth/Qwen3-0.6B-GGUF",
        model_id: "qwen3-0.6b",
        model_lib: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/Qwen2-0.5B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm", // Closest architecture lib
        vram_required_MB: 1024,
        low_resource_required: true,
    },
    {
        model: "https://huggingface.co/jantxu/nano-llama",
        model_id: "nano-llama",
        model_lib: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/Llama-2-7b-chat-hf-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 512,
        low_resource_required: true,
    },
    {
        model: "https://huggingface.co/bartowski/SmolLM2-135M-Instruct-GGUF",
        model_id: "smollm2-135m",
        model_lib: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/Llama-3-8B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm", // SmolLM is typically Llama architecture
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
        model_lib: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/Mistral-7B-Instruct-v0.2-q4f32_1-ctx4k_cs1k-webgpu.wasm", // Zephyr is Mistral-based
        vram_required_MB: 512,
        low_resource_required: true,
    }
    // Note: Image (FLUX) and Audio (TTS) models are excluded from LLM engine config to prevent compatibility errors.
];

const appConfig: AppConfig = {
    useIndexedDBCache: true, // Re-enable cache now that we use stable URLs
    model_list: [
        ...prebuiltAppConfig.model_list, // Use the official list as base
        ...CUSTOM_MODELS.map(m => ({
            model: m.model,
            model_id: m.model_id,
            model_lib: m.model_lib,
            vram_required_MB: m.vram_required_MB,
            low_resource_required: m.low_resource_required,
        }))
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

    private constructor() {}

    private engine: MLCEngine | null = null;
    private currentModelId: string = "";
    private userPreferences: Record<string, any> = {}; 
    private initPromise: Promise<MLCEngine> | null = null;

    // Models Dictionary - Updating to use keys present in prebuiltAppConfig where possible
    public static MODELS = {
        // Judges & Planners
        // Using user-specified default tiny model
        SUPERVISOR: "llama2-xs-460m", 
        
        // Specialized Coders
        GEMMA_CODER: "qwen3-0.6b", // Using Qwen3 as coding specialist
        SMOL_LM2: "smollm2-135m",
        
        // Others will use custom definitions if they work, or fallback
        QWEN3_ZERO: "qwen3-0.6b",
        NER: "tinymistral-248m",
        SUMMARIZER_PHI: "zephyr-220m",
        NT_JAVA: "beecoder-220m",
        BEE_CODER: "beecoder-220m",
    };

    public async preload() {
        console.log("[AI] Starting preload...");
        await this.ensureEngine(AIEnchancer.MODELS.SUPERVISOR);
    }

    private async ensureEngine(modelId: string) {
        if (this.engine && this.currentModelId === modelId) return this.engine;

        // If initialization is already in progress, wait for it
        if (this.initPromise) {
             const eng = await this.initPromise;
             if (this.currentModelId === modelId) return eng;
             // If the requested model is different, we continue to re-init below
        }

        if (this.engine) {
            console.log(`[AI] Unloading ${this.currentModelId}...`);
            await this.engine.unload(); 
            this.engine = null;
        }

        console.log(`[AI] Loading ${modelId}...`);
        this.currentModelId = modelId;
        
        this.initPromise = CreateMLCEngine(
            modelId,
            {
                appConfig: appConfig,
                initProgressCallback: (info) => console.log(`[AI Init ${modelId}]:`, info.text),
                logLevel: "INFO"
            }
        );

        this.engine = await this.initPromise;
        this.initPromise = null;
        return this.engine;
    }

    /**
     * ADAPTIVE ORCHESTRATOR
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private async adaptiveGenerate(prompt: string, _contextType: 'coding' | 'creative' | 'general'): Promise<string> {
        // Simplified Orchestrator using stable models
        // For now, we'll use Llama-3-8B for most tasks to ensure it works
        // as the custom WASM URLs were invalid.
        const selectedModel = AIEnchancer.MODELS.SUPERVISOR;
        
        const worker = await this.ensureEngine(selectedModel);
        
        const finalPrompt = `
        You are an expert coding assistant.
        Task: ${prompt}
        Output ONLY the code/result. No markdown if possible.
        `;
        
        const result = await worker.chat.completions.create({
            messages: [{ role: "user", content: finalPrompt }],
            temperature: 0.2,
        });
        
        let content = result.choices[0].message.content || "";
        content = content.replace(/^```azalea\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');
        
        return content;
    }

    // --- Public Interface ---

    public async enhance(code: string): Promise<string> {
        return this.adaptiveGenerate(`Improve this code:\n${code}`, 'coding');
    }

    public async generateFunction(name: string, params: string[], description: string): Promise<string> {
        return this.adaptiveGenerate(`Write a function ${name}(${params}) that ${description}`, 'coding');
    }

    public async optimizeBlock(code: string): Promise<string> {
        return this.adaptiveGenerate(`Optimize this:\n${code}`, 'coding');
    }

    public async process(instruction: string, contextCode: string): Promise<string> {
        return this.adaptiveGenerate(`Instruction: ${instruction}\nContext:\n${contextCode}`, 'general');
    }
    
    public learnPreference(key: string, value: any) {
        this.userPreferences[key] = value;
    }

    // --- New AI Native Capabilities ---

    public async generateModule(moduleName: string): Promise<string> {
        return this.adaptiveGenerate(`Generate a purely functional module named "${moduleName}" in Azalea syntax. Include exported functions.`, 'coding');
    }

    public async ragSearch(query: string, context: string[]): Promise<string> {
        // In a real implementation, this would use vector embeddings.
        // Here we use the LLM to "search" the provided context strings.
        const contextBlock = context.join('\n');
        return this.adaptiveGenerate(`Given this context:\n${contextBlock}\n\nAnswer this query based on the context: ${query}`, 'general');
    }

    public async inspectVariable(value: any): Promise<string> {
        return this.adaptiveGenerate(`Explain what this data structure represents and suggest how to use it:\n${JSON.stringify(value)}`, 'general');
    }

    public async runAgentStep(agentName: string, history: string[]): Promise<string> {
        const historyBlock = history.join('\n');
        return this.adaptiveGenerate(`You are an autonomous agent named ${agentName}.
        History:
        ${historyBlock}
        
        Decide the next action or thought.`, 'general');
    }
}

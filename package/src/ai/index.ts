import { CreateMLCEngine, MLCEngine, type AppConfig, prebuiltAppConfig } from "@mlc-ai/web-llm";

// Merge our custom models with the prebuilt list to ensure standard models work correctly
const CUSTOM_MODELS = [
    // --- Coding Specialists ---
    {
        model_id: "gemma-3-270m-coder",
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/gemma-2-2b-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 512,
        low_resource_required: true,
    },
    // ... other custom models ...
    // For now, relying on prebuilt config for standard models to ensure stability
];

const appConfig: AppConfig = {
    useIndexedDBCache: true, // Re-enable cache now that we use stable URLs
    model_list: [
        ...prebuiltAppConfig.model_list, // Use the official list as base
        ...CUSTOM_MODELS.map(m => ({
            model: "https://huggingface.co/" + m.model_id,
            model_id: m.model_id,
            model_lib: m.model_lib_url,
            vram_required_MB: m.vram_required_MB,
            low_resource_required: m.low_resource_required,
        }))
    ]
};

export class AIEnchancer {
    private engine: MLCEngine | null = null;
    private currentModelId: string = "";
    private userPreferences: Record<string, any> = {}; 

    // Models Dictionary - Updating to use keys present in prebuiltAppConfig where possible
    private static MODELS = {
        // Judges & Planners
        SUPERVISOR: "Llama-3-8B-Instruct-q4f32_1-MLC",
        
        // Specialized Coders
        GEMMA_CODER: "gemma-2-2b-it-q4f32_1-MLC", // Switched to standard model for stability
        SMOL_LM2: "Llama-3-8B-Instruct-q4f32_1-MLC", // Fallback for now
        
        // Others will use custom definitions if they work, or fallback
        QWEN3_ZERO: "Llama-3-8B-Instruct-q4f32_1-MLC", // Fallback until custom WASM is fixed
        NER: "Llama-3-8B-Instruct-q4f32_1-MLC",
        SUMMARIZER_PHI: "Phi-3.5-mini-instruct-q4f16_1-MLC",
        NT_JAVA: "Llama-3-8B-Instruct-q4f32_1-MLC",
        BEE_CODER: "Llama-3-8B-Instruct-q4f32_1-MLC",
    };

    private async ensureEngine(modelId: string) {
        if (this.engine && this.currentModelId === modelId) return this.engine;

        if (this.engine) {
            console.log(`[AI] Unloading ${this.currentModelId}...`);
            await this.engine.unload(); 
        }

        console.log(`[AI] Loading ${modelId}...`);
        this.currentModelId = modelId;
        this.engine = await CreateMLCEngine(
            modelId,
            {
                appConfig: appConfig,
                initProgressCallback: (info) => console.log(`[AI Init ${modelId}]:`, info.text),
                logLevel: "INFO"
            }
        );
        return this.engine;
    }

    /**
     * ADAPTIVE ORCHESTRATOR
     */
    private async adaptiveGenerate(prompt: string, contextType: 'coding' | 'creative' | 'general'): Promise<string> {
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
}

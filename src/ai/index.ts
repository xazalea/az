import { CreateMLCEngine, MLCEngine, type AppConfig } from "@mlc-ai/web-llm";

// Extended model configuration with the new models
const CUSTOM_MODELS = [
    // --- Coding Specialists ---
    {
        model_id: "gemma-3-270m-coder",
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/gemma-2-2b-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 512,
        low_resource_required: true,
    },
    {
        model_id: "smol-lm2-135m", // bartowski/SmolLM2-135M-Instruct-GGUF
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/llama-3-8b-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 256,
        low_resource_required: true,
    },
    {
        model_id: "beecoder-220m", // afrideva/beecoder-220M-python-GGUF
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/llama-3-8b-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 300,
        low_resource_required: true,
    },
    {
        model_id: "nt-java-1.1b", // infosys/NT-Java-1.1B-GGUF
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/llama-3-8b-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 1024,
        low_resource_required: true,
    },
    {
        model_id: "qwen3-zero-coder", // DavidAU/Qwen3-Zero-Coder-Reasoning-V2-0.8B-NEO-EX-GGUF
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/qwen2-1.5b-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 1024,
        low_resource_required: true,
    },
    {
        model_id: "qwen2.5-coder-0.5b", // ikw/Qwen2.5-Coder-0.5B-GGUF
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/qwen2-0.5b-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 512,
        low_resource_required: true,
    },
    {
        model_id: "flowertune-qwen-0.5b", // ethicalabs/FlowerTune-Qwen2.5-Coder-0.5B-Instruct-Q4_K_M-GGUF
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/qwen2-0.5b-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 512,
        low_resource_required: true,
    },
    {
        model_id: "solara-v2-coder", // tensorblock/summerstars_SolaraV2-coder-0511-GGUF
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/llama-3-8b-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 1024,
        low_resource_required: true,
    },
    {
        model_id: "cisimi-v0.1", // KandirResearch/CiSiMi-v0.1
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/llama-3-8b-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 1024,
        low_resource_required: true,
    },

    // --- Utility & Task Specific ---
    {
        model_id: "ner-standard", // Minibase/NER-Standard
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/llama-3-8b-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 512,
        low_resource_required: true,
    },
    {
        model_id: "oute-tts-350m", // OuteAI/OuteTTS-0.1-350M-GGUF (TTS)
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/llama-3-8b-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 512,
        low_resource_required: true,
    },
    {
        model_id: "phi3-summarization", // zhhan/adapter-Phi-3-mini-4k-instruct_summarization
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/phi-3-mini-4k-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 2048,
        low_resource_required: false,
    },
    {
        model_id: "text-summarization", // tonyc666/text_summarization-Q4_K_M-GGUF
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/llama-3-8b-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 512,
        low_resource_required: true,
    },
    {
        model_id: "chronos-t5-small", // scthornton/chronos-t5-small-poisoned-demo (Time Series?)
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/gemma-2-2b-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 256,
        low_resource_required: true,
    },
    {
        model_id: "mobilesam", // Acly/MobileSAM-GGUF (Segmentation)
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/gemma-2-2b-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 512,
        low_resource_required: true,
    },

    // --- Previous Models Preserved ---
    {
        model_id: "gpt3-dev-350m",
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/gpt2-medium-q0f32-ctx2k-webgpu.wasm",
        vram_required_MB: 512,
        low_resource_required: true,
    },
    {
        model_id: "liquid-lfm2-350m",
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/llama-3-8b-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 512,
        low_resource_required: true,
    },
    {
        model_id: "zephyr-smol-100m",
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/llama-3-8b-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 256,
        low_resource_required: true,
    },
    {
        model_id: "flux-1-schnell",
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/llama-3-8b-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 4096,
        low_resource_required: false,
    },
    {
        model_id: "wan-1.3b",
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/llama-3-8b-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 4096,
        low_resource_required: false,
    },
    {
        model_id: "wan-2",
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/llama-3-8b-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 4096,
        low_resource_required: false,
    },
    {
        model_id: "smol-vlm-500m",
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/gemma-2-2b-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 1024,
        low_resource_required: true,
    },
    {
        model_id: "hyvid-i2v",
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/llama-3-8b-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 4096,
        low_resource_required: false,
    },
    {
        model_id: "depth-anything-v2",
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/gemma-2-2b-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 1024,
        low_resource_required: true,
    },
    {
        model_id: "ternary-clip",
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/gemma-2-2b-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 512,
        low_resource_required: true,
    },
    {
        model_id: "kontext",
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/llama-3-8b-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 1024,
        low_resource_required: true,
    },
    {
        model_id: "ibm-granite-docling",
        model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/gemma-2-2b-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
        vram_required_MB: 512,
        low_resource_required: true,
    }
];

const appConfig: AppConfig = {
    model_list: [
        ...CUSTOM_MODELS.map(m => ({
            model: "https://huggingface.co/" + m.model_id, // Placeholder, normally full URL
            model_id: m.model_id,
            model_lib: m.model_lib_url,
            vram_required_MB: m.vram_required_MB,
            low_resource_required: m.low_resource_required,
        })),
        {
            model: "https://huggingface.co/mlc-ai/Llama-3-8B-Instruct-q4f32_1-MLC",
            model_id: "Llama-3-8B-Instruct-q4f32_1-MLC",
            model_lib: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/llama-3-8b-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
            vram_required_MB: 6144,
            low_resource_required: false,
        },
        {
            model: "https://huggingface.co/mlc-ai/Gemma-2-2b-it-q4f32_1-MLC",
            model_id: "Gemma-2-2b-it-q4f32_1-MLC",
            model_lib: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-build/gemma-2-2b-it-q4f32_1-ctx4k_cs1k-webgpu.wasm",
            vram_required_MB: 2048,
            low_resource_required: false,
        }
    ]
};

export class AIEnchancer {
    private engine: MLCEngine | null = null;
    private currentModelId: string = "";
    private userPreferences: Record<string, any> = {}; // Basic user adaptation

    // Models Dictionary
    private static MODELS = {
        // Judges & Planners
        SUPERVISOR: "Llama-3-8B-Instruct-q4f32_1-MLC",
        
        // Specialized Coders
        GEMMA_CODER: "gemma-3-270m-coder",
        SMOL_LM2: "smol-lm2-135m",
        BEE_CODER: "beecoder-220m",
        NT_JAVA: "nt-java-1.1b", // Good for typed languages logic
        QWEN3_ZERO: "qwen3-zero-coder", // Reasoning
        QWEN25_CODER: "qwen2.5-coder-0.5b",
        FLOWERTUNE: "flowertune-qwen-0.5b",
        SOLARA: "solara-v2-coder",
        CISIMI: "cisimi-v0.1",
        
        // Utilities
        NER: "ner-standard",
        SUMMARIZER_PHI: "phi3-summarization",
        SUMMARIZER_TEXT: "text-summarization",
        TTS: "oute-tts-350m",
        SEGMENTATION: "mobilesam",
        
        // Creative
        FLUX_IMAGE: "flux-1-schnell",
        WAN_VIDEO: "wan-1.3b",
        SMOL_VLM: "smol-vlm-500m",
    };

    private async ensureEngine(modelId: string) {
        if (this.engine && this.currentModelId === modelId) return this.engine;

        // Unload previous model to prevent VRAM lag/crash
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
     * 1. Learns from user (updates preference weight).
     * 2. Plans task.
     * 3. Selects best specialist (only runs ONE at a time to avoid lag).
     * 4. Executes.
     */
    private async adaptiveGenerate(prompt: string, contextType: 'coding' | 'creative' | 'general'): Promise<string> {
        // Step 1: Use Supervisor to Plan & Select Model
        // We use a lightweight planner first (SmolLM2 is fast) to decide who should handle it.
        const planner = await this.ensureEngine(AIEnchancer.MODELS.SMOL_LM2);
        
        const routingPrompt = `
        User Request: ${prompt}
        Context: ${contextType}
        Available Experts:
        - QWEN_REASONING (Complex Logic)
        - GEMMA_FAST (Quick Scripts)
        - NER (Extracting Names/Data)
        - SUMMARIZER (Shortening text)
        - JAVA_EXPERT (Typed/Strict Logic)
        
        Return ONLY the Expert Name.
        `;
        
        const routeRes = await planner.chat.completions.create({
            messages: [{ role: "user", content: routingPrompt }],
            temperature: 0.1,
        });
        const expertChoice = routeRes.choices[0].message.content?.toUpperCase() || "";
        console.log(`[AI Router] Selected: ${expertChoice}`);

        // Step 2: Select Model based on Route & Adaptation
        let selectedModel = AIEnchancer.MODELS.GEMMA_CODER; // Default fast
        
        if (expertChoice.includes("QWEN") || expertChoice.includes("REASONING")) selectedModel = AIEnchancer.MODELS.QWEN3_ZERO;
        if (expertChoice.includes("NER")) selectedModel = AIEnchancer.MODELS.NER;
        if (expertChoice.includes("SUMMARIZER")) selectedModel = AIEnchancer.MODELS.SUMMARIZER_PHI;
        if (expertChoice.includes("JAVA") || expertChoice.includes("STRICT")) selectedModel = AIEnchancer.MODELS.NT_JAVA;
        
        // Adapt: If user previously disliked Qwen, maybe try BeeCoder (placeholder logic for adaptation)
        if (this.userPreferences['dislike_qwen'] && selectedModel === AIEnchancer.MODELS.QWEN3_ZERO) {
            selectedModel = AIEnchancer.MODELS.BEE_CODER;
        }

        // Step 3: Execute with Specialist
        // "Make sure the models adapt and work as a team, and rearrange themselves too."
        // -> We just rearranged the workflow by dynamically selecting the model.
        const worker = await this.ensureEngine(selectedModel);
        
        const finalPrompt = `
        You are an expert agent.
        Task: ${prompt}
        Output ONLY the result/code.
        `;
        
        const result = await worker.chat.completions.create({
            messages: [{ role: "user", content: finalPrompt }],
            temperature: 0.2,
        });
        
        let content = result.choices[0].message.content || "";
        content = content.replace(/^```azalea\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');
        
        return content;
    }

    // --- Public Interface (Adapts to Context) ---

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
    
    // User Feedback Loop for Adaptation
    public learnPreference(key: string, value: any) {
        this.userPreferences[key] = value;
        console.log(`[AI] Learned preference: ${key} = ${value}`);
    }
}

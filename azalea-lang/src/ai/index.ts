import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";

export class AIEnchancer {
    private engine: MLCEngine | null = null;
    private currentModelId: string = "";

    // Models
    private static MODELS = {
        HEAVY: "Llama-3-8B-Instruct-q4f32_1-MLC",
        FAST: "Gemma-2-2b-it-q4f32_1-MLC",
    };

    public async init(modelId: string = AIEnchancer.MODELS.HEAVY) {
        if (this.engine && this.currentModelId === modelId) return;

        this.currentModelId = modelId;
        this.engine = await CreateMLCEngine(
            modelId,
            {
                initProgressCallback: (info) => console.log(`[AI Init ${modelId}]:`, info.text),
                logLevel: "INFO"
            }
        );
    }

    private getSystemPrompt(): string {
        return `
You are an expert programmer in the Azalea language.
Azalea is a modern, indentation-based UI programming language.

Syntax Rules:
1. Blocks start with a colon (:) and must be indented (4 spaces).
2. No curly braces {} or semicolons ; are required.
3. Functions: fn name(args): ...
4. Variables: var x = 10
5. Control Flow: if x > 5: ... else: ... (else must be at same indentation as if)
6. UI Primitives: box, text, button.
   Example:
   fn main():
       box():
           text("Hello")
           button("Click")

Task:
`;
    }

    public async enhance(code: string): Promise<string> {
        // Use Heavy model for full file enhancement
        await this.init(AIEnchancer.MODELS.HEAVY);

        const prompt = `${this.getSystemPrompt()}
Optimize and improve the following code. 
Make it cleaner, more efficient, and fix any bugs.
Ensure the output uses valid Azalea indentation-based syntax.
Return ONLY the code, no markdown, no explanations.

Code:
${code}
`;

        const reply = await this.engine!.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
        });

        let content = reply.choices[0].message.content || code;
        // Strip markdown code blocks if present
        content = content.replace(/^```azalea\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');
        return content;
    }

    public async generateFunction(name: string, params: string[], description: string): Promise<string> {
        const prompt = `${this.getSystemPrompt()}
Generate a function named '${name}' with parameters (${params.join(', ')}) that matches this description: "${description}".
Ensure correct indentation.
Output ONLY the function code.
`;
        return this.generate(prompt, AIEnchancer.MODELS.HEAVY);
    }

    public async optimizeBlock(code: string): Promise<string> {
        const prompt = `${this.getSystemPrompt()}
Optimize this Azalea code block:
${code}
Return ONLY the code.
`;
        return this.generate(prompt, AIEnchancer.MODELS.FAST);
    }

    private async generate(prompt: string, modelId: string): Promise<string> {
        await this.init(modelId);
        const reply = await this.engine!.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
        });
        let content = reply.choices[0].message.content || "";
         // Strip markdown code blocks if present
        content = content.replace(/^```azalea\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');
        return content;
    }
}

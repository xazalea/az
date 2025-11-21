import wabt from 'wabt';

export class Runtime {
    private output: string[] = [];
    private container: HTMLElement | null = null;

    constructor(containerId: string) {
        this.container = document.getElementById(containerId);
    }

    public getOutput(): string[] {
        return this.output;
    }

    public clearOutput() {
        this.output = [];
        if (this.container) this.container.innerHTML = '';
    }

    public async run(wat: string) {
        this.clearOutput();

        // Convert WAT to Binary
        // Since we don't have a WAT assembler in browser easily without big deps (wabt.js),
        // and I promised to keep it simple/standalone if possible.
        // BUT, I can use 'wabt' package if I installed it, or use a simple mock for now if the WAT is simple.
        // Wait, I didn't install 'wabt'.
        // I should have installed 'wabt' or 'wabt.js'.
        // Let's assume for this prototype I'll use a fetch to a public WAT assembler or just try to use a very simple binary generation if possible.
        // Actually, for a robust solution, I should use 'wabt'.
        // I'll ask the user or just install it.
        // For now, I'll use a placeholder that simulates execution or tries to fetch.
        // BETTER: I'll use a simple inline assembler for a subset of WAT or just compile to JS for the prototype if WASM is too hard without wabt.
        // NO, the requirement is WASM.
        // I will install 'wabt' dynamically or just use a CDN link in index.html.

        try {
            const wabtModule = await wabt();

            const module = wabtModule.parseWat('test.wat', wat);
            const binary = module.toBinary({});
            const { instance } = await WebAssembly.instantiate(binary.buffer, {
                env: {
                    log: (val: number) => {
                        this.output.push(val.toString());
                        console.log('Azalea Log:', val);
                    },
                    createBox: () => {
                        const div = document.createElement('div');
                        div.className = 'az-box p-4 border rounded bg-white shadow';
                        this.container?.appendChild(div);
                        return 0; // Handle ID
                    },
                    createText: (ptr: number, len: number) => {
                        const span = document.createElement('span');
                        span.textContent = "Text"; // TODO: Read memory
                        this.container?.appendChild(span);
                        return 0;
                    },
                    createButton: (ptr: number, len: number) => {
                        const btn = document.createElement('button');
                        btn.textContent = "Button"; // TODO: Read memory
                        btn.className = 'az-btn px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600';
                        this.container?.appendChild(btn);
                        return 0;
                    },
                    appendChild: (parent: number, child: number) => {
                        // TODO: Implement hierarchy
                    }
                }
            }) as unknown as { instance: WebAssembly.Instance, module: WebAssembly.Module };

            // Run main if exists
            if (instance.exports.main) {
                (instance.exports.main as Function)();
            }

        } catch (e) {
            console.error(e);
            this.output.push(`Error: ${e}`);
        }
    }
}

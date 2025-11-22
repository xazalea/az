export class Runtime {
    private memory: WebAssembly.Memory;
    private instance: WebAssembly.Instance | null = null;
    private container: HTMLElement | null = null;

    constructor(containerId: string) {
        this.memory = new WebAssembly.Memory({ initial: 1 });
        this.container = document.getElementById(containerId);
    }

    public async run(wasmBytes: Uint8Array) {
        const importObject = {
            env: {
                memory: this.memory,
                log: (arg: number) => console.log(arg),
                createBox: () => this.createBox(),
                createText: (ptr: number, len: number) => this.createText(ptr, len), // ptr and len unused in mock, but signature matches
                createButton: (ptr: number, len: number) => this.createButton(ptr, len), // unused ptr, len
                appendChild: (parent: number, child: number) => {} // Mock
            }
        };

        const { instance } = await WebAssembly.instantiate(wasmBytes, importObject);
        this.instance = instance;

        const main = instance.exports.main as CallableFunction;
        if (main) {
            main();
        }
    }

    private createBox(): number {
        if (this.container) {
            const div = document.createElement('div');
            div.className = 'p-4 border border-gray-300 rounded mb-2';
            this.container.appendChild(div);
        }
        return 1; // Mock ID
    }

    private createText(ptr: number, len: number): number {
        // In real impl, read string from memory using ptr/len
        // For now, just printing placeholder
        if (this.container) {
            const p = document.createElement('p');
            p.textContent = "Hello from WASM (Mock Text)";
            this.container.appendChild(p);
        }
        return 2;
    }

    private createButton(ptr: number, len: number): number {
        if (this.container) {
            const btn = document.createElement('button');
            btn.textContent = "WASM Button";
            btn.className = "bg-blue-500 text-white px-4 py-2 rounded";
            this.container.appendChild(btn);
        }
        return 3;
    }
}

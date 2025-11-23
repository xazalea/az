export class Runtime {
    private memory: WebAssembly.Memory;
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
                createText: (_ptr: number, _len: number) => this.createText(), 
                createButton: (_ptr: number, _len: number) => this.createButton(),
                appendChild: (_parent: number, _child: number) => {} 
            }
        };

        // Cast result to any to handle overload confusion in TS (Promise<Instance> vs Promise<{instance, module}>)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await WebAssembly.instantiate(wasmBytes, importObject) as any;
        const instance = result.instance || result;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const main = (instance.exports as any).main as CallableFunction;
        
        if (typeof main === 'function') {
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

    private createText(): number {
        // In real impl, read string from memory using ptr/len
        // For now, just printing placeholder
        if (this.container) {
            const p = document.createElement('p');
            p.textContent = "Hello from WASM (Mock Text)";
            this.container.appendChild(p);
        }
        return 2;
    }

    private createButton(): number {
        if (this.container) {
            const btn = document.createElement('button');
            btn.textContent = "WASM Button";
            btn.className = "bg-blue-500 text-white px-4 py-2 rounded";
            this.container.appendChild(btn);
        }
        return 3;
    }
}

export const MachineIntrinsics = {
    memory: new Uint8Array(1024), // 1KB virtual memory for 'machine' paradigm

    peek: (address: number) => {
        if (address < 0 || address >= 1024) return 0;
        return MachineIntrinsics.memory[address];
    },

    poke: (address: number, value: number) => {
        if (address >= 0 && address < 1024) {
            MachineIntrinsics.memory[address] = value;
        }
    }
};

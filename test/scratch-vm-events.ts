import VirtualMachine from 'scratch-vm';

declare module 'scratch-vm/events' {
    interface VirtualMachineCustomEvents {
        TRIGGER_MANUAL_RESTORE_POINT: [];
        RESTORE_POINT_START: [];
        RESTORE_POINT_END: [];
    }

    interface RuntimeCustomEvents {
        RUNTIME_PAUSED: [];
        RUNTIME_UNPAUSED: [];
    }
}

const vm = new VirtualMachine();

vm.on('TRIGGER_MANUAL_RESTORE_POINT', () => undefined);
vm.emit('RESTORE_POINT_START');
vm.emit('RESTORE_POINT_END');
vm.runtime.emit('RUNTIME_PAUSED');
vm.runtime.on('RUNTIME_UNPAUSED', () => undefined);
vm.on('PROJECT_CHANGED', () => undefined);

// @ts-expect-error consumer events keep their declared payloads
vm.emit('RESTORE_POINT_END', 'done');

// @ts-expect-error runtime custom events are not VM events
vm.on('RUNTIME_PAUSED', () => undefined);

// @ts-expect-error VM custom events are not runtime events
vm.runtime.on('TRIGGER_MANUAL_RESTORE_POINT', () => undefined);

// @ts-expect-error names nobody declared are still rejected
vm.emit('RESTORE_POINT_MIDDLE');

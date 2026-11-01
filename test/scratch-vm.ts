import VirtualMachine from 'scratch-vm';

const vm = new VirtualMachine();

vm.on('targetsUpdate', update => {
    const editing: string | null = update.editingTarget;
    const count: number = update.targetList.length;
    return [editing, count];
});

vm.on('PROJECT_CHANGED', () => undefined);

vm.runtime.on('STAGE_SIZE_CHANGED', (width, height) => width * height);

const stage = vm.runtime.getTargetForStage();
const list = stage?.lookupVariableByNameAndType('output', 'list');
const firstValue: VirtualMachine.VariableValue | undefined = list?.value;

export const loaded: Promise<void> = vm.loadProject(new ArrayBuffer(0)).then(() => {
    vm.setEditingTarget(stage?.id ?? '');
    return firstValue === undefined ? undefined : undefined;
});

// @ts-expect-error unknown events are rejected
vm.on('not-an-event', () => undefined);

// @ts-expect-error listeners must match the payload
vm.runtime.on('MIC_LISTENING', (listening: string) => listening);

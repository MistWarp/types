import VirtualMachine from 'scratch-vm';
import ArgumentType from 'scratch-vm/src/extension-support/argument-type';
import BlockType from 'scratch-vm/src/extension-support/block-type';
import {
    getChangeKey,
    getExtensionSignatureHash,
    getExtensionSignatures,
    hashString
} from 'scratch-vm/src/serialization/fractch-context';
import {scopesUsedByProject} from 'scratch-vm/src/extensions/rotur/core';
import opcodeTable from 'scratch-vm/src/engine/opcodes.generated.json';

const vm = new VirtualMachine();
const runtime = vm.runtime;

vm.on('targetsUpdate', update => {
    const editing: string | null = update.editingTarget;
    const names: string[] = update.targetList.map(target => target.name);
    const costumeCount: number | undefined = update.targetList[0]?.costumeCount;
    return [editing, names, costumeCount];
});

vm.on('workspaceUpdate', data => {
    const xml: string = data.xml;
    const header: string = data.headerXml;
    const scripts: string[] = data.blocks.scripts;
    return [xml, header, scripts];
});

vm.on('PROJECT_CHANGED', () => undefined);
vm.on('LOAD_PROGRESS', ({stage, loaded, total}) => {
    const named: VirtualMachine.LoadStage = stage;
    return [named, loaded ?? 0, total ?? 0];
});
vm.on('EXTENSION_LOAD_ERROR', ({extensionID, url}) => `${extensionID} ${url}`);
vm.on('ASSET_PROGRESS', (finished, total) => finished / total);
vm.on('EXTENSION_FIELD_ADDED', (field, missing) => [field.name, missing]);
vm.on('PERIPHERAL_REQUEST_ERROR', () => undefined);
vm.on('EDIT_COMMAND_ERROR', error => error);
vm.on('CREATE_UNSANDBOXED_EXTENSION_API', scratch => scratch);
vm.on('MONITORS_UPDATE', monitors => monitors.values().map(monitor => monitor.id));
vm.on('BLOCK_DRAG_END', (blocks, topBlockId) => blocks.some(block => block.id === topBlockId));
vm.on('EXTENSION_ADDED', category => category.blocks.map(block => block.info.opcode));
vm.on('EXTENSIONS_REORDERED', ({ids}) => ids.length);
vm.on('VISUAL_REPORT', ({id, value}) => `${id}${value}`);

runtime.on('STAGE_SIZE_CHANGED', (width, height) => width * height);
runtime.on('ASSET_PROGRESS', (finished, total, detail) => (detail ? detail.phase : finished + total));
runtime.on('THREAD_STARTED', thread => thread.topBlock);
runtime.on('THREAD_ERROR', ({thread, error}) => [thread.isCompiled, error]);
runtime.on('BREAKPOINT_HIT', (thread, blockId) => thread.peekStack() === blockId);
runtime.on('EXTENSION_RELOADED', entry => entry.changed.concat(entry.added, entry.removed));
runtime.on('EXTENSION_ERROR', report => report.kind === 'block' && report.count > 1);
runtime.on('EXTENSION_CONSOLE', message => message.level);
runtime.on('ITEMS_CHANGED', items => items.length);
runtime.on('ENTITLEMENTS_CHANGED', entitlements => Object.keys(entitlements));
runtime.on('PLATFORM_MISMATCH', (platform, accept) => {
    accept();
    return platform;
});
runtime.on('QUESTION', question => question ?? '');
runtime.on('targetWasCreated', (clone, original) => clone.isOriginal || original === undefined);
runtime.on('SPRITE_INFO_CHANGED', (target, change) => [target.id, change.x]);
runtime.on('PERIPHERAL_CONNECTION_LOST_ERROR', ({extensionId}) => extensionId);
runtime.emit('ANSWER', 'yes');
runtime.emit('PLAY_NOTE', 60, 'music');

const stage = runtime.getTargetForStage();
const list = stage?.lookupVariableByNameAndType('output', 'list');
const firstValue: VirtualMachine.VariableValue | undefined = list?.value;
const editing = vm.editingTarget;
if (editing) {
    const id: string = editing.id;
    const costumes: VirtualMachine.Costume[] = editing.getCostumes();
    const sounds: VirtualMachine.Sound[] = editing.sprite.sounds;
    const block: VirtualMachine.Block | undefined = editing.blocks.getBlock(id);
    const top: string | null = editing.blocks.getTopLevelScript(id);
    const allBlocks: VirtualMachine.Block[] = Object.values(editing.blocks._blocks);
    const scripts: string[] = editing.blocks._scripts;
    const json: VirtualMachine.TargetJSON = editing.toJSON();
    const bounds: VirtualMachine.Bounds | null = editing.getBounds();
    editing.setXY(0, 0);
    editing.setCostume(costumes.length - 1);
    editing.createComment('c', null, 'note', 0, 0, 200, 200, false);
    const moved: boolean = editing.updateComment('c', {x: 10, blockId: null});
    editing.postSpriteInfo({x: 1, rotationStyle: 'left-right'});
    void [costumes, sounds, block, top, allBlocks, scripts, json, bounds, moved];
}

const threads: VirtualMachine.Thread[] | undefined = runtime.startHats('event_whenkeypressed', {KEY_OPTION: 'space'});
runtime.toggleScript('top', {target: stage, stackClick: true});
runtime.requestUpdateMonitor({id: 'monitor', visible: false});
runtime.requestUpdateMonitor({toJS: () => ({id: 'monitor', x: 5})});
runtime.requestAddMonitor({id: 'monitor', mode: 'large'});
const monitor: VirtualMachine.MonitorRecord | undefined = runtime.getMonitorState().get('monitor');
const xml: VirtualMachine.CategoryXML[] = runtime.getBlocksXML(stage);
const label = runtime.getLabelForOpcode('pen_clear');
const labelText: string | undefined = label?.label;
const addon: VirtualMachine.AddonBlock | null = runtime.getAddonBlock('breakpoint');
const categories: string[] = runtime.getCategoryOrder();
const playing: boolean = runtime.turboMode && runtime.runtimeOptions.caseSensitiveLists;
const framerate: number = runtime.frameLoop.framerate;
const active: VirtualMachine.Thread | null = runtime.sequencer.activeThread;
runtime.ioDevices.clock.pause();
runtime.ioDevices.cloud.requestUpdateVariable('☁ score', 10);
runtime.setBreakpoints(new Set(['a']));
runtime.setBreakpoints(null);
const fonts: VirtualMachine.Font[] = runtime.fontManager.getFonts();
runtime.fontManager.on('change', () => undefined);
const assetURL: string = runtime.assetManager.getObjectURL('image.png');
const assetCount: number = runtime.assetManager.assets.length;

const internals = {
    blockInfo: runtime._blockInfo.map(category => category.id),
    clones: runtime._cloneCounter,
    hats: Object.keys(runtime._hats),
    monitors: runtime._monitorState.size,
    loaded: Array.from(vm.extensionManager._loadedExtensions.keys()),
    generation: vm._projectLoadGeneration ?? 0,
    paused: runtime.ioDevices.clock._paused
};
const originalStep = runtime._step;
runtime._step = function () {
    originalStep.call(this);
};

const renderer = vm.renderer;
if (renderer) {
    renderer.draw();
    renderer.requestSnapshot(dataURI => dataURI.length);
    renderer.setUseHighQualityRender(true);
    renderer.on('UseHighQualityRenderChanged', enabled => !enabled);
    const [nativeWidth, nativeHeight] = renderer.getNativeSize();
    const drawable = renderer.pick(nativeWidth / 2, nativeHeight / 2);
    const extraction: VirtualMachine.DrawableExtraction = renderer.extractDrawableScreenSpace(drawable);
    const color = renderer.extractColor(1, 1, 3).color;
    renderer.useRealLayerIndexes = true;
    void [extraction, color, renderer.canvas.toDataURL(), renderer.overlayContainer.className];
}

const extensions = vm.extensionManager;
const loaded: boolean = extensions.isExtensionLoaded('pen');
const urls: Record<string, string> = extensions.getExtensionURLs();
const mode: VirtualMachine.ExtensionMode | null = extensions.getExtensionMode('pen');
const entries: VirtualMachine.ExtensionEntry[] = extensions.getExtensionEntries();
export const extensionWork: Promise<unknown>[] = [
    extensions.loadExtensionURL('https://example.com/extension.js'),
    extensions.getExtensionSource('pen', {fetch: true}),
    extensions.reloadExtension('pen', 'source', {confirm: diff => diff.mode === 'iframe'}),
    extensions.createExtension('source', {unsandboxed: true}),
    extensions.setExtensionOrder(['pen', 'music'])
];
vm.securityManager.canLoadExtensionFromProject = (url, options) => url.length > 0 && options?.wholeProject === true;
vm.securityManager.getSandboxMode = () => 'unsandboxed';

vm.editingCommands.handler = command => command.method;
vm.editingCommands.request('selectCostume', [0]);
const snapshot: VirtualMachine.EditTargetState[] = vm.editingCommands.snapshot(false);

const restore: VirtualMachine.RestoreFunction = vm.deleteSprite('sprite');
const restoreCostume = vm.deleteCostume(0);
if (typeof restoreCostume === 'function') {
    restoreCostume().then(() => undefined);
}
const reordered: boolean | Promise<unknown> = vm.reorderCostume('sprite', 0, 1);
const usage: VirtualMachine.ExtensionUsage = vm.getExtensionUsage('pen');
const context: VirtualMachine.FractchContext = vm.getFractchContext();
const hash: string | null = vm.getCodeStateHash('sprite');
const files: Record<string, Uint8Array> = vm.saveProjectSb3DontZip();
const drawableTarget: string | null = vm.getTargetIdForDrawableId(1);
vm.addAddonBlock({
    procedureCode: 'breakpoint',
    arguments: [],
    callback: (args, util) => util.thread.topBlock,
    displayName: 'breakpoint'
});
vm.postIOData('mouse', {x: 0, y: 0, isDown: true});
vm.setRuntimeOptions({maxClones: Infinity});
vm.setCompilerOptions({warpTimer: true});

const argumentType: 'string' = ArgumentType.STRING;
const blockType: 'reporter' = BlockType.REPORTER;
const signatures = getExtensionSignatures(runtime);
const signatureArguments = Object.values(signatures).flatMap(signature =>
    signature.blocks.map(block => block.arguments.length));
const changeKey: string = getChangeKey(runtime, stage ?? runtime.targets[0]!, getExtensionSignatureHash(runtime));
const textHash: string = hashString('text');
const scopes: string[] = scopesUsedByProject(runtime);
const addInfo = opcodeTable.opcodes.operator_add;
const variadicPrefix: string | undefined = addInfo?.variadic?.prefix;

export const loadedProject: Promise<void> = vm.loadProject(new ArrayBuffer(0)).then(() => {
    vm.setEditingTarget(stage?.id ?? '');
    return firstValue === undefined ? undefined : undefined;
});

export const used = [
    threads, monitor, xml, labelText, addon, categories, playing, framerate, active, fonts, assetURL,
    assetCount, internals, loaded, urls, mode, entries, snapshot, restore, reordered, usage, context,
    hash, files, drawableTarget, argumentType, blockType, signatureArguments, changeKey, textHash,
    scopes, variadicPrefix
];

// @ts-expect-error unknown events are rejected
vm.on('not-an-event', () => undefined);

// @ts-expect-error the VM does not forward PROJECT_LOADED, listen on the runtime instead
vm.on('PROJECT_LOADED', () => undefined);

// @ts-expect-error the VM forwards PERIPHERAL_REQUEST_ERROR without a payload
vm.on('PERIPHERAL_REQUEST_ERROR', (error: {message: string}) => error);

// @ts-expect-error workspace updates are VM events, not runtime events
runtime.on('workspaceUpdate', () => undefined);

// @ts-expect-error listeners must match the payload
runtime.on('MIC_LISTENING', (listening: string) => listening);

// @ts-expect-error the project's platform is not validated, so it is unknown
runtime.on('PLATFORM_MISMATCH', (platform: {name: string}) => platform.name);

// @ts-expect-error the runtime has no projectName
export const projectName = runtime.projectName;

// @ts-expect-error startHats upper-cases match fields, so they must be strings
runtime.startHats('event_whenkeypressed', {KEY_OPTION: 32});

// @ts-expect-error toggleScript takes a target, not a target id
runtime.toggleScript('top', {target: 'stage'});

// @ts-expect-error getTargetById can miss
export const missing: VirtualMachine.RenderedTarget = runtime.getTargetById('sprite');

// @ts-expect-error deleteCostume can return a rejected promise or null instead of a restore function
export const restoreDirect: VirtualMachine.RestoreFunction = vm.deleteCostume(0);

// @ts-expect-error reorder results are promises while a collaboration handler is set
export const reorderedDirect: boolean = vm.reorderSound('sprite', 0, 1);

// @ts-expect-error the renderer declaration only covers what scratch-gui calls
renderer?.updateSVGSkin(1, '<svg/>');

// @ts-expect-error extension modes are a closed set
vm.securityManager.getSandboxMode = () => 'sandboxed';

// @ts-expect-error ArgumentType is read-only
ArgumentType.STRING = 'text';

// @ts-expect-error rotation styles are a closed set
editing?.postSpriteInfo({rotationStyle: 'sideways'});

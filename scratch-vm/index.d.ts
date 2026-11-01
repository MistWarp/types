declare module 'scratch-vm' {
    type Listener<Args extends unknown[]> = (...args: Args) => void;

    interface TypedEmitter<Events extends {[K in keyof Events]: unknown[]}> {
        on<K extends keyof Events & string>(event: K, listener: Listener<Events[K]>): this;
        once<K extends keyof Events & string>(event: K, listener: Listener<Events[K]>): this;
        off<K extends keyof Events & string>(event: K, listener: Listener<Events[K]>): this;
        addListener<K extends keyof Events & string>(event: K, listener: Listener<Events[K]>): this;
        removeListener<K extends keyof Events & string>(event: K, listener: Listener<Events[K]>): this;
        emit<K extends keyof Events & string>(event: K, ...args: Events[K]): boolean;
    }

    namespace VirtualMachine {
        type VariableValue = string | number | boolean | (string | number | boolean)[];

        interface Variable {
            id: string;
            name: string;
            type: '' | 'list' | 'broadcast_msg';
            value: VariableValue;
            isCloud: boolean;
        }

        interface Costume {
            name: string;
            assetId: string;
            md5: string;
            dataFormat: string;
            bitmapResolution: number;
            rotationCenterX: number;
            rotationCenterY: number;
            skinId?: number;
            size?: [number, number];
        }

        interface Sound {
            name: string;
            assetId: string;
            md5: string;
            dataFormat: string;
            format?: string;
            rate: number;
            sampleCount: number;
            soundId?: string;
        }

        interface Block {
            id: string;
            opcode: string;
            next: string | null;
            parent: string | null;
            inputs: Record<string, {name: string; block: string | null; shadow: string | null}>;
            fields: Record<string, {name: string; value: unknown; id?: string}>;
            shadow: boolean;
            topLevel: boolean;
            x?: number;
            y?: number;
            mutation?: Record<string, unknown> | null;
            comment?: string;
        }

        interface Blocks {
            _blocks: Record<string, Block>;
            getBlock(blockId: string): Block | undefined;
            getScripts(): string[];
            getOpcode(block: Block): string | null;
            createBlock(block: Partial<Block> & {id: string; opcode: string}): void;
            deleteBlock(blockId: string): void;
            toXML(comments?: Record<string, unknown>): string;
        }

        interface Sprite {
            name: string;
            costumes: Costume[];
            sounds: Sound[];
            clones: RenderedTarget[];
        }

        interface Target {
            id: string;
            runtime: Runtime;
            blocks: Blocks;
            variables: Record<string, Variable>;
            comments: Record<string, unknown>;
            isStage: boolean;
            getName(): string;
            lookupVariableById(id: string): Variable | undefined;
            lookupVariableByNameAndType(name: string, type?: Variable['type'], skipStage?: boolean): Variable | null;
            lookupOrCreateList(id: string, name: string): Variable;
            getAllVariableNamesInScopeByType(type: Variable['type'], skipStage?: boolean): string[];
        }

        interface RenderedTarget extends Target {
            sprite: Sprite;
            x: number;
            y: number;
            direction: number;
            size: number;
            visible: boolean;
            draggable: boolean;
            rotationStyle: string;
            currentCostume: number;
            volume: number;
            isOriginal: boolean;
            drawableID: number;
            getCostumes(): Costume[];
            getSounds(): Sound[];
            getCurrentCostume(): Costume;
            setXY(x: number, y: number, force?: boolean): void;
            toJSON(): Record<string, unknown>;
        }

        interface Thread {
            topBlock: string;
            target: Target;
            status: number;
            stack: string[];
        }

        interface RuntimeOptions {
            maxClones: number;
            miscLimits: boolean;
            fencing: boolean;
        }

        interface CompilerOptions {
            enabled: boolean;
            warpTimer: boolean;
        }

        interface GlowData {
            id: string;
        }

        interface TargetsUpdate {
            readonly targetList: Record<string, unknown>[];
            editingTarget: string | null;
        }

        interface WorkspaceUpdate {
            xml: string;
        }

        interface RuntimeEvents {
            SCRIPT_GLOW_ON: [GlowData];
            SCRIPT_GLOW_OFF: [GlowData];
            BLOCK_GLOW_ON: [GlowData];
            BLOCK_GLOW_OFF: [GlowData];
            HAS_CLOUD_DATA_UPDATE: [boolean];
            TURBO_MODE_ON: [];
            TURBO_MODE_OFF: [];
            RUNTIME_OPTIONS_CHANGED: [RuntimeOptions];
            COMPILER_OPTIONS_CHANGED: [CompilerOptions];
            FRAMERATE_CHANGED: [number];
            INTERPOLATION_CHANGED: [boolean];
            STAGE_SIZE_CHANGED: [number, number];
            COMPILE_ERROR: [Target, unknown];
            BEFORE_EXECUTE: [];
            AFTER_EXECUTE: [];
            ASSET_PROGRESS: [number, number];
            PROJECT_START: [];
            PROJECT_RUN_START: [];
            PROJECT_RUN_STOP: [];
            PROJECT_STOP_ALL: [];
            STOP_FOR_TARGET: [Target, Thread | undefined];
            VISUAL_REPORT: [{id: string; value: unknown}];
            PROJECT_LOADED: [];
            PROJECT_CHANGED: [];
            TOOLBOX_EXTENSIONS_NEED_UPDATE: [];
            TARGETS_UPDATE: [boolean];
            SPRITE_INFO_CHANGED: [];
            MONITORS_UPDATE: [unknown];
            BLOCK_DRAG_UPDATE: [boolean];
            BLOCK_DRAG_END: [Block[], string];
            EXTENSION_ADDED: [unknown];
            EXTENSION_REMOVED: [unknown];
            EXTENSIONS_REORDERED: [unknown];
            EXTENSION_FIELD_ADDED: [string, unknown];
            PERIPHERAL_LIST_UPDATE: [Record<string, unknown>];
            USER_PICKED_PERIPHERAL: [Record<string, unknown>];
            PERIPHERAL_CONNECTED: [];
            PERIPHERAL_DISCONNECTED: [];
            PERIPHERAL_REQUEST_ERROR: [];
            PERIPHERAL_CONNECTION_LOST_ERROR: [{extensionId: string}];
            PERIPHERAL_SCAN_TIMEOUT: [];
            MIC_LISTENING: [boolean];
            BLOCKSINFO_UPDATE: [unknown];
            RUNTIME_STARTED: [];
            RUNTIME_STOPPED: [];
            RUNTIME_DISPOSED: [];
            BLOCKS_NEED_UPDATE: [];
            PLATFORM_MISMATCH: [unknown, (accepted: boolean) => void];
        }

        interface VirtualMachineEvents extends RuntimeEvents {
            workspaceUpdate: [WorkspaceUpdate];
            targetsUpdate: [TargetsUpdate];
            playgroundData: [{blocks: Blocks; threads: string}];
        }

        interface Runtime extends TypedEmitter<RuntimeEvents> {
            targets: RenderedTarget[];
            executableTargets: RenderedTarget[];
            threads: Thread[];
            stageWidth: number;
            stageHeight: number;
            currentMSecs: number;
            currentStepTime: number;
            turboMode: boolean;
            runtimeOptions: RuntimeOptions;
            compilerOptions: CompilerOptions;
            ioDevices: Record<string, unknown>;
            getTargetById(targetId: string): RenderedTarget | undefined;
            getTargetForStage(): RenderedTarget | undefined;
            getSpriteTargetByName(name: string): RenderedTarget | undefined;
            getEditingTarget(): RenderedTarget | null;
            setEditingTarget(target: RenderedTarget): void;
            emitProjectChanged(): void;
            startHats(opcode: string, matchFields?: Record<string, unknown>, target?: Target): Thread[] | undefined;
            greenFlag(): void;
            stopAll(): void;
            requestRedraw(): void;
        }
    }

    class VirtualMachine implements TypedEmitter<VirtualMachine.VirtualMachineEvents> {
        constructor();
        runtime: VirtualMachine.Runtime;
        editingTarget: VirtualMachine.RenderedTarget | null;
        renderer: unknown;

        on<K extends keyof VirtualMachine.VirtualMachineEvents & string>(
            event: K, listener: Listener<VirtualMachine.VirtualMachineEvents[K]>): this;
        once<K extends keyof VirtualMachine.VirtualMachineEvents & string>(
            event: K, listener: Listener<VirtualMachine.VirtualMachineEvents[K]>): this;
        off<K extends keyof VirtualMachine.VirtualMachineEvents & string>(
            event: K, listener: Listener<VirtualMachine.VirtualMachineEvents[K]>): this;
        addListener<K extends keyof VirtualMachine.VirtualMachineEvents & string>(
            event: K, listener: Listener<VirtualMachine.VirtualMachineEvents[K]>): this;
        removeListener<K extends keyof VirtualMachine.VirtualMachineEvents & string>(
            event: K, listener: Listener<VirtualMachine.VirtualMachineEvents[K]>): this;
        emit<K extends keyof VirtualMachine.VirtualMachineEvents & string>(
            event: K, ...args: VirtualMachine.VirtualMachineEvents[K]): boolean;

        start(): void;
        stop(): void;
        quit(): void;
        greenFlag(): void;
        stopAll(): void;
        clear(): void;
        setTurboMode(turboModeOn: boolean): void;
        setFramerate(framerate: number): void;
        setInterpolation(interpolationEnabled: boolean): void;
        setRuntimeOptions(runtimeOptions: Partial<VirtualMachine.RuntimeOptions>): void;
        setCompilerOptions(compilerOptions: Partial<VirtualMachine.CompilerOptions>): void;
        setStageSize(width: number, height: number): void;
        loadProject(input: ArrayBuffer | ArrayBufferView | string | object, options?: {
            editSessionActive?: () => boolean;
        }): Promise<void>;
        saveProjectSb3(type?: string, options?: Record<string, unknown>): Promise<Blob>;
        toJSON(optTargetId?: string, serializationOptions?: Record<string, unknown>): string;
        setEditingTarget(targetId: string): void;
        emitTargetsUpdate(triggerProjectChange?: boolean): void;
        emitWorkspaceUpdate(): void;
        postIOData(device: string, data: unknown): void;
        getTargetIdForDrawableId(drawableId: number): string | null;
        renameSprite(targetId: string, newName: string): void;
        deleteSprite(targetId: string): () => Promise<void>;
        duplicateSprite(targetId: string): Promise<void>;
        renameCostume(costumeIndex: number, newName: string): void;
        renameSound(soundIndex: number, newName: string): void;
        deleteCostume(costumeIndex: number): () => void;
        deleteSound(soundIndex: number): () => void;
        setVariableValue(targetId: string, variableId: string, value: VirtualMachine.VariableValue): boolean;
        getVariableValue(targetId: string, variableId: string): VirtualMachine.VariableValue | null;
    }

    export = VirtualMachine;
}

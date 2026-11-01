declare module 'scratch-vm' {
    import {RuntimeCustomEvents, VirtualMachineCustomEvents} from 'scratch-vm/events';

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
        type VariableType = '' | 'list' | 'broadcast_msg';

        type ScalarValue = string | number | boolean;

        type VariableValue = ScalarValue | ScalarValue[];

        interface Variable extends VariableInternals {
            id: string;
            name: string;
            type: VariableType;
            value: VariableValue;
            isCloud: boolean;
            toXML(isLocal?: boolean): string;
        }

        interface Comment {
            id: string;
            text: string;
            x: number;
            y: number;
            width: number;
            height: number;
            minimized: boolean;
            blockId: string | null;
            toXML(): string;
        }

        interface Frame {
            id: string;
            title: string;
            x: number;
            y: number;
            width: number;
            height: number;
            collapsed: boolean;
            blocks: string[];
            toXML(): string;
        }

        interface StorageAssetType {
            contentType: string;
            name: string;
            runtimeFormat: string;
            immutable: boolean;
        }

        interface StorageAsset {
            assetType: StorageAssetType;
            assetId: string;
            dataFormat: string;
            data: Uint8Array;
            clean: boolean;
            decodeText(): string;
            encodeDataURI(contentType?: string): string;
        }

        interface Costume {
            name: string;
            assetId: string;
            md5: string;
            dataFormat: string;
            bitmapResolution: number;
            rotationCenterX: number;
            rotationCenterY: number;
            asset?: StorageAsset;
            skinId?: number | null;
            size?: [number, number];
            textLayerAsset?: StorageAsset;
            broken?: Partial<Costume>;
        }

        interface Sound {
            name: string;
            assetId: string;
            md5: string;
            dataFormat: string;
            format?: string;
            rate: number;
            sampleCount: number;
            asset?: StorageAsset;
            soundId?: string;
            broken?: Partial<Sound>;
        }

        interface BlockInput {
            name: string;
            block: string | null;
            shadow: string | null;
        }

        interface BlockField {
            name: string;
            value: unknown;
            id?: string;
            variableType?: VariableType;
        }

        interface Block {
            id: string;
            opcode: string;
            next: string | null;
            parent: string | null;
            inputs: Record<string, BlockInput>;
            fields: Record<string, BlockField>;
            shadow: boolean;
            topLevel: boolean;
            x?: number;
            y?: number;
            mutation?: Record<string, unknown> | null;
            comment?: string;
            isMonitored?: boolean;
        }

        interface BlockChange {
            element: 'field' | 'mutation' | 'checkbox';
            id: string;
            name?: string;
            value: unknown;
        }

        interface Blocks extends BlocksInternals {
            runtime: Runtime;
            forceNoGlow: boolean;
            revision: number;
            getBlock(blockId: string): Block | undefined;
            getScripts(): string[];
            getNextBlock(id: string): string | null;
            getTopLevelScript(id: string): string | null;
            createBlock(block: Block): void;
            changeBlock(args: BlockChange): void;
            duplicate(): Blocks;
            resetCache(): void;
            toXML(comments?: Record<string, Comment>): string;
            blockToXML(blockId: string, comments?: Record<string, Comment>): string | undefined;
        }

        interface Sprite extends SpriteInternals {
            runtime: Runtime;
            blocks: Blocks;
            name: string;
            costumes: Costume[];
            sounds: Sound[];
            clones: RenderedTarget[];
            soundBank: unknown;
        }

        interface Target {
            id: string;
            runtime: Runtime;
            blocks: Blocks;
            variables: Record<string, Variable>;
            comments: Record<string, Comment>;
            frames: Record<string, Frame>;
            extensionStorage: Record<string, unknown>;
            declRevision: number;
            getName(): string;
            lookupVariableById(id: string): Variable | undefined;
            lookupVariableByNameAndType(name: string, type?: VariableType, skipStage?: boolean): Variable | null;
            createVariable(id: string, name: string, type: VariableType, isCloud?: boolean): void;
            renameVariable(id: string, newName: string): void;
            deleteVariable(id: string): void;
            getAllVariableNamesInScopeByType(type?: VariableType, skipStage?: boolean): string[];
            createComment(id: string, blockId: string | null, text: string, x: number, y: number,
                width: number, height: number, minimized?: boolean): void;
            deleteComment(id: string, blockId?: string | null): void;
        }

        type RotationStyle = 'all around' | 'left-right' | "don't rotate";

        interface SpriteInfo {
            x?: number;
            y?: number;
            force?: boolean;
            direction?: number;
            draggable?: boolean;
            rotationStyle?: RotationStyle;
            visible?: boolean;
            size?: number;
        }

        interface SpriteInfoChange {
            x?: number;
            y?: number;
            direction?: number;
            size?: number;
            visible?: boolean;
            rotationStyle?: RotationStyle;
        }

        interface Bounds {
            left: number;
            right: number;
            top: number;
            bottom: number;
        }

        interface TargetJSON {
            id: string;
            name: string;
            isStage: boolean;
            x: number;
            y: number;
            size: number;
            direction: number;
            draggable: boolean;
            currentCostume: number;
            costume: Costume | undefined;
            costumeCount: number;
            visible: boolean;
            rotationStyle: RotationStyle;
            comments: Record<string, Comment>;
            frames: Record<string, Frame>;
            blocks: Record<string, Block>;
            variables: Record<string, Variable>;
            costumes: Costume[];
            sounds: Sound[];
            textToSpeechLanguage: string | null;
            tempo: number;
            volume: number;
            videoTransparency: number;
            videoState: string;
        }

        interface RenderedTarget extends Target {
            sprite: Sprite;
            renderer: Renderer | null | undefined;
            drawableID: number | null;
            dragging: boolean;
            isOriginal: boolean;
            isStage: boolean;
            x: number;
            y: number;
            direction: number;
            draggable: boolean;
            visible: boolean;
            size: number;
            currentCostume: number;
            rotationStyle: RotationStyle;
            volume: number;
            tempo: number;
            videoTransparency: number;
            videoState: string;
            textToSpeechLanguage: string | null;
            isSprite(): boolean;
            setVisible(visible: boolean): void;
            setSize(size: number): void;
            setCostume(index: number): void;
            getCostumes(): Costume[];
            addCostume(costumeObject: Costume, index?: number): void;
            renameCostume(costumeIndex: number, newName: string): void | Promise<unknown>;
            deleteCostume(index: number): Costume | null;
            reorderCostume(costumeIndex: number, newIndex: number): boolean;
            getSounds(): Sound[];
            addSound(soundObject: Sound, index?: number): void;
            renameSound(soundIndex: number, newName: string): void | Promise<unknown>;
            deleteSound(index: number): Sound | null;
            reorderSound(soundIndex: number, newIndex: number): boolean;
            getBounds(): Bounds | null;
            goToFront(): void;
            makeClone(): RenderedTarget | null;
            duplicate(): Promise<RenderedTarget>;
            postSpriteInfo(data: SpriteInfo): void;
            startDrag(): void;
            stopDrag(): void;
            toJSON(): TargetJSON;
            dispose(): void;
        }

        interface StackFrame {
            isLoop: boolean;
            warpMode: boolean;
            justReported: unknown;
            reporting: string;
            reported: Record<string, unknown> | null;
            waitingReporter: unknown;
            params: Record<string, unknown> | null;
            executionContext: Record<string, unknown> | null;
            op: unknown;
        }

        interface Thread {
            topBlock: string;
            stack: string[];
            stackFrames: StackFrame[];
            status: 0 | 1 | 2 | 3 | 4;
            isKilled: boolean;
            target: RenderedTarget;
            blockContainer: Blocks;
            isCompiled: boolean;
            warpTimer: unknown;
            timer: unknown;
            compatibilityStackFrame: StackFrame | null;
            stackClick: boolean;
            updateMonitor: boolean;
            getId(): string;
            peekStack(): string | undefined;
            peekStackFrame(): StackFrame | undefined;
            popStack(): string | undefined;
            goToNextBlock(): void;
        }

        interface MonitorDelta {
            id?: string | null;
            spriteName?: string | null;
            targetId?: string | null;
            opcode?: string | null;
            value?: unknown;
            params?: unknown;
            mode?: string | null;
            sliderMin?: number | null;
            sliderMax?: number | null;
            isDiscrete?: boolean | null;
            x?: number | null;
            y?: number | null;
            width?: number | null;
            height?: number | null;
            visible?: boolean | null;
        }

        type ExternalMonitorDelta = MonitorDelta | {toJS(): MonitorDelta} | Map<string, unknown>;

        interface MonitorRecord extends MonitorRecordFields {
            get<K extends keyof MonitorRecordFields>(property: K): MonitorRecordFields[K];
        }

        interface MonitorRecordFields {
            id: string | null;
            spriteName: string | null;
            targetId: string | null;
            opcode: string | null;
            value: unknown;
            params: unknown;
            mode: string;
            sliderMin: number;
            sliderMax: number;
            isDiscrete: boolean;
            x: number | null;
            y: number | null;
            width: number;
            height: number;
            visible: boolean;
        }

        interface MonitorState {
            map: Map<string, MonitorRecord>;
            dirty: boolean;
            readonly size: number;
            get(id: string): MonitorRecord | undefined;
            has(id: string): boolean;
            set(id: string, delta: MonitorDelta): void;
            delete(id: string): void;
            filter(callback: (record: MonitorRecord) => boolean): void;
            empty(): boolean;
            values(): MonitorRecord[];
            valueSeq(): MonitorRecord[];
            shallowClone(): MonitorState;
        }

        interface RuntimeOptions {
            maxClones: number;
            miscLimits: boolean;
            fencing: boolean;
            caseSensitiveLists: boolean;
        }

        interface CompilerOptions {
            enabled: boolean;
            warpTimer: boolean;
        }

        interface ExtensionArgumentInfo {
            type?: string;
            menu?: string;
            defaultValue?: unknown;
        }

        interface ExtensionBlockInfo {
            opcode?: string;
            text?: string | string[];
            blockType?: string;
            arguments?: Record<string, ExtensionArgumentInfo>;
            branchCount?: number;
            isTerminal?: boolean;
            hideFromPalette?: boolean;
            func?: unknown;
        }

        interface CategoryBlock {
            info: ExtensionBlockInfo;
            json?: Record<string, unknown>;
            xml: string;
        }

        interface CategoryInfo {
            id: string;
            name: string;
            showStatusButton?: boolean;
            blockIconURI?: string;
            menuIconURI?: string;
            color1: string;
            color2: string;
            color3: string;
            blocks: CategoryBlock[];
            customFieldTypes: Record<string, unknown>;
            menus: unknown[];
            menuInfo?: Record<string, unknown>;
        }

        interface CategoryXML {
            id: string;
            xml: string;
        }

        interface AddonBlockOptions {
            procedureCode: string;
            callback: (args: Record<string, unknown>, util: {thread: Thread}) => unknown;
            arguments?: string[];
            hidden?: boolean;
            return?: 1 | 2;
            displayName?: string;
        }

        interface AddonBlock extends AddonBlockOptions {
            namesIdsDefaults: [string[], string[], string[]];
        }

        type TestEntitlements = Record<string, string[]>;

        interface GlowData {
            id: string;
        }

        interface ExtensionField {
            name: string;
            implementation: unknown;
        }

        interface ExtensionReloadEntry {
            id: string;
            removed: string[];
            added: string[];
            changed: string[];
        }

        interface ExtensionReloadResult {
            ids: string[];
            removed: string[];
            added: string[];
            changed: string[];
        }

        type ExtensionMode = 'worker' | 'iframe' | 'unsandboxed';

        interface ExtensionReloadDiff extends ExtensionReloadResult {
            mode: ExtensionMode;
            details: unknown;
        }

        interface ExtensionLoadError {
            message: string;
            line: number | null;
            column: number | null;
        }

        interface ExtensionEntry {
            id: string;
            url: string | null;
            kind: 'builtin' | 'embedded' | 'url';
            status: 'loaded' | 'denied' | 'failed';
            mode: ExtensionMode | null;
            name: string;
            error: ExtensionLoadError | null;
        }

        interface ExtensionConsoleMessage {
            extensionId: string;
            level: 'log' | 'info' | 'warn' | 'error' | 'debug';
            message: string;
            line: number | null;
            column: number | null;
        }

        interface ExtensionErrorReport {
            extensionId: string;
            kind: 'load' | 'getInfo' | 'menu' | 'button' | 'block' | 'hat';
            opcode: string | null;
            blockId: string | null;
            targetId: string | null;
            message: string;
            stack: string | null;
            line: number | null;
            column: number | null;
            count: number;
        }

        interface AssetProgressDetail {
            phase: 'download' | 'prepare';
            completed: number;
            total: number;
            overallCompleted: number;
            overallTotal: number;
        }

        type LoadStage = 'unzipping' | 'parsing' | 'checking' | 'building' | 'installing';

        interface LoadProgress {
            stage: LoadStage;
            loaded: number | undefined;
            total: number | undefined;
        }

        interface RuntimeEvents extends RuntimeCustomEvents {
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
            ASSET_PROGRESS: [number, number, AssetProgressDetail | undefined];
            PROJECT_START: [];
            PROJECT_RUN_START: [];
            PROJECT_RUN_STOP: [];
            PROJECT_STOP_ALL: [];
            STOP_FOR_TARGET: [Target, Thread | undefined];
            VISUAL_REPORT: [{id: string; value: string}];
            PROJECT_LOADED: [];
            PROJECT_CHANGED: [];
            TOOLBOX_EXTENSIONS_NEED_UPDATE: [];
            TARGETS_UPDATE: [boolean];
            SPRITE_INFO_CHANGED: [RenderedTarget, SpriteInfoChange];
            MONITORS_UPDATE: [MonitorState];
            BLOCK_DRAG_UPDATE: [boolean];
            BLOCK_DRAG_END: [Block[], string];
            EXTENSION_ADDED: [CategoryInfo];
            EXTENSION_REMOVED: [{id: string}];
            EXTENSIONS_REORDERED: [{ids: string[]}];
            EXTENSION_FIELD_ADDED: [ExtensionField];
            PERIPHERAL_LIST_UPDATE: [Record<string, unknown>];
            USER_PICKED_PERIPHERAL: [Record<string, unknown>];
            PERIPHERAL_CONNECTED: [];
            PERIPHERAL_DISCONNECTED: [];
            PERIPHERAL_REQUEST_ERROR: [{message: string; extensionId: string}];
            PERIPHERAL_CONNECTION_LOST_ERROR: [{message: string; extensionId: string}];
            PERIPHERAL_SCAN_TIMEOUT: [];
            MIC_LISTENING: [boolean];
            BLOCKSINFO_UPDATE: [CategoryInfo];
            RUNTIME_STARTED: [];
            RUNTIME_STOPPED: [];
            RUNTIME_DISPOSED: [];
            BLOCKS_NEED_UPDATE: [];
            PLATFORM_MISMATCH: [unknown, () => void];
            THREAD_ERROR: [{thread: Thread; error: unknown}];
            THREAD_STARTED: [Thread];
            BREAKPOINT_HIT: [Thread, string];
            PRODUCTS_CHANGED: [unknown[]];
            ITEMS_CHANGED: [unknown[]];
            ENTITLEMENTS_CHANGED: [TestEntitlements];
            EXTENSION_CONSOLE: [ExtensionConsoleMessage];
            EXTENSION_ERROR: [ExtensionErrorReport];
            EXTENSION_RELOADED: [ExtensionReloadEntry];
            TARGET_SCRIPTS_REPLACED: [string];
            KEY_PRESSED: [string];
            SAY: [RenderedTarget, 'say' | 'think', unknown];
            QUESTION: [string | null];
            ANSWER: [string];
            PLAY_NOTE: [number, string];
            targetWasCreated: [RenderedTarget, RenderedTarget | undefined];
            targetWasRemoved: [RenderedTarget];
        }

        type ForwardedRuntimeEvent =
            'SCRIPT_GLOW_ON' | 'SCRIPT_GLOW_OFF' | 'BLOCK_GLOW_ON' | 'BLOCK_GLOW_OFF' |
            'PROJECT_START' | 'PROJECT_RUN_START' | 'PROJECT_RUN_STOP' | 'PROJECT_CHANGED' |
            'VISUAL_REPORT' | 'MONITORS_UPDATE' | 'BLOCK_DRAG_UPDATE' | 'BLOCK_DRAG_END' |
            'EXTENSION_ADDED' | 'EXTENSION_REMOVED' | 'EXTENSIONS_REORDERED' | 'BLOCKSINFO_UPDATE' |
            'PERIPHERAL_LIST_UPDATE' | 'USER_PICKED_PERIPHERAL' | 'PERIPHERAL_CONNECTED' |
            'PERIPHERAL_DISCONNECTED' | 'PERIPHERAL_CONNECTION_LOST_ERROR' | 'PERIPHERAL_SCAN_TIMEOUT' |
            'MIC_LISTENING' | 'RUNTIME_STARTED' | 'RUNTIME_STOPPED' | 'HAS_CLOUD_DATA_UPDATE' |
            'RUNTIME_OPTIONS_CHANGED' | 'COMPILER_OPTIONS_CHANGED' | 'FRAMERATE_CHANGED' |
            'INTERPOLATION_CHANGED' | 'STAGE_SIZE_CHANGED' | 'COMPILE_ERROR' |
            'TURBO_MODE_ON' | 'TURBO_MODE_OFF';

        interface TargetsUpdate {
            readonly targetList: TargetJSON[];
            editingTarget: string | null;
        }

        interface WorkspaceUpdate {
            readonly xml: string;
            headerXml: string;
            blocks: {
                blocks: Record<string, Block>;
                scripts: string[];
                comments: Record<string, Comment>;
            };
        }

        interface VirtualMachineEvents extends Pick<RuntimeEvents, ForwardedRuntimeEvent>, VirtualMachineCustomEvents {
            ASSET_PROGRESS: [number, number];
            EXTENSION_FIELD_ADDED: [ExtensionField, undefined];
            PERIPHERAL_REQUEST_ERROR: [];
            LOAD_PROGRESS: [LoadProgress];
            EXTENSION_LOAD_ERROR: [{extensionID: string; url: string; error: unknown}];
            LOCALE_CHANGED: [string];
            LEGACY_EXTENSION_API: [string];
            CREATE_UNSANDBOXED_EXTENSION_API: [unknown];
            EDIT_COMMAND_ERROR: [unknown];
            targetsUpdate: [TargetsUpdate];
            workspaceUpdate: [WorkspaceUpdate];
            playgroundData: [{blocks: Blocks; threads: string}];
        }

        interface DrawableExtraction {
            imageData: ImageData;
            x: number;
            y: number;
            width: number;
            height: number;
        }

        interface ColorExtraction {
            data: Uint8Array;
            width: number;
            height: number;
            color: {r: number; g: number; b: number; a: number};
        }

        interface RendererEvents {
            UseHighQualityRenderChanged: [boolean];
        }

        interface Renderer extends TypedEmitter<RendererEvents> {
            readonly canvas: HTMLCanvasElement;
            readonly gl: WebGLRenderingContext;
            dirty: boolean;
            useRealLayerIndexes: boolean;
            overlayContainer: HTMLElement;
            customFonts: Record<string, string>;
            draw(): void;
            requestSnapshot(callback: (dataURI: string) => void): void;
            setUseHighQualityRender(enabled: boolean): void;
            resize(pixelsWide: number, pixelsTall: number): void;
            getNativeSize(): [number, number];
            getBounds(drawableID: number): Bounds;
            pick(centerX: number, centerY: number, touchWidth?: number, touchHeight?: number,
                candidateIDs?: number[]): number;
            extractDrawableScreenSpace(drawableID: number): DrawableExtraction;
            extractColor(x: number, y: number, radius: number): ColorExtraction;
        }

        interface SecurityManager {
            getSandboxMode(extensionURL: string): ExtensionMode | Promise<ExtensionMode>;
            canLoadExtensionFromProject(extensionURL: string, options?: {wholeProject: boolean}):
                boolean | Promise<boolean>;
            canCreateUnsandboxedExtension(): boolean | Promise<boolean>;
            canRunUnsandboxedFromFile(fileName: string, source: string, extensionId: string):
                boolean | Promise<boolean>;
            rewriteExtensionURL(extensionURL: string): string | Promise<string>;
            canFetch(resourceURL: string): boolean | Promise<boolean>;
            canOpenWindow(websiteURL: string): boolean | Promise<boolean>;
            canRedirect(websiteURL: string): boolean | Promise<boolean>;
            canRecordAudio(): boolean | Promise<boolean>;
            canRecordVideo(): boolean | Promise<boolean>;
            canReadClipboard(): boolean | Promise<boolean>;
            canNotify(): boolean | Promise<boolean>;
            canGeolocate(): boolean | Promise<boolean>;
            canEmbed(documentURL: string): boolean | Promise<boolean>;
            canDownload(resourceURL: string, name: string): boolean | Promise<boolean>;
        }

        interface ReloadExtensionOptions {
            keepURL?: boolean;
            confirm?: ((diff: ExtensionReloadDiff) => boolean | Promise<boolean>) | null;
            mode?: ExtensionMode | null;
        }

        interface ExtensionManager extends ExtensionManagerInternals {
            securityManager: SecurityManager;
            isExtensionLoaded(extensionID: string): boolean;
            isExtensionUnloaded(extensionId: string): boolean;
            isExtensionURLLoaded(url: string): boolean;
            isBuiltinExtension(extensionId: string): boolean;
            isCoreExtension(extensionId: string): boolean;
            loadExtensionIdSync(extensionId: string): void;
            loadExtensionURL(extensionURL: string, extensionId?: string): Promise<void>;
            setExtensionOrder(orderedExtensionIds: Iterable<string>): Promise<unknown>;
            getExtensionURLs(): Record<string, string>;
            getExtensionEntries(): ExtensionEntry[];
            getExtensionMode(id: string): ExtensionMode | null;
            getExtensionSource(id: string, options?: {fetch?: boolean; fresh?: boolean}): Promise<string | null>;
            requestUnsandboxedAllowance(id: string, source: string, fileName: string): Promise<boolean>;
            reloadExtension(id: string, source: string, options?: ReloadExtensionOptions):
                Promise<ExtensionReloadResult>;
            createExtension(source: string, options?: {unsandboxed?: boolean}): Promise<string[]>;
            convertToEmbedded(id: string): Promise<void>;
        }

        interface EditCommand {
            method: string;
            args: unknown[];
            targetId: string | null;
            itemId?: string;
            beforeId?: string | null;
            beforeTargetId?: string | null;
        }

        interface EditTargetState {
            id: string;
            name: string;
            isStage: boolean;
            props: Record<string, unknown>;
            blocks?: Record<string, Block>;
            variables?: Record<string, Variable>;
            comments?: Record<string, Comment>;
            frames?: Record<string, Frame>;
            costumes: Record<string, unknown>[];
            sounds: Record<string, unknown>[];
        }

        interface EditingCommands {
            handler: ((command: EditCommand) => unknown) | null;
            canLoadExtension: (url: string) => boolean | Promise<boolean>;
            loadingSnapshot?: boolean;
            extensions: {
                loadExtensionURL: ExtensionManager['loadExtensionURL'];
            };
            request(method: string, args: unknown[], targetId?: string | null): unknown;
            snapshot(includeCode?: boolean, targetId?: string | null): EditTargetState[];
            applyState(target: RenderedTarget, state: Partial<EditTargetState>,
                getAsset: (assetId: string) => unknown, active?: () => boolean): Promise<void>;
        }

        interface Font {
            system: boolean;
            name: string;
            family: string;
            data: Uint8Array | null;
            format: string | null;
        }

        interface InternalFont {
            system: boolean;
            family: string;
            fallback: string;
            asset?: StorageAsset;
        }

        interface FontManager extends TypedEmitter<{change: []}>, FontManagerInternals {
            runtime: Runtime;
            getFonts(): Font[];
            restrictFont(family: string): void;
            getUnusedSystemFont(family: string): string;
            getUnusedCustomFont(family: string): string;
            addSystemFont(family: string, fallback: string): void;
            addCustomFont(family: string, fallback: string, asset: StorageAsset): void;
            deleteFont(index: number): void;
        }

        interface CustomAsset {
            name: string;
            asset: StorageAsset;
        }

        interface AssetManager extends TypedEmitter<{change: []}> {
            runtime: Runtime;
            assets: CustomAsset[];
            getAsset(name: string): CustomAsset | null;
            renameAsset(index: number, newName: string): void;
            deleteAsset(index: number): void;
            getObjectURL(name: string): string;
        }

        interface Sequencer {
            activeThread: Thread | null;
            stepThreads(): Thread[];
            stepThread(thread: Thread): void;
        }

        interface FrameLoop {
            framerate: number;
            running: boolean;
        }

        interface Clock extends ClockInternals {
            pause(): void;
            resume(): void;
        }

        interface Cloud {
            requestUpdateVariable(name: string, value: string | number): void;
        }

        interface Mouse extends MouseInternals {
            usesRightClickDown: boolean;
        }

        interface IoDevices {
            clock: Clock;
            cloud: Cloud;
            keyboard: unknown;
            mouse: Mouse;
            mouseWheel: unknown;
            userData: unknown;
            video: unknown;
        }

        interface ToggleScriptOptions {
            target?: RenderedTarget;
            stackClick?: boolean;
        }

        interface Runtime extends TypedEmitter<RuntimeEvents>, RuntimeInternals {
            vm: VirtualMachine;
            targets: RenderedTarget[];
            executableTargets: RenderedTarget[];
            threads: Thread[];
            sequencer: Sequencer;
            flyoutBlocks: Blocks;
            monitorBlocks: Blocks;
            frameLoop: FrameLoop;
            ioDevices: IoDevices;
            extensionManager: ExtensionManager;
            fontManager: FontManager;
            assetManager: AssetManager;
            renderer?: Renderer;
            storage?: unknown;
            audioEngine?: unknown;
            extensionStorage: Record<string, unknown>;
            cloudOptions: {limit: number};
            stageWidth: number;
            stageHeight: number;
            currentMSecs: number;
            currentStepTime: number;
            turboMode: boolean;
            runtimeOptions: RuntimeOptions;
            compilerOptions: CompilerOptions;
            totalAssetRequests: number;
            finishedAssetRequests: number;
            roturHost?: unknown;
            mistwarpGameHost?: unknown;
            hasCloudData(): boolean;
            canAddCloudVariable(): boolean;
            getNumberOfCloudVariables(): number;
            getTargetById(targetId: string): RenderedTarget | undefined;
            getTargetForStage(): RenderedTarget | undefined;
            getSpriteTargetByName(spriteName: string): RenderedTarget | undefined;
            getEditingTarget(): RenderedTarget | null;
            setEditingTarget(editingTarget: RenderedTarget): void;
            getAllVarNamesOfType(varType: VariableType): string[];
            getIsEdgeActivatedHat(opcode: string): boolean | undefined;
            getLabelForOpcode(extendedOpcode: string): {category: 'extension'; label: string} | undefined;
            getBlocksXML(target?: RenderedTarget | null): CategoryXML[];
            getBlocksJSON(): (Record<string, unknown> | undefined)[];
            getMonitorState(): MonitorState;
            requestUpdateMonitor(delta: ExternalMonitorDelta): boolean;
            startHats(requestedHatOpcode: string, optMatchFields?: Record<string, string> | null,
                optTarget?: Target): Thread[] | undefined;
            toggleScript(topBlockId: string, opts?: ToggleScriptOptions): void;
            stopForTarget(target: Target, optThreadException?: Thread): void;
            greenFlag(): void;
            stopAll(): void;
            clonesAvailable(): boolean;
            emitProjectChanged(): void;
            requestRedraw(): void;
            resetProgress(): void;
            setRuntimeOptions(runtimeOptions: Partial<RuntimeOptions>): void;
            setBreakpoints(blockIds: Iterable<string> | null): void;
            getAddonBlock(procedureCode: string): AddonBlock | null;
            getStoredProjectOptions(): Record<string, unknown> | null | undefined;
            getCategoryOrder(): string[];
            setCategoryOrder(categoryOrder: string[]): void;
            ownsProduct(productId: string, username: string): boolean;
        }

        interface RuntimeInternals {
            _blockInfo: CategoryInfo[];
            _hats: Record<string, {edgeActivated?: boolean; restartExistingThreads?: boolean}>;
            _cloneCounter: number;
            _monitorState: MonitorState;
            _roturHostResolved?: unknown;
            _mistwarpGamesHost?: unknown;
            _step(): void;
            _getMonitorThreadCount(threads: Thread[]): number;
        }

        interface VariableInternals {
            _monitorUpToDate?: boolean;
        }

        interface SpriteInternals {
            costumes_: Costume[];
        }

        interface BlocksInternals {
            _blocks: Record<string, Block>;
            _scripts: string[];
        }

        interface FontManagerInternals {
            fonts: InternalFont[];
        }

        interface ExtensionManagerInternals {
            _loadedExtensions: Map<string, string>;
        }

        interface ClockInternals {
            _paused: boolean;
            _pausedTime: number | null;
        }

        interface MouseInternals {
            _scratchX: number;
            _scratchY: number;
        }

        interface VirtualMachineInternals {
            _projectLoadGeneration?: number;
        }

        interface LoadProjectOptions {
            editSessionActive?: () => boolean;
        }

        interface SerializationOptions {
            allowOptimization?: boolean;
        }

        interface ExtensionUsage {
            id: string;
            targets: {
                targetId: string;
                name: string;
                isStage: boolean;
                blocks: number;
                hatScripts: number;
                monitors: number;
            }[];
            totalBlocks: number;
            totalHatScripts: number;
            totalMonitors: number;
            storageKeys: number;
        }

        interface FractchTargetContext {
            id: string;
            name: string;
            isStage: boolean;
            changeKey: string;
            blocksRevision: number;
            declRevision: number;
            variables: unknown;
            lists: unknown;
            broadcasts: unknown;
            keptLists: unknown;
            blocks: Record<string, unknown>;
            comments: Record<string, unknown>;
            primitiveIds: Record<string, Record<string, {block: string | null; shadow: string | null}>>;
            obscuredShadows: Record<string, ({id: string; blocks: Record<string, Block>} | null)[]>;
            monitors: unknown[];
            costumes: {name: string}[];
            sounds: {name: string}[];
        }

        interface ExtensionSignatureArgument {
            name: string;
            type: string | undefined;
            menu: string | null;
        }

        interface ExtensionSignatureBlock {
            opcode: string;
            blockType: string | undefined;
            text: string;
            branchCount: number;
            isTerminal: boolean;
            arguments: ExtensionSignatureArgument[];
        }

        interface ExtensionSignature {
            blocks: ExtensionSignatureBlock[];
            menus: Record<string, {acceptReporters: boolean; items: string[] | null}>;
        }

        interface FractchContext {
            generation: number;
            extensionSignatureHash: string;
            extensionSignatures: Record<string, ExtensionSignature>;
            targets: FractchTargetContext[];
        }

        type RestoreFunction = () => Promise<unknown>;

        interface ZipOutputs {
            base64: string;
            string: string;
            text: string;
            binarystring: string;
            array: number[];
            uint8array: Uint8Array;
            arraybuffer: ArrayBuffer;
            blob: Blob;
            nodebuffer: Uint8Array;
        }

        type ZipType = keyof ZipOutputs;
    }

    class VirtualMachine implements TypedEmitter<VirtualMachine.VirtualMachineEvents>,
        VirtualMachine.VirtualMachineInternals {
        constructor();
        runtime: VirtualMachine.Runtime;
        editingTarget: VirtualMachine.RenderedTarget | null;
        readonly renderer: VirtualMachine.Renderer | undefined;
        readonly assets: VirtualMachine.StorageAsset[];
        extensionManager: VirtualMachine.ExtensionManager;
        securityManager: VirtualMachine.SecurityManager;
        editingCommands: VirtualMachine.EditingCommands;
        exports: Record<string, unknown>;
        _projectLoadGeneration?: number;

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
        setCompatibilityMode(compatibilityModeOn: boolean): void;
        setFramerate(framerate: number): void;
        setInterpolation(interpolationEnabled: boolean): void;
        setRuntimeOptions(runtimeOptions: Partial<VirtualMachine.RuntimeOptions>): void;
        setCompilerOptions(compilerOptions: Partial<VirtualMachine.CompilerOptions>): void;
        setStageSize(width: number, height: number): void;
        addAddonBlock(options: VirtualMachine.AddonBlockOptions): void;
        getAddonBlock(procedureCode: string): VirtualMachine.AddonBlock | null;
        storeProjectOptions(extraOptions?: Record<string, unknown> | null): void;
        getProducts(): unknown[];
        setProducts(products: unknown[]): void;
        getItems(): unknown[];
        setItems(items: unknown[]): void;
        getTestEntitlements(): VirtualMachine.TestEntitlements;
        grantProduct(productId: string, username: string): boolean;
        revokeProduct(productId: string, username: string): boolean;
        ownsProduct(productId: string, username: string): boolean;
        handleExtensionButtonPress(buttonData: string): void;
        postIOData(device: string, data: unknown): void;
        setVideoProvider(videoProvider: unknown): void;
        setCloudProvider(cloudProvider: unknown): void;
        scanForPeripheral(extensionId: string): void;
        connectPeripheral(extensionId: string, peripheralId: number | string): void;
        disconnectPeripheral(extensionId: string): void;
        getPeripheralIsConnected(extensionId: string): boolean;
        loadProject(input: ArrayBuffer | ArrayBufferView | string | object,
            options?: VirtualMachine.LoadProjectOptions): Promise<void>;
        saveProjectSb3<T extends VirtualMachine.ZipType = 'blob'>(type?: T, options?: VirtualMachine.SerializationOptions):
            Promise<VirtualMachine.ZipOutputs[T]>;
        saveProjectSb3Stream(type?: VirtualMachine.ZipType, options?: VirtualMachine.SerializationOptions): unknown;
        saveProjectSb3DontZip(options?: VirtualMachine.SerializationOptions): Record<string, Uint8Array>;
        exportSprite<T extends VirtualMachine.ZipType = 'blob'>(targetId: string, optZipType?: T):
            Promise<VirtualMachine.ZipOutputs[T]>;
        toJSON(optTargetId?: string | null, serializationOptions?: VirtualMachine.SerializationOptions): string;
        deserializeProject(projectJSON: object, zip: unknown, active?: () => boolean): Promise<void>;
        addSprite(input: ArrayBuffer | ArrayBufferView | string | object): Promise<unknown>;
        addCostume(md5ext: string, costumeObject: object, optTargetId?: string | null,
            optVersion?: number | null): Promise<unknown>;
        addCostumeFromLibrary(md5ext: string, costumeObject: object): Promise<unknown>;
        duplicateCostume(costumeIndex: number): Promise<unknown>;
        renameCostume(costumeIndex: number, newName: string): void;
        deleteCostume(costumeIndex: number): VirtualMachine.RestoreFunction | Promise<never> | null;
        addSound(soundObject: object, optTargetId?: string | null): Promise<unknown>;
        duplicateSound(soundIndex: number): Promise<unknown>;
        renameSound(soundIndex: number, newName: string): void;
        getSoundBuffer(soundIndex: number): AudioBuffer | null;
        updateSoundBuffer(soundIndex: number, newBuffer: AudioBuffer, soundEncoding?: ArrayBuffer | Uint8Array): void | Promise<unknown>;
        deleteSound(soundIndex: number): VirtualMachine.RestoreFunction | Promise<never> | null;
        getCostume(costumeIndex: number): string | null;
        getExportedCostume(costumeObject: VirtualMachine.Costume): Uint8Array;
        getExportedCostumeBase64(costumeObject: VirtualMachine.Costume): string;
        updateBitmap(costumeIndex: number, bitmap: ImageData, rotationCenterX: number, rotationCenterY: number,
            bitmapResolution: number): Promise<unknown> | undefined;
        updateSvg(costumeIndex: number, svg: string, rotationCenterX: number, rotationCenterY: number): void | Promise<unknown>;
        addBackdrop(md5ext: string, backdropObject: object): Promise<unknown>;
        renameSprite(targetId: string, newName: string): void | Promise<unknown>;
        renameVariable(variableId: string, newName: string): boolean;
        renameBroadcast(broadcastId: string, newName: string): boolean;
        deleteSprite(targetId: string): VirtualMachine.RestoreFunction;
        duplicateSprite(targetId: string): Promise<unknown>;
        attachAudioEngine(audioEngine: unknown): void;
        attachRenderer(renderer: VirtualMachine.Renderer): void;
        attachV2BitmapAdapter(bitmapAdapter: unknown): void;
        attachStorage(storage: unknown): void;
        setLocale(locale: string, messages: Record<string, string>): Promise<unknown>;
        getLocale(): string;
        blockListener(e: object): void;
        flyoutBlockListener(e: object): void;
        monitorBlockListener(e: object): void;
        clearFlyoutBlocks(): void;
        setEditingTarget(targetId: string): void;
        exportStandaloneBlocks(blockObjects: VirtualMachine.Block[]): unknown;
        shareBlocksToTarget(blocks: unknown, targetId: string, optFromTargetId?: string | null): Promise<unknown>;
        shareCostumeToTarget(costumeIndex: number, targetId: string): Promise<unknown>;
        shareSoundToTarget(soundIndex: number, targetId: string): Promise<unknown>;
        refreshWorkspace(): void;
        emitTargetsUpdate(triggerProjectChange?: boolean): void;
        emitWorkspaceUpdate(): void;
        getFractchContext(targetId?: string): VirtualMachine.FractchContext;
        getCodeStateHash(targetId: string): string | null;
        replaceTargetScripts(targetId: string, change: unknown): unknown;
        getExtensionUsage(id: string): VirtualMachine.ExtensionUsage;
        removeExtensionFromProject(ids: string | string[]): void;
        getTargetIdForDrawableId(drawableId: number): string | null;
        reorderTarget(targetIndex: number, newIndex: number): boolean | Promise<unknown>;
        reorderCostume(targetId: string, costumeIndex: number, newIndex: number): boolean | Promise<unknown>;
        reorderSound(targetId: string, soundIndex: number, newIndex: number): boolean | Promise<unknown>;
        startDrag(targetId: string): void;
        stopDrag(targetId: string): void;
        postSpriteInfo(data: VirtualMachine.SpriteInfo): void | Promise<unknown>;
        setVariableValue(targetId: string, variableId: string, value: VirtualMachine.VariableValue):
            boolean | Promise<unknown>;
        getVariableValue(targetId: string, variableId: string): VirtualMachine.VariableValue | null;
    }

    export = VirtualMachine;
}

declare module 'scratch-vm/src/extension-support/argument-type' {
    const ArgumentType: {
        readonly ANGLE: 'angle';
        readonly BOOLEAN: 'Boolean';
        readonly COLOR: 'color';
        readonly NUMBER: 'number';
        readonly STRING: 'string';
        readonly MATRIX: 'matrix';
        readonly NOTE: 'note';
        readonly IMAGE: 'image';
        readonly COSTUME: 'costume';
        readonly SOUND: 'sound';
    };
    export = ArgumentType;
}

declare module 'scratch-vm/src/extension-support/block-type' {
    const BlockType: {
        readonly BOOLEAN: 'Boolean';
        readonly BUTTON: 'button';
        readonly LABEL: 'label';
        readonly COMMAND: 'command';
        readonly CONDITIONAL: 'conditional';
        readonly EVENT: 'event';
        readonly HAT: 'hat';
        readonly LOOP: 'loop';
        readonly REPORTER: 'reporter';
        readonly XML: 'xml';
    };
    export = BlockType;
}

declare module 'scratch-vm/src/serialization/fractch-context' {
    import VirtualMachine from 'scratch-vm';

    export function hashString(string: string): string;
    export function getExtensionSignatures(runtime: VirtualMachine.Runtime):
        Record<string, VirtualMachine.ExtensionSignature>;
    export function getExtensionSignatureHash(runtime: VirtualMachine.Runtime): string;
    export function getChangeKey(runtime: VirtualMachine.Runtime, target: VirtualMachine.Target,
        signatureHash?: string): string;
}

declare module 'scratch-vm/src/extensions/rotur/core' {
    import VirtualMachine from 'scratch-vm';

    export function scopesUsedByProject(runtime: VirtualMachine.Runtime | null | undefined): string[];
}

declare module 'scratch-vm/src/engine/opcodes.generated.json' {
    interface OpcodeVariadic {
        prefix: string;
        minItems: number;
        collapsed: boolean;
    }

    interface OpcodeInfo {
        inputs: string[];
        fields: string[];
        primitive: boolean;
        hat: boolean;
        definition: boolean;
        variadic?: OpcodeVariadic;
        mutationInputs?: 'argumentids';
    }

    const opcodeTable: {
        sources: string[];
        opcodes: Record<string, OpcodeInfo>;
    };
    export = opcodeTable;
}

declare module 'scratch-vm/events' {
    export interface RuntimeCustomEvents {}

    export interface VirtualMachineCustomEvents {}
}

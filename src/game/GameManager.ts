import Phaser from 'phaser';
import { PreloadScene } from '../scenes/PreloadScene';
import { CountdownScene } from '../scenes/CountdownScene';
import { RedEnvelopeScene } from '../scenes/RedEnvelopeScene';

export class GameManager {
    private game: Phaser.Game | null = null;
    private gameContainer: HTMLElement | null = null;
    private baseWidth: number = 375; // 设计基准宽度
    private baseHeight: number = 667; // 设计基准高度
    private parentRatio: number = 1;
    private debugMode: boolean = false;
    private resources: Array<{ id: string, src: string }> = [];
    private enableRandomAngleParticles: boolean = true;
    private particleFrequenciesConfig: Record<string, number> = {};

    private gameDuration: number | null = null; // 游戏总时长（秒），null 表示无限
    private gameTimerEvent: Phaser.Time.TimerEvent | null = null;
    private currentTime: number = 0; // 当前剩余时间（秒）
    private elapsedTimeInCurrentSecond: number = 0; // 当前秒内已经过去的时间（毫秒）
    private lastUpdateTime: number = 0; // 上次更新的时间戳

    constructor() {
        // 设置 body 样式
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';
    }

    start(
        debugMode: boolean = false, 
        gameDurationInSeconds: number | null = null, 
        resources: Array<{ id: string, src: string }> = [], 
        enableRandomAngle: boolean = true,
        redFrequencyVal: number = 400,
        goldFrequencyVal: number = 800
    ) {
        this.debugMode = debugMode;
        this.gameDuration = gameDurationInSeconds;
        this.resources = resources;
        this.enableRandomAngleParticles = enableRandomAngle;
        this.particleFrequenciesConfig = {
            redFrequency: redFrequencyVal,
            goldFrequency: goldFrequencyVal
        };

        if (this.gameDuration !== null) {
            this.currentTime = this.gameDuration;
        } else {
            this.currentTime = 0; // 对于无限时长的游戏，可以理解为已进行时间或不使用
        }

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio, 2);
        
        // 创建游戏容器并添加到body
        this.gameContainer = document.createElement('div');
        this.gameContainer.style.position = 'fixed';
        this.gameContainer.style.top = '0';
        this.gameContainer.style.left = '0';
        this.gameContainer.style.width = '100%';
        this.gameContainer.style.height = '100%';
        this.gameContainer.style.zIndex = '99999'; // 提高z-index，使其位于页面最上层
        this.gameContainer.style.pointerEvents = 'auto'; // 确保事件能够被接收
        this.gameContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'; // 使用更透明的黑色背景
        this.gameContainer.className = 'phaser-game-container';
        document.body.appendChild(this.gameContainer);

        // 计算宽高比
        this.parentRatio = screenWidth / screenHeight;
        
        // 计算游戏实际尺寸，保持设计比例并考虑设备像素比
        let width, height;
        const baseRatio = this.baseWidth / this.baseHeight;
        
        if (this.parentRatio >= baseRatio) {
            // 窄屏设备，以高度为基准
            height = this.baseHeight;
            width = height * this.parentRatio;
        } else {
            // 宽屏设备，以宽度为基准
            width = this.baseWidth;
            height = width / this.parentRatio;
        }
        
        // 应用设备像素比以提高清晰度
        width = Math.ceil(width * dpr);
        height = Math.ceil(height * dpr);

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            parent: this.gameContainer,
            width,
            height,
            transparent: true, // 设置为透明背景
            backgroundColor: 0x000000,
            scene: [PreloadScene, CountdownScene, RedEnvelopeScene],
            pixelArt: false,
            roundPixels: true,
            antialias: true,
            physics: {
                default: 'arcade',
                arcade: {
                    fps: 60,
                    gravity: { x: 0, y: 0 }
                }
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: width,
                height: height,
                zoom: 1 / dpr  // 高DPI设备的自动缩放
            },
            render: {
                pixelArt: false,
                antialias: true,
                roundPixels: true,
                antialiasGL: true,
                powerPreference: 'high-performance',
                clearBeforeRender: true,
                preserveDrawingBuffer: false,
                failIfMajorPerformanceCaveat: false,
                premultipliedAlpha: true,
                batchSize: 2048 // 增加批处理大小以减少绘制调用
            },
            disableContextMenu: true,
            banner: false,
            autoFocus: true,
            audio: {
                disableWebAudio: true,
                noAudio: true
            }
        };

        this.game = new Phaser.Game(config);
        
        // 将 GameManager 实例存入注册表，方便场景访问
        this.game.registry.set('gameManager', this);
        // 将 resources 存入注册表，方便 PreloadScene 访问
        this.game.registry.set('resources', this.resources);
        // 将 enableRandomAngleParticles 存入注册表
        this.game.registry.set('enableRandomAngleParticles', this.enableRandomAngleParticles);
        this.game.registry.set('particleFrequencies', this.particleFrequenciesConfig);

        // 手动设置Canvas样式
        if (this.game.canvas) {
            // 设置Canvas CSS大小
            this.game.canvas.style.width = '100%';
            this.game.canvas.style.height = '100%';
            // 确保画布清晰
            this.game.canvas.style.imageRendering = 'auto';
            // 设置canvas位于最上层
            this.game.canvas.style.zIndex = '100000';
        }
        
        // 监听窗口大小变化事件
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // 将调试模式状态传递给RedEnvelopeScene
        this.game.events.on('ready', () => {
            const redEnvelopeScene = this.getRedEnvelopeScene();
            if (redEnvelopeScene) {
                redEnvelopeScene.setDebugMode(this.debugMode);
            }
        });
        
        return this.game;
    }

    // 由 RedEnvelopeScene 在其 create 方法末尾调用
    public initializeMainGameTimer(mainGameScene: Phaser.Scene) {
        if (!this.game || !mainGameScene) {
            console.warn("GameManager: Cannot initialize timer, game or scene not ready.");
            return;
        }

        // 通知UI显示倒计时
        if (this.gameDuration !== null) {
            this.game.events.emit('mainGameTimerStarted');
            // 初始化计时相关变量
            this.currentTime = this.gameDuration;
            this.elapsedTimeInCurrentSecond = 0;
            this.lastUpdateTime = Date.now();
        } else {
            // 对于无限时长的游戏，发出事件，让UI可以显示 "∞"
            this.game.events.emit('mainGameTimerStarted');
            this.game.events.emit('gameTimerUpdate', Infinity, 100);
            return; // 无限时长，不启动事件计时器
        }
        
        // 清理可能存在的旧计时器
        if (this.gameTimerEvent) {
            this.gameTimerEvent.remove(false);
        }

        // 创建帧更新计时器
        this.gameTimerEvent = mainGameScene.time.addEvent({
            delay: 33, // 约30帧/秒，对于UI动画足够流畅
            callback: this.onTimerUpdate,
            callbackScope: this,
            loop: true
        });

        // 计时器创建后，立即发出一次准确的初始状态，填充UI
        if (this.game) { 
             this.game.events.emit('gameTimerUpdate', this.currentTime, 100);
        }
    }

    // 每帧更新方法
    private onTimerUpdate() {
        if (this.gameDuration === null || !this.game) return;

        // 计算从上次更新到现在经过的时间（毫秒）
        const now = Date.now();
        const deltaMs = now - this.lastUpdateTime;
        this.lastUpdateTime = now;
        
        // 更新当前秒内已过去的时间
        this.elapsedTimeInCurrentSecond += deltaMs;
        
        // 检查是否需要更新显示的秒数
        let displaySecond = Math.ceil(this.currentTime - (this.elapsedTimeInCurrentSecond / 1000));
        displaySecond = Math.max(0, displaySecond); // 确保不会小于0
        
        // 计算精确的进度比例（带小数）
        const exactTimeRemaining = Math.max(0, this.currentTime - (this.elapsedTimeInCurrentSecond / 1000));
        const progressPercent = (exactTimeRemaining / this.gameDuration) * 100;

        // 如果游戏结束
        if (exactTimeRemaining <= 0) {
            // 先发一次 0 的 UI
            this.game.events.emit('gameTimerUpdate', 0, 0);
            // 延迟 800ms 再真正结束
            setTimeout(() => {
                this.stopGameDueToTimeUp();
            }, 800);
            // 停止计时器
            if (this.gameTimerEvent) {
                this.gameTimerEvent.remove(false);
                this.gameTimerEvent = null;
            }
            return;
        }
        
        // 发送更新事件
        this.game.events.emit('gameTimerUpdate', displaySecond, progressPercent);
        
        // 如果完整的一秒钟过去了，更新currentTime
        if (this.elapsedTimeInCurrentSecond >= 1000) {
            const secondsToSubtract = Math.floor(this.elapsedTimeInCurrentSecond / 1000);
            this.currentTime -= secondsToSubtract;
            this.elapsedTimeInCurrentSecond %= 1000; // 保留剩余毫秒
            
            // 边界检查
            if (this.currentTime <= 0) {
                this.currentTime = 0;
            }
        }
    }

    private stopGameDueToTimeUp() {
        if(this.gameTimerEvent) {
            this.gameTimerEvent.remove(false);
            this.gameTimerEvent = null;
        }

        let clickedCount = { red: 0, gold: 0, total: 0 };
        const scene = this.getRedEnvelopeScene();
        if (scene) {
            scene.getEmitter()?.stop();
            clickedCount = scene.getClickedEnvelopesCount(); // 获取点击数量
        }
        
        // 抛出游戏时间结束事件，并附带点击数量
        this.game?.events.emit('gameTimeUp', clickedCount);
    }

    private calculateProgress(): number {
        if (this.gameDuration === null || this.gameDuration === 0) {
            return 100; // 无限时长或0时长，进度条满
        }
        if (this.currentTime <= 0) return 0;
        return (this.currentTime / this.gameDuration) * 100;
    }

    // 窗口大小变化处理
    private handleResize() {
        if (!this.game) return;
        
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio, 2);
        
        // 重新计算宽高比
        this.parentRatio = screenWidth / screenHeight;
        
        // 计算新的游戏尺寸
        let width, height;
        const baseRatio = this.baseWidth / this.baseHeight;
        
        if (this.parentRatio >= baseRatio) {
            // 窄屏设备，以高度为基准
            height = this.baseHeight;
            width = height * this.parentRatio;
        } else {
            // 宽屏设备，以宽度为基准
            width = this.baseWidth;
            height = width / this.parentRatio;
        }
        
        // 应用设备像素比
        width = Math.ceil(width * dpr);
        height = Math.ceil(height * dpr);
        
        this.game.scale.resize(width, height);
        
        // 确保缩放比例设置正确
        this.game.scale.setZoom(1 / dpr);
    }

    destroy() {
        // 移除窗口事件监听
        window.removeEventListener('resize', this.handleResize.bind(this));
        
        if (this.gameTimerEvent) {
            this.gameTimerEvent.remove(false);
            this.gameTimerEvent = null;
        }
        
        if (this.game) {
            this.game.destroy(true);
            this.game = null;
        }
        
        // 移除游戏容器
        if (this.gameContainer && document.body.contains(this.gameContainer)) {
            document.body.removeChild(this.gameContainer);
            this.gameContainer = null;
        }
    }

    getRedEnvelopeScene(): RedEnvelopeScene | null {
        if (!this.game) return null;
        return this.game.scene.getScene('RedEnvelopeScene') as RedEnvelopeScene;
    }
} 
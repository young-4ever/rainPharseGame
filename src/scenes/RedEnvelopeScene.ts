import Phaser from 'phaser';
// import redEnvelopeImg from "@/assets/red-envelope.png"; // 已移至 PreloadScene
// import gotEnvelopeImg from "@/assets/got-envelope.png"; // 已移至 PreloadScene
// import rainBgImg from "@/assets/rain-bg.png"; // 已移至 PreloadScene
import { GameManager } from '../game/GameManager'; // 确保导入

export class RedEnvelopeScene extends Phaser.Scene {
    private emitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
    private goldEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null; // 新增金红包发射器
    private particles: Phaser.GameObjects.Particles.Particle[] = [];
    private debugText: Phaser.GameObjects.Text | null = null;
    private lastFrameTime: number = 0;
    private frameCount: number = 0;
    private fpsValue: number = 0;
    private isDebugMode: boolean = false;
    private clickedRedCount: number = 0; // 红包点击计数
    private clickedGoldCount: number = 0; // 金红包点击计数
    private applyRandomAngleToParticles: boolean = true; // 新增，用于存储从注册表读取的设置
    
    // 修改倒计时UI相关属性
    private countdownText: Phaser.GameObjects.Text | null = null;
    private progressBar: any | null = null; // 修改为 any 或插件的特定类型
    private clockBg: Phaser.GameObjects.Image | null = null;
    private progressBg: Phaser.GameObjects.Image | null = null;
    private progressBarWidth: number = 248; // 基准设计图尺寸 (会根据屏幕宽度调整)
    private progressBarHeight: number = 19; // 基准设计图尺寸 (会根据屏幕宽度调整)
    private progressBarInnerWidth: number = 246; // 基准设计图尺寸 (会根据屏幕宽度调整)
    private progressBarInnerHeight: number = 16; // 基准设计图尺寸 (会根据屏幕宽度调整)
    private currentProgressWidth: number = 0; // 当前实际显示的进度条宽度 - 可用于设置初始值
    private targetProgressWidth: number = 0;  // 目标进度条宽度
    private lastSecond: number = 0; // 记录上一秒的值
    private timeProgress: number = 0; // 用于平滑插值的时间进度
    private designBaseWidth: number = 375; // 设计稿基准宽度
    // 在类中添加属性用于管理延迟关闭定时器
    private _gameEndTimeout: any = null;

    constructor() {
        super({ key: "RedEnvelopeScene" });
    }

    // 设置调试模式状态
    setDebugMode(enabled: boolean) {
        this.isDebugMode = enabled;
        // 如果调试文本已经创建，则根据调试模式控制其可见性
        if (this.debugText) {
            this.debugText.setVisible(enabled);
        }
    }

    preload() {
        // this.load.image("redEnvelope", redEnvelopeImg); // 已移至 PreloadScene
        // this.load.image("gotEnvelope", gotEnvelopeImg); // 已移至 PreloadScene
        // this.load.image("rainBg", rainBgImg); // 已移至 PreloadScene
    }

    create() {
        // 添加背景图 - 使用contain模式
        const bg = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "rainBg"
        );

        // 计算背景图的缩放比例 - 使用contain模式
        const scaleX = this.cameras.main.width / bg.width;
        const scaleY = this.cameras.main.height / bg.height;
        // 使用Math.min确保图像完全包含在视窗内 (contain模式)
        const scale = Math.min(scaleX, scaleY);

        // 设置背景图属性
        bg.setScale(scale)
           .setOrigin(0.5)
           .setScrollFactor(0)
           .setDepth(0)
           .setBlendMode(Phaser.BlendModes.NORMAL);

        // 重置粒子数组
        this.particles = [];

        // 从注册表读取粒子是否随机角度的设置
        this.applyRandomAngleToParticles = this.registry.get('enableRandomAngleParticles') ?? true;

        // 从注册表读取粒子频率配置
        const particleFrequencies = this.registry.get('particleFrequencies') as Record<string, number> || {};
        const redFreq = particleFrequencies.redFrequency || 400; // 默认红红包频率
        const goldFreq = particleFrequencies.goldFrequency || 800; // 默认金红包频率

        // 根据设置准备粒子旋转配置
        let particleInitialRotateConfig: number | Phaser.Types.GameObjects.Particles.ParticleEmitterConfig["rotate"] = 0;
        if (this.applyRandomAngleToParticles) {
            particleInitialRotateConfig = { min: -180, max: 180 }; // 随机角度
        }

        // 在此处定义回调函数，用于跟踪粒子
        const onEmitCallback = (particle: Phaser.GameObjects.Particles.Particle) => {
            // 将新粒子添加到跟踪数组
            this.particles.push(particle);
            
            // 初始角度设置已移至发射器配置的 rotate 属性
            // if (this.applyRandomAngleToParticles) {
            //     particle.angle = Phaser.Math.RND.angle();
            // } else {
            //     particle.angle = 0;
            // }
            
            return particle;
        };
        
        const onParticleDeathCallback = (particle: Phaser.GameObjects.Particles.Particle) => {
            // 从跟踪数组中移除死亡的粒子
            this.particles = this.particles.filter(p => p !== particle);
            // console.log('粒子已销毁，剩余粒子数量:', this.particles.length); // 调试时可以取消注释
            
            return particle;
        };

        const emitterConfigBase: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
            x: { min: 30, max: this.scale.width - 30 },
            y: -100,
            lifespan: { min: 4000, max: 6000 },
            speedY: { min: 200, max: 400 },
            speedX: { min: -10, max: 10 },
            scale: 1.0,
            rotate: particleInitialRotateConfig,
            quantity: 1,
            blendMode: "NORMAL",
            gravityY: 200,
            frequency: 400, // 红包和金红包可以有不同的频率，如果需要的话
            maxParticles: 30, // 每种发射器的最大粒子数
            maxAliveParticles: 20, // 每种发射器屏幕上最大存活粒子数
            bounds: {
                x: 30,
                y: -100,
                width: this.scale.width - 60,
                height: this.scale.height + 400
            },
            emitCallback: onEmitCallback,
            deathCallback: onParticleDeathCallback
        };

        // 创建红色红包粒子发射器
        this.emitter = this.add.particles(0, 0, "redEnvelope", {
            ...emitterConfigBase,
            frequency: redFreq,
            // maxParticles: redMaxP, // 旧的配置方式
            // maxAliveParticles: redAliveP
        });

        // 创建金色红包粒子发射器
        this.goldEmitter = this.add.particles(0, 0, "goldEnvelope", {
            ...emitterConfigBase,
            frequency: goldFreq,
            // maxParticles: goldMaxP, // 旧的配置方式
            // maxAliveParticles: goldAliveP,
        });

        // 添加死亡区域 - 底部出界就销毁 (两个发射器共用)
        const deathRect = new Phaser.Geom.Rectangle(0, this.scale.height, this.scale.width, 1);
        this.emitter.addDeathZone({
            type: 'onEnter',
            source: deathRect
        });
        this.goldEmitter.addDeathZone({ // 金红包发射器也添加死亡区域
            type: 'onEnter',
            source: deathRect
        });

        // 处理点击/触摸事件的函数
        const handleInteraction = (pointer: Phaser.Input.Pointer) => {
            const { x, y } = pointer;

            if (!this.emitter) return;
            // console.log('🚀 点击事件触发，当前粒子数量:', this.particles.length); // 可以保留或移除
            
            for (let particle of this.particles) {
                const distance = Phaser.Math.Distance.Between(
                    x,
                    y,
                    particle.x,
                    particle.y
                );
                
                if (distance < 100) {
                    // 判断粒子类型并增加对应计数
                    if (particle.texture.key === 'redEnvelope') {
                        this.clickedRedCount++;
                    } else if (particle.texture.key === 'goldEnvelope') {
                        this.clickedGoldCount++;
                    }
                    particle.kill();
                    // this.clickedEnvelopesCount++; // 旧的总计数器递增，已移除
                    
                    const icon = this.add.image(x, y, "gotEnvelope");
                    
                    // 设置初始属性 - 使用1:1比例
                    icon.setScale(1.0) // 将缩放设为1.0，展示原始大小
                        .setDepth(100)
                        .setOrigin(0.5);

                    // 添加动画效果 - 保持从1开始的缩放
                    this.tweens.add({
                        targets: icon,
                        scale: 1.5, // 从1.0缩放到1.5
                        alpha: 0,
                        duration: 800,
                        ease: "Power2",
                        onComplete: () => {
                            icon.destroy();
                        }
                    });
                    
                    break;
                }
            }
        };

        // 添加点击和触摸事件监听
        this.input.on("pointerdown", handleInteraction);
        this.input.on("touchstart", handleInteraction);
        
        // 添加帧率和粒子数量显示（仅调试用）
        this.debugText = this.add.text(10, this.cameras.main.height - 200, '', { 
            color: '#ffffff',
            backgroundColor: '#00000077',
            padding: { x: 5, y: 5 }
        }).setDepth(100);
        
        // 根据调试模式设置调试文本的可见性
        if (this.debugText) {
            this.debugText.setVisible(this.isDebugMode);
        }
        
        // 初始化帧率计算变量
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fpsValue = 0;

        // 在create方法末尾添加倒计时UI初始化
        this.initCountdownUI();
        
        // 获取 GameManager 实例并启动计时器
        const gameManager = this.registry.get('gameManager') as GameManager;
        if (gameManager) {
            gameManager.initializeMainGameTimer(this);
        } else {
            console.error("RedEnvelopeScene: GameManager not found in registry.");
        }
    }

    private initCountdownUI() {
        // 获取当前场景的实际宽度
        const currentWidth = this.cameras.main.width;
        
        // 计算响应式缩放比例 - 类似于CSS中的vw单位效果
        const scaleRatio = currentWidth / this.designBaseWidth;
        
        // 基于设计稿的尺寸和位置 
        const baseClockWidth = 63;  // 时钟宽度 (设计稿)
        const baseClockHeight = 117; // 时钟高度 (设计稿)
        const baseClockMarginLeft = 19; // 时钟左边距 (设计稿)
        const baseClockMarginTop = 0; // 时钟上边距 (设计稿)
        
        const baseProgressWidth = 248; // 进度条宽度 (设计稿)
        const baseProgressHeight = 19; // 进度条高度 (设计稿)
        const baseProgressMarginRight = 19; // 进度条右边距 (设计稿)
        const baseProgressMarginTop = 69; // 进度条上边距 (设计稿)
        
        // 应用响应式缩放 - 所有尺寸根据屏幕宽度等比例缩放
        const clockWidth = baseClockWidth * scaleRatio;
        const clockHeight = baseClockHeight * scaleRatio;
        const clockMarginLeft = baseClockMarginLeft * scaleRatio;
        const clockMarginTop = baseClockMarginTop * scaleRatio;
        
        // 保存进度条响应式尺寸供其他方法使用
        this.progressBarWidth = baseProgressWidth * scaleRatio;
        this.progressBarHeight = baseProgressHeight * scaleRatio;
        this.progressBarInnerWidth = (baseProgressWidth - 4) * scaleRatio;
        this.progressBarInnerHeight = (baseProgressHeight - 4) * scaleRatio;
        const progressMarginRight = baseProgressMarginRight * scaleRatio;
        const progressMarginTop = baseProgressMarginTop * scaleRatio;
        
        // 计算时钟位置
        const clockX = clockMarginLeft + clockWidth/2; // 时钟X坐标（考虑中心点）
        const clockY = clockMarginTop + clockHeight/2; // 时钟Y坐标（考虑中心点）
        
        // 计算进度条位置
        const progressX = currentWidth - progressMarginRight - this.progressBarWidth; // 进度条起始X坐标
        const progressY = progressMarginTop + this.progressBarHeight/2; // 进度条Y坐标（中心点）
        
        // 创建时钟背景
        this.clockBg = this.add.image(clockX, clockY, 'clockBg')
            .setOrigin(0.5)
            .setDepth(98)
            .setDisplaySize(clockWidth, clockHeight); // 设置响应式尺寸

        // 创建倒计时文本 - 放置在时钟背景图的底部12px处
        const fontSize = Math.max(16, Math.round(32 * scaleRatio)); // 最小16px，基准32px
        
        // 计算文本Y位置：时钟背景底部减去12px的响应式值
        const textY = clockY + clockHeight/2 - (12 * scaleRatio);
        
        this.countdownText = this.add.text(clockX, textY, '', {
            fontSize: `${fontSize}px`, // 响应式字体大小
            color: '#000000',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        })
        .setOrigin(0.5, 1) // 设置原点为底部中心，便于底部对齐
        .setDepth(100);

        // 创建进度条背景
        this.progressBg = this.add.image(progressX + this.progressBarWidth/2, progressY, 'progressBg')
            .setOrigin(0.5)
            .setDepth(98)
            .setDisplaySize(this.progressBarWidth, this.progressBarHeight);

        // 初始化当前进度条宽度为满值
        this.currentProgressWidth = this.progressBarWidth;
        this.targetProgressWidth = this.progressBarWidth;

        // 直接用 Phaser graphics 实现圆角进度条
        const barCenterX = progressX + this.progressBarWidth / 2;
        const barCenterY = progressY;
        const scaleRatioForRadius = this.cameras.main.width / this.designBaseWidth;
        const baseBorderRadius = 9;
        const responsiveRadius = Math.min(baseBorderRadius * scaleRatioForRadius, this.progressBarHeight / 2);

        // 先销毁旧的
        if (this.progressBar && typeof this.progressBar.destroy === 'function') {
            this.progressBar.destroy();
        }
        // 创建 graphics 对象
        const graphics = this.add.graphics();
        graphics.setDepth(99);
        this.progressBar = {
            graphics,
            value: 1,
            width: this.progressBarInnerWidth,
            height: this.progressBarInnerHeight,
            x: barCenterX,
            y: barCenterY,
            setValue: (value: number) => {
                graphics.clear();
                // 更圆润的圆角（高度一半）
                const roundRadius = this.progressBarInnerHeight / 2;
                // 外边框
                graphics.lineStyle(4, 0x8B2C0B, 1);
                graphics.strokeRoundedRect(
                    barCenterX - this.progressBarInnerWidth / 2,
                    barCenterY - this.progressBarInnerHeight / 2,
                    this.progressBarInnerWidth,
                    this.progressBarInnerHeight,
                    roundRadius
                );
                // 进度填充高度略小于外框
                const fillHeight = this.progressBarInnerHeight - 2 * scaleRatio; // 比外框小2px
                const fillY = barCenterY - fillHeight / 2;
                const actualWidth = Math.max(0, Math.min(this.progressBarInnerWidth, this.progressBarInnerWidth * value));
                graphics.fillStyle(0xE6B94A, 1);
                if (actualWidth > 0) {
                    if (actualWidth >= fillHeight) {
                        graphics.fillRoundedRect(
                            barCenterX - this.progressBarInnerWidth / 2,
                            fillY,
                            actualWidth,
                            fillHeight,
                            fillHeight / 2
                        );
                    } else {
                        graphics.fillCircle(
                            barCenterX - this.progressBarInnerWidth / 2 + actualWidth / 2,
                            barCenterY,
                            actualWidth / 2
                        );
                    }
                }
                this.progressBar.value = value;
            },
            setVisible: (visible: boolean) => {
                graphics.setVisible(visible);
            },
            destroy: () => {
                graphics.destroy();
            }
        };
        this.progressBar.setValue(1);
        
        // 监听游戏计时器更新事件
        this.game.events.on('gameTimerUpdate', this.updateCountdownUI, this);
        
        // 监听游戏开始事件
        this.game.events.on('mainGameTimerStarted', () => {
            if (this.countdownText) this.countdownText.setVisible(true);
            if (this.clockBg) this.clockBg.setVisible(true);
            if (this.progressBg) this.progressBg.setVisible(true);
            if (this.progressBar) this.progressBar.setVisible(true);
        });
        
        // 监听窗口大小变化事件
        this.scale.on('resize', this.handleResize, this);
    }
    
    // 处理窗口大小变化
    private handleResize() {
        // 当窗口大小变化时，重新初始化UI
        if (this.countdownText) this.countdownText.destroy();
        if (this.clockBg) this.clockBg.destroy();
        if (this.progressBg) this.progressBg.destroy();
        if (this.progressBar && typeof this.progressBar.destroy === 'function') { // 插件对象销毁
             this.progressBar.destroy();
        }
        
        this.countdownText = null;
        this.clockBg = null;
        this.progressBg = null;
        this.progressBar = null;
        
        this.initCountdownUI();
    }

    private updateCountdownUI(time: number | string, progress: number) {
        // 更新倒计时文本
        if (this.countdownText && this.clockBg) {
            // 检查时间变化
            if (time !== Infinity && typeof time === 'number') {
                // 只在整秒变化时更新文本
                if (time !== this.lastSecond) {
                    this.countdownText.setText(time.toString());
                    this.lastSecond = time;
                }
            } else {
                this.countdownText.setText(time === Infinity ? '∞' : time.toString());
            }
            
            // 获取当前响应式比例
            const scaleRatio = this.cameras.main.width / this.designBaseWidth;
            const fontSize = Math.max(16, Math.round(32 * scaleRatio)); // 最小16px
            
            // 重新计算文本位置，确保在时钟底部12px处
            const clockBounds = this.clockBg.getBounds();
            const textY = clockBounds.bottom - (12 * scaleRatio);
            
            // 更新文本位置和样式
            this.countdownText.setPosition(clockBounds.centerX, textY);
            
            // 调整文本样式以更好地匹配设计
            this.countdownText.setStyle({
                fontSize: `${fontSize}px`, // 响应式字体大小
                color: '#000000',
                fontStyle: 'bold',
                fontFamily: 'Arial'
            });
        }

        // 更新进度值，确保不超出有效范围
        this.timeProgress = Math.max(0, Math.min(100, progress));
        // 倒计时为0时，进度条宽度为0但延迟300ms后隐藏
        if (this.timeProgress === 0 && this.progressBar) {
            setTimeout(() => {
                if (this.progressBar) this.progressBar.setVisible(false);
            }, 300);
            // 延迟800ms后再关闭/结束游戏（只执行一次）
            if (!this._gameEndTimeout) {
                this._gameEndTimeout = setTimeout(() => {
                    if (this.scene && this.scene.stop) {
                        this.scene.stop(); // 或者调用你自己的游戏结束逻辑
                    }
                    this._gameEndTimeout = null;
                }, 800);
            }
        } else if (this.progressBar) {
            this.progressBar.setVisible(true);
            if (this._gameEndTimeout) {
                clearTimeout(this._gameEndTimeout);
                this._gameEndTimeout = null;
            }
        }
        this.targetProgressWidth = Math.max(0, this.progressBarWidth * (this.timeProgress / 100));
    }

    update(time: number, delta: number) {
        // 更新进度条的值
        if (this.progressBar) {
            // this.timeProgress 是一个百分比 (0-100)
            const progressValue = Math.max(0, Math.min(1, this.timeProgress / 100));
            this.progressBar.setValue(progressValue);
        }

        // 如果不是调试模式，则只执行动画相关的逻辑，跳过调试相关的逻辑
        if (!this.isDebugMode) return;
        
        // 帧率计算 (原有调试代码)
        this.frameCount++;
        
        if (time > this.lastFrameTime + 1000) {
            this.fpsValue = this.frameCount;
            this.frameCount = 0;
            this.lastFrameTime = time;
        }
        
        // 更新调试文本
        if (this.debugText && this.emitter && this.goldEmitter) {
            this.debugText.setText(
                `FPS: ${this.fpsValue}\n` +
                `粒子总数: ${this.particles.length}\n` +
                `红发射器: ${this.emitter.emitting ? '活跃' : '停止'} (${this.emitter.getAliveParticleCount()}/${this.emitter.maxParticles}) F:${this.emitter.frequency}ms\n` +
                `金发射器: ${this.goldEmitter.emitting ? '活跃' : '停止'} (${this.goldEmitter.getAliveParticleCount()}/${this.goldEmitter.maxParticles}) F:${this.goldEmitter.frequency}ms\n` +
                `进度: ${this.timeProgress.toFixed(2)}%`
            );
        }
    }

    getEmitter() { 
        return this.emitter;
    }

    getGoldEmitter() {
        return this.goldEmitter;
    }

    public getClickedEnvelopesCount(): { red: number, gold: number, total: number } {
        return {
            red: this.clickedRedCount,
            gold: this.clickedGoldCount,
            total: this.clickedRedCount + this.clickedGoldCount
        };
    }

    public resetClickedEnvelopesCount(): void {
        this.clickedRedCount = 0;
        this.clickedGoldCount = 0;
    }
}
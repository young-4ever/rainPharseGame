/*
 * @Author: young4ever oliverstack@qq.com
 * @Date: 2025-05-15 17:14:27
 * @LastEditors: young4ever oliverstack@qq.com
 * @LastEditTime: 2025-05-16 14:51:40
 * @FilePath: /code/rainPharse/src/scenes/CountdownScene.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Phaser from 'phaser';
// import readyImg from "@/assets/ready.png"; // 已移至 PreloadScene
// import goImg from "@/assets/go.png"; // 已移至 PreloadScene
// import countdownBgImg from "@/assets/countdown-bg.png"; // 已移至 PreloadScene

export class CountdownScene extends Phaser.Scene {
    // 添加属性声明，修复TypeScript错误
    private countdownImage!: Phaser.GameObjects.Image;

    constructor() {
        super({ key: "CountdownScene" });
    }

    preload() {
        // // 加载倒计时图片 // 已移至 PreloadScene
        // this.load.image("ready", readyImg);
        // this.load.image("go", goImg);
        // // 加载背景图，移除不支持的pixelArt选项 // 已移至 PreloadScene
        // this.load.image("countdownBg", countdownBgImg);
    }

    create() {
        // 添加背景图
        const bg = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "countdownBg"
        );

        // 使用contain模式计算缩放比例
        const scaleX = this.cameras.main.width / bg.width;
        const scaleY = this.cameras.main.height / bg.height;
        const scale = Math.min(scaleX, scaleY); // contain模式

        // 设置背景图属性
        bg.setScale(scale)
           .setOrigin(0.5)
           .setScrollFactor(0)
           .setDepth(0)
           .setBlendMode(Phaser.BlendModes.NORMAL);

        // 创建倒计时图片
        this.countdownImage = this.add
            .image(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                "ready"
            )
            .setScale(1.0); // 使用1:1比例

        // 开始倒计时动画序列
        this.startCountdownSequence();
    }

    startCountdownSequence() {
        // 延迟500ms后开始ready的放大消失动画
        this.time.delayedCall(500, () => {
            // Ready 放大消失动画
            this.tweens.add({
                targets: this.countdownImage,
                scale: 1.5,
                alpha: 0,
                duration: 1000,
                ease: "Power2",
                onComplete: () => {
                    // Ready 动画完成后，显示 GO
                    this.countdownImage.setTexture("go");
                    this.countdownImage.setScale(1.0);  // 重置为1:1比例
                    this.countdownImage.setAlpha(1);

                    this.time.delayedCall(200, () => {
                        // GO 放大消失动画
                        this.tweens.add({
                            targets: this.countdownImage,
                            scale: 1.5,
                            alpha: 0,
                            duration: 800,
                            ease: "Power2",
                            onComplete: () => {
                                // GO 动画完成后，直接切换到红包雨场景
                                this.scene.start("RedEnvelopeScene");
                            },
                        });
                    });
                },
            });
        });
    }
} 
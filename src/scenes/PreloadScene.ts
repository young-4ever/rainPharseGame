/*
 * @Author: young4ever oliverstack@qq.com
 * @Date: 2025-05-16 13:41:46
 * @LastEditors: young4ever oliverstack@qq.com
 * @LastEditTime: 2025-05-17 12:37:54
 * @FilePath: /code/rainPharse/src/scenes/PreloadScene.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Phaser from 'phaser';
import clock from "@/assets/clock.png";
import bar from "@/assets/bar.png";

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: "PreloadScene" });
    }

    preload() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // 样式定义
        const barWidth = 300;
        const barHeight = 12; // 更纤细的进度条
        const cornerRadius = barHeight / 2; // 胶囊形状
        const progressBarOffsetY = 0; // 进度条在垂直方向的偏移

        const boxColor = 0xE0E0E0; // Material Design 浅灰色背景
        const barColor = 0xe4be79; // 与primaryTextColor保持一致

        const primaryTextColor = '#ffffff'; // 深灰色文字，用于浅色背景
        const secondaryTextColor = '#ffffff'; // 中灰色文字

        // "加载中..." 文字
        const loadingText = this.make.text({
            x: centerX,
            y: centerY - barHeight - 20 + progressBarOffsetY, // 进度条上方
            text: '加载中',
            style: {
                font: 'bold 24px Arial', // 增大字体大小并简化字体设置
                color: primaryTextColor,
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        // 进度条背景
        const progressBox = this.add.graphics();
        progressBox.fillStyle(boxColor, 1);
        progressBox.fillRoundedRect(centerX - barWidth / 2, centerY - barHeight / 2 + progressBarOffsetY, barWidth, barHeight, cornerRadius);

        // 进度条填充
        const progressBar = this.add.graphics();

        // 百分比文字
        const percentText = this.make.text({
            x: centerX,
            y: centerY + barHeight + 15 + progressBarOffsetY, // 进度条下方
            text: '0%',
            style: {
                font: '16px "Roboto", "Helvetica Neue", sans-serif',
                color: secondaryTextColor,
            }
        });
        percentText.setOrigin(0.5, 0.5);

        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(barColor, 1);
            // 动态绘制填充部分，确保圆角效果在填充时也正确显示
            if (value > 0) {
                progressBar.fillRoundedRect(centerX - barWidth / 2, centerY - barHeight / 2 + progressBarOffsetY, barWidth * value, barHeight, cornerRadius);
            }
            percentText.setText(Math.floor(value * 100) + '%');
        });

        this.load.on('complete', () => {
            this.time.delayedCall(500, () => {
                progressBar.destroy();
                progressBox.destroy();
                loadingText.destroy();
                percentText.destroy();
                this.scene.start("CountdownScene");
            });
        });


        // 加载新的UI资源
        this.load.image('clockBg', clock);  // 时钟背景
        this.load.image('progressBg', bar);  // 进度条背景

        // 从注册表加载所有游戏资源
        const gameResources = this.registry.get('resources') as Array<{ id: string, src: string }>;
        if (gameResources && Array.isArray(gameResources)) {
            if (gameResources.length === 0) {
                console.warn("PreloadScene: No game resources found in registry to load.");
            } else {
                console.log("PreloadScene: Loading game resources from registry:", gameResources);
            }
            gameResources.forEach(resource => {
                // 假设都是图片资源，如果将来有其他类型（音频、精灵表等），需要扩展这里的逻辑
                this.load.image(resource.id, resource.src);
                console.log(`2PreloadScene: Loading image - id: ${resource.id}, src: ${resource.src}`);
            });
        } else {
            console.warn("PreloadScene: gameResources not found or not an array in registry.");
        }
    }

    create() {
        // preload完成后会自动调用 complete 事件中的 scene.start
    }
} 
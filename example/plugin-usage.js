// 示例：如何在自定义Phaser游戏中使用rain-phaser-game导出的插件
import Phaser from 'phaser';
import { RexRoundRectangleProgressPlugin, getRexRoundRectangleProgressPluginConfig } from 'rain-phaser-game';

// 创建一个基本的Phaser游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // 预加载资源
    this.load.image('background', 'assets/background.png');
  }

  create() {
    // 添加背景
    this.add.image(400, 300, 'background');

    // 使用RexRoundRectangleProgress插件创建进度条
    // 确保插件已加载 (通过在游戏配置中设置)
    if (typeof this.add.rexRoundRectangleProgress === 'function') {
      // 创建圆角矩形进度条
      this.progressBar = this.add.rexRoundRectangleProgress({
        x: 400,
        y: 300,
        width: 300,
        height: 30,
        radius: 15,
        barColor: 0xF4D057,
        barColor2: 0xC95F0E,
        value: 0.5, // 初始值为50%
        trackColor: 0x333333,
        trackStrokeColor: 0x000000,
        trackStrokeThickness: 1
      });
    } else {
      console.warn('RexRoundRectangleProgress插件未加载，请检查游戏配置');
    }

    // 添加一个滑动控制器
    this.add.text(400, 350, '点击拖动调整进度', {
      color: '#ffffff',
      fontSize: '16px'
    }).setOrigin(0.5);

    // 添加交互
    this.input.on('pointermove', (pointer) => {
      if (pointer.isDown && this.progressBar) {
        // 将鼠标X位置转换为0-1的值
        const value = Math.max(0, Math.min(1, (pointer.x - 250) / 300));
        this.progressBar.setValue(value);
      }
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  parent: 'game-container',
  plugins: {
    global: [
      // 使用辅助函数配置Rex插件
      getRexRoundRectangleProgressPluginConfig()
      
      // 或者手动配置:
      // {
      //   key: 'rexRoundRectangleProgress',
      //   plugin: RexRoundRectangleProgressPlugin,
      //   start: true
      // }
    ]
  },
  scene: [MainScene]
};

// 启动游戏
const game = new Phaser.Game(config);

// 导出游戏实例以便外部访问
export default game; 
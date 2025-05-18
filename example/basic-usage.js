/*
 * @Author: young4ever oliverstack@qq.com
 * @Date: 2025-05-17 12:15:49
 * @LastEditors: young4ever oliverstack@qq.com
 * @LastEditTime: 2025-05-17 18:20:59
 * @FilePath: /code/rainPharse/example/basic-usage.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 基本用法示例
import { GameManager, RexRoundRectangleProgressPlugin } from 'rain-phaser-game';

// 定义资源列表
const resources = [
  { id: 'redEnvelope', src: './assets/red-envelope.png' },
  { id: 'goldEnvelope', src: './assets/gold-envelope.png' },
  { id: 'gotEnvelope', src: './assets/got-envelope.png' },
  { id: 'rainBg', src: './assets/rain-bg.png' },
  { id: 'progressBarBg', src: './assets/progress-bar-bg.png' },
  { id: 'clockIcon', src: './assets/clock-icon.png' }
];

// 创建游戏管理器实例
const gameManager = new GameManager();

// 启动游戏
const game = gameManager.start(
  false,  // debugMode
  60,     // 游戏时长（秒）
  resources, // 资源列表
  true,   // 启用随机角度
  400,    // 红包生成频率（毫秒）
  800     // 金红包生成频率（毫秒）
);

// 监听游戏时间更新事件
game.events.on('gameTimerUpdate', (timeRemaining, progressPercent) => {
  console.log(`剩余时间: ${timeRemaining}秒, 进度: ${progressPercent}%`);
});

// 监听游戏计时器启动事件
game.events.on('mainGameTimerStarted', () => {
  console.log('游戏计时器已启动!');
});

// 在需要销毁游戏时调用
function destroyGame() {
  if (gameManager) {
    gameManager.destroy();
  }
} 
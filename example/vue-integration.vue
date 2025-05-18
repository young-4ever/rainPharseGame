<template>
  <div class="game-wrapper">
    <div ref="gameContainer" class="game-container"></div>
    <div v-if="showControls" class="game-controls">
      <button @click="startGame">开始游戏</button>
      <button @click="stopGame">结束游戏</button>
      <div class="game-info">
        <p>剩余时间: {{ displayTime }}</p>
        <p>进度: {{ progress }}%</p>
        <p>已收集红包: {{ redCount }}</p>
        <p>已收集金红包: {{ goldCount }}</p>
        <p>总计: {{ totalCount }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { GameManager } from 'rain-phaser-game';

// 游戏相关引用
const gameContainer = ref(null);
let gameManager = null;
let game = null;

// 游戏状态
const showControls = ref(true);
const timeRemaining = ref(0);
const progress = ref(0);
const redCount = ref(0);
const goldCount = ref(0);
const totalCount = ref(0);
const displayTime = ref('60');

// 资源列表
const resources = [
  { id: 'redEnvelope', src: './assets/red-envelope.png' },
  { id: 'goldEnvelope', src: './assets/gold-envelope.png' },
  { id: 'gotEnvelope', src: './assets/got-envelope.png' },
  { id: 'rainBg', src: './assets/rain-bg.png' },
  { id: 'progressBarBg', src: './assets/progress-bar-bg.png' },
  { id: 'clockIcon', src: './assets/clock-icon.png' }
];

// 游戏设置
const gameDuration = 60; // 游戏时长（秒）
const enableRandomAngle = true; // 启用随机角度
const redFrequency = 400; // 红包生成频率（毫秒）
const goldFrequency = 800; // 金红包生成频率（毫秒）

// 启动游戏
function startGame() {
  if (gameManager) {
    stopGame();
  }
  
  gameManager = new GameManager();
  game = gameManager.start(
    false, // 调试模式
    gameDuration,
    resources,
    enableRandomAngle,
    redFrequency,
    goldFrequency
  );
  
  // 监听游戏事件
  setupEventListeners();
}

// 停止游戏
function stopGame() {
  if (gameManager) {
    gameManager.destroy();
    gameManager = null;
    game = null;
    
    // 重置状态
    timeRemaining.value = 0;
    progress.value = 0;
    displayTime.value = String(gameDuration);
    redCount.value = 0;
    goldCount.value = 0;
    totalCount.value = 0;
  }
}

// 设置事件监听器
function setupEventListeners() {
  if (!game) return;
  
  // 监听游戏时间更新
  game.events.on('gameTimerUpdate', (time, progressValue) => {
    timeRemaining.value = time;
    progress.value = progressValue;
    
    // 处理无限时长的情况
    if (time === Infinity) {
      displayTime.value = '∞';
    } else {
      displayTime.value = String(time);
    }
  });
  
  // 每秒检查一次收集的红包数量
  const checkEnvelopesInterval = setInterval(() => {
    if (!gameManager || !game) {
      clearInterval(checkEnvelopesInterval);
      return;
    }
    
    const redEnvelopeScene = gameManager.getRedEnvelopeScene();
    if (redEnvelopeScene) {
      const counts = redEnvelopeScene.getClickedEnvelopesCount();
      redCount.value = counts.red;
      goldCount.value = counts.gold;
      totalCount.value = counts.total;
    }
  }, 1000);
  
  // 组件销毁时清除定时器
  onBeforeUnmount(() => {
    clearInterval(checkEnvelopesInterval);
  });
}

// 组件挂载时初始化
onMounted(() => {
  // 自动启动游戏，也可以注释掉让用户点击按钮启动
  // startGame();
});

// 组件卸载前清理
onBeforeUnmount(() => {
  stopGame();
});
</script>

<style scoped>
.game-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
}

.game-container {
  width: 100%;
  height: 100%;
}

.game-controls {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px;
  border-radius: 5px;
  color: white;
  z-index: 100001;
}

button {
  margin-right: 10px;
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.game-info {
  margin-top: 10px;
}

.game-info p {
  margin: 5px 0;
}
</style> 
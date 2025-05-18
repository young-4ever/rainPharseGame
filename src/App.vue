<!--
 * @Author: young4ever oliverstack@qq.com
 * @Date: 2025-05-15 12:45:54
 * @LastEditors: young4ever oliverstack@qq.com
 * @LastEditTime: 2025-05-16 18:55:57
 * @FilePath: /code/rainPharse/src/App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup lang="ts">
import RainGame from './components/RainGame.vue'

// 导入所有图片资源，Vite会处理路径
import readyImg from '@/assets/ready.png';
import goImg from '@/assets/go.png';
import countdownBgImg from '@/assets/countdown-bg.png';
import goldEnvelopeImg from "@/assets/gold-envelope.png";
import redEnvelopeImg from '@/assets/red-envelope.png';
import gotEnvelopeImg from '@/assets/got-envelope.png';
import rainBgImg from '@/assets/rain-bg.png';

// 构建 resources 数组
const gameResources = [
    { id: 'ready', src: readyImg }, 
    { id: 'go', src: goImg },
    { id: 'countdownBg', src: countdownBgImg },
    { id: 'goldEnvelope', src: goldEnvelopeImg },
    { id: 'redEnvelope', src: redEnvelopeImg },
    { id: 'gotEnvelope', src: gotEnvelopeImg },
    { id: 'rainBg', src: rainBgImg },
];
</script>

<template>
  <div>
    <RainGame :gameDuration="10" :enableRandomAngle="false" :resources="gameResources" :redFrequency="400" :goldFrequency="800" />
  </div>
</template>

<style>
/* 全局样式，确保倒计时显示在Canvas之上 */
.countdown-container {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 200000; /* 高于Phaser游戏容器和Canvas */
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 8px;
  border-radius: 8px;
  backdrop-filter: blur(3px);
  pointer-events: auto;
}

.timer {
  width: 30px;
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.progress-bar-container {
  width: 250px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #00ff00;
  transition: width 1s linear;
}

/* Phaser游戏容器样式 */
.phaser-game-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99999;
  pointer-events: auto;
}
</style>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

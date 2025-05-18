<template>
    <div>
        <div class="game-container">
            <div v-if="!gameStarted" class="settings-panel">
                <button @click="startGame" class="start-button">
                    开始游戏
                </button>
                <div class="debug-toggle">
                    <input type="checkbox" id="debug-mode" v-model="debugMode">
                    <label for="debug-mode">显示调试信息</label>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" name="HelloWorld">
import { ref, onBeforeUnmount } from "vue";
import { GameManager } from '../game/GameManager';

const props = defineProps({
    gameDuration: {
        type: Number,
        default: 5
    },
    resources: {
        type: Array as () => Array<{ id: string, src: string }>,
        required: true
    },
    enableRandomAngle: {
        type: Boolean,
        default: true
    },
    redFrequency: { type: Number, default: 400 },
    goldFrequency: { type: Number, default: 800 }
});

const gameStarted = ref(false);
const debugMode = ref(false);
let gameManager: GameManager | null = null;

function startGame() {
    if (gameManager) {
        gameManager.destroy();
    }
    gameManager = new GameManager();
    gameStarted.value = true;

    const game = gameManager.start(
        debugMode.value, 
        props.gameDuration, 
        props.resources, 
        props.enableRandomAngle,
        props.redFrequency,
        props.goldFrequency
    );

    game.events.on('gameTimeUp', (clickedResult: { red: number, gold: number, total: number }) => {
        console.log(`🚀 Game Over! Red clicked: ${clickedResult.red}, Gold clicked: ${clickedResult.gold}, Total: ${clickedResult.total}`);
        gameStarted.value = false;
        gameManager?.destroy();
        gameManager = null;
    });
}

onBeforeUnmount(() => {
    if (gameManager) {
        gameManager.destroy();
        gameManager = null;
    }
});
</script>

<style scoped>
.game-container {
    overflow: hidden;
    pointer-events: none;
}

.start-button {
    padding: 15px 30px;
    font-size: 18px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
    pointer-events: auto;
}

.start-button:hover {
    background-color: #45a049;
}

.settings-panel {
    position: relative;
    height: fit-content;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 10px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    min-width: 250px;
    pointer-events: auto;
}

.debug-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: white;
    font-size: 16px;
}

.debug-toggle input[type="checkbox"] {
    width: 18px;
    height: 18px;
}

:deep(canvas) {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
}
</style>
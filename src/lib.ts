import { GameManager } from './game/GameManager';
// 导入 RoundRectangleProgressPlugin 以确保它被打包

// 导出GameManager类
export { GameManager };


// 提供一个工厂函数，方便用户创建GameManager实例
export function createGameManager() {
  return new GameManager();
}

// 导出默认对象
export default {
  GameManager,
  createGameManager
}; 
# Rain Phaser Game

一个基于Phaser框架的雨游戏库，包含精美的倒计时时钟和进度条。

## 特点

- 基于Phaser 3框架
- 精美的倒计时界面
- 带渐变和圆角的进度条
- 简洁易用的API

## 安装

```bash
npm install rain-phaser-game
```

## 依赖项

此库依赖以下包：

- phaser (^3.88.0)
- phaser3-rex-plugins (^1.80.15)
- vue (^3.3.0) - 仅当与Vue一起使用时需要

## 使用方法

### 直接使用GameManager

```javascript
import { GameManager } from 'rain-phaser-game';

// 创建GameManager实例
const gameManager = new GameManager();

// 启动游戏
const game = gameManager.start(
  false, // 调试模式
  5,     // 游戏持续时间（秒）
  [      // 游戏资源
    { id: 'redEnvelope', src: 'path/to/red-envelope.png' },
    { id: 'goldEnvelope', src: 'path/to/gold-envelope.png' },
    // ...其他资源
  ],
  true,  // 启用随机角度
  400,   // 红包发射频率
  800    // 金包发射频率
);

// 监听游戏结束事件
game.events.on('gameTimeUp', (result) => {
  console.log(`游戏结束! 红包: ${result.red}, 金包: ${result.gold}, 总计: ${result.total}`);
  
  // 销毁游戏（如果需要）
  gameManager.destroy();
});
```

### 在自定义Phaser游戏中使用Rex插件

如果你想在自己的Phaser游戏中使用我们导出的Rex插件，可以这样做：

```javascript
import Phaser from 'phaser';
import { RexRoundRectangleProgressPlugin, getRexRoundRectangleProgressPluginConfig } from 'rain-phaser-game';

// 使用导出的配置函数
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  plugins: {
    global: [
      // 方法1: 使用配置函数
      getRexRoundRectangleProgressPluginConfig()
      
      // 方法2: 手动配置
      // {
      //   key: 'rexRoundRectangleProgress',
      //   plugin: RexRoundRectangleProgressPlugin,
      //   start: true
      // }
    ]
  },
  // ...其他配置
};

const game = new Phaser.Game(config);
```

### 使用工厂函数

```javascript
import { createGameManager } from 'rain-phaser-game';

// 使用工厂函数创建实例
const gameManager = createGameManager();

// 接下来与上面相同...
```

## 配置选项

| 参数 | 类型 | 默认值 | 描述 |
|------|------|-------|------|
| debugMode | boolean | false | 是否启用调试模式 |
| gameDuration | number | null | 游戏持续时间（秒），null表示无限 |
| resources | Array | [] | 游戏资源列表，格式为[{id: string, src: string}] |
| enableRandomAngle | boolean | true | 红包是否随机旋转角度 |
| redFrequency | number | 400 | 红包发射频率（毫秒） |
| goldFrequency | number | 800 | 金包发射频率（毫秒） |

## API参考

### GameManager类

#### 方法

- `start(debugMode, gameDuration, resources, enableRandomAngle, redFrequency, goldFrequency)`: 启动游戏
- `destroy()`: 销毁游戏实例，释放资源
- `getRedEnvelopeScene()`: 获取红包雨场景实例

### 导出的插件和工具函数

- `RexRoundRectangleProgressPlugin`: Rex插件的圆角矩形进度条  
- `getRexRoundRectangleProgressPluginConfig()`: 获取Rex插件的配置对象

## 故障排除

### 常见问题

#### 插件相关错误

**问题**: 出现 "rexRoundRectangleProgress plugin is not available" 警告

**解决方案**:

1. 确保你的项目中没有重复的插件加载

2. 这个警告可能不会影响功能，因为我们添加了一个后备的进度条实现

3. 如果你想在自己的游戏中使用此插件，请参考上面的"在自定义Phaser游戏中使用Rex插件"部分

#### 库版本问题

如果您使用的是0.1.1版本之前的库，可能会遇到插件加载问题。请更新到最新版本：

```bash
npm install rain-phaser-game@latest
```

#### 关于资源加载

请确保正确提供资源的路径，相对路径是相对于您的项目根目录。

## 依赖说明

本库依赖以下外部库：

- [Phaser](https://phaser.io/) (v3.88.0+)
- [Phaser3-Rex-Plugins](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/) (v1.80.0+)

## 许可证

MIT

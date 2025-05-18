/*
 * @Author: young4ever oliverstack@qq.com
 * @Date: 2025-05-15 12:45:54
 * @LastEditors: young4ever oliverstack@qq.com
 * @LastEditTime: 2025-05-17 18:24:54
 * @FilePath: /code/rainPharse/vite.config.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    lib: {
      // 库的入口文件
      entry: path.resolve(__dirname, 'src/lib.ts'),
      // 库的名称，在UMD构建中会作为全局变量名
      name: 'RainPhaser',
      // 输出文件名格式
      fileName: (format) => `rain-phaser.${format}.js`,
      // 输出格式
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      // 只将Vue和Phaser设为外部依赖，phaser3-rex-plugins需要被打包进库
      external: [
        'vue', 
        'phaser'
      ],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue',
          phaser: 'Phaser'
        }
      }
    },
    // 确保支持传统浏览器
    target: 'es2015',
    // 生成源码映射文件，方便调试
    sourcemap: true
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  define: {
    global: 'globalThis'
  }
})

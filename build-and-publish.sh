#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # 无颜色

echo -e "${BLUE}开始构建和发布 Rain Phaser Game 库...${NC}"

# 1. 安装依赖
echo -e "${BLUE}正在安装依赖...${NC}"
npm install
if [ $? -ne 0 ]; then
  echo -e "${RED}依赖安装失败，退出构建流程${NC}"
  exit 1
fi
echo -e "${GREEN}依赖安装成功!${NC}"

# 2. 运行类型检查和构建
echo -e "${BLUE}正在构建库...${NC}"
npm run build:lib
if [ $? -ne 0 ]; then
  echo -e "${RED}构建失败，退出发布流程${NC}"
  exit 1
fi
echo -e "${GREEN}构建成功!${NC}"

# 3. 确认发布
echo -e "${BLUE}准备发布到 npm...${NC}"
read -p "是否要发布到 npm? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${RED}已取消发布${NC}"
  exit 0
fi

# 4. 发布到 npm
echo -e "${BLUE}正在发布到 npm...${NC}"
npm publish
if [ $? -ne 0 ]; then
  echo -e "${RED}发布失败${NC}"
  exit 1
fi

echo -e "${GREEN}库已成功发布到 npm!${NC}"
echo -e "${BLUE}现在可以使用 npm install rain-phaser-game 安装此库${NC}" 
# 方块打字冒险 BlockType Adventure

原创像素方块风网页版打字游戏。当前子项目暂存于 `growth-os/apps/blocktype-adventure`，后续可迁移到独立仓库。

## 本地运行

```bash
cd apps/blocktype-adventure
npm install
npm run dev
```

## 构建

```bash
npm run check
npm run build
```

## 当前玩法

- 怪物携带英文单词向字核塔移动。
- 输入首字母自动锁定距离基地最近的匹配目标。
- 正确输入逐字攻击，错误输入中断连击。
- Backspace 撤销，Escape 暂停。
- 坚持 60 秒获胜，基地生命归零失败。
- 结算显示得分、准确率、WPM、最高连击和高频错误按键。

## 版权原则

不使用 Minecraft、打字鸭或其他产品的角色、纹理、页面、音乐、图标、代码与品牌资产。所有正式素材需重新绘制为原创透明 SVG 或程序图形。

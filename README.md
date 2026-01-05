# 威软去广告

智能视频广告拦截工具 - **威软科技**

## 功能特点

- 去除各大视频网站广告（优酷、爱奇艺、腾讯视频、哔哩哔哩、芒果TV、YouTube等）
- 不影响浏览器其他功能
- 去除广告后，视频界面保持原样
- 支持油猴脚本和Chrome浏览器插件两种使用方式
- YouTube广告智能跳过（自动点击跳过按钮/快进到广告结尾）

## 支持的视频网站

| 网站 | 域名 | 支持程度 |
|------|------|----------|
| YouTube | youtube.com | 完整支持 |
| 哔哩哔哩 | bilibili.com | 完整支持 |
| 优酷 | youku.com | 完整支持 |
| 爱奇艺 | iqiyi.com | 完整支持 |
| 腾讯视频 | v.qq.com | 完整支持 |
| 芒果TV | mgtv.com | 基础支持 |
| 西瓜视频 | ixigua.com | 基础支持 |
| 搜狐视频 | sohu.com | 基础支持 |
| AcFun | acfun.cn | 基础支持 |
| 乐视 | le.com | 基础支持 |
| PPTV | pptv.com | 基础支持 |

## 安装方法

### 方式一：油猴脚本（推荐）

1. 安装油猴扩展（Tampermonkey/Greasemonkey）
   - Chrome: [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - Firefox: [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/)
   - Edge: [Tampermonkey](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

2. 点击油猴扩展图标 → 添加新脚本

3. 复制 `userscript/weiruan-adblocker.user.js` 的内容并保存

### 方式二：Chrome浏览器插件

1. 打开Chrome浏览器，访问 `chrome://extensions/`

2. 开启右上角的"开发者模式"

3. 点击"加载已解压的扩展程序"

4. 选择 `chrome-extension` 文件夹

5. 完成！插件图标将出现在浏览器工具栏

## 项目结构

```
weiruan-ads/
├── userscript/
│   └── weiruan-adblocker.user.js    # 油猴脚本
├── chrome-extension/
│   ├── manifest.json                 # 插件配置文件 (Manifest V3)
│   ├── popup.html                    # 弹出窗口界面
│   ├── rules.json                    # 网络请求拦截规则
│   ├── js/
│   │   ├── content.js               # 内容脚本
│   │   ├── background.js            # 后台服务
│   │   └── popup.js                 # 弹出窗口脚本
│   ├── css/
│   │   └── adblock.css              # 广告屏蔽样式
│   └── icons/
│       ├── icon16.png
│       ├── icon32.png
│       ├── icon48.png
│       └── icon128.png
└── README.md
```

## 使用说明

### Chrome插件

- 点击工具栏上的插件图标可以打开控制面板
- 可以随时开启/关闭广告拦截功能
- 查看已拦截的广告数量统计
- 点击"重置统计"可清零计数

### 油猴脚本

- 安装后自动生效
- 访问支持的视频网站时自动拦截广告
- 在油猴扩展中可以管理脚本的启用/禁用
- 默认开启调试模式，可在控制台查看 `[威软去广告]` 日志

## 技术原理

### YouTube广告处理流程

```
检测广告播放 → 静音处理 → 跳转到广告结尾/16倍速播放 → 点击跳过按钮 → 恢复正常播放
```

### 广告拦截技术

1. **精准CSS隐藏**: 只隐藏广告覆盖层，不影响视频播放器
2. **DOM监听**: 使用MutationObserver实时检测新出现的广告元素
3. **网络请求拦截**: 拦截广告服务器的请求（doubleclick、googlesyndication等）
4. **智能跳过**: 自动检测并点击跳过按钮，或快进到广告结尾

### 广告检测方式

```javascript
// 检测YouTube播放器是否正在播放广告
const player = document.querySelector('.html5-video-player');
if (player && player.classList.contains('ad-showing')) {
    // 执行广告跳过逻辑
}
```

## 调试模式

默认开启调试模式，打开浏览器开发者控制台（F12）可查看日志：

```
[威软去广告] 威软去广告脚本 v1.1.0 已加载 - 威软科技制作
[威软去广告] 当前站点: youtube
[威软去广告] YouTube广告拦截器初始化
[威软去广告] 检测到广告正在播放，正在跳过...
[威软去广告] 已跳转到广告结尾
[威软去广告] 广告结束，已恢复正常播放
```

如需关闭调试日志，将脚本中的 `debug: true` 改为 `debug: false`。

## 注意事项

- 本工具仅用于学习和研究目的
- 部分视频网站可能需要VIP才能观看完整内容
- 广告拦截可能影响网站的正常运营，请酌情使用
- 如遇到问题，可尝试刷新页面或暂时禁用插件
- 视频网站可能会更新广告机制，如失效请等待更新

## 版本历史

### v1.1.0 (最新)
- 修复YouTube广告处理导致视频画面空白的问题
- 重写YouTube广告处理逻辑：检测 → 静音 → 快进/跳过 → 恢复
- 移除过于激进的CSS选择器，避免误伤视频播放器
- 为各视频站点创建独立的广告处理模块
- 优化广告检测频率和准确性

### v1.0.0
- 首次发布
- 支持主流视频网站广告拦截
- 提供油猴脚本和Chrome插件两种版本

## 常见问题

**Q: 为什么YouTube广告没有被完全跳过？**

A: YouTube会不断更新广告机制。脚本会尝试：1) 点击跳过按钮 2) 快进到广告结尾 3) 16倍速播放。如仍有问题，请反馈。

**Q: 视频画面空白怎么办？**

A: v1.1.0已修复此问题。如仍有问题，请更新到最新版本。

**Q: 为什么有些网站广告没被拦截？**

A: 部分网站使用特殊的广告技术，目前可能未完全支持。欢迎反馈具体网站。

## 许可证

MIT License

---

**威软科技制作** © 2026

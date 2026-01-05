# 威软去广告

智能视频广告拦截工具 - **威软科技**

## 功能特点

- 去除各大视频网站广告（优酷、爱奇艺、腾讯视频、哔哩哔哩、芒果TV、YouTube等）
- 不影响浏览器其他功能
- 去除广告后，视频界面保持原样
- 支持油猴脚本和Chrome浏览器插件两种使用方式

## 支持的视频网站

| 网站 | 域名 |
|------|------|
| 优酷 | youku.com |
| 爱奇艺 | iqiyi.com |
| 腾讯视频 | v.qq.com |
| 哔哩哔哩 | bilibili.com |
| 芒果TV | mgtv.com |
| YouTube | youtube.com |
| 西瓜视频 | ixigua.com |
| 搜狐视频 | sohu.com |
| AcFun | acfun.cn |
| 乐视 | le.com |
| PPTV | pptv.com |

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
│   ├── manifest.json                 # 插件配置文件
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

## 技术原理

1. **CSS隐藏**: 通过CSS选择器隐藏广告元素
2. **DOM移除**: 监听DOM变化，实时移除新出现的广告元素
3. **请求拦截**: 拦截广告相关的网络请求
4. **视频跳过**: 自动跳过可跳过的视频广告

## 注意事项

- 本工具仅用于学习和研究目的
- 部分视频网站可能需要VIP才能观看完整内容
- 广告拦截可能影响网站的正常运营，请酌情使用
- 如遇到问题，可尝试刷新页面或暂时禁用插件

## 版本历史

### v1.0.0
- 首次发布
- 支持主流视频网站广告拦截
- 提供油猴脚本和Chrome插件两种版本

## 许可证

MIT License

---

**威软科技制作** © 2026

/**
 * 威软去广告 - Popup Script
 * 威软科技制作
 */

document.addEventListener('DOMContentLoaded', () => {
    const enableToggle = document.getElementById('enableToggle');
    const statusIndicator = document.getElementById('statusIndicator');
    const blockedCount = document.getElementById('blockedCount');
    const currentSite = document.getElementById('currentSite');
    const resetBtn = document.getElementById('resetBtn');

    // 加载设置
    loadSettings();
    loadStats();
    getCurrentTabInfo();

    // 切换开关
    enableToggle.addEventListener('change', () => {
        const enabled = enableToggle.checked;

        chrome.storage.sync.set({ enabled: enabled }, () => {
            updateStatusIndicator(enabled);

            // 通知当前标签页
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        type: 'TOGGLE_ENABLED',
                        enabled: enabled
                    }).catch(() => {
                        // 忽略错误（可能页面不支持）
                    });
                }
            });
        });
    });

    // 重置统计
    resetBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'RESET_STATS' }, () => {
            blockedCount.textContent = '0';
        });
    });

    // 加载设置
    function loadSettings() {
        chrome.storage.sync.get(['enabled'], (result) => {
            const enabled = result.enabled !== false;
            enableToggle.checked = enabled;
            updateStatusIndicator(enabled);
        });
    }

    // 加载统计
    function loadStats() {
        chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
            if (response && response.totalBlocked) {
                blockedCount.textContent = formatNumber(response.totalBlocked);
            }
        });
    }

    // 获取当前标签页信息
    function getCurrentTabInfo() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].url) {
                try {
                    const url = new URL(tabs[0].url);
                    const hostname = url.hostname;

                    // 检查是否是视频网站
                    const videoSites = {
                        'youku.com': '优酷',
                        'iqiyi.com': '爱奇艺',
                        'qq.com': '腾讯视频',
                        'bilibili.com': '哔哩哔哩',
                        'mgtv.com': '芒果TV',
                        'youtube.com': 'YouTube',
                        'ixigua.com': '西瓜视频',
                        'sohu.com': '搜狐视频',
                        'le.com': '乐视',
                        'pptv.com': 'PPTV',
                        'acfun.cn': 'AcFun'
                    };

                    let siteName = hostname;
                    for (const [domain, name] of Object.entries(videoSites)) {
                        if (hostname.includes(domain)) {
                            siteName = name;
                            break;
                        }
                    }

                    currentSite.textContent = `当前站点: ${siteName}`;
                } catch (e) {
                    currentSite.textContent = '当前站点: -';
                }
            }
        });
    }

    // 更新状态指示器
    function updateStatusIndicator(enabled) {
        if (enabled) {
            statusIndicator.className = 'status-indicator status-active';
        } else {
            statusIndicator.className = 'status-indicator status-inactive';
        }
    }

    // 格式化数字
    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
});

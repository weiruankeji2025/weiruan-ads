/**
 * 威软去广告 - Background Service Worker
 * 威软科技制作
 */

// 广告拦截统计
let blockedAdsCount = {};
let totalBlocked = 0;

// 初始化
chrome.runtime.onInstalled.addListener(() => {
    console.log('[威软去广告] 插件已安装 - 威软科技制作');

    // 初始化存储
    chrome.storage.sync.set({
        enabled: true,
        stats: {},
        totalBlocked: 0
    });
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'AD_BLOCKED') {
        const site = message.site || 'unknown';
        const count = message.count || 1;

        // 更新统计
        if (!blockedAdsCount[site]) {
            blockedAdsCount[site] = 0;
        }
        blockedAdsCount[site] += count;
        totalBlocked += count;

        // 保存到存储
        chrome.storage.sync.set({
            stats: blockedAdsCount,
            totalBlocked: totalBlocked
        });

        // 更新badge
        updateBadge(totalBlocked);

        sendResponse({ success: true });
    }

    if (message.type === 'GET_STATS') {
        sendResponse({
            stats: blockedAdsCount,
            totalBlocked: totalBlocked
        });
    }

    if (message.type === 'RESET_STATS') {
        blockedAdsCount = {};
        totalBlocked = 0;
        chrome.storage.sync.set({
            stats: {},
            totalBlocked: 0
        });
        updateBadge(0);
        sendResponse({ success: true });
    }

    return true;
});

// 更新badge显示
function updateBadge(count) {
    if (count > 0) {
        const displayText = count > 999 ? '999+' : String(count);
        chrome.action.setBadgeText({ text: displayText });
        chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
    } else {
        chrome.action.setBadgeText({ text: '' });
    }
}

// 加载保存的统计数据
chrome.storage.sync.get(['stats', 'totalBlocked'], (result) => {
    if (result.stats) {
        blockedAdsCount = result.stats;
    }
    if (result.totalBlocked) {
        totalBlocked = result.totalBlocked;
        updateBadge(totalBlocked);
    }
});

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // 检查是否是视频网站
        const videoSites = [
            'youku.com', 'iqiyi.com', 'qq.com', 'bilibili.com',
            'mgtv.com', 'youtube.com', 'ixigua.com', 'sohu.com',
            'le.com', 'pptv.com', 'tudou.com', 'acfun.cn'
        ];

        const isVideoSite = videoSites.some(site => tab.url.includes(site));

        if (isVideoSite) {
            console.log(`[威软去广告] 检测到视频网站: ${tab.url}`);
        }
    }
});

console.log('[威软去广告] Background Service Worker 已启动');

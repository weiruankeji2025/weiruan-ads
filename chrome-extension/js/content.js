/**
 * 威软去广告 - Content Script
 * 去除各大视频网站广告，保持原始界面不变
 * 威软科技制作
 */

(function() {
    'use strict';

    // ========== 配置 ==========
    const CONFIG = {
        debug: false,
        checkInterval: 500,
        maxRetries: 100
    };

    // ========== 日志工具 ==========
    const log = {
        info: (msg) => CONFIG.debug && console.log(`[威软去广告] ${msg}`),
        warn: (msg) => CONFIG.debug && console.warn(`[威软去广告] ${msg}`),
        error: (msg) => console.error(`[威软去广告] ${msg}`)
    };

    // ========== 通用广告选择器 ==========
    const COMMON_AD_SELECTORS = [
        '[class*="ad-"]:not([class*="upload"]):not([class*="download"]):not([class*="add"])',
        '[class*="-ad"]:not([class*="head"]):not([class*="load"])',
        '[class*="_ad"]',
        '[class*="ad_"]',
        '[class*="advertisement"]',
        '[class*="adsense"]',
        '[class*="advert"]',
        '[id*="ad-"]',
        '[id*="-ad"]',
        '[id*="_ad"]',
        '[id*="ad_"]',
        '.video-ad',
        '.player-ad',
        '.pause-ad',
        'iframe[src*="ad"]',
        'iframe[src*="advertisement"]'
    ];

    // ========== 各站点专用选择器 ==========
    const SITE_AD_SELECTORS = {
        'youku.com': [
            '.advertise-layer',
            '.ad-layer',
            '.youku-layer-ad',
            '.yk-ad',
            '#player_ad',
            '.player-ad-tips',
            '.ad-tips',
            '.h5-ext-ad',
            '.h5-layer-ad',
            '.advertise',
            '.ads-box',
            '[class*="yk_ad"]',
            '[class*="adv-"]',
            '.player-loading-ad',
            '.video-ad-player'
        ],
        'iqiyi.com': [
            '.iqp-ad',
            '.cupid-wrap',
            '.skippable-ad',
            '.ad-pause',
            '.qy-ad',
            '.iqp-ads',
            '[class*="cupid"]',
            '[class*="iqp-ad"]',
            '.iq-adv',
            '.ad-wrap',
            '.pause-ad-container',
            '#flashbox_ads',
            '.qy-player-ad'
        ],
        'qq.com': [
            '.txp_ad',
            '.txp_ads',
            '.ad_area',
            '#player_pause_ad',
            '.txp_pause_ad',
            '.mod_ad',
            '.ad_center',
            '[class*="txp_ad"]',
            '[class*="player_ad"]',
            '.tvp_ad',
            '.tvp_overlay_ad',
            '.pause-ad',
            '#adPlayer'
        ],
        'bilibili.com': [
            '.ad-report',
            '.bili-ad',
            '.video-card-ad-small',
            '.ad-floor',
            '.activity-banner',
            '.ad-m',
            '[class*="ad-report"]',
            '.slide-ad-exp',
            '.video-page-game-card',
            '.video-page-special-card'
        ],
        'mgtv.com': [
            '.ad-layer',
            '.mango-ad',
            '[class*="ad-wrap"]',
            '.pause-ad',
            '.video-ad'
        ],
        'youtube.com': [
            '.ytp-ad-module',
            '.ytp-ad-overlay-slot',
            '.ytp-ad-text-overlay',
            '.ytd-display-ad-renderer',
            '.ytd-promoted-sparkles-web-renderer',
            '.ytd-companion-slot-renderer',
            '.ytd-action-companion-ad-renderer',
            '[class*="ytp-ad"]',
            '.ytp-ad-skip-button-container',
            '#player-ads',
            '.video-ads',
            '.ytd-banner-promo-renderer',
            '.ytd-statement-banner-renderer'
        ],
        'ixigua.com': [
            '.ad-wrapper',
            '.xg-ad',
            '[class*="ad-layer"]',
            '.video-ad'
        ],
        'sohu.com': [
            '.ad-layer',
            '.x-ad',
            '[class*="sohu-ad"]'
        ],
        'acfun.cn': [
            '.ad-wrapper',
            '.acfun-ad',
            '[class*="banner-ad"]'
        ]
    };

    // ========== 获取当前站点 ==========
    function getCurrentSite() {
        const hostname = location.hostname;
        for (const site of Object.keys(SITE_AD_SELECTORS)) {
            if (hostname.includes(site)) {
                return site;
            }
        }
        return null;
    }

    // ========== 检查是否启用 ==========
    let isEnabled = true;

    function checkEnabled() {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.sync.get(['enabled'], (result) => {
                isEnabled = result.enabled !== false;
            });
        }
    }

    // ========== 检查是否是视频播放器 ==========
    function isVideoPlayer(element) {
        const videoTags = ['VIDEO', 'OBJECT', 'EMBED'];
        if (videoTags.includes(element.tagName)) {
            return true;
        }
        if (element.querySelector('video')) {
            const classList = element.className.toLowerCase();
            if (classList.includes('player') && !classList.includes('ad')) {
                return true;
            }
        }
        return false;
    }

    // ========== 移除广告元素 ==========
    function removeAdElements() {
        if (!isEnabled) return;

        const currentSite = getCurrentSite();
        const selectors = [...COMMON_AD_SELECTORS];

        if (currentSite && SITE_AD_SELECTORS[currentSite]) {
            selectors.push(...SITE_AD_SELECTORS[currentSite]);
        }

        let removedCount = 0;

        selectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    if (!isVideoPlayer(el)) {
                        el.style.setProperty('display', 'none', 'important');
                        el.style.setProperty('visibility', 'hidden', 'important');
                        el.style.setProperty('opacity', '0', 'important');
                        el.style.setProperty('pointer-events', 'none', 'important');
                        el.style.setProperty('height', '0', 'important');
                        el.style.setProperty('width', '0', 'important');
                        el.style.setProperty('overflow', 'hidden', 'important');
                        removedCount++;
                    }
                });
            } catch (e) {
                log.warn(`选择器错误: ${selector}`);
            }
        });

        if (removedCount > 0) {
            log.info(`已隐藏 ${removedCount} 个广告元素`);
            // 通知background脚本
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.sendMessage({
                    type: 'AD_BLOCKED',
                    count: removedCount,
                    site: getCurrentSite() || location.hostname
                });
            }
        }
    }

    // ========== 跳过YouTube广告 ==========
    function skipYouTubeAds() {
        if (!location.hostname.includes('youtube.com')) return;
        if (!isEnabled) return;

        // 跳过可跳过的广告
        const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button');
        if (skipButton) {
            skipButton.click();
            log.info('已跳过YouTube广告');
        }

        // 加速播放不可跳过广告
        const video = document.querySelector('.html5-main-video');
        const adDisplay = document.querySelector('.ytp-ad-player-overlay, .ytp-ad-text');

        if (video && adDisplay) {
            video.playbackRate = 16;
            video.muted = true;
            log.info('正在加速跳过YouTube广告');
        }
    }

    // ========== 处理视频前贴片广告 ==========
    function handlePrerollAds() {
        if (!isEnabled) return;

        const currentSite = getCurrentSite();

        if (currentSite === 'youku.com') {
            const adPlayer = document.querySelector('.advertise-layer, .ad-layer');
            if (adPlayer) {
                adPlayer.remove();
                log.info('已移除优酷前贴片广告');
            }
        }

        if (currentSite === 'iqiyi.com') {
            const adContainer = document.querySelector('.iqp-ad, .cupid-wrap');
            if (adContainer) {
                adContainer.remove();
                log.info('已移除爱奇艺前贴片广告');
            }
            const skipBtn = document.querySelector('[class*="skip"]');
            if (skipBtn) {
                skipBtn.click();
            }
        }

        if (currentSite === 'qq.com') {
            const adLayer = document.querySelector('.txp_ad, #adPlayer');
            if (adLayer) {
                adLayer.remove();
                log.info('已移除腾讯视频前贴片广告');
            }
        }
    }

    // ========== 拦截广告请求 ==========
    function blockAdRequests() {
        if (!isEnabled) return;

        const adPatterns = [
            /ads?\./i,
            /advert/i,
            /adsense/i,
            /doubleclick/i,
            /googlesyndication/i,
            /pagead/i,
            /adservice/i,
            /atm\.youku\.com/i,
            /irs01\.com/i,
            /p-log\.ykimg\.com/i,
            /cupid\.iqiyi\.com/i,
            /api\.cupid/i,
            /lives\.l\.qq\.com.*ad/i,
            /btrace\.qq\.com/i
        ];

        // 拦截 XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            if (typeof url === 'string' && adPatterns.some(pattern => pattern.test(url))) {
                log.info(`已拦截广告请求: ${url.substring(0, 50)}...`);
                return;
            }
            return originalXHROpen.call(this, method, url, ...args);
        };

        // 拦截 Fetch
        const originalFetch = window.fetch;
        window.fetch = function(url, ...args) {
            if (typeof url === 'string' && adPatterns.some(pattern => pattern.test(url))) {
                log.info(`已拦截广告Fetch请求: ${url.substring(0, 50)}...`);
                return Promise.reject(new Error('Ad blocked by 威软去广告'));
            }
            return originalFetch.call(this, url, ...args);
        };

        log.info('已启用广告请求拦截');
    }

    // ========== MutationObserver 监听DOM变化 ==========
    function observeDOMChanges() {
        const observer = new MutationObserver((mutations) => {
            if (!isEnabled) return;

            let hasNewNodes = false;
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    hasNewNodes = true;
                }
            });

            if (hasNewNodes) {
                removeAdElements();
                handlePrerollAds();
                skipYouTubeAds();
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        log.info('已启动DOM变化监听');
    }

    // ========== 监听来自popup的消息 ==========
    function listenForMessages() {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (message.type === 'TOGGLE_ENABLED') {
                    isEnabled = message.enabled;
                    if (isEnabled) {
                        removeAdElements();
                        handlePrerollAds();
                    }
                    sendResponse({ success: true });
                }
                if (message.type === 'GET_STATUS') {
                    sendResponse({
                        enabled: isEnabled,
                        site: getCurrentSite() || location.hostname
                    });
                }
            });
        }
    }

    // ========== 初始化 ==========
    function init() {
        log.info('威软去广告插件已加载 - 威软科技制作');

        checkEnabled();
        listenForMessages();
        blockAdRequests();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                removeAdElements();
                handlePrerollAds();
                observeDOMChanges();
            });
        } else {
            removeAdElements();
            handlePrerollAds();
            observeDOMChanges();
        }

        // 定时检查广告
        let retries = 0;
        const checkInterval = setInterval(() => {
            if (isEnabled) {
                removeAdElements();
                handlePrerollAds();
                skipYouTubeAds();
            }

            retries++;
            if (retries >= CONFIG.maxRetries) {
                clearInterval(checkInterval);
                log.info('广告检测周期结束');
            }
        }, CONFIG.checkInterval);

        log.info('威软去广告已初始化完成');
    }

    init();

})();

// ==UserScript==
// @name         威软去广告
// @namespace    https://weiruan.tech/
// @version      1.0.0
// @description  去除各大视频网站广告，保持原始界面不变 - 威软科技制作
// @author       威软科技制作
// @match        *://*.youku.com/*
// @match        *://*.iqiyi.com/*
// @match        *://*.iq.com/*
// @match        *://*.qq.com/*
// @match        *://*.bilibili.com/*
// @match        *://*.mgtv.com/*
// @match        *://*.youtube.com/*
// @match        *://*.ixigua.com/*
// @match        *://*.sohu.com/*
// @match        *://*.le.com/*
// @match        *://*.pptv.com/*
// @match        *://*.tudou.com/*
// @match        *://*.acfun.cn/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-start
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // ========== 配置 ==========
    const CONFIG = {
        debug: false,
        checkInterval: 500,    // 广告检测间隔 (毫秒)
        maxRetries: 100        // 最大重试次数
    };

    // ========== 日志工具 ==========
    const log = {
        info: (msg) => CONFIG.debug && console.log(`[威软去广告] ${msg}`),
        warn: (msg) => CONFIG.debug && console.warn(`[威软去广告] ${msg}`),
        error: (msg) => console.error(`[威软去广告] ${msg}`)
    };

    log.info('威软去广告脚本已加载 - 威软科技制作');

    // ========== 通用广告选择器 ==========
    const COMMON_AD_SELECTORS = [
        // 通用广告类名
        '[class*="ad-"]',
        '[class*="-ad"]',
        '[class*="_ad"]',
        '[class*="ad_"]',
        '[class*="advertisement"]',
        '[class*="adsense"]',
        '[class*="advert"]',
        '[id*="ad-"]',
        '[id*="-ad"]',
        '[id*="_ad"]',
        '[id*="ad_"]',
        // 视频广告遮罩
        '.video-ad',
        '.player-ad',
        '.pause-ad',
        // iframe 广告
        'iframe[src*="ad"]',
        'iframe[src*="advertisement"]'
    ];

    // ========== 各站点专用选择器 ==========
    const SITE_AD_SELECTORS = {
        // 优酷
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
        // 爱奇艺
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
        // 腾讯视频
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
        // 哔哩哔哩
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
        // 芒果TV
        'mgtv.com': [
            '.ad-layer',
            '.mango-ad',
            '[class*="ad-wrap"]',
            '.pause-ad',
            '.video-ad'
        ],
        // YouTube
        'youtube.com': [
            '.ytp-ad-module',
            '.ytp-ad-overlay-slot',
            '.ytp-ad-text-overlay',
            '.ytd-display-ad-renderer',
            '.ytd-promoted-sparkles-web-renderer',
            '.ytd-companion-slot-renderer',
            '.ytd-action-companion-ad-renderer',
            '.ytd-watch-next-secondary-results-renderer > .ytd-item-section-renderer',
            '[class*="ytp-ad"]',
            '.ytp-ad-skip-button-container',
            '#player-ads',
            '.video-ads',
            '.ytd-banner-promo-renderer',
            '.ytd-statement-banner-renderer'
        ],
        // 西瓜视频
        'ixigua.com': [
            '.ad-wrapper',
            '.xg-ad',
            '[class*="ad-layer"]',
            '.video-ad'
        ],
        // 搜狐视频
        'sohu.com': [
            '.ad-layer',
            '.x-ad',
            '[class*="sohu-ad"]'
        ],
        // AcFun
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

    // ========== 移除广告元素 ==========
    function removeAdElements() {
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
                    // 避免移除视频播放器本身
                    if (!isVideoPlayer(el)) {
                        el.style.display = 'none';
                        el.style.visibility = 'hidden';
                        el.style.opacity = '0';
                        el.style.pointerEvents = 'none';
                        el.style.height = '0';
                        el.style.width = '0';
                        el.style.overflow = 'hidden';
                        removedCount++;
                    }
                });
            } catch (e) {
                log.warn(`选择器错误: ${selector}`);
            }
        });

        if (removedCount > 0) {
            log.info(`已隐藏 ${removedCount} 个广告元素`);
        }
    }

    // ========== 检查是否是视频播放器 ==========
    function isVideoPlayer(element) {
        const videoTags = ['VIDEO', 'OBJECT', 'EMBED'];
        if (videoTags.includes(element.tagName)) {
            return true;
        }
        // 检查是否包含视频元素
        if (element.querySelector('video')) {
            const classList = element.className.toLowerCase();
            // 如果类名同时包含player但不包含ad，认为是播放器
            if (classList.includes('player') && !classList.includes('ad')) {
                return true;
            }
        }
        return false;
    }

    // ========== 跳过YouTube广告 ==========
    function skipYouTubeAds() {
        if (!location.hostname.includes('youtube.com')) return;

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
        const currentSite = getCurrentSite();

        // 优酷
        if (currentSite === 'youku.com') {
            const adPlayer = document.querySelector('.advertise-layer, .ad-layer');
            if (adPlayer) {
                adPlayer.remove();
                log.info('已移除优酷前贴片广告');
            }
        }

        // 爱奇艺
        if (currentSite === 'iqiyi.com') {
            const adContainer = document.querySelector('.iqp-ad, .cupid-wrap');
            if (adContainer) {
                adContainer.remove();
                log.info('已移除爱奇艺前贴片广告');
            }
            // 尝试跳过广告
            const skipBtn = document.querySelector('[class*="skip"]');
            if (skipBtn) {
                skipBtn.click();
            }
        }

        // 腾讯视频
        if (currentSite === 'qq.com') {
            const adLayer = document.querySelector('.txp_ad, #adPlayer');
            if (adLayer) {
                adLayer.remove();
                log.info('已移除腾讯视频前贴片广告');
            }
        }
    }

    // ========== 注入CSS隐藏广告 ==========
    function injectAdBlockCSS() {
        const currentSite = getCurrentSite();
        let cssRules = [];

        // 通用规则
        cssRules.push(`
            [class*="ad-"]:not([class*="upload"]):not([class*="download"]):not([class*="add"]),
            [class*="-ad"]:not([class*="head"]):not([class*="load"]),
            [class*="advertisement"],
            [class*="adsense"],
            .pause-ad,
            .video-ad {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
        `);

        // 优酷
        if (currentSite === 'youku.com') {
            cssRules.push(`
                .advertise-layer,
                .ad-layer,
                .youku-layer-ad,
                .yk-ad,
                .player-ad-tips,
                .ad-tips,
                .h5-ext-ad,
                .advertise {
                    display: none !important;
                }
            `);
        }

        // 爱奇艺
        if (currentSite === 'iqiyi.com') {
            cssRules.push(`
                .iqp-ad,
                .cupid-wrap,
                .skippable-ad,
                .ad-pause,
                .qy-ad,
                .pause-ad-container {
                    display: none !important;
                }
            `);
        }

        // 腾讯视频
        if (currentSite === 'qq.com') {
            cssRules.push(`
                .txp_ad,
                .txp_ads,
                .ad_area,
                #player_pause_ad,
                .txp_pause_ad,
                .mod_ad,
                #adPlayer {
                    display: none !important;
                }
            `);
        }

        // 哔哩哔哩
        if (currentSite === 'bilibili.com') {
            cssRules.push(`
                .ad-report,
                .bili-ad,
                .video-card-ad-small,
                .ad-floor,
                .slide-ad-exp,
                .video-page-game-card {
                    display: none !important;
                }
            `);
        }

        // YouTube
        if (currentSite === 'youtube.com') {
            cssRules.push(`
                .ytp-ad-module,
                .ytp-ad-overlay-slot,
                .ytp-ad-text-overlay,
                .ytd-display-ad-renderer,
                .ytd-promoted-sparkles-web-renderer,
                #player-ads,
                .video-ads {
                    display: none !important;
                }
            `);
        }

        // 添加样式
        if (typeof GM_addStyle === 'function') {
            GM_addStyle(cssRules.join('\n'));
        } else {
            const style = document.createElement('style');
            style.textContent = cssRules.join('\n');
            (document.head || document.documentElement).appendChild(style);
        }

        log.info('已注入广告屏蔽CSS');
    }

    // ========== 拦截广告请求 ==========
    function blockAdRequests() {
        const adPatterns = [
            /ads?\./i,
            /advert/i,
            /adsense/i,
            /doubleclick/i,
            /googlesyndication/i,
            /pagead/i,
            /adservice/i,
            /tracking/i,
            /analytics/i,
            /beacon/i,
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
                return Promise.reject(new Error('Ad blocked'));
            }
            return originalFetch.call(this, url, ...args);
        };

        log.info('已启用广告请求拦截');
    }

    // ========== MutationObserver 监听DOM变化 ==========
    function observeDOMChanges() {
        const observer = new MutationObserver((mutations) => {
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

    // ========== 初始化 ==========
    function init() {
        // 立即注入CSS
        if (document.head || document.documentElement) {
            injectAdBlockCSS();
        } else {
            document.addEventListener('DOMContentLoaded', injectAdBlockCSS);
        }

        // 拦截广告请求
        blockAdRequests();

        // DOM加载完成后执行
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
            removeAdElements();
            handlePrerollAds();
            skipYouTubeAds();

            retries++;
            if (retries >= CONFIG.maxRetries) {
                clearInterval(checkInterval);
                log.info('广告检测周期结束');
            }
        }, CONFIG.checkInterval);

        log.info('威软去广告已初始化完成');
    }

    // 启动脚本
    init();

})();

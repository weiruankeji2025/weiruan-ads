/**
 * 威软去广告 - Content Script v1.1.0
 * 去除各大视频网站广告，保持原始界面不变
 * 威软科技制作
 */

(function() {
    'use strict';

    // ========== 配置 ==========
    const CONFIG = {
        debug: true,
        checkInterval: 200,
        youtubeCheckInterval: 100
    };

    // ========== 日志工具 ==========
    const log = {
        info: (msg) => CONFIG.debug && console.log(`[威软去广告] ${msg}`),
        warn: (msg) => CONFIG.debug && console.warn(`[威软去广告] ${msg}`),
        error: (msg) => console.error(`[威软去广告] ${msg}`)
    };

    log.info('威软去广告插件 v1.1.0 已加载 - 威软科技制作');

    // ========== 检查是否启用 ==========
    let isEnabled = true;

    function checkEnabled() {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.sync.get(['enabled'], (result) => {
                isEnabled = result.enabled !== false;
            });
        }
    }
    checkEnabled();

    // ========== 获取当前站点 ==========
    function getCurrentSite() {
        const hostname = location.hostname;
        if (hostname.includes('youtube.com')) return 'youtube';
        if (hostname.includes('youku.com')) return 'youku';
        if (hostname.includes('iqiyi.com')) return 'iqiyi';
        if (hostname.includes('qq.com')) return 'qq';
        if (hostname.includes('bilibili.com')) return 'bilibili';
        if (hostname.includes('mgtv.com')) return 'mgtv';
        if (hostname.includes('ixigua.com')) return 'ixigua';
        return 'other';
    }

    // ========================================================
    // YouTube 专用广告处理
    // ========================================================
    const YouTubeAdBlocker = {
        lastAdTime: 0,
        blockedCount: 0,

        init() {
            if (!isEnabled) return;
            log.info('YouTube广告拦截器初始化');
            this.startMonitoring();
        },

        startMonitoring() {
            setInterval(() => {
                if (!isEnabled) return;
                this.handleAds();
            }, CONFIG.youtubeCheckInterval);

            const observer = new MutationObserver(() => {
                if (!isEnabled) return;
                this.handleAds();
            });

            if (document.body) {
                observer.observe(document.body, { childList: true, subtree: true });
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    observer.observe(document.body, { childList: true, subtree: true });
                });
            }
        },

        handleAds() {
            this.skipAd();
            this.speedUpAd();
            this.removeAdOverlays();
        },

        skipAd() {
            const skipSelectors = [
                '.ytp-ad-skip-button',
                '.ytp-ad-skip-button-modern',
                '.ytp-skip-ad-button',
                'button.ytp-ad-skip-button-modern',
                '.ytp-ad-skip-button-container button',
                '.videoAdUiSkipButton',
                '.ytp-ad-skip-button-slot button'
            ];

            for (const selector of skipSelectors) {
                const skipButton = document.querySelector(selector);
                if (skipButton && skipButton.offsetParent !== null) {
                    skipButton.click();
                    log.info('已点击跳过广告按钮');
                    this.reportBlocked();
                    return true;
                }
            }
            return false;
        },

        speedUpAd() {
            const video = document.querySelector('video.html5-main-video');
            if (!video) return;

            const isAdPlaying = this.isAdPlaying();

            if (isAdPlaying) {
                const now = Date.now();
                if (now - this.lastAdTime > 500) {
                    log.info('检测到广告正在播放，正在跳过...');
                    this.lastAdTime = now;
                }

                video.muted = true;

                if (video.duration && isFinite(video.duration)) {
                    video.currentTime = video.duration;
                    log.info('已跳转到广告结尾');
                    this.reportBlocked();
                }

                if (video.playbackRate !== 16) {
                    video.playbackRate = 16;
                    log.info('已将广告播放速度设为16倍');
                }
            } else {
                if (video.playbackRate === 16) {
                    video.playbackRate = 1;
                    video.muted = false;
                    log.info('广告结束，已恢复正常播放');
                }
            }
        },

        isAdPlaying() {
            const adIndicators = [
                '.ytp-ad-player-overlay',
                '.ytp-ad-player-overlay-instream-info',
                '.ytp-ad-text',
                '.ytp-ad-preview-container',
                '.ytp-ad-simple-ad-badge',
                '.ytp-ad-skip-button-container'
            ];

            for (const selector of adIndicators) {
                const el = document.querySelector(selector);
                if (el && el.offsetParent !== null) {
                    return true;
                }
            }

            const player = document.querySelector('.html5-video-player');
            if (player && player.classList.contains('ad-showing')) {
                return true;
            }

            return false;
        },

        removeAdOverlays() {
            const overlaySelectors = [
                '.ytp-ad-overlay-slot',
                '.ytp-ad-overlay-container',
                '.ytp-ad-text-overlay'
            ];

            overlaySelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    if (el.innerHTML.trim()) {
                        el.innerHTML = '';
                        this.reportBlocked();
                    }
                });
            });
        },

        reportBlocked() {
            this.blockedCount++;
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.sendMessage({
                    type: 'AD_BLOCKED',
                    count: 1,
                    site: 'youtube.com'
                }).catch(() => {});
            }
        }
    };

    // ========================================================
    // 哔哩哔哩专用处理
    // ========================================================
    const BilibiliAdBlocker = {
        init() {
            if (!isEnabled) return;
            log.info('哔哩哔哩广告拦截器初始化');
        }
    };

    // ========================================================
    // 优酷专用处理
    // ========================================================
    const YoukuAdBlocker = {
        init() {
            if (!isEnabled) return;
            log.info('优酷广告拦截器初始化');
            this.startMonitoring();
        },

        startMonitoring() {
            setInterval(() => {
                if (!isEnabled) return;
                const skipBtn = document.querySelector('.advertise-skip, .skip-ad, [class*="skip"]');
                if (skipBtn) {
                    skipBtn.click();
                    log.info('已跳过优酷广告');
                }
            }, CONFIG.checkInterval);
        }
    };

    // ========================================================
    // 爱奇艺专用处理
    // ========================================================
    const IqiyiAdBlocker = {
        init() {
            if (!isEnabled) return;
            log.info('爱奇艺广告拦截器初始化');
            this.startMonitoring();
        },

        startMonitoring() {
            setInterval(() => {
                if (!isEnabled) return;
                const skipBtn = document.querySelector('.skippable-ad-skip, [class*="skip"]');
                if (skipBtn) {
                    skipBtn.click();
                    log.info('已跳过爱奇艺广告');
                }
            }, CONFIG.checkInterval);
        }
    };

    // ========================================================
    // 腾讯视频专用处理
    // ========================================================
    const QQVideoAdBlocker = {
        init() {
            if (!isEnabled) return;
            log.info('腾讯视频广告拦截器初始化');
            this.startMonitoring();
        },

        startMonitoring() {
            setInterval(() => {
                if (!isEnabled) return;
                const skipBtn = document.querySelector('.txp_ad_skip, [class*="skip"]');
                if (skipBtn) {
                    skipBtn.click();
                    log.info('已跳过腾讯视频广告');
                }
            }, CONFIG.checkInterval);
        }
    };

    // ========================================================
    // 通用广告拦截
    // ========================================================
    const GenericAdBlocker = {
        init() {
            log.info('通用广告拦截器初始化');
            this.blockAdRequests();
        },

        blockAdRequests() {
            const adPatterns = [
                /doubleclick\.net/i,
                /googlesyndication\.com/i,
                /googleadservices\.com/i,
                /moatads\.com/i,
                /adnxs\.com/i,
                /atm\.youku\.com/i,
                /cupid\.iqiyi\.com/i,
                /btrace\.qq\.com/i
            ];

            const originalXHROpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url, ...args) {
                if (typeof url === 'string' && adPatterns.some(p => p.test(url))) {
                    log.info(`已拦截广告请求: ${url.substring(0, 60)}...`);
                    return;
                }
                return originalXHROpen.call(this, method, url, ...args);
            };

            const originalFetch = window.fetch;
            window.fetch = function(url, ...args) {
                const urlStr = typeof url === 'string' ? url : (url && url.url) || '';
                if (adPatterns.some(p => p.test(urlStr))) {
                    log.info(`已拦截广告Fetch: ${urlStr.substring(0, 60)}...`);
                    return Promise.resolve(new Response('', { status: 200 }));
                }
                return originalFetch.call(this, url, ...args);
            };

            log.info('网络请求拦截已启用');
        }
    };

    // ========================================================
    // 监听消息
    // ========================================================
    function listenForMessages() {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (message.type === 'TOGGLE_ENABLED') {
                    isEnabled = message.enabled;
                    log.info(`广告拦截已${isEnabled ? '启用' : '禁用'}`);
                    sendResponse({ success: true });
                }
                if (message.type === 'GET_STATUS') {
                    sendResponse({
                        enabled: isEnabled,
                        site: getCurrentSite()
                    });
                }
            });
        }
    }

    // ========================================================
    // 主初始化
    // ========================================================
    function init() {
        const site = getCurrentSite();
        log.info(`当前站点: ${site}`);

        listenForMessages();
        GenericAdBlocker.init();

        switch (site) {
            case 'youtube':
                YouTubeAdBlocker.init();
                break;
            case 'bilibili':
                BilibiliAdBlocker.init();
                break;
            case 'youku':
                YoukuAdBlocker.init();
                break;
            case 'iqiyi':
                IqiyiAdBlocker.init();
                break;
            case 'qq':
                QQVideoAdBlocker.init();
                break;
            default:
                log.info('使用通用广告拦截');
        }

        log.info('威软去广告初始化完成 - 威软科技制作');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.YoutubeExternalSubtitle = factory());
}(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    var Container = /** @class */ (function () {
        function Container() {
            this.document = null;
            this.onIframeApiReady = null;
            this.YT = null;
        }
        Container.prototype.setDocument = function (document) {
            this.document = document;
        };
        Container.prototype.getDocument = function () {
            return this.document;
        };
        Container.prototype.setYT = function (YT) {
            this.YT = YT;
        };
        Container.prototype.getYT = function () {
            return this.YT;
        };
        Container.prototype.setOnIframeApiReady = function (onIframeApiReady) {
            this.onIframeApiReady = onIframeApiReady;
        };
        Container.prototype.getOnIframeApiReady = function () {
            return this.onIframeApiReady;
        };
        return Container;
    }());
    var DIC = new Container();

    var CSS = {
        ID: 'youtube-external-subtitle-style',
        CLASS: 'youtube-external-subtitle',
        FULLSCREEN: 'fullscreen',
        FULLSCREEN_IGNORE: 'fullscreen-ignore'
    };
    var getCacheName = function (seconds) {
        return Math.floor(seconds / 10);
    };
    var getCacheNames = function (start, end) {
        var cacheNames = [];
        var endCacheName = getCacheName(end);
        for (var i = getCacheName(start); i <= endCacheName; i++) {
            cacheNames.push(i);
        }
        return cacheNames;
    };
    var buildCache = function (subtitles) {
        var cache = {};
        for (var _i = 0, subtitles_1 = subtitles; _i < subtitles_1.length; _i++) {
            var subtitle = subtitles_1[_i];
            for (var _a = 0, _b = getCacheNames(subtitle.start, subtitle.end); _a < _b.length; _a++) {
                var cacheName = _b[_a];
                if (!cache[cacheName]) {
                    cache[cacheName] = [];
                }
                cache[cacheName].push(subtitle);
            }
        }
        return cache;
    };
    var getSubtitleFromCache = function (seconds, builtCache) {
        if (!builtCache) {
            return null;
        }
        var cache = builtCache[getCacheName(seconds)];
        if (!cache) {
            return null;
        }
        for (var _i = 0, cache_1 = cache; _i < cache_1.length; _i++) {
            var subtitle = cache_1[_i];
            if (seconds >= subtitle.start && seconds <= subtitle.end) {
                return subtitle;
            }
        }
        return null;
    };
    var getFullscreenElement = function () {
        var document = DIC.getDocument();
        return document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.webkitCurrentFullScreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement;
    };
    var getSubtitles = function (container) {
        var subtitleElements = container.getElementsByClassName(CSS.CLASS);
        var subtitles = [];
        for (var i = 0; i < subtitleElements.length; i++) {
            subtitles.push(subtitleElements[i].youtubeExternalSubtitle);
        }
        return subtitles;
    };
    var getFullscreenSubtitle = function () {
        var fullscreenElement = getFullscreenElement();
        var subtitle = null;
        if (fullscreenElement) {
            if (fullscreenElement.youtubeExternalSubtitle) {
                subtitle = fullscreenElement.youtubeExternalSubtitle;
            }
            else {
                var elements = getSubtitles(fullscreenElement);
                if (elements.length > 0) {
                    subtitle = elements[0];
                }
            }
        }
        return {
            subtitle: subtitle,
            isFullscreen: !!fullscreenElement
        };
    };
    var fullscreenChangeHandler = function () {
        var _a = getFullscreenSubtitle(), fullscreenSubtitle = _a.subtitle, isFullscreen = _a.isFullscreen;
        var document = DIC.getDocument();
        var subtitles = getSubtitles(document);
        var _loop_1 = function (subtitle) {
            var isFullscreenActive = isFullscreen ? fullscreenSubtitle === subtitle : null;
            if (isFullscreen) {
                setTimeout(function () {
                    subtitle.setIsFullscreenActive(isFullscreenActive);
                }, 0);
            }
            else {
                subtitle.setIsFullscreenActive(isFullscreenActive);
            }
        };
        for (var _i = 0, subtitles_2 = subtitles; _i < subtitles_2.length; _i++) {
            var subtitle = subtitles_2[_i];
            _loop_1(subtitle);
        }
    };
    var globalStyleAdded = function () {
        var document = DIC.getDocument();
        return !!document.getElementById(CSS.ID);
    };
    var addGlobalStyle = function () {
        var document = DIC.getDocument();
        var style = document.createElement('style');
        style.id = CSS.ID;
        style.type = 'text/css';
        style.innerHTML = "\n    ." + CSS.CLASS + " { position: absolute; display: none; z-index: 0; pointer-events: none; color: #fff; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 17px; text-align: center; }\n    ." + CSS.CLASS + " span { background: #000; padding: 1px 4px; display: inline-block; margin-bottom: 2px; }\n    ." + CSS.CLASS + "." + CSS.FULLSCREEN_IGNORE + " { display: none !important; }\n    ." + CSS.CLASS + "." + CSS.FULLSCREEN + " { z-index: 3000000000; }\n  ";
        var head = document.getElementsByTagName('head')[0] || document.documentElement;
        head.insertBefore(style, head.firstChild);
        document.addEventListener('fullscreenchange', fullscreenChangeHandler);
        document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
        document.addEventListener('mozfullscreenchange', fullscreenChangeHandler);
        document.addEventListener('MSFullscreenChange', fullscreenChangeHandler);
    };
    var addQueryStringParameterToUrl = function (url, qsParameters) {
        var hashIndex = url.indexOf('#');
        var hash = '';
        if (hashIndex !== -1) {
            hash = url.substr(hashIndex);
            url = url.substr(0, hashIndex);
        }
        var qsIndex = url.indexOf('?');
        var qs = '';
        if (qsIndex !== -1) {
            qs = url.substr(qsIndex);
            url = url.substr(0, qsIndex);
        }
        for (var i in qsParameters) {
            qs += "" + (qs === '' ? '?' : '&') + i + "=" + qsParameters[i];
        }
        return "" + url + qs + hash;
    };
    var getIframeSrc = function (src) {
        var newSrc = src;
        if (newSrc.indexOf('enablejsapi=1') === -1) {
            newSrc = addQueryStringParameterToUrl(newSrc, { enablejsapi: '1' });
        }
        if (newSrc.indexOf('html5=1') === -1) {
            newSrc = addQueryStringParameterToUrl(newSrc, { html5: '1' });
        }
        if (newSrc.indexOf('playsinline=1') === -1) {
            newSrc = addQueryStringParameterToUrl(newSrc, { playsinline: '1' });
        }
        if (newSrc.indexOf('fs=') === -1) {
            newSrc = addQueryStringParameterToUrl(newSrc, { fs: '0' });
        }
        return newSrc;
    };
    var createSubtitleElement = function (iframe, subtitle) {
        var document = DIC.getDocument();
        var element = document.createElement('div');
        element.youtubeExternalSubtitle = subtitle;
        iframe.parentNode.insertBefore(element, iframe.nextSibling);
        return element;
    };
    var isStateChanged = function (prevState, nextState) {
        for (var i in nextState) {
            if (prevState[i] !== nextState[i]) {
                return true;
            }
        }
        return false;
    };
    var Subtitle = /** @class */ (function () {
        function Subtitle(iframe, subtitles) {
            var _this = this;
            this.cache = null;
            this.timeChangeInterval = 0;
            this.player = null;
            this.videoId = null;
            this.element = null;
            this.state = {
                text: null,
                isFullscreenActive: null
            };
            this.onTimeChange = function () {
                var subtitle = getSubtitleFromCache(_this.player.getCurrentTime(), _this.cache);
                _this.setState({ text: subtitle ? subtitle.text : null });
            };
            this.onPlayerReady = function () {
                _this.videoId = _this.getCurrentVideoId();
            };
            this.onPlayerStateChange = function (e) {
                if (_this.videoId !== _this.getCurrentVideoId()) {
                    return;
                }
                var YT = DIC.getYT();
                if (e.data === YT.PlayerState.PLAYING) {
                    _this.start();
                }
                else if (e.data === YT.PlayerState.PAUSED) {
                    _this.stop();
                }
                else if (e.data === YT.PlayerState.ENDED) {
                    _this.stop();
                    _this.setState({ text: null });
                }
            };
            if (iframe.youtubeExternalSubtitle) {
                throw new Error('YoutubeExternalSubtitle: subtitle is already added for this element');
            }
            iframe.youtubeExternalSubtitle = this;
            if (!globalStyleAdded()) {
                addGlobalStyle();
            }
            var src = getIframeSrc(iframe.src);
            if (iframe.src !== src) {
                iframe.src = src;
            }
            if (subtitles) {
                this.load(subtitles);
            }
            this.element = createSubtitleElement(iframe, this);
            this.render();
            var onIframeApiReady = DIC.getOnIframeApiReady();
            onIframeApiReady(function () {
                var YT = DIC.getYT();
                _this.player = new YT.Player(iframe);
                _this.player.addEventListener('onReady', _this.onPlayerReady);
                _this.player.addEventListener('onStateChange', _this.onPlayerStateChange);
            });
        }
        Subtitle.prototype.load = function (subtitles) {
            this.cache = buildCache(subtitles);
        };
        Subtitle.prototype.setIsFullscreenActive = function (isFullscreenActive) {
            this.setState({ isFullscreenActive: isFullscreenActive });
        };
        Subtitle.prototype.destroy = function () {
            this.stop();
            this.element.parentNode.removeChild(this.element);
            this.player.getIframe().youtubeExternalSubtitle = null;
            this.player.removeEventListener('onReady', this.onPlayerReady);
            this.player.removeEventListener('onStateChange', this.onPlayerStateChange);
        };
        Subtitle.prototype.render = function () {
            var classes = [CSS.CLASS];
            if (this.state.isFullscreenActive !== null) {
                classes.push(this.state.isFullscreenActive ? CSS.FULLSCREEN : CSS.FULLSCREEN_IGNORE);
            }
            this.element.className = classes.join(' ');
            var text = this.state.text === null ? '' : this.state.text;
            this.element.innerHTML = "<span>" + text.replace(/(?:\r\n|\r|\n)/g, '</span><br /><span>') + "</span>";
            this.element.style.display = this.state.text === null ? '' : 'block';
            if (this.player) {
                var iframe = this.player.getIframe();
                var frame = {
                    x: iframe.offsetLeft - iframe.scrollLeft + iframe.clientLeft,
                    y: iframe.offsetTop - iframe.scrollTop + iframe.clientTop,
                    width: iframe.offsetWidth,
                    height: iframe.offsetHeight
                };
                this.element.style.visibility = 'hidden';
                this.element.style.top = frame.y + 'px';
                this.element.style.left = frame.x + 'px';
                this.element.style.maxWidth = (frame.width - 20) + 'px';
                this.element.style.top = (frame.y + frame.height - 60 - this.element.offsetHeight) + 'px';
                this.element.style.left = (frame.x + (frame.width - this.element.offsetWidth) / 2) + 'px';
                this.element.style.visibility = '';
            }
        };
        Subtitle.prototype.setState = function (state) {
            var prevState = this.state;
            var nextState = __assign(__assign({}, prevState), state);
            if (!isStateChanged(prevState, nextState)) {
                return;
            }
            this.state = nextState;
            this.render();
        };
        Subtitle.prototype.start = function () {
            this.stop();
            this.timeChangeInterval = setInterval(this.onTimeChange, 500);
        };
        Subtitle.prototype.stop = function () {
            clearInterval(this.timeChangeInterval);
        };
        Subtitle.prototype.getCurrentVideoId = function () {
            return this.player.getVideoData().video_id;
        };
        return Subtitle;
    }());

    var iframeApiScriptAdded = function () {
        var document = DIC.getDocument();
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].src;
            if (src && src.indexOf('youtube.com/iframe_api') !== -1) {
                return true;
            }
        }
        return false;
    };
    var addIframeApiScript = function () {
        var document = DIC.getDocument();
        var tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    };
    var iframeApiLoaded = function () {
        return !!(window.YT && window.YT.Player);
    };
    var onIframeApiReady = function (cb) {
        if (DIC.getYT() !== null) {
            cb();
            return;
        }
        var onLoaded = function () {
            DIC.setYT(window.YT);
            cb();
        };
        if (iframeApiLoaded()) {
            onLoaded();
            return;
        }
        var iframeApiInterval = setInterval(function () {
            if (iframeApiLoaded()) {
                clearInterval(iframeApiInterval);
                onLoaded();
            }
        }, 100);
        if (!iframeApiScriptAdded()) {
            addIframeApiScript();
        }
    };
    DIC.setDocument(window.document);
    DIC.setOnIframeApiReady(onIframeApiReady);
    var youtube_external_subtitle = { Subtitle: Subtitle };

    return youtube_external_subtitle;

})));

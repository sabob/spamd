/*!
 * Homepage: http://github.com/blixt/js-hash
 * Copyright (c) 2009-2011 Andreas Blixt <andreas@blixt.org>
 * Contributors: Aaron Ogle <aogle@avencia.com>,
 * Matti Virkkunen <mvirkkunen@gmail.com>,
 * Simon Chester <simonches@gmail.com>
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 * Hash handler
 * Keeps track of the history of changes to the hash part in the address bar.
 */
/* WARNING for Internet Explorer 7 and below:
 * If an element on the page has the same ID as the hash used, the history will
 * get messed up.
 *
 * Does not support history in Safari 2 and below.
 *
 * Example:
 * function handler(newHash, initial) {
 * if (initial)
 * alert('Hash is "' + newHash + '"');
 * else
 * alert('Hash changed to "' + newHash + '"');
 * }
 * hash.init(handler);
 * hash('abc123');
 *
 *
 * Updated by Simon Chester (simonches@gmail.com) on 2011-05-16:
 * - Removed the need for blank.html and the iframe argument by creating the
 * iframe on initialization.
 *
 * Updated by Matti Virkkunen (mvirkkunen@gmail.com) on 2009-11-16:
 * - Added second argument to callback that indicates whether the callback is
 * due to initial state (true) or due to an actual change to the hash
 * (false).
 *
 * Updated by Aaron Ogle (aogle@avencia.com) on 2009-08-11:
 * - Fixed bug where Firefox automatically unescapes location.hash but no
 * other browsers do. Always get the hash by parsing location.href and
 * never use location.hash.
 */

define(function(require) {

    var $ = require("jquery");
    var params = require("../utils/params");

    var historyLength = window.history.length;

    var createHash = function(window) {

        // Import globals
        var documentMode = document.documentMode;

        var history = window.history;

        // Local variables
        var callback;

        var hash;

        // IE-specific
        var iframe;

        var that = function(val) {
            that.ensureInitialized();

            if (typeof val === 'undefined' || typeof val === 'function') {
                return getHash();

            } else {
                return setHash(val);
            }
        };

        that.ensureInitialized = function() {
            if (callback == null) {
                throw new Error("hash not initialized! Call hash.init first!");
            }
        };

        that.init = function(cb) {
            // init can only be called once.
            if (callback) {
                return;
            }
            if (!cb) {
                throw new Error("hash.init requires callback!");
            }

            callback = cb;

            // Keep track of the hash value.
            hash = getHash();
            var options = {
                newHash: hash,
                oldHash: hash,
                initial: true,
                external: false
            };
            performCallback(options);

            if (isHashChangeSupported()) {
                if (window.addEventListener) {
                    window.addEventListener('hashchange', poll, false);
                } else if (window.attachEvent) {
                    window.attachEvent('onhashchange', poll);
                }
            } else {
                // Run specific code for Internet Explorer.
                if (window.ActiveXObject) {
                    if (!documentMode || documentMode < 8) {
                        // Internet Explorer 5.5/6/7 need an iframe for history
                        // support.
                        setUpIframe();
                    }
                } else {
                    // Change Opera navigation mode to improve history support.
                    if (history.navigationMode) {
                        history.navigationMode = 'compatible';
                    }

                    setInterval(poll, 50);
                }
            }
        };
        
        that.update = function() {
            that.ensureInitialized();
            var curHash = getHash();
            var options = {
                newHash: curHash,
                oldHash: hash,
                initial: false,
                external: false
            };
            hash = curHash;
            performCallback(options);
        };

        that.trigger = function() {
            that.ensureInitialized();
            var curHash = getHash();
            var options = {
                newHash: curHash,
                oldHash: hash,
                initial: false,
                external: false
            };
            performCallback(options);
        };

        function performCallback(options) {
            callback(options);
        }

        function getHash() {
            // Internet Explorer 6 (and possibly other browsers) extracts the query
            // string out of the location.hash property into the location.search
            // property, so we can't rely on it. The location.search property can't be
            // relied on either, since if the URL contains a real query string, that's
            // what it will be set to. The only way to get the whole hash is to parse
            // it from the location.href property.
            //
            // Another thing to note is that in Internet Explorer 6 and 7 (and possibly
            // other browsers), subsequent hashes are removed from the location.href
            // (and location.hash) property if the location.search property is set.
            //
            // Via Aaron: Firefox 3.5 (and below?) always unescape location.hash which
            // causes poll to fire the hashchange event twice on escaped hashes. This
            // is because the hash variable (escaped) will not match location.hash
            // (unescaped.) The only consistent option is to rely completely on
            // location.href.
            var index = window.location.href.indexOf('#');
            return (index == -1 ? '' : window.location.href.substr(index + 1));
        }

        function setHash(newHash) {
            // Cancel if the new hash is the same as the current one, since there
            // is no cross-browser way to keep track of navigation to the exact
            // same hash multiple times in a row. A wrapper can handle this by
            // adding an incrementing counter to the end of the hash.
            if (newHash == hash) {
                return false;
            }

            if (iframe) {
                setIframe(newHash);
            } else {

                var options = {
                    newHash: newHash,
                    oldHash: hash,
                    initial: false,
                    external: false
                };
                window.location.hash = hash = newHash;
                performCallback(options);
            }
            return newHash;
        }

// Used by all browsers except Internet Explorer 7 and below.
        function poll() {
            var curHash = getHash();
            if (curHash != hash) {

                //var newHistoryLength = window.history.length;
                //console.info("history.length", newHistoryLength);
                //var externalHashChange = true;
                //if (historyLength !== newHistoryLength) {
                 //   console.info("history.length changed. was:", historyLength, "now:", newHistoryLength);
                 //   historyLength = newHistoryLength;
                 //   externalHashChange = false;
                //}

                var options = {
                    newHash: curHash,
                    oldHash: hash,
                    initial: false,
                    external: true
                };
                hash = curHash;
                performCallback(options);
            }
        }

        // From: http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
        function isHashChangeSupported() {
            var eventName = 'onhashchange';
            var isSupported = (eventName in document.body);
            if (!isSupported) {
                document.body.setAttribute(eventName, 'return;');
                isSupported = typeof document.body[eventName] == 'function';
            }

            // documentMode logic from YUI to filter out IE8 Compat Mode (which
            // generates false positives).
            return isSupported && (document.documentMode === undefined ||
                    document.documentMode > 7);
        }

        function createIframe() {
            var tempEl = document.createElement();
            tempEl.innerHTML = '<iframe src="javascript:void(0)" tabindex="-1" ' +
                    'style="display: none;"></iframe>';
            var frame = tempEl.childNodes[0];
            document.body.appendChild(frame);
            return frame;
        }

// Used to create a history entry with a value in the iframe.
        function setIframe(newHash) {
            try {
                var doc = iframe.contentWindow.document;
                doc.open();
                doc.write('<html><body>' + newHash + '</body></html>');
                doc.close();
                hash = newHash;
            } catch (e) {
                setTimeout(function() {
                    setIframe(newHash);
                }, 10);
            }
        }

// Used by Internet Explorer 7 and below to set up an iframe that keeps track
// of history changes.
        function setUpIframe() {
            // Don't run until access to the body is allowed.
            try {
                iframe = createIframe();
            } catch (e) {
                setTimeout(setUpIframe, 10);
                return;
            }

            // Create a history entry for the initial state.
            setIframe(hash);
            var data = hash;

            setInterval(function() {
                var curData, curHash;

                try {
                    curData = iframe.contentWindow.document.body.innerText;
                    if (curData != data) {

                        var options = {
                            newHash: curData,
                            oldHash: data,
                            initial: true, // TODO need to test in IE if initial is always true
                            external: false
                        };
                        data = curData;
                        window.location.hash = hash = curData;
                        performCallback(options);
                    } else {
                        curHash = getHash();
                        if (curHash != hash)
                            setIframe(curHash);
                    }
                } catch (e) {
                }
            }, 50);
        }

        return that;
    };

    var hash = createHash(window);

    return hash;

});
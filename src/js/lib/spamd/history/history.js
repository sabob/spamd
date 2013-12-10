define(function(require) {
    var $ = require("jquery");
    var hash = require("./hash");
    var params = require("./params");
    var paramsObj = null;

    $.spamd = $.spamd || {};
    $.spamd.history = $.spamd.history || {};

    var createHistory = function() {

        var that = {};

        that.hash = function(val) {
            if (that.disable()) {
                return;
            }

            if (arguments.length) {
                return hash(val);
            } else {
                return hash();
            }
        };

        var skipOnce = false;
        var disable = false;
        var changeCallback;

        that.skipOnce = function(val) {
            if (arguments.length) {
                skipOnce = val;
                return val;
            } else {
                return skipOnce;
            }
        };

        that.disable = function(val) {
            if (arguments.length) {
                disable = val;
                return val;
            } else {
                return disable;
            }
        };

        function hashHandler(newHash, initial) {
            if (that.disable()) {
                return;
            }
            if (that.skipOnce()) {
                that.skipOnce(false);
                return;
            }

            if (changeCallback) {
                changeCallback(newHash, initial);
            }
        }

        that.update = function() {
            if (that.disable()) {
                return;
            }
            var str = paramsObj.string();
            hash(str);
            paramsObj = null;
        };

        that.params = function(val) {
            if (that.disable()) {
                return;
            }

            ensureParamsInitialized();

            if (arguments.length) {
                return paramsObj.add(val);
            } else {
                return paramsObj.get();
            }
        };
        
        that.params.get = function(param) {
            if (that.disable()) {
                return;
            }

            ensureParamsInitialized();
            
            if (arguments.length) {
                paramsObj.get(param);
            } else {
                return paramsObj.get();
            }
        };
        
        that.params.add = function(params) {
            if (that.disable()) {
                return;
            }

            ensureParamsInitialized();
            
            if (arguments.length) {
                paramsObj.add(params);
            }
        };
        
        that.params.set = function(params) {
            if (that.disable()) {
                return;
            }

            ensureParamsInitialized();
            
            if (arguments.length) {
                paramsObj.set(params);
            }
        };

        that.params.remove = function(params) {
            if (that.disable()) {
                return;
            }

            ensureParamsInitialized();
            
            if (arguments.length) {
                paramsObj.remove(params);
            }
        };

        that.params.clear = function() {
            if (that.disable()) {
                return;
            }

            ensureParamsInitialized();
            paramsObj.clear();
        };

        that.init = function(callback) {
            changeCallback = callback;
            hash.init(hashHandler);
        };

        function ensureParamsInitialized() {
            if (paramsObj == null) {
                var hash = that.hash();
                paramsObj = params(hash);
            }
        }

        return that;
    };

    $.spamd.history = createHistory();

    var h = $.spamd.history;
    //h.disable(true);
    $.spamd.history.init(function(newHash, initial) {

        console.log('Hash "' + newHash + '"');
        if (initial) {
            console.log('Initial Hash is "' + newHash + '"');
        } else {
            console.log('Hash changed to "' + newHash + '"');
        }
    });

    h.hash('moo&x=1&x=2&y');
    console.log("h", h.hash());
    console.log("params()", h.params());
    //h.params({"x": "y"});
    //console.log("params(x:y)", h.params());
    //console.log("params.get()", h.params.get());
    h.params.clear();
    //console.log("params.add'(x', 'y')", h.params.get());
    h.update();


    //hash('x=1&y&x=1');
    //var val = hash();
    //var p = params(val);
    //console.log("params", val, p.get(), p.string());

    return $.spamd.history;
});
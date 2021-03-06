(function(factory) {
    if (typeof define === 'function' && define.amd) {
// AMD is found. Use it to register as anonymous module.
        define(['jquery'], factory);
    } else {
// AMD is not found, use a standard module pattern
        factory(jQuery);
    }
}(function($) {
// use $ safely, it's provided either by AMD or module pattern

    $.jock = $.jock || {};
    /*if (!$.jock) {
     $.jock = jock;
     }*/
    $.jock.showError = function(text, selector) {
        selector = selector || 'body';
        var tmpl = '<div id="kv-overlay" class="overlay"></div><div id="errorDialog"><div id="errorHolder"></div><div class="close bl-close"><a href="#">Close</a></div><div class="close br-close"><a href="#">Close</a></div></div>';

        if ($(selector).length == 0) {
            //console.log("selector '" + selector + " not found in the document!");
            return;
        }
        $(tmpl).appendTo(selector);
        var iframe = $('<iframe id="dialogFrame"/>').appendTo('#errorHolder');
        var target = $(iframe).contents()[0];
        target.open();
        target.write('<!doctype html><html><head></head><body></body></html>');
        target.close();
        $('#dialogFrame').contents().find('body').empty().html(text);

        if (typeof prettyPrint !== "undefined") {
            prettyPrint(null, $('#dialogFrame')[0].contentDocument.body);
        }

        applyStyling();

        showDialog();
        $(".close a").on("click", function(event) {
            hideDialog();
        });
        // Bind esc key
        $(document).on('keydown', function(e) {
            if (e.keyCode === 27) { // ESC
                e.preventDefault();
                hideDialog();
            }
        });
        $('.overlay').on('click', function(e) {
            e.preventDefault();
            hideDialog();
        });
        function showDialog() {
            $(".overlay").show();
            $("#errorDialog").show();
            size($("#errorDialog"));
            center($("#errorDialog"));
        }

        function hideDialog() {
            $(".overlay").hide();
            $("#errorDialog").hide();
            $('.overlay').off('click');
            $(document).off('keydown');
            $("#kv-overlay").remove();
            $("#errorDialog").remove();
        }

        function size(element) {
            var h = ($(window).height());
            var w = ($(window).width());
            h = h / 150 * 100;
            w = w / 120 * 100;
            element.css("height", Math.max(0, h) + "px");
            element.css("width", Math.max(0, w) + "px");
        }

        function center(element) {
            element.css("position", "absolute");
            var oh = element.outerHeight();
            var ow = element.outerWidth();
            var wh = $(window).height();
            var ww = $(window).width();
            var t = ((wh - oh) / 2);
            var l = ((ww - ow) / 2);
            t += $(document).scrollTop();
            l += $(document).scrollLeft();

            element.css("top", Math.max(0, t) + "px");
            element.css("left", Math.max(0, l) + "px");
        }

        function applyStyling() {

            $('#kv-overlay').css({
                width: '100%',
                height: '100%',
                position: 'fixed',
                display: 'none',
                top: '0px',
                left: '0px',
                opacity: '0.8',
                'background-color': '#eee'
            });

            $('#errorHolder').css({
                width: '100%',
                height: '100%'

            });

            $('#errorDialog').css({
                display: 'none',
                opacity: '1',
                position: 'absolute',
                height: '90%',
                width: '90%',
                padding: '35px',
                margin: '0 auto',
                'z-index': '99',
                'background-color': '#fff',
                top: '20px',
                left: '20px',
                'border-radius': '10px',
                border: '1px solid #ccc',
                'border-color': '#9ecaed',
                'box-shadow': '0 0 5px 5px #ddd'
            });

            $('#dialogFrame').css({
                border: '1px solid #ccc',
                'border-radius': '10px',
                'height': '100%',
                width: '100%'
            });

            $('.close').css({
                position: 'absolute'
            });

            $('.bl-close').css({
                bottom: '5px',
                left: '10px'
            });

            $('.br-close').css({
                bottom: '5px',
                right: '10px'
            });
        }
    };

    // so far supports only Firefox, Chrome and Opera (buggy), Safari (for real exceptions)
// Later Safari and IE10 are supposed to support error.stack as well
// See also https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error/Stack
    $.jock.extractStacktrace = function(e, offset) {
        var fileName="pok.js";
        offset = offset === undefined ? 0 : offset;

        var stack, include, i;

        if (e.stacktrace) {
            // Opera
            return e.stacktrace.split("\n")[ offset + 3 ];
        } else if (e.stack) {
            // Firefox, Chrome
            stack = e.stack.split("\n");
            if (/^error$/i.test(stack[0])) {
                stack.shift();
            }
            if (fileName) {
                include = [];
                for (i = offset; i < stack.length; i++) {
                    if (stack[ i ].indexOf(fileName) !== -1) {
                        break;
                    }
                    include.push(stack[ i ]);
                }
                if (include.length) {
                    return include.join("\n");
                }
            }
            return stack[ offset ];
        } else if (e.sourceURL) {
            // Safari, PhantomJS
            // hopefully one day Safari provides actual stacktraces
            // exclude useless self-reference for generated Error objects
            //console.log("e.sourceURL", e.sourceURL);
            if (/qunit.js$/.test(e.sourceURL)) {
                return;
            }
            // for actual exceptions, this is useful
            return e.sourceURL + ":" + e.line;
        }
    };

    $.jock.sourceFromStacktrace = function(offset) {
        try {
            throw new Error();
        } catch (e) {
            return $.jock.extractStacktrace(e, offset);
        }
    };
    
    $.jock.extractFileName = function() {
        var fileName = ($.jock.sourceFromStacktrace( 0 ) || "" ).replace(/(:\d+)+\)?/, "").replace(/.+\//, "");
        return fileName;
    };

    return $.jock;
}));
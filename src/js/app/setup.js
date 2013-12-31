define(function(require) {
    console.log("Setup starting!");

    var $ = require("jquery");
    require("spamd/spamd");
    var viewManager = require("spamd/view/view-manager");
    var Home = require("./views/home/Home");
    var Intro = require("./views/intro/Intro");
    var API = require("./views/api/API");
    var Docs = require("./views/docs/Docs");
    var Why = require("./views/why/Why");
    var prettify = require("prettify");
    require("domReady!");
    
    setupActiveMenu();

    var options = {};
    options.routes = {
        "api": API.id,
        "intro": Intro.id,
        "docs": Docs.id,
        "home": Home.id,
        "why": Why.id
    };

    options.onHashChange = function(view) {
        var routesByPath = viewManager.getRoutesByPath();
        var route = routesByPath[view.id];
        console.log("change", view, view.id, "Route:", route);
        $("#navbar li.active").removeClass("active");

        if (route == null) {
            console.warn("View with id '", view.id, "' does not have a route defined. Cannot determine which menu item this view is associated with.");
            return;
        }
        var item = $("#menu-" + route).parent();
        var location = getActiveMenuLocation(item);
        item.addClass("active");
        $("#nav-ind").css(location);

    };
    options.defaultView = Home;
    //options.animate= false;
    //options.target = "#moo";

    /*
    options.animateHandler = function(html, options) {
        var target = options.target;
            var $target = $(target);
            var viewAttached = options.viewAttached;
            var viewVisible = options.viewVisible;
            $target.fadeOut(1000, function() {

                $target.empty();
                $target.html(html);
                viewAttached(options);
                $target.fadeIn('fast', function() {
                    viewVisible(options);
                });
            });
    };*/
    //options.params = {p1: ["val1", "val2"], p2: "pok"};
    options.globalOnAttached = function(options) {
        prettify.prettyPrint();
    };

    console.log("calling viewManager.init");
    // Move main code to here???
    //options.bindTemplate = false;
    viewManager.init(options);
    console.log("viewManager.init called");

    function setupActiveMenu() {
        //var offsetLeft = $(homeItem).offset().left - $('#navbar').offset().left;
        //var right = $('#navbar').width() - $(homeItem).width() - offsetLeft;
        //$('#nav-ind').css({right: right});


        $('#navbar li').click(function() {
            if (!$(this).hasClass('active')) {
                $('li.active').removeClass('active');
                slideToActive($(this));
            }
        });
    }

    function slideToActive(li) {
        $(li).addClass('active');
        //var offsetTop = $(li).offset().top - $('#navbar').offset().top;
        var location = getActiveMenuLocation(li);
        $('#nav-ind').animate(location, 'fast', 'linear');
    }

    function getActiveMenuLocation(li) {
        var offsetTop = 57;
        var $item = $(li);
        var offsetLeft = 0;
        if ($item.length) {
            var offsetLeft = $item.offset().left - $('#navbar').offset().left;
        }
        var location = {
            top: offsetTop,
            left: offsetLeft,
            right: $('#navbar').width() - $(li).width() - offsetLeft,
            bottom: $('#navbar').height() - $(li).height() - offsetTop
        };
        return location;
    }

    return {
        start: function() {

        }
    };
});
define(function(require) {
    var $ = require("jquery");
    var template = require("hb!./Home.htm");
    var titlePartial = require("hb!./title.htm");
    var Handlebars = require("handlebars");
        var te = require("spamd/template/template-engine");
    var viewManager = require("spamd/view/view-manager");
    require("domReady!");

    function Home() {

        // private variables
        var that = this;

        // priviledged methods

        this.onInit = function(dom, args) {
                Handlebars.registerPartial("titlePartial", titlePartial);
            //onReady();
            var context = {'name': 'Bob'};
            var options = {
                bindtarget: "#container",
                data : {
                    one: "two",
                    testAction: function(e, context, options) {
                        e.preventDefault();
                        //console.log("Hi Bob!" + Date.now());
                        console.log("context:", context, "options:", options);
                    }
                }
            };
            var html = te.render(this.getTemplate(), context, options);

            dom.attach(html).then(function() {
                //alert("Goes");
               //te.bind("#cont");
                //te.bind();
                //te.bind();
                onAttached(args);
                });
        };

        this.getTemplate = function() {
            return template;
        };

        // private methods
        function onAttached(args) {

/*
            $("#manageProducts").click(function(evt) {
            });

            $("#manageServices").click(function(evt) {
            });

            $("#manageOpportunities").click(function(evt) {
            });*/
        }
    }



    return Home;

});
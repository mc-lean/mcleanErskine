/*** MainView ***/

// define this module in Require.JS
define(function(require, exports, module) {

    // Import additional modules to be used in this view 
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ImageSurface = require('famous/surfaces/ImageSurface');

    // Constructor function for our MainView class
    function MainView() {
        // Applies View's constructor function to MainView class
        View.apply(this, arguments);
        
        this.rootModifier = new StateModifier();
        
        this.mainNode = this.add(this.rootModifier);
        _createBackground.call(this);
    }

    // Establishes prototype chain for MainView class to inherit from View
    MainView.prototype = Object.create(View.prototype);
    MainView.prototype.constructor = MainView;

    // Default options for MainView class
    MainView.DEFAULT_OPTIONS = {
        baseUrl: "https://s3.amazonaws.com/elasticbeanstalk-us-east-1-538093400772/mcleanErskine/",
        size: [1280, 1920]
    };

    // Define your helper functions and prototype methods here
    function _createBackground(){
        var background = new Surface({
            size : [undefined, undefined],
            properties: { 
                backgroundImage: "url(" + this.options.baseUrl +  "ggBridgeBackground.jpg )",
                backgroundRepeate: "no-repeat",
                backgroundPosition: "bottom",
                backgroundSize: "cover"
            }
        });
        
        this.mainNode.add(background);
    }

    module.exports = MainView;
});

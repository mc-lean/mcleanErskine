/*** BoxView ***/

// define this module in Require.JS
define(function(require, exports, module) {

    // Import additional modules to be used in this view 
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Timer           = require('famous/utilities/Timer');

    // Constructor function for our BoxView class
    function BoxView() {
        // Applies View's constructor function to BoxView class
        View.apply(this, arguments);
        
        _createBackground.call(this);
        _createTitle.call(this);
        _setListener.call(this);
    }

    // Establishes prototype chain for BoxView class to inherit from View
    BoxView.prototype = Object.create(View.prototype);
    BoxView.prototype.constructor = BoxView;

    // Default options for BoxView class
    BoxView.DEFAULT_OPTIONS = {
        fontSize: 25,
        height: 150,
        width: 110,
        opacity: 1
    };

    // Define your helper functions and prototype methods here
    function _createBackground(){
         this.backgroundSurface = new Surface({
            size: [this.options.width, this.options.height],
            classes: ["menu-item", this.options.title],
            data: [this.options.title],
            properties: {
                backgroundColor: 'rgb(107,107,107)'
            }
        });
        
        this.backgroundModifier = new StateModifier({
            opacity: this.options.opacity
        });
        
        this.add(this.backgroundModifier).add(this.backgroundSurface);
    }
    
    function _createTitle(){
        var titleSurface = new Surface({
            size: [this.options.width, true],
            content: this.options.title,
            properties: {
                fontSize: this.options.fontSize + 'px',
                fontFamily: 'Special Elite',
                textTransform: 'lowercase',
                pointerEvents: 'none',
                color: 'whitesmoke',
                textAlign: 'center'
            }
        });
        
        var titleModifier = new StateModifier({
            transform: Transform.translate(0, (this.options.height / 2) - (this.options.fontSize / 2), 0)
        });
        
        this.add(titleModifier).add(titleSurface);
    }
    function _setListener(){
        this.backgroundSurface.on("click", function(){
            this._eventOutput.emit('boxClick', this.options.title);
            this._eventOutput.emit(this.options.title);
        }.bind(this));
    }

    module.exports = BoxView;
});

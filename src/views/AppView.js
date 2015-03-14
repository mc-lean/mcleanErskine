/*** AppView ***/

// define this module in Require.JS
define(function(require, exports, module) {

    // Import additional modules to be used in this view 
    var Transitionable  = require('famous/transitions/Transitionable');
    var StateModifier   = require('famous/modifiers/StateModifier');
    var EventHandler    = require('famous/core/EventHandler');
    var FastClick       = require('famous/inputs/FastClick');
    var Transform       = require('famous/core/Transform');
    var Modifier        = require('famous/core/Modifier');
    var Surface         = require('famous/core/Surface');
    var View            = require('famous/core/View');

    // Import classes 
    // var MenuView = require('views/MenuView');
    var PageView = require('views/PageView');
    var PageData = require('data/PageData');

    // Constructor function for our AppView class
    function AppView() {
        // Applies View's constructor function to AppView class
        View.apply(this, arguments);

        _createPageView.call(this);
        // _createMenuView.call(this);
        // _setListeners.call(this);
    }

    // Establishes prototype chain for AppView class to inherit from View
    AppView.prototype = Object.create(View.prototype);
    AppView.prototype.constructor = AppView;

    // Default options for AppView class
    AppView.DEFAULT_OPTIONS = {};

    // Define your helper functions and prototype methods here
    function _createPageView(){
        this.pageView = new PageView({ pageData : PageData });

        this.add(this.pageView);
    }
    
    function _createMenuView(){
        this.menuView = new MenuView({ boxData : BoxData });
        this.menuModifier = new StateModifier();
        
        this.add(this.menuModifier).add(this.menuView);
    }
    function _setListeners(){
        this.menuView.on('changePage', function(event){
            this.pageView.changePage(event);
        }.bind(this));
    }

    module.exports = AppView;
});

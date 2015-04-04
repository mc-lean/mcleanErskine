/*** AppView ***/

// define this module in Require.JS
define(function(require, exports, module) {

    // Import additional modules to be used in this view 
    var Transitionable  = require('famous/transitions/Transitionable');
    var StateModifier   = require('famous/modifiers/StateModifier');
    var Easing          = require('famous/transitions/Easing');
    var EventHandler    = require('famous/core/EventHandler');
    var FastClick       = require('famous/inputs/FastClick');
    var RenderNode      = require('famous/core/RenderNode');
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

        // _createLogo.call(this);
        _addListeners.call(this);
        _createPageView.call(this);
        _createNewLogo.call(this);
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
    
    function _addListeners(){
        
        var transition = { durration: 200, curve: 'easeIn' },
            move = 60;
        this.on('slide', function(){
            console.log('move');
            
            this.mcleanMove.set(-move, transition);
            this.erskineMove.set(
                move, transition, 
                function() { 
                    this.logoOpacity.set(
                        0, transition,
                        function() {
                            
                            this._eventOutput.emit('good morning');
                        }.bind(this.pageView)
                    );
                }.bind(this)
            );
        }.bind(this));
    }
    
    function _createNewLogo(){
        
                
        this.erskineMove = new Transitionable(0);
        this.logoOpacity = new Transitionable(1);
        this.mcleanMove = new Transitionable(0);
        this.width = new Transitionable(110);
        
        var logoSurface = new Surface({
            properties: {
                backgroundColor: 'black'
            }
        });
        
        var logoSurfaceMod = new Modifier();
        
        logoSurfaceMod
            .opacityFrom(function(){ return this.logoOpacity.get(); }.bind(this))
            .transformFrom(function(){ return Transform.translate(0, 0, 1); });
        
        var logoNode = new RenderNode(logoSurfaceMod);
        logoNode.add(logoSurface);
    
        
        var style = {
            fontFamily: 'Special Elite',
            overflow: 'hidden',
            textAlign: 'left',
            fontSize: '30px',
            color: 'white'
        };
        
        var mclean = new Surface({
            content: "mclean",
            properties: style,
        });
        
        var mcleanModifier = new Modifier();
        
        mcleanModifier
            .transformFrom(function(){ return Transform.translate(this.mcleanMove.get(), 0, 0); }.bind(this))
            .sizeFrom(function(){ return [this.width.get(), 60]; }.bind(this))
            .originFrom( [0.5,0.5] );
            
        var erskine = new Surface({
            content: 'erskine',
            properties: style,
        });
        
        var erskineModifier = new Modifier({
            origin : [0.5,0.5],
        });
        
        erskineModifier
            .transformFrom(function(){ return Transform.translate(this.erskineMove.get(), 0, 0); }.bind(this))
            .sizeFrom(function(){ return [this.width.get() + 10, 60]; }.bind(this));
        

        this._eventOutput.emit('slide');
        
        
        logoNode
            .add(mcleanModifier)
            .add(mclean);
        
        logoNode
            .add(erskineModifier)
            .add(erskine);
        
        this.add(logoNode);
    }
    
    function _createLogo() {
        this.width = new Transitionable(110);
        this.zMove = new Transitionable(-120);
        var style = {
            fontFamily: 'Special Elite',
            overflow: 'hidden',
            textAlign: 'left',
            fontSize: '30px',
            color: 'black'
        };
        
        var mclean = new Surface({
            content: "mclean",
            properties: style,
        });
        
        var mcleanModifier = new Modifier();
        
        mcleanModifier
            .sizeFrom(function(){ return [this.width.get(), 60]; }.bind(this))
            .transformFrom(function(){ return Transform.translate(this.zMove.get(), 0, 0); }.bind(this))
            .originFrom( [1,1] );
        
        var erskine = new Surface({
            content: 'erskine',
            properties: style,
        });
        
        var erskineModifier = new Modifier({
            origin : [1,1],
        });
        
        erskineModifier
            .sizeFrom(function(){ return [this.width.get() + 10, 60]; }.bind(this));
        
        mclean.on('click', function(){
            this._eventOutput.emit('slide');
        }.bind(this));
        
        this
            .add(mcleanModifier)
            .add(mclean);
            
        this
            .add(erskineModifier)
            .add(erskine);
    }


    module.exports = AppView;
});

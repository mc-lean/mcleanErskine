/*** AppView ***/

// define this module in Require.JS
define(function(require, exports, module) {

    // Import additional modules to be used in this view 
    var Transitionable  = require('famous/transitions/Transitionable');
    var StateModifier   = require('famous/modifiers/StateModifier');
    var RenderCtlr      = require("famous/views/RenderController");
    var Easing          = require('famous/transitions/Easing');
    var EventHandler    = require('famous/core/EventHandler');
    var FastClick       = require('famous/inputs/FastClick');
    var Timer           = require('famous/utilities/Timer');
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

        _addListeners.call(this);
        _createLogo.call(this);
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
        // Set backgound image for the body after loading the intro
        document.body.style.backgroundImage = "url('https://s3.amazonaws.com/elasticbeanstalk-us-east-1-538093400772/mcleanErskine/ggBridgeBackground.jpg')";
        
        var transition = { durration: 300, curve: Easing.inOutCirc() },
            move = 60;
            
        this.on('slide', function(){
            
            this.mcleanMove.set(-move, transition);
            this.erskineMove.set(
                move, transition, 
                function() { 
                    Timer.setTimeout(function(){
                        
                        this.scale.set(0, transition);
                        this.mcleanMove.set(move, transition);
                        this.pageView._eventOutput.emit('goodMorning'); 
                        this.renderCtlr.hide(); 
                        
                    }.bind(this), 
                    300);
                    
                }.bind(this)
            );
        }.bind(this));
    }
    
    function _createNewLogo(){
        
        this.erskineMove = new Transitionable(0);
        this.mcleanMove = new Transitionable(0);
        this.width = new Transitionable(110);
        this.scale = new Transitionable(1);
        
        this.renderCtlr = new RenderCtlr({
            inTransition: {
                curve: Easing.inOutCirc,
                duration: 1000
            },
            outTransition: {
                curve: Easing.inOutCirc,
                duration: 1000
            },
            overlap: false
        });
        
        var logoSurface = new Surface({
            properties: {
                backgroundColor: 'black'
            }
        });
        
        this.logoSurfaceMod = new Modifier();
        
        // Move it forward in Z index
        this.logoSurfaceMod
            .transformFrom(function(){ return Transform.translate(0, 0, 1); });
        
        var logoNode = new RenderNode(this.logoSurfaceMod);
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
        
        var mcleanModifier = new Modifier({
            origin : [0.5,0.5],
            align: [0.5,0.5],
            size : [110, 60],
            transform : function(){
                return Transform.translate(this.mcleanMove.get(), 0, 0); 
            }.bind(this)
        });
        
        var mcleanScale = new Modifier({
            transform: function(){
                var startScale = this.scale.get();
                return Transform.scale(startScale, startScale, startScale);
            }.bind(this)
        });
        
        var erskine = new Surface({
            content: 'erskine',
            properties: style,
        });
        
        var erskineModifier = new Modifier({
            origin : [0.5,0.5],
            align: [0.5,0.5],
            size : [120, 60],
            transform : function(){
                return Transform.translate(this.erskineMove.get(), 0, 0);
            }.bind(this)
        });
        
        var erskineScale = new Modifier({
            transform: function(){
                var startScale = this.scale.get();
                return Transform.scale(startScale, startScale, startScale);
            }.bind(this)
        });
        
        
        logoNode
            .add(mcleanModifier)
            .add(mcleanScale)
            .add(mclean);
        
        logoNode
            .add(erskineModifier)
            .add(erskineScale)
            .add(erskine);
            
        this.renderCtlr
            .inOpacityFrom( function(){ return 1; } ); 
        
        this.renderCtlr.show(logoNode);
        
        this.add(this.renderCtlr);
        
        
        Timer.setTimeout(function() {
            
            this._eventOutput.emit('slide');
        }.bind(this), 
        500);
    }
    
    function _createLogo() {
        
       var logoView = new Surface({
            content: "Under Development",
            size: [310,40],
            properties: {
                fontFamily: 'Special Elite',
                textAlign: 'center',
                fontSize: '30px',
                color: 'rgb(202, 48, 48)'
            }
        });
        
        var logoModifier = new StateModifier({
            origin: [1,1],
            align: [1,1]
        });
        
        this.add(logoModifier).add(logoView);
     }


    module.exports = AppView;
});

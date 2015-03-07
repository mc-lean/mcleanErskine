/*** ContentView ***/

// define this module in Require.JS
define(function(require, exports, module) {

    // Import additional modules to be used in this view 
    var Transitionable      = require('famous/transitions/Transitionable');
    var HeaderFooterLayout  = require("famous/views/HeaderFooterLayout");
    var SequentialLayout    = require("famous/views/SequentialLayout");
    var Easing              = require('famous/transitions/Easing');
    var EventHandler        = require('famous/core/EventHandler');
    var RenderNode          = require('famous/core/RenderNode');
    var Transform           = require('famous/core/Transform');
    var Modifier            = require('famous/core/Modifier');
    var Surface             = require('famous/core/Surface');
    var View                = require('famous/core/View');
    
    var MusicData = require('data/MusicData');

    // Constructor function for our ContentView class
    function ContentView() { 

        // Applies View's constructor function to ContentView class
        View.apply(this, arguments); 
        
        this.currentPage = null;
        this.originalPoition = null;
        
        _createContent.call(this);
        
        _setListeners.call(this);
    }

    // Establishes prototype chain for ContentView class to inherit from View
    ContentView.prototype = Object.create(View.prototype);
    ContentView.prototype.constructor = ContentView;

    // Default options for ContentView class
    ContentView.DEFAULT_OPTIONS = {
        videoSurfaceSize: window.innerWidth / MusicData.length,
        pageInfo: {}
    };
    
    function _setListeners(){
        this.xOutEvents.on('videoBlur', function(){
            this.videoBlur(this.currentPage);
        }.bind(this));
    }
    
    function _createContent(){
        var pageInfo = this.options.pageInfo;
        this.xOut = new Transitionable(0);
        this.xOutEvents = new EventHandler();
        
        this.layout = new HeaderFooterLayout({
            headerSize: 60
        });
        
        var header = new Surface({
            content: pageInfo.title,
            properties: {
                backgroundColor: 'black',
                textAlign: 'right',
                color: 'white'
            }
        });
        
        var content = page[pageInfo.title].call(this);
        
        var closeX = new Surface({
            size: [20,20],
            content: "X",
            properties: {
                fontFamily: "arial",
                fontWeight: "normal",
                cursor: "pointer",
                fontSize: "30px",
                color: "white"
            }
        });
        
        var closeXModifier = new Modifier({
            transform: Transform.translate(0,0,1),
            origin: [1,0]
        });
        
        closeXModifier.opacityFrom(function(){ return this.xOut.get(); }.bind(this));
        
        var closeOut = new RenderNode(closeXModifier);
        
        closeOut.add(closeX);
        
        header.on("click", function(e){
            e.preventDefault(); e.stopPropagation(); 
            
            this._eventOutput.emit('zoomOut');
            return false;
        }.bind(this));
        
        
        closeX.on("click", function(e){
            e.preventDefault(); e.stopPropagation(); 
            
            this.xOutEvents.emit("videoBlur");
            
        }.bind(this));
        
        
        this.layout.content
            .add(content)
            .add(closeOut);
            
        this.layout.header.add(header);
        this.add(this.layout);
        
    }
    

    var page = {
        
        about : function(){
            
        },
        music : function(){
            
            var surface = new RenderNode(),
                opts = this.options,
                surfaces = [],
                x = 0;
            
            this.videoSurfaceModifiers = [];
            this.sizeModifiers = [];
            this.xTransitions = [];
            this.zS = [];
            
            
            MusicData.forEach(function(song, i){
                
                var sizeModifier = new Transitionable([opts.videoSurfaceSize, undefined]),
                    xTransition  = new Transitionable(x),
                    z = new Transitionable(0);
                
                var videoSurface = new Surface({
                    // content: "<iframe width='100%' height='100%' src="+ MusicData[i].src +" frameborder='0' allowfullscreen></iframe>",
                    properties : {
                        backgroundColor : "hsl(" + (i * 360 / 10) + ", 100%, 50%)",
                        overflow : "hidden",
                        cursor: 'pointer'
                    }
                });
                
                var videoSurfaceModifier = new Modifier();

                videoSurfaceModifier
                    .transformFrom( function(){ return Transform.translate(xTransition.get(), 0, z.get()) })
                    .sizeFrom( function(){ return sizeModifier.get() });
                
                surface
                    .add(videoSurfaceModifier)
                    .add(videoSurface);
                
                videoSurface.on("click", function(){ this.videoFocus(i); }.bind(this));
                
                this.videoSurfaceModifiers.push(videoSurfaceModifier);
                this.sizeModifiers.push(sizeModifier);
                this.xTransitions.push(xTransition);
                this.zS.push(z);
                
                x += opts.videoSurfaceSize;
                surfaces.push(surface);
                
            }.bind(this));

            return surface;
            
        },
        resume : function(){
            
        },
        contact : function(){
            
        }
    };
    // Define your helper functions and prototype methods here
    
    ContentView.prototype.videoBlur = function(x){
        
        var animation = { duration: 500, curve: 'easeIn' };
        this.currentPage = null;
        
        this.xTransitions[x].set(this.originalPoition, animation);
        
        this.sizeModifiers[x].set(
            [this.options.videoSurfaceSize, undefined], 
            animation, 
            function(){ 
                
                this.zS[x].set(0); 
                
            }.bind(this)
        );
        
        this.xOut.set(0, animation); 
    };
    
    ContentView.prototype.videoFocus = function(x){
        
        var animation = { duration: 500, curve: 'easeIn' };
        
        if(this.currentPage === x) return; 
        
        
        this.originalPoition = this.xTransitions[x].get();
        this.xTransitions[x].set(1, animation);
        this.currentPage = x;
        this.zS[x].set(1);
        
        this.sizeModifiers[x].set(
            [window.innerWidth, undefined], 
            animation, 
            function(){ 
                
                this.xOut.set(1, animation); 
                
            }.bind(this)
        );
    };

    module.exports = ContentView;
});

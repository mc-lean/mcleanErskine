/*** ContentView ***/

// define this module in Require.JS
define(function(require, exports, module) {

    // Import additional modules to be used in this view 
    var Transitionable      = require('famous/transitions/Transitionable');
    var HeaderFooterLayout  = require("famous/views/HeaderFooterLayout");
    var SequentialLayout    = require("famous/views/SequentialLayout");
    var Easing              = require('famous/transitions/Easing');
    var GenericSync         = require('famous/inputs/GenericSync');
    var EventHandler        = require('famous/core/EventHandler');
    var RenderNode          = require('famous/core/RenderNode');
    var MouseSync           = require('famous/inputs/MouseSync');
    var Scrollview          = require("famous/views/Scrollview");
    var TouchSync           = require('famous/inputs/TouchSync');
    var Transform           = require('famous/core/Transform');
    var Modifier            = require('famous/core/Modifier');
    var Surface             = require('famous/core/Surface');
    var View                = require('famous/core/View');
    
    var MusicData = require('data/MusicData');
    
    GenericSync.register({'mouse': MouseSync, 'touch': TouchSync});

    // Constructor function for our ContentView class
    function ContentView() { 

        // Applies View's constructor function to ContentView class
        View.apply(this, arguments); 
        
        this.currentPage = null;
        this.originalPoition = null;
        this.pageReady = false;

        
        _createContent.call(this);
        
        _setListeners.call(this);
    }

    // Establishes prototype chain for ContentView class to inherit from View
    ContentView.prototype = Object.create(View.prototype);
    ContentView.prototype.constructor = ContentView;

    // Default options for ContentView class
    ContentView.DEFAULT_OPTIONS = {
        videoSurfaceSize: Math.ceil(window.innerWidth / MusicData.length),
        pageInfo: {}
    };
    
    function _setListeners(){
        this.xOutEvents.on('videoBlur', function(x){
            
            if(!x) return;      // If x (currentPage) is null return
            
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
        }.bind(this));
        
        
        // !!!!!!!!!!!!!!Prevent bubbling !!!!!!!!!!!!!!!!!
        // let the current page know that it is showing and
        this.on('ready', function(){ this.pageReady = true; });
        
        this.on('videoFocus', function(x){
            
            if(!this.pageReady) return;
            
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
            
        }.bind(this));
    }
    
    function _createContent(){
        var pageInfo = this.options.pageInfo;
        this.xOutEvents = new EventHandler();
        this.xOut = new Transitionable(0);
        
        this.layout = new HeaderFooterLayout({
            headerSize: 60
        });
        
        // Make the Header
        var header = page.header.call(this);
        
        //Make the content of the page 
        var content = page[pageInfo.title].call(this);
        
        var closeX = new Surface({
            size: [50,50],
            content: "X",
            properties: {
                fontFamily: 'Special Elite',
                fontWeight: "normal",
                textAlign: "center",
                lineHeight: "50px",
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
        
        
        closeX.on("click", function(){
            
            this.xOutEvents.emit("videoBlur", this.currentPage);
            
        }.bind(this));
        
        
        this.layout.content
            .add(content)
            .add(closeOut);
            
        this.layout.header
            .add(header);
            
        this.add(this.layout);
        
    }
    

    var page = {
        
        header : function(){
            var headerNode = new RenderNode();
            
            var headerBackground = new Surface({
                properties: {
                    backgroundColor: "black"
                }
            });
            
            var headerModifier = new Modifier({
                transform: Transform.behind
            });
            
            var title = new Surface({
                content: this.options.pageInfo.title,
                size: [200, 60],
                properties: {
                    fontFamily: 'Special Elite',
                    textAlign: 'center',
                    lineHeight: "60px",
                    fontSize: "30px",
                    color: 'white'
                }
            }); 
            
            var titleModifier = new Modifier({
                origin: [0.5, 0.5]
            });
            
            var closePageX = new Surface({
                size: [50,60],
                content: "X",
                properties: {
                    fontFamily: 'Special Elite',
                    textAlign: "center",
                    lineHeight: "60px",
                    cursor: "pointer",
                    fontSize: "30px",
                    color: "white"
                }
            });
            
            var closePageXModifier = new Modifier({
                origin: [1, 0.5],
                transform: Transform.inFront
                
            });
            
            closePageX.on("click", function(e){
                e.preventDefault(); e.stopPropagation();
                
                this.xOutEvents.emit('videoBlur', this.currentPage);
                this._eventOutput.emit('zoomOut');
                this.pageReady = false; 

                return false;
            }.bind(this));
            
            headerNode
                .add(headerModifier)
                .add(headerBackground);
                
            headerNode
                .add(titleModifier)
                .add(title);
            
            headerNode
                .add(closePageXModifier)
                .add(closePageX);
            
            
            return headerNode; 
        },
        about : function(){
            
            
            var aboutSurface = new RenderNode(),
                opts = this.options,
                surfaces = [];
                
            var body = new Surface({
                size: [undefined, undefined],
                properties: {
                    backgroundColor: 'gray',
                }
            });
            
            var scrollview = new Scrollview();
            
            scrollview.sequenceFrom(surfaces);
    
            for (i = 0; i < 1000; i++) {
                
                
                var surface = new Surface({
                    size: [undefined, 90],
                    content: "surface " + (i + 1),
                    properties: {
                        color: "#ffffff",
                        backgroundColor : "hsl(" + (i * 360 / 50) + ", 100%, 50%)",
                        border: "5px black solid",
                        textAlign: 'center',
                        lineHeight: "50px",
                        cursor: 'default'
                    }
                });
    
                surface.pipe(scrollview);
                var mod = new Modifier({
                    transform: Transform.translate(0,0,-1)
                });
 
                var node = new RenderNode(mod);
                node.add(surface);
                surfaces.push(node);
            }
            
            
            
            aboutSurface
                .add(scrollview)
                .add(body);
            
            return aboutSurface; 
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
                
                // add new video surfaces to the render node
                surface
                    .add(videoSurfaceModifier)
                    .add(videoSurface);
                
                videoSurface.on("click", function(){ 
                    
                    this._eventOutput.emit('videoFocus', i); 
                    
                }.bind(this));
                
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

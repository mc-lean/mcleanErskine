/*** ContentView ***/

// define this module in Require.JS
define(function(require, exports, module) {

    // Import additional modules to be used in this view 
    var Transitionable      = require('famous/transitions/Transitionable');
    var HeaderFooterLayout  = require("famous/views/HeaderFooterLayout");
    var SequentialLayout    = require("famous/views/SequentialLayout");
    var Easing              = require('famous/transitions/Easing');
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
        
        
        _createContent.call(this);
    }

    // Establishes prototype chain for ContentView class to inherit from View
    ContentView.prototype = Object.create(View.prototype);
    ContentView.prototype.constructor = ContentView;

    // Default options for ContentView class
    ContentView.DEFAULT_OPTIONS = {
        videoSurfaceSize: window.innerWidth / MusicData.length,
        pageInfo: {}
    };
    
    function _createContent(){
        var pageInfo = this.options.pageInfo;
        
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
        
        header.on("click", function(){
            this._eventOutput.emit('zoomOut');
        }.bind(this));
        
        this.layout.content.add(content);
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
            
            
            MusicData.forEach(function(song, i){
                
                var sizeModifier = new Transitionable([opts.videoSurfaceSize, undefined]),
                    xTransition = new Transitionable(x);
                
                var videoSurface = new Surface({
                    // content: "<iframe width='100%' height='100%' src="+ MusicData[i].src +" frameborder='0' allowfullscreen></iframe>",
                    properties : {
                        backgroundColor : "hsl(" + (i * 360 / 10) + ", 100%, 50%)",
                        overflow : "hidden"
                    }
                });
                
                
                var videoSurfaceModifier = new Modifier({
                    // transform: function(){
                    //     var xTrans = xTransition.get();
                    //     return Transform.translate(xTrans, 0,0);
                    // }
                });

                videoSurfaceModifier
                    .transformFrom( function(){ return Transform.translate(xTransition.get(), 0, 0) })
                    .sizeFrom( function(){ return sizeModifier.get() });
                
                
                surface
                    .add(videoSurfaceModifier)
                    .add(videoSurface);
                
                videoSurface.on("click", function(){ this.videoFocus(i); }.bind(this));
                
                this.videoSurfaceModifiers.push(videoSurfaceModifier);
                this.sizeModifiers.push(sizeModifier);
                this.xTransitions.push(xTransition);
                
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
    
    ContentView.prototype.videoFocus = function(x){
        
        this.videoSurfaceModifiers[x].transformFrom(Transform.inFront);
        this.xTransitions[x].set(0, {duration: 1000, curve: 'easeIn'});
        
            
        this.sizeModifiers[x].set([undefined, undefined], { duration: 500, curve: 'easeIn' });
    };

    module.exports = ContentView;
});

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
        gridSize: window.innerWidth / MusicData.length,
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
        
        console.log(this.layout);
    }

    var page = {
        
        about : function(){
            
        },
        music : function(){
            
            var sequentialLayout = new SequentialLayout({ direction : 0 }),
                opts = this.options,
                surfaces = [];
                
            this.sizeModifiers = [],
            
            MusicData.forEach(function(song, i){
                
                var sizeModifier = new Transitionable([opts.gridSize, undefined]);
                
                var grid = new Surface({
                    // size: [window.innerWidth / MusicData.length, undefined],
                    // content: "<iframe width='100%' height='100%' src="+ MusicData[i].src +" frameborder='0' allowfullscreen></iframe>",
                    properties : {
                        backgroundColor : "hsl(" + (i * 360 / 10) + ", 100%, 50%)",
                        overflow : "hidden"
                    }
                });
                
                
                var gridModifier = new Modifier({
                    size: sizeModifier
                });
                
                //Use RenderNode to add the Modifier to the surface for sequential Layout
                var surface = new RenderNode(gridModifier);
                
                surface.add(grid);
                
                grid.on("click", function(){ this.videoFocus(i); }.bind(this));
                
                this.sizeModifiers.push(sizeModifier);
                
                surfaces.push(surface);
                
            }.bind(this));

            
            sequentialLayout.sequenceFrom(surfaces);
            
            return sequentialLayout;
            
            // this.layout.content
            //     .add(sequentialLayout);
            
        },
        resume : function(){
            
        },
        contact : function(){
            
        }
    };
    // Define your helper functions and prototype methods here
    
    ContentView.prototype.videoFocus = function(x){
        
        // console.log(this.surfaces[x]);
        // this.surfaces[x].setTransform(Transform.translate(200,200,2), { duration: 1000, curve: 'easeIn' });
        this.sizeModifiers[x].set([200, undefined], { duration: 1000, curve: 'easeIn' });
    };

    module.exports = ContentView;
});

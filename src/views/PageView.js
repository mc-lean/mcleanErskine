/*** PageView ***/
var Page;
// define this module in Require.JS
define(function(require, exports, module) {

    // Import additional modules to be used in this view 
    var SpringTransition    = require('famous/transitions/SpringTransition');
    var Transitionable      = require('famous/transitions/Transitionable');
    var StateModifier       = require('famous/modifiers/StateModifier');
    var RenderController    = require("famous/views/RenderController");
    var ImageSurface        = require('famous/surfaces/ImageSurface');
    var Easing              = require('famous/transitions/Easing');
    var GenericSync         = require('famous/inputs/GenericSync');
    var EventHandler        = require('famous/core/EventHandler');
    var MouseSync           = require('famous/inputs/MouseSync');
    var TouchSync           = require('famous/inputs/TouchSync');
    var RenderNode          = require('famous/core/RenderNode');
    var Transform           = require('famous/core/Transform');
    var Modifier            = require('famous/core/Modifier');
    var Surface             = require('famous/core/Surface');
    var View                = require('famous/core/View');
    
    // Transitionable.registerMethod('spring', SpringTransition);
    
    GenericSync.register({'mouse': MouseSync, 'touch': TouchSync});
    
    var ContentView = require('views/ContentView');
    
    var eventHandler    = new EventHandler();

    // Constructor function for our PageView class
    function PageView() {
        // Applies View's constructor function to PageView class
        View.apply(this, arguments);
        
        this.currentPage = null;
        this.transitioning = false; 
        
        _renderPages.call(this);
        _setListeners.call(this);
        _pageMove.call(this);
        
    }

    // Establishes prototype chain for PageView class to inherit from View
    PageView.prototype = Object.create(View.prototype);
    PageView.prototype.constructor = PageView;

    // Default options for PageView class
    PageView.DEFAULT_OPTIONS = {
        baseUrl: "https://s3.amazonaws.com/elasticbeanstalk-us-east-1-538093400772/mcleanErskine/",
        spring: { method: 'spring', period: 1000, dampingRatio: 0.3},
        fadeInCurve: { duration: 1000, curve: Easing.outBack },
        contentTransition: {
            inTransition: {
                curve: Easing.easeOut,
                duration: 500
            },
            outTransition: {
                curve: Easing.easeIn,
                duration: 100
            }
        },
        defaultAngle: 0.001,
        pagePosition: 0.04,
        pageOffset: 320,
        yOffset: 0.8, 
        pageData: {}
    };

    // Define your helper functions and prototype methods here
    function _pageMove(){
        
        this.on('slide', function(data){
            var moveDistance = data.delta / window.innerWidth;
            
            this.origins.forEach(function(origin, z){
                var move = [origin.get()[0] + moveDistance, origin.get()[1]];
                
                origin.set(move);
            });
        });
    }
    
    function _setListeners(){
        this.on('goodMorning', function(){ 
            
            this.scales.forEach(function(scale, i) {
               scale.set(0.2, {duration: 2000, curve: Easing.outBack});
            });
            
        });
    }
    
    
    function _renderPages(){
        var opts        = this.options, 
            pageOffset  = opts.pagePosition,
            scaleTo     = window.innerWidth / 4 - 50;
        
        
        this.contentModifiers = [];
        this.pageModifiers = [];
        this.pageRotations = [];
        this.contentPages = [];
        this.opacities = [];
        this.origins = [];
        this.angles = [];
        this.scales = [];
        this.align  = [];
        this.pages = [];
        this.z = [];
        
        
        opts.pageData.forEach(function(page, i){
            
            
            var offset = new Transitionable([pageOffset, opts.yOffset]),
                angle = new Transitionable(opts.defaultAngle),
                z = new Transitionable(0.122222),
                opacity = new Transitionable(0),
                contentNode = new RenderNode(),
                scale = new Transitionable(0);
                
            
            var singlePage = new Surface({
                classes: [page.title, 'double-sided'],
                content: page.title, 
                properties: {
                    backgroundColor: 'rgba(255, 255, 255, 0.30)',
                    border: "2px solid rgba(0, 0, 0, 0.23)",
                    fontFamily: 'special elite',
                    textAlign: 'center',
                    lineHeight: window.innerHeight + "px",
                    cursor: 'pointer',
                    fontSize: "5em",
                    color: "black",
                } 
            });
            
            pageModifier = new Modifier();
                   
            //Add Transitionable to move the elemnts around via align and origin
            pageModifier
                .transformFrom(function(){ return Transform.rotateY(angle.get()); })
                .originFrom(function(){ return offset.get(); })
                .alignFrom(function(){ return offset.get(); });
            
            var scaleModifier = new Modifier({
                transform: function(){
                    var startScale = scale.get();
                    return Transform.scale(startScale, startScale, startScale);
                }
            });
            
            var zModifier = new Modifier({
                transform: function(){
                    return Transform.translate(0,0,0);
                }
            });
            
            // Sync touch and mouse for moving pages side to side
            var move = new GenericSync(
                ['mouse', 'touch'],
                { direction : GenericSync.DIRECTION_X }
            );
            
            singlePage.pipe(move);
            
            move.on('update', function(data){
                
                this._eventOutput.emit('slide', data);
                
            }.bind(this));
            
            move.on('end', function(data){ 
                
                if(Math.abs(data.position) < 1){ 
                    this.changePage(page); 
                }

            }.bind(this));
            
            
            move.on('click', function(){ console.log('hello'); });
            
            
            
            // CREATE CONTENT SIDE 
            var content = new ContentView({ pageInfo : page });
            
            var contentModifier = new Modifier();
            contentModifier
                .originFrom(function(){ return offset.get(); })
                .alignFrom(function(){ return offset.get(); })
                .transformFrom(Transform.translate(0,0,-2))
                .opacityFrom(function(){ return opacity.get(); });
            
            var contentScaleModifier = new Modifier({
                transform: function(){
                    var startScale = scale.get();
                    return Transform.scale(startScale, startScale, startScale);
                }
            });
            
            // contentRenderController
            //     .inOriginFrom(function(){ return offset.get(); });
            
            content.on('zoomOut', function(){ this.zoomOut(i); }.bind(this));
            

            this.contentModifiers.push(contentModifier);
            this.pageModifiers.push(pageModifier);
            this.contentPages.push(content);
            this.opacities.push(opacity);
            this.pages.push(singlePage);
            this.origins.push(offset);
            this.angles.push(angle);
            this.scales.push(scale);
            this.z.push(z);
            
            
            this
                .add(zModifier)
                .add(pageModifier)
                .add(scaleModifier)
                .add(singlePage);
                
            
            this
                .add(contentModifier)
                .add(contentScaleModifier)
                .add(content);
            
            pageOffset += 0.3;
            
            // scale.set(0.2, {duration: 2000, curve: Easing.outBack});
            
        }.bind(this));
        
        
    }
    

    PageView.prototype.toggle = function(){
        
         angle.set(1, { duration: 2000, curve: 'easeInOut' });
    };
    
    PageView.prototype.boxSize = function(){
        var windowHeight = window.innerHeight,
            windowWidth = window.innerWidth,
            boxSize = [200,300];
            
        return boxSize;
    };
    
    PageView.prototype.changePage = function(page){
        var trans = { duration: 600, curve: 'easeIn' },
            currentPage = this.currentPage,
            center = [0.5, 0.5],
            newPage = page.id,
            x = newPage;
        
        if(newPage === currentPage || this.transitioning){  return; }
        
        this.transitioning = true;

        //Math to center selected page via origin
        var moveOrigin = this.origins[x].get()[0] - 0.5;
        
        // Move front and center
        this.origins.forEach(function(origin, z){
            var yOrigin = z === x ? 0.5 : origin.get()[1],
                move = [origin.get()[0] - moveOrigin, yOrigin];
            
            origin.set(move, { duration: 800, curve: 'easeInOut' });
        });
        

        this.scales[x].set(0.5, trans);         //move Scale up 
            
        this.angles[x].set(         //Spin the page
            Math.PI, trans,
            function(){
                
                this.scales[x].set(1, trans);       //Finish the zoom in
                
                this.contentModifiers[x]          
                    .transformFrom(Transform.translate(0,0,2));
                    
                this.opacities[x].set(1, { duration: 1000, curve: 'easeIn' }, 
                    function(){
                        
                        // Emit ready so the current page can perform its events
                        this._eventOutput.emit('ready');
                    }.bind(this.contentPages[x])
                );

                
                this.transitioning = !this.transitioning;
            }.bind(this)
        );

        this.currentPage = newPage;
    };
    
    PageView.prototype.zoomOut = function(x){
        var trans = { duration: 1000, curve: 'easeIn' };
        
        if(this.transitioning){ return; }
        
        this.transitioning = true;
        
        this.origins[x].set([this.origins[x].get()[0], this.options.yOffset]);
        
        this.contentModifiers[x]          //Show content Surface
            .transformFrom(Transform.translate(0,0,-1));
            
        this.opacities[x].set(0, {duration: 150, curve: 'easeIn'}, 
            function(){

            this.scales[x].set(0.2, trans);
            this.angles[x].set(this.options.defaultAngle, trans, function(){ 
                
                this.transitioning = !this.transitioning;
                
            }.bind(this));
            
        }.bind(this));
        
        this.currentPage = null;
    };

    module.exports = PageView;
});

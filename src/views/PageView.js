/*** PageView ***/
var Page;
// define this module in Require.JS
define(function(require, exports, module) {

    // Import additional modules to be used in this view 
    var View            = require('famous/core/View');
    var Surface         = require('famous/core/Surface');
    var Transform       = require('famous/core/Transform');
    var StateModifier   = require('famous/modifiers/StateModifier');
    var ImageSurface    = require('famous/surfaces/ImageSurface');
    var EventHandler    = require('famous/core/EventHandler');
    var Easing          = require('famous/transitions/Easing');
    var Modifier        = require('famous/core/Modifier');
    var Transitionable  = require('famous/transitions/Transitionable');
    
    var eventHandler    = new EventHandler();

    // Constructor function for our PageView class
    function PageView() {
        // Applies View's constructor function to PageView class
        View.apply(this, arguments);
        
        this.currentPage = null;
        
        _renderPages.call(this);
        _listeners.call(this);
        
    }

    // Establishes prototype chain for PageView class to inherit from View
    PageView.prototype = Object.create(View.prototype);
    PageView.prototype.constructor = PageView;

    // Default options for PageView class
    PageView.DEFAULT_OPTIONS = {
        baseUrl: "https://s3.amazonaws.com/elasticbeanstalk-us-east-1-538093400772/mcleanErskine/",
        fadeInCurve: { duration: 1000, curve: Easing.outBack },
        defaultAngle: 0.001,
        pagePosition: 0.04,
        pageOffset: 320,
        pageData: {}
    };

    // Define your helper functions and prototype methods here

    function _listeners(){
        
    }
    
    function _renderPages(){
        var opts        = this.options, 
            pageOffset  = opts.pagePosition,
            scaleTo     = window.innerWidth / 4 - 50;
        
        this.pageModifiers = [];
        this.pageRotations = [];
        this.origins = [];
        this.angles = [];
        this.scales = [];
        this.align  = [];
        
        opts.pageData.forEach(function(page, i){
            var angle = new Transitionable(opts.defaultAngle),
                offset = new Transitionable([pageOffset, 0.5]),
                scale = new Transitionable(0);
            
            var singlePage = new Surface({
                content: page.title,
                classes: [page.title, 'double-sided'],
                properties: {
                    backgroundColor: 'rgba(255, 255, 255, 0.30)',
                    border: "2px solid rgba(0, 0, 0, 0.23)",
                    textAlign: 'right',
                    cursor: 'pointer',
                    zIndex: 1
                }
            });
            
            var pageModifier = new Modifier({
                transform: function (){
                    return Transform.rotateY(angle.get());
                }
            });
            
            //Add Transitionable to move the elemnts around via align and origin
            pageModifier
                .originFrom(function(){ return offset.get(); })
                .alignFrom(function(){ return offset.get(); });
            
            var scaleModifier = new Modifier({
                transform: function(){
                    var startScale = scale.get();
                    return Transform.scale(startScale, startScale, 1);
                }
            });
            
            singlePage.on('click', function(){ this.changePage(page) }.bind(this));
            
            this.pageModifiers.push(pageModifier);
            this.origins.push(offset);
            this.angles.push(angle);
            this.scales.push(scale);
            
            this
            .add(pageModifier)
            .add(scaleModifier)
            .add(singlePage);

            pageOffset += 0.3;
            
            scale.set(0.2, {duration: 2000, curve: Easing.outBack});
            
        }.bind(this));
        
        
    }

    PageView.prototype.toggle = function(){
        console.log('there');
        
         angle.set(1, { duration: 2000, curve: 'easeInOut' });
    };
    
    PageView.prototype.boxSize = function(){
        var windowWidth = window.innerWidth,
            windowHeight = window.innerHeight,
            boxSize = [200,300];
            
        return boxSize;
    };
    
    PageView.prototype.changePage = function(page){
        var trans = { duration: 1000, curve: 'easeIn' },
            currentPage = this.currentPage,
            center = [0.5, 0.5],
            newPage = page.id,
            x = newPage - 1;
        
        if(newPage === currentPage){
            console.log("same page");
            this.zoomOut(x);
            return;
        }
        // this.pageModifiers[x].transformFrom(Transform.inFront);
        // this.pageModifiers.forEach(function(modifier, z){
        //     if(z != x){
        //         console.log(Transform.behind);
        //         modifier.transformFrom(Transform.behind);
        //     } else {
        //         modifier.transformFrom(Transform.inFront);
        //     }
        // });
        //Math to center selected origin
        var moveOrigin = this.origins[x].get()[0] - 0.5;
        
        // Move front and cener
        this.origins.forEach(function(origin, z){
            var move = [origin.get()[0] - moveOrigin, 0.5];
            
            origin.set(move, { duration: 1000, curve: 'easeInOut' });
        });
        
            
        // this.pageModifiers[x].setTransform(Transform.inFront);
        this.scales[x].set(         //move Scale up 
            0.5, trans, 
            function(){
                this.angles[x].set(
                    3.14, trans,
                    function(){
                        this.scales[x].set(1, trans);
                        // console.log(Transform.inFront);
                    }.bind(this));
        }.bind(this));

        console.log(this.origins);
        this.currentPage = newPage;
    };
    
    PageView.prototype.zoomOut = function(page){
        var trans = { duration: 1000, curve: 'easeIn' };
        console.log("zoom otu");
        console.log(this.origins[page]);
        
        this.scales[page].set(
            0.2, trans, 
            function(){
                this.angles[page].set(this.options.defaultAngle, trans);
        }.bind(this));
        
        this.currentPage = null;
    };

    module.exports = PageView;
});

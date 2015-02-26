/*** MenuView ***/

// define this module in Require.JS
define(function(require, exports, module) {

    var View            = require('famous/core/View');
    // Import additional modules to be used in this view 
    var Surface         = require('famous/core/Surface');
    var Transform       = require('famous/core/Transform');
    var StateModifier   = require('famous/modifiers/StateModifier');
    var Timer           = require('famous/utilities/Timer');
    var Easing          = require('famous/transitions/Easing');
    var EventHandler    = require('famous/core/EventHandler');
    
    // Includes 
    var BoxView = require('views/BoxView');

    //Set eventListeners up
    var navListener = new EventHandler(),
        menuAnimateListener = new EventHandler();

    // Constructor function for our MenuView class
    function MenuView() {
        // Applies View's constructor function to MenuView class
        View.apply(this, arguments);
        
        this.menuToggle = false;
        
        // this.add(this.rootModifier).add(this.rootSurface);
        _createBoxViews.call(this);
        _createLogo.call(this);
        _createCurrentNav.call(this);
        _setListeners.call(this);
        _pageLoaded.call(this);
    }

    // Establishes prototype chain for MenuView class to inherit from View
    MenuView.prototype = Object.create(View.prototype);
    MenuView.prototype.constructor = MenuView;

    // Default options for MenuView class
    MenuView.DEFAULT_OPTIONS = {
        baseUrl: "https://s3.amazonaws.com/elasticbeanstalk-us-east-1-538093400772/mcleanErskine/",
        topOffset: 2,
        boxOffset: 151,
        boxData: {},
        navWidth: 155,
        navTrans: {
            duration: 40
        },
        transition: {
            duration: 400,
            curve: Easing.inExpo
        }
    };

    // Define your helper functions and prototype methods here
    function _createBoxViews(){
        var yOffset = this.options.topOffset;
            
        this.boxModifiers = [];
        
        this.options.boxData.forEach(function (box, i) {
            var boxView = new BoxView({
                title: box.title
            });
            
            var boxModifier = new StateModifier({
                transform: Transform.translate(0, yOffset, 0),
                origin: [1,0]
            });
        
            boxView.on("boxClick", function(element){
                //Toggle Menu
                menuAnimateListener.emit('menuToggle', element);
                
                // Emit whitch page to load
                this._eventOutput.emit('changePage', element);
            }.bind(this));
            
            this.boxModifiers.push(boxModifier);
            this.add(boxModifier).add(boxView);
            
            yOffset += this.options.boxOffset;
        }.bind(this));
    }
    
    function _createLogo() {
        this.logoView = new Surface({
            content: "m.e.",
            size: [110,110],
            properties: {
                fontFamily: 'Special Elite',
                textAlign: 'center',
                fontSize: '30px',
                color: 'black'
            }
        });
        
        this.logoModifier = new StateModifier({
            origin: [1,1]
        });
        
        this.add(this.logoModifier).add(this.logoView);
    }

    function _createCurrentNav(){
        this.currentNav = new Surface({
            content: "home",
            size: [this.options.navWidth, 30],
            properties: {
                fontFamily: 'Special Elite',
                textAlign: 'right',
                fontSize: '30px',
                color: 'black',
                backgroundImage: "url(" + this.options.baseUrl + "ham.png)",
                backgroundSize: "30px",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: "95% 36%",
                paddingRight: "42px"
            }
        });
        
        this.currentNavModifier = new StateModifier({
            transform: Transform.translate(this.options.navWidth, 0, 0),
            origin: [1, 0]
        });
        
        this.add(this.currentNavModifier).add(this.currentNav);
    }

    function _pageLoaded(){ 
        Timer.setTimeout(function(){ 
            this.animateBoxes();
        }.bind(this), 1000);
    }
    
    function _setListeners(){
        this.logoView.on("click", function(){
            console.log("logo Clicked");
        }.bind(this));
        
        this.currentNav.on('click', function(){

            this.currentNavModifier.setTransform(
                Transform.translate(this.options.navWidth, 0, 0), 
                this.options.navTrans,
                function(){
                    menuAnimateListener.emit('menuToggle');
                }
            );
        }.bind(this));

        menuAnimateListener.on('menuToggle', function(element){
            this.animateBoxes(element);
        }.bind(this));

        navListener.on('showMenu', function(){
            console.log('show menu');
        });
    }
    MenuView.prototype.animateLogo = function(){
        var logoOffset = this.menuToggle && window.innerHeight < 880 ? 110 : 0;
        
        this.logoModifier.setTransform(
            Transform.translate(logoOffset, 0, 0), 
            this.options.transition
        );
    };
    
    MenuView.prototype.animateNav = function(event){
        var xPos = !this.menuToggle ? 110 : 0,
            title = event !== undefined ? event : "home";
        
        this.currentNav.setContent(title);
        
        this.currentNavModifier.setTransform(
            Transform.translate(xPos, 0, 0),
            this.options.navTrans
        );
    };
    
    MenuView.prototype.animateBoxes = function(event){
        var boxOffset = this.menuToggle ? this.options.boxOffset : 0,
            xOffset =   this.menuToggle ? 0 : 110,
            yOffset = this.options.topOffset;
        
        this.boxModifiers.forEach(function (boxModifier, i){
            
            boxModifier.setTransform(
                Transform.translate(0, 0, 0), 
                this.options.transition
            ).setTransform(
                Transform.translate(xOffset, yOffset, 0),
                this.options.transition,
                function(){
                    if(this.menuToggle){ this.animateNav(event); }
                }.bind(this)
            );
            
            yOffset += boxOffset;
        }.bind(this));
        
        this.animateLogo();
        
        this.menuToggle = !this.menuToggle;
    };
    
    MenuView.prototype.slideDown = function(){
        this.boxModifiers.setTransform(Transform.translate(0, 151, 0));
    };
    MenuView.prototype.slideUp = function(){
        
        this.setTransform(Transform.translate(0, 0, 0));
    };
    module.exports = MenuView;
});

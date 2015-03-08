var App;
define(function(require, exports, module) {
        var Engine = require('famous/core/Engine');
        var mainContext = Engine.createContext();  
        var AppView = require('views/AppView');
        var appView = new AppView();

        
        mainContext.setPerspective(1000);

        mainContext.add(appView);

        App = mainContext;

});

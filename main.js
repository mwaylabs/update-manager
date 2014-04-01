// Copyright (c) 2014 M-Way Solutions GmbH
// https://github.com/mwaylabs/brackets-quick-require/blob/master/LICENCE

define(function(require, exports, module) {
    "use strict";

    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

    var AppInit = brackets.getModule("utils/AppInit");

    var nodeBridge = require('nodeBridge');

    var updateVersionURL = 'http://localhost/version.json';

    var Plugin = {
        initialize: function() {
            setTimeout(function() {
                console.log('runNode');
                nodeBridge.callUpdate(updateVersionURL);
            }, 7000);
        }
    };

    AppInit.appReady(function() {
        Plugin.initialize();
        brackets.app.showDeveloperTools();
    });


});
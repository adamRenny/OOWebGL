define(function(require) {
    'use strict';

    var Uniform = function(location, type, functionName) {
        this.location = location;
        this.type = type;
        this.functionName = functionName;
    };

    return Uniform;
});
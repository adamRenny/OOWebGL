define(function(require) {
    'use strict';

    var VertexAttribute = function(location, numberOfComponents, offset) {
        this.location = location;
        this.offset = offset;
        this.numberOfComponents = numberOfComponents;
    };

    return VertexAttribute;
});
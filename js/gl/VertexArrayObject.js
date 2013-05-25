define(function(require) {
    'use strict';

    var VertexAttribute = require('gl/VertexAttribute');
    var bufferUtility = require('gl/BufferUtility');

    var isExtensionAvailable = null;
    var EXTENSION_NAME = 'OES_vertex_array_object';

    var VertexArrayObject = function(gl, program, dataType) {
        this.gl = gl;
        this.program = program;
        this.dataType = dataType || this.gl.FLOAT;
        this.isAttribEnabled = false;
        this.vertexAttributes = [];
        this.stride = 0;
        this.numberOfComponents = 0;
        this.glExt = this.gl.getExtension(EXTENSION_NAME);

        this.array = null;

        this.init();
    };

    VertexArrayObject.prototype.init = function() {
        this.isAttribEnabled = false;

        if (this.glExt) {
            this.array = this.glExt.createVertexArrayOES();
        }
    };

    VertexArrayObject.prototype.bind = function() {
        this.glExt.bindVertexArrayOES(this.array);
        this.enableAttributes();
    };

    VertexArrayObject.prototype.unbind = function() {
        this.glExt.bindVertexArrayOES(null);
    }

    VertexArrayObject.prototype.addAttribute = function(location, numberOfComponents, offset) {
        this.vertexAttributes.push(new VertexAttribute(location, numberOfComponents, offset || 0));
        this.sortVertexAttributesByOffset();
        this.calculateStride();
    };

    VertexArrayObject.prototype.sortVertexAttributesByOffset = function() {
        // sort by offset, ascending
        this.vertexAttributes.sort(function(a, b) {
            return a.offset - b.offset;
        });
    };

    VertexArrayObject.prototype.calculateStride = function() {
        var i = 0;
        var vertexAttributes = this.vertexAttributes;
        var length = vertexAttributes.length;
        var vertexAttribute;
        var stride = 0;
        var numberOfComponents = 0;

        for (; i < length; i++) {
            numberOfComponents = numberOfComponents + vertexAttributes[i].numberOfComponents;
        }

        this.numberOfComponents = numberOfComponents;
        this.stride = numberOfComponents * bufferUtility.getSize(this.gl, this.dataType);
    };

    VertexArrayObject.prototype.attachVertexAttributePointers = function() {
        var i = 0;
        var vertexAttributes = this.vertexAttributes;
        var length = vertexAttributes.length;
        var vertexAttribute;
        var stride = this.stride;
        var size = bufferUtility.getSize(this.gl, this.dataType);
        var offset = 0;

        for (; i < length; i++) {
            vertexAttribute = vertexAttributes[i];
            this.gl.vertexAttribPointer(vertexAttribute.location, vertexAttribute.numberOfComponents, this.dataType, false, stride, offset);
            offset = offset + vertexAttribute.numberOfComponents * size;
        }
    };

    VertexArrayObject.prototype.destroy = function() {
        this.disableAttributes();
        if (this.glExt) {
            this.glExt.deleteVertexArrayOES(this.array);
        }
    };

    VertexArrayObject.prototype.onContextLost = function() {
        this.gl = null;
        this.program = null;
        this.isAttribEnabled = false;
    };

    VertexArrayObject.prototype.onContextRestored = function(gl, program) {
        this.gl = gl;
        this.program = program;
        this.glExt = this.gl.getExtension(EXTENSION_NAME);

        this.init();
    };

    VertexArrayObject.prototype.enableAttributes = function() {
        if (this.isAttribEnabled) {
            return this;
        }

        this.isAttribEnabled = true;

        var attribute;
        var attributeList = this.program.attributeList;
        for (attribute in attributeList) {
            this.gl.enableVertexAttribArray(attributeList[attribute].location);
        }

        return this;
    };

    VertexArrayObject.prototype.disableAttributes = function() {
        if (!this.isAttribEnabled) {
            return this;
        }

        this.isAttribEnabled = false;

        var attribute;
        var attributeList = this.program.attributeList;
        for (attribute in attributeList) {
            this.gl.disableVertexAttribArray(attributeList[attribute].location);
        }

        return this;
    };

    return VertexArrayObject;
});
define(function(require) {
    'use strict';

    var VertexAttribute = require('gl/VertexAttribute');
    var bufferUtility = require('gl/BufferUtility');

    var VertexBufferObject = function(gl, dataType, drawMode, usage) {
        if (!gl) {
            return this;
        }

        this.gl = gl;
        this.dataType = dataType || this.gl.FLOAT;
        this.usage = usage || this.gl.STATIC_DRAW;
        this.drawMode = drawMode || this.gl.TRIANGLES;
        this.vertices = null;
        this.buffer = null;
        this.stride = 0;
        this.vertexAttributes = [];
        this.vertexCount = 0;

        this.init();
    };

    VertexBufferObject.prototype.init = function() {
        this.buffer = this.gl.createBuffer();
    };

    VertexBufferObject.prototype.bind = function() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    }

    VertexBufferObject.prototype.addVertexAttribute = function(location, numberOfComponents, offset) {
        this.vertexAttributes.push(new VertexAttribute(location, numberOfComponents, offset || 0));
        this.sortVertexAttributesByOffset();
        this.calculateVertexCount();
    };

    VertexBufferObject.prototype.sortVertexAttributesByOffset = function() {
        // sort by offset, ascending
        this.vertexAttributes.sort(function(a, b) {
            return a.offset - b.offset;
        });
    };

    VertexBufferObject.prototype.calculateVertexCount = function() {
        var vertexCount = this.vertices.length;
        var attributeCount = 0;
        var i = 0;
        var vertexAttributes = this.vertexAttributes;
        var length = vertexAttributes.length;
        for (; i < length; i++) {
            attributeCount = attributeCount + vertexAttributes[i].numberOfComponents;
        }

        this.vertexCount = vertexCount / attributeCount;
        this.stride = attributeCount * bufferUtility.getSize(this.gl, this.dataType);
        // this.stride = 0;
    };

    VertexBufferObject.prototype.attachVertexAttributePointers = function() {
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

    VertexBufferObject.prototype.setVertices = function(vertices) {
        this.vertices = vertices;
        var bufferType = bufferUtility.getBufferType(this.gl, this.dataType);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new bufferType(vertices), this.usage);
    };

    VertexBufferObject.prototype.destroy = function() {
        this.gl.deleteBuffer(this.buffer);
    };

    VertexBufferObject.prototype.onContextLost = function() {
        this.gl = null;
    };

    VertexBufferObject.prototype.onContextRestored = function(gl) {
        this.gl = gl;

        this.init();
    };

    VertexBufferObject.prototype.draw = function() {
        this.gl.drawArrays(this.drawMode, 0, this.vertexCount);
    };

    return VertexBufferObject;
});
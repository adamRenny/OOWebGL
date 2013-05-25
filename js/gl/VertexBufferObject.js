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
    };

    VertexBufferObject.prototype.unbind = function() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    };

    VertexBufferObject.prototype.setVertexCountWithNumberOfComponents = function(numberOfComponents) {
        this.vertexCount = this.vertices.length / numberOfComponents;
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
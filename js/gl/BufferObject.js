define(function(require) {
    'use strict';

    var VertexAttribute = require('gl/VertexAttribute');
    var bufferUtility = require('gl/BufferUtility');

    var BufferObject = function(gl, dataType, bufferType, usage) {
        this.gl = gl;
        this.dataType = dataType;
        this.usage = usage || this.gl.STATIC_DRAW;
        this.type = bufferType || this.gl.ARRAY_BUFFER;
        this.data = null;
        this.buffer = null;
        this.dataCount = 0;

        this.init();
    };

    BufferObject.prototype.init = function() {
        this.buffer = this.gl.createBuffer();
    };

    BufferObject.prototype.bind = function() {
        this.gl.bindBuffer(this.type, this.buffer);
    };

    BufferObject.prototype.setData = function(data) {
        this.data = data;
        var bufferType = bufferUtility.getBufferType(this.gl, this.dataType);

        this.gl.bindBuffer(this.type, this.buffer);
        this.gl.bufferData(this.type, new bufferType(data), this.usage);
        this.dataCount = this.data.length;
    };

    BufferObject.prototype.destroy = function() {
        this.gl.deleteBuffer(this.buffer);
    };

    BufferObject.prototype.onContextLost = function() {
        this.gl = null;
    };

    BufferObject.prototype.onContextRestored = function(gl) {
        this.gl = gl;

        this.init();
        this.setData(this.data);
    };

    return BufferObject;
});
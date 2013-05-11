define(function(require) {
    'use strict';

    var VertexBufferObject = require('gl/VertexBufferObject');
    var BufferObject = require('gl/BufferObject');

    var IndexedVertexBufferObject = function(gl, dataType, drawMode, usage) {
        this.elementBufferObject = null;
        VertexBufferObject.call(this, gl, dataType, drawMode, usage);

        this.init();
    };

    IndexedVertexBufferObject.prototype = new VertexBufferObject();
    IndexedVertexBufferObject.prototype.constructor = IndexedVertexBufferObject;

    IndexedVertexBufferObject.prototype.init = function() {
        this.buffer = this.gl.createBuffer();
        this.elementBufferObject = new BufferObject(this.gl, this.gl.UNSIGNED_SHORT, this.gl.ELEMENT_ARRAY_BUFFER);
    };

    IndexedVertexBufferObject.prototype.bind = function() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.elementBufferObject.bind();
    };

    IndexedVertexBufferObject.prototype.setIndices = function(indices) {
        this.elementBufferObject.setData(indices);
    };

    IndexedVertexBufferObject.prototype.destroy = function() {
        this.gl.deleteBuffer(this.buffer);
        this.elementBufferObject.destroy();
    };

    IndexedVertexBufferObject.prototype.draw = function() {
        this.gl.drawElements(this.drawMode, this.elementBufferObject.dataCount, this.elementBufferObject.dataType, 0);
    };

    return IndexedVertexBufferObject;
});
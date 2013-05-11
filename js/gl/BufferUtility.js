define(function(require) {
    'use strict';

    var BufferUtility = function() {};

    BufferUtility.prototype.getSize = function(gl, dataType) {
        var size = 0;

        switch (dataType) {
            case gl.UNSIGNED_BYTE:
            case gl.BYTE:
                size = 1;
                break;
            case gl.UNSIGNED_SHORT:
            case gl.SHORT:
                size = 2;
                break;
            case gl.FLOAT:
                size = 4;
                break;
        }

        return size;
    };

    BufferUtility.prototype.getBufferType = function(gl, dataType) {
        var bufferType = Array;

        switch (dataType) {
            case gl.UNSIGNED_BYTE:
                bufferType = Uint8Array;
                break;
            case gl.BYTE:
                bufferType = Int8Array;
                break;
            case gl.UNSIGNED_SHORT:
                bufferType = Uint16Array;
                break;
            case gl.SHORT:
                bufferType = Int16Array;
                break;
            case gl.FLOAT:
                bufferType = Float32Array;
                break;
        }

        return bufferType;
    };

    return new BufferUtility();
});
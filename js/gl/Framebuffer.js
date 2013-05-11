define(function(require) {
    'use strict';

    var Framebuffer = function(gl, width, height) {
        this.gl = gl;
        this.width = width;
        this.height = height;

        this.clearMask = this.gl.COLOR_BUFFER_BIT;

        this.init();
    };

    Framebuffer.prototype.init = function() {
        this.gl.viewport(0, 0, this.width, this.height);
        this.setClearColor(0, 0, 0, 1);
    };

    Framebuffer.prototype.destroy = function() {
        // Perform cleanup
    };

    Framebuffer.prototype.onContextLost = function() {
        this.gl = null;
    };

    Framebuffer.prototype.onContextRestored = function(gl) {
        this.gl = gl;
        this.init();
        // reinstate depth buffer
    }

    Framebuffer.prototype.setClearColor = function(red, green, blue, alpha) {
        this.gl.clearColor(red, green, blue, alpha);
    }

    Framebuffer.prototype.enableDepth = function(shouldEnable) {
        var isEnabled = (this.clearMask & this.gl.DEPTH_BUFFER_BIT) == this.gl.DEPTH_BUFFER_BIT;
        if (isEnabled && shouldEnable
            || !isEnabled && !shouldEnable
        ) {
            return this;
        }

        if (shouldEnable) {
            this.clearMask |= this.gl.DEPTH_BUFFER_BIT;
            this.gl.enable(this.gl.DEPTH_TEST);
        } else {
            this.clearMask &= ~this.gl.DEPTH_BUFFER_BIT;
            this.gl.disable(this.gl.DEPTH_TEST);
        }

        return this;
    };

    Framebuffer.prototype.clear = function() {
        this.gl.clear(this.clearMask);
    };

    return Framebuffer;
});
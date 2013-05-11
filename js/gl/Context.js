define(function(require) {
    'use strict';

    var Context = function Context(canvas) {
        this.isEnabled = false;

        this.gl = null;
        this.maxTextureSize = 0;
        this.canvas = canvas;

        this.setupHandlers()
            .enable()
            .useCurrentContext();
    };

    Context.prototype.setupHandlers = function() {
        this.onContextCreationErrorHandler = this.onContextCreationError.bind(this);
        this.onContextLostHandler = this.onContextLost.bind(this);
        this.onContextRestoredHandler = this.onContextRestored.bind(this);

        return this;
    };

    Context.prototype.enable = function() {
        if (this.isEnabled) {
            return this;
        }

        this.isEnabled = true;

        this.canvas.addEventListener('webglcontextcreationerror', this.onContextCreationErrorHandler, false);
        this.canvas.addEventListener('webglcontextlost', this.onContextLostHandler, false);
        this.canvas.addEventListener('webglcontextrestored', this.onContextRestoredHandler, false);

        return this;
    };

    Context.prototype.disable = function() {
        if (!this.isEnabled) {
            return this;
        }

        this.isEnabled = false;

        this.canvas.removeEventListener('webglcontextcreationerror', this.onContextCreationErrorHandler, false);
        this.canvas.removeEventListener('webglcontextlost', this.onContextLostHandler, false);
        this.canvas.removeEventListener('webglcontextrestored', this.onContextRestoredHandler, false);

        return this;
    };

    var CONTEXT_LIST = [
        'webgl',
        'experimental-webgl',
        'webkit-3d',
        'moz-webgl'
    ];

    Context.prototype.useCurrentContext = function() {
        if (this.gl && !this.gl.isContextLost()) {
            return this;
        }

        var context = null;
        var i = 0;

        for (; i < CONTEXT_LIST.length; i++) {
            try {
                context = this.canvas.getContext(CONTEXT_LIST[i]);
            } catch (exception) {}

            if (context !== null) {
                break;
            }
        }

        this.gl = context;
    };

    Context.prototype.onContextCreationError = function(event) {
        console.log('onContextCreationError', event);
        console.error(event.statusMessage);
    };

    Context.prototype.onContextLost = function(event) {
        console.log('onContextLost', event);
        console.error(event.statusMessage);
        // Figure out what to do to restore the context
    };

    Context.prototype.onContextRestored = function(event) {
        console.log('onContextRestored', event);
        console.error(event.statusMessage);
    };

    Context.prototype.getMaxTextureSize = function() {
        if (this.maxTextureSize === 0) {
            this.maxTextureSize = this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
        }

        return this.maxTextureSize;
    };

    return Context;
});
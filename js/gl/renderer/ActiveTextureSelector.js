define(function(require) {
    'use strict';

    var Texture = require('gl/Texture');

    var ActiveTextureSelector = function(gl) {
        this.gl = gl;
        this.maxActive = 0;
        this.baseActive = this.gl.TEXTURE0;
        this.nextActive = 0;

        this.init();
    };

    ActiveTextureSelector.prototype.init = function() {

        this.maxActive = this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        this.baseActive = this.gl.TEXTURE0;
        this.nextActive = 0;
    };

    ActiveTextureSelector.prototype.destroy = function() {
        this.gl = null;
    };

    ActiveTextureSelector.prototype.bindActiveTexture = function(texture) {
        var activeIndex = this.nextActive;
        if (activeIndex >= this.maxActive) {
            throw new Error('Not enough active texture units');
        }

        this.nextActive = activeIndex + 1;
        this.gl.activeTexture(this.baseActive + activeIndex);
        texture.bind();

        return activeIndex;
    };

    ActiveTextureSelector.prototype.drainActiveTextures = function() {
        this.nextActive = 0;
    };

    ActiveTextureSelector.prototype.onContextLost = function() {
        this.gl = null;
        this.maxActive = 0;
        this.baseActive = 0;
        this.nextActive = 0;
    };

    ActiveTextureSelector.prototype.onContextRestored = function(gl) {
        this.gl = gl;

        this.init();
    };

    return ActiveTextureSelector;
});
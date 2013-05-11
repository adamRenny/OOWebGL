define(function(require) {
    'use strict';

    var glMatrix = require('glMatrix');
    var Uniform = require('gl/Uniform');

    function _getUniformFunction(gl, type) {
        var functionName = '';

        switch (type) {
            case gl.FLOAT_MAT4:
                functionName = 'uniformMatrix4fv';
                break;
            case gl.FLOAT_MAT3:
                functionName = 'uniformMatrix3fv';
                break;
            case gl.FLOAT_MAT2:
                functionName = 'uniformMatrix2fv';
                break;
            case gl.SAMPLER_2D:
                functionName = 'uniform1i';
                break;
        }
        
        return functionName; 
    }

    function _getUniformDefault(gl, type) {
        var defaultValue = null;

        switch (type) {
            case gl.FLOAT_MAT4:
                defaultValue = glMatrix.mat4.create();
                glMatrix.mat4.identity(defaultValue);
                break;
            case gl.FLOAT_MAT3:
                defaultValue = glMatrix.mat3.create();
                glMatrix.mat3.identity(defaultValue);
                break;
            case gl.FLOAT_MAT2:
                defaultValue = glMatrix.mat2.create();
                glMatrix.mat2.identity(defaultValue);
                break;
            case gl.SAMPLER_2D:
                // No default image
                defaultValue = null;
                break;
        }

        return defaultValue;
    }

    var UniformBufferObject = function(gl, program) {
        this.gl = gl;
        this.program = program;
        this.uniforms = null;

        this.init();
    };

    UniformBufferObject.prototype.init = function() {
        this.uniforms = {};

        var uniformName;
        var uniformList = this.program.uniformList;
        var uniform;
        for (uniformName in uniformList) {
            this[uniformName] = _getUniformDefault(this.gl, uniformList[uniformName].type);
            this.uniforms[uniformName] = new Uniform(
                uniformList[uniformName].location,
                uniformList[uniformName].type,
                _getUniformFunction(this.gl, uniformList[uniformName].type)
            );
        }
    };

    UniformBufferObject.prototype.destroy = function() {
        
    };

    UniformBufferObject.prototype.onContextLost = function() {
        this.gl = null;
        this.uniforms = null;
    };

    UniformBufferObject.prototype.onContextRestored = function(gl, program) {
        this.gl = gl;
        this.program = program;

        this.init();
    };

    UniformBufferObject.prototype.pushUniform = function(uniformName, value) {
        this[uniformName] = value;
        var uniform = this.uniforms[uniformName];

        // Is a texture
        if (uniform.type === this.gl.SAMPLER_2D) {
            // TODO: Implement an active texture manager
            this.gl.activeTexture(this.gl.TEXTURE0);
            value.bind();
            this.gl[uniform.functionName](uniform.location, 0);
        } else {
            this.gl[uniform.functionName](uniform.location, false, value);
        }
    };

    UniformBufferObject.prototype.pushUniforms = function() {
        var uniformName;
        var uniform;

        for (uniformName in this.uniforms) {
            uniform = this.uniforms[uniformName];

            // If it is a texture
            if (uniform.type === this.gl.SAMPLER_2D) {
                // TODO: Implement an active texture manager
                this.gl.activeTexture(this.gl.TEXTURE0);
                value.bind();
                console.log(uniform);
                this.gl[uniform.functionName](uniform.location, 0);
            } else {
                this.gl[uniform.functionName](uniform.location, false, this[uniformName]);
            }
        }
    };

    return UniformBufferObject;
});
define(function(require) {
    'use strict';

    var VertexArrayObject = function(gl, program) {
        this.gl = gl;
        this.program = program;
        this.isAttribEnabled = false;

        this.init();
    };

    VertexArrayObject.prototype.init = function() {
        this.isAttribEnabled = false;
    };

    VertexArrayObject.prototype.destroy = function() {
        this.disableAttributes();
    };

    VertexArrayObject.prototype.onContextLost = function() {
        this.gl = null;
        this.program = null;
        this.isAttribEnabled = false;
    };

    VertexArrayObject.prototype.onContextRestored = function(gl, program) {
        this.gl = gl;
        this.program = program;

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
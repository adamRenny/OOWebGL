define(function(require) {
    'use strict';

    function _compileShader(gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(shader));
        }

        return shader;
    };

    function _linkProgram(gl, program, vertex, fragment) {
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log(gl.getProgramInfoLog(program));
        }
    };

    var Program = function(gl, vertexSource, fragmentSource) {
        this.gl = gl;
        this.vertexSource = vertexSource;
        this.fragmentSource = fragmentSource;
        this.vertexShader = null;
        this.fragmentShader = null;

        this.attributeList = {};
        this.uniformList = {};

        this.init();
    };

    Program.prototype.init = function() {
        this.vertexShader = _compileShader(this.gl, this.gl.VERTEX_SHADER, this.vertexSource);
        this.fragmentShader = _compileShader(this.gl, this.gl.FRAGMENT_SHADER, this.fragmentSource);
        this.program = this.gl.createProgram();
        _linkProgram(this.gl, this.program, this.vertexShader, this.fragmentShader);

        this.populateShaderParameters();
    };

    Program.prototype.populateShaderParameters = function() {
        
        var numberOfAttributes = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
        var numberOfUniforms = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);
        var i;
        var attribute;
        var uniform;
        var parameter;

        // Gather attributes
        for (i = 0; i < numberOfAttributes; i++) {
            attribute = this.gl.getActiveAttrib(this.program, i);
            attribute.location = this.gl.getAttribLocation(this.program, attribute.name);
            this.attributeList[attribute.name] = attribute;
        }

        // Gather uniforms
        for (i = 0; i < numberOfUniforms; i++) {
            uniform = this.gl.getActiveUniform(this.program, i);
            uniform.location = this.gl.getUniformLocation(this.program, uniform.name);
            this.uniformList[uniform.name] = uniform;
        }

        return this;
    };

    Program.prototype.use = function() {
        this.gl.useProgram(this.program);
    };

    Program.prototype.destroy = function() {
        this.gl.deleteShader(this.vertexShader);
        this.gl.deleteShader(this.fragmentShader);
        this.gl.deleteProgram(this.program);
    };

    Program.prototype.onContextLost = function() {
        this.gl = null;
        this.vertexShader = null;
        this.fragmentShader = null;
        this.program = null;
        this.uniformList = null;
        this.attributeList = null;
    };

    Program.prototype.onContextRestored = function(gl) {
        this.gl = gl;
        this.init();
    };

    return Program;
})
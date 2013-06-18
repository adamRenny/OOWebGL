define(function(require) {
    'use strict';

    var Context = require('gl/Context');
    var ActiveTextureSelector = require('gl/renderer/ActiveTextureSelector');
    var Program = require('gl/Program');

    var VertexArrayObject = require('gl/VertexArrayObject');
    var VertexBufferObject = require('gl/VertexBufferobject');
    var IndexedVertexBufferObject = require('gl/IndexedVertexBufferObject');
    var Framebuffer = require('gl/Framebuffer');
    var UniformBufferObject = require('gl/UniformBufferObject');

    var ItemHash = require('gl/renderer/ItemHash');

    var glMatrix = require('glMatrix');

    var stats = require('stats.min');

    var _programId = 0;

    var mat4 = glMatrix.mat4;
    var mat3 = glMatrix.mat3;
    var vec3 = glMatrix.vec3;

    var Renderer = function(target) {
        if (typeof target === 'undefined') {
            throw new TypeError('Expected target');
        }

        this.init(target);
    };

    Renderer.prototype.init = function(target) {
        this.target = target;

        this.context = new Context(target);
        this.gl = this.context.gl;
        this.activeTextureSelector = new ActiveTextureSelector(this.gl);

        this.vboHash = new ItemHash();
        this.programHash = new ItemHash();

        this.programs = {};

        this.framebuffer = new Framebuffer(this.gl, target.width, target.height);
        this.framebuffer.enableDepth(true);

        this.perspectiveMatrix = mat4.create();
        mat4.perspective(45, this.framebuffer.width / this.framebuffer.height , 0.1, 100.0, this.perspectiveMatrix);

        this.renderables = [];

        this.stats = new Stats();

        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.left = '0px';
        this.stats.domElement.style.top = '0px';

        document.body.appendChild( this.stats.domElement );

    };

    Renderer.prototype.add = function(item) {
        item.vbo = new IndexedVertexBufferObject(this.gl);
        item.vbo.bind();
        item.vbo.setVertices(item.vertexData);
        item.vbo.setIndices(item.faces);
        item.vbo.unbind();

        this.renderables.push(item);
    };

    Renderer.prototype.remove = function(item) {

    };

    Renderer.prototype.loadProgram = function(vertexSource, fragmentSource) {
        var program = new Program(this.gl, vertexSource, fragmentSource);
        // Get program id to pass back to implementor
        var id = _programId;
        this.programs[id] = program;
        _programId = _programId + 1;

        for (var i = 0; i < this.renderables.length; i++) {
            console.log(this.renderables[i]);
            this.renderables[i].vbo.bind();

            this.renderables[i].vao = new VertexArrayObject(this.gl, program, this.gl.FLOAT);
            program.use();
            this.ubo = new UniformBufferObject(this.gl, program, this.activeTextureSelector);
            this.renderables[i].vao.addAttribute(program.attributeList.aVertexPosition.location, 3);
            this.renderables[i].vao.addAttribute(program.attributeList.aVertexColor.location, 4, 3);

            this.renderables[i].vbo.setVertexCountWithNumberOfComponents(this.renderables[i].vao.numberOfComponents);

            this.renderables[i].vao.bind();
            this.renderables[i].vao.enableAttributes();
            this.renderables[i].vao.attachVertexAttributePointers();
        }

        this.ubo.pushUniform('uPMatrix', this.perspectiveMatrix);

        return id;
    };

    var modelViewMatrix = mat4.create();
    mat4.identity(modelViewMatrix);

    var scale = 0.2;

    var step = ((Math.random() * Math.PI * 2) / (Math.PI * 2)) / 1000;

    Renderer.prototype.update = function(elapsed) {
        for (var i = 0; i < this.renderables.length; i++) {
            this.renderables[i].update(elapsed);
        }
    };

    Renderer.prototype.render = function() {
        this.stats.begin();
        this.framebuffer.clear();

        for (var i = 0; i < this.renderables.length; i++) {
            this.renderables[i].vao.bind();
            this.renderables[i].vbo.bind();

            this.ubo.pushUniform('uMVMatrix', this.renderables[i].modelView);

            this.renderables[i].vbo.draw();
        }

        this.stats.end();
    };

    return Renderer;
});
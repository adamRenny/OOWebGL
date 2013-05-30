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
        this.modelViewMatrix = mat4.create();
        mat4.identity(this.modelViewMatrix);

        this.rotation = 0;

    };

    Renderer.prototype.add = function(item) {
        this.renderItem = item;

        item.vbo = new IndexedVertexBufferObject(this.gl);
        item.vbo.bind();
        // item.vbo.setVertices([
        //     // Front face
        //     -1.0, -1.0,  1.0,   1.0, 0.0, 0.0, 1.0,
        //      1.0, -1.0,  1.0,   1.0, 0.0, 0.0, 1.0,
        //      1.0,  1.0,  1.0,   1.0, 0.0, 0.0, 1.0,
        //     -1.0,  1.0,  1.0,   1.0, 0.0, 0.0, 1.0,

        //     // Back face
        //     -1.0, -1.0, -1.0,   1.0, 1.0, 0.0, 1.0,
        //     -1.0,  1.0, -1.0,   1.0, 1.0, 0.0, 1.0,
        //      1.0,  1.0, -1.0,   1.0, 1.0, 0.0, 1.0,
        //      1.0, -1.0, -1.0,   1.0, 1.0, 0.0, 1.0,

        //     // Top face
        //     -1.0,  1.0, -1.0,   0.0, 1.0, 0.0, 1.0,
        //     -1.0,  1.0,  1.0,   0.0, 1.0, 0.0, 1.0,
        //      1.0,  1.0,  1.0,   0.0, 1.0, 0.0, 1.0,
        //      1.0,  1.0, -1.0,   0.0, 1.0, 0.0, 1.0,

        //     // Bottom face
        //     -1.0, -1.0, -1.0,   1.0, 0.5, 0.5, 1.0,
        //      1.0, -1.0, -1.0,   1.0, 0.5, 0.5, 1.0,
        //      1.0, -1.0,  1.0,   1.0, 0.5, 0.5, 1.0,
        //     -1.0, -1.0,  1.0,   1.0, 0.5, 0.5, 1.0,

        //     // Right face
        //      1.0, -1.0, -1.0,   1.0, 0.0, 1.0, 1.0,
        //      1.0,  1.0, -1.0,   1.0, 0.0, 1.0, 1.0,
        //      1.0,  1.0,  1.0,   1.0, 0.0, 1.0, 1.0,
        //      1.0, -1.0,  1.0,   1.0, 0.0, 1.0, 1.0,

        //     // Left face
        //     -1.0, -1.0, -1.0,   0.0, 0.0, 1.0, 1.0,
        //     -1.0, -1.0,  1.0,   0.0, 0.0, 1.0, 1.0,
        //     -1.0,  1.0,  1.0,   0.0, 0.0, 1.0, 1.0,
        //     -1.0,  1.0, -1.0,   0.0, 0.0, 1.0, 1.0
        // ]);
        item.vbo.setVertices(item.vertexData);
        // item.vbo.setIndices([
        //     0, 1, 2,      0, 2, 3,    // Front face
        //     4, 5, 6,      4, 6, 7,    // Back face
        //     8, 9, 10,     8, 10, 11,  // Top face
        //     12, 13, 14,   12, 14, 15, // Bottom face
        //     16, 17, 18,   16, 18, 19, // Right face
        //     20, 21, 22,   20, 22, 23  // Left face
        // ]);
        item.vbo.setIndices(item.faces);
    };

    Renderer.prototype.remove = function(item) {

    };

    Renderer.prototype.loadProgram = function(vertexSource, fragmentSource) {
        var program = new Program(this.gl, vertexSource, fragmentSource);
        // Get program id to pass back to implementor
        var id = _programId;
        this.programs[id] = program;
        _programId = _programId + 1;

        this.renderItem.vbo.bind();

        this.vao = new VertexArrayObject(this.gl, program, this.gl.FLOAT);
        program.use();
        this.ubo = new UniformBufferObject(this.gl, program, this.activeTextureSelector);
        this.vao.addAttribute(program.attributeList.aVertexPosition.location, 3);
        this.vao.addAttribute(program.attributeList.aVertexColor.location, 4, 3);

        this.renderItem.vbo.setVertexCountWithNumberOfComponents(this.vao.numberOfComponents);

        this.vao.bind();
        this.vao.enableAttributes();
        this.vao.attachVertexAttributePointers();

        this.ubo.pushUniform('uPMatrix', this.perspectiveMatrix);


        return id;
    };

    var modelViewMatrix = mat4.create();
    mat4.identity(modelViewMatrix);

    var scale = 5.0;

    var step = ((Math.random() * Math.PI * 2) / (Math.PI * 2)) / 1000;

    Renderer.prototype.update = function(elapsed) {
        this.rotation += elapsed * step;
    };

    Renderer.prototype.render = function() {
        this.framebuffer.clear();

        this.renderItem.vbo.bind();

        mat4.translate(this.modelViewMatrix, [0.0, -0.5, -3.0], modelViewMatrix);
        mat4.scale(modelViewMatrix, [scale, scale, scale]);
        mat4.rotate(modelViewMatrix, this.rotation, [0.0, 1.0, 0.0]);
        this.ubo.pushUniform('uMVMatrix', modelViewMatrix);

        this.renderItem.vbo.draw();

        window.renderItem = this.renderItem;
    };

    return Renderer;
});
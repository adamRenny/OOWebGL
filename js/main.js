requirejs.config({
    baseUrl: 'js',
    paths: {
        gl: 'gl',
        glMatrix: 'gl-matrix'
    },
    urlArgs: 'cb=' + new Date().getTime()
});

require([
    'jquery',
    'glMatrix',
    'gl/Context',
    'gl/Framebuffer',
    'gl/Program',
    'gl/VertexArrayObject',
    'gl/VertexBufferObject',
    'gl/IndexedVertexBufferObject',
    'gl/UniformBufferObject',
    'gl/Texture',
    'config'
], function(
    $,
    glMatrix,
    Context,
    Framebuffer,
    Program,
    VertexArrayObject,
    VertexBufferObject,
    IndexedVertexBufferObject,
    UniformBufferObject,
    Texture,
    config
) {
    'use strict';

    var mat4 = glMatrix.mat4;

    $(document).ready(function() {
        var canvas = document.getElementById('the-gls');
        var context = new Context(canvas);
        var gl = context.gl;

        var f = new Framebuffer(gl, canvas.width, canvas.height);
        f.enableDepth(true);

        var program = new Program(
            gl,
            'attribute vec3 aVertexPosition;attribute vec2 aTextureCoord;uniform mat4 uPMatrix;uniform mat4 uMVMatrix;varying vec2 vTextureCoord;void main(void) {vTextureCoord = aTextureCoord;gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);}',
            'precision mediump float;varying vec2 vTextureCoord;uniform sampler2D uSampler;void main(void) {gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));}'
            // 'precision mediump float;varying vec2 vTextureCoord;uniform sampler2D uSampler;void main(void) {gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);}'
        );

        var perspectiveMatrix = mat4.create();
        mat4.perspective(45, f.width / f.height , 0.1, 100.0, perspectiveMatrix);

        var baseModelView = mat4.create();
        mat4.identity(baseModelView);

        var modelViewMatrix = mat4.create();

        var ubo = new UniformBufferObject(gl, program);
        var vao = new VertexArrayObject(gl, program);
        // var vbo = new VertexBufferObject(gl, gl.FLOAT);

        // vbo.setVertices([
        //     // Front face       // Front face
        //      0.0,  1.0,  0.0,   1.0, 0.0, 0.0, 1.0,
        //     -1.0, -1.0,  1.0,   1.0, 0.0, 0.0, 1.0,
        //      1.0, -1.0,  1.0,   1.0, 0.0, 0.0, 1.0,
        //     // Right face       // Right face
        //      0.0,  1.0,  0.0,   0.0, 1.0, 0.0, 1.0,
        //      1.0, -1.0,  1.0,   0.0, 1.0, 0.0, 1.0,
        //      1.0, -1.0, -1.0,   0.0, 1.0, 0.0, 1.0,
        //     // Back face        // Back face
        //      0.0,  1.0,  0.0,   0.0, 0.0, 1.0, 1.0,
        //      1.0, -1.0, -1.0,   0.0, 0.0, 1.0, 1.0,
        //     -1.0, -1.0, -1.0,   0.0, 0.0, 1.0, 1.0,
        //     // Left face        // Left face
        //      0.0,  1.0,  0.0,   1.0, 1.0, 0.0, 1.0,
        //     -1.0, -1.0, -1.0,   1.0, 1.0, 0.0, 1.0,
        //     -1.0, -1.0,  1.0,   1.0, 1.0, 0.0, 1.0
        // ]);

        var texture = new Texture(gl);
        var img = new Image();
        img.onload = function() {
            texture.setImage(img);
            program.use();
            ubo.pushUniform('uSampler', texture);

            drawAll();
        }
        // img.src = 'img/nehe.gif';
        img.src = 'img/megaman.jpg';

        var square = new IndexedVertexBufferObject(gl, gl.FLOAT);
        square.setVertices([
            // Front face
            -1.0, -1.0,  1.0,   /*1.0, 0.0, 0.0, 1.0,*/   0.0, 0.0,
             1.0, -1.0,  1.0,   /*1.0, 0.0, 0.0, 1.0,*/   1.0, 0.0,
             1.0,  1.0,  1.0,   /*1.0, 0.0, 0.0, 1.0,*/   1.0, 1.0,
            -1.0,  1.0,  1.0,   /*1.0, 0.0, 0.0, 1.0,*/   0.0, 1.0,

            // Back face
            -1.0, -1.0, -1.0,   /*1.0, 1.0, 0.0, 1.0,*/   1.0, 0.0,
            -1.0,  1.0, -1.0,   /*1.0, 1.0, 0.0, 1.0,*/   1.0, 1.0,
             1.0,  1.0, -1.0,   /*1.0, 1.0, 0.0, 1.0,*/   0.0, 1.0,
             1.0, -1.0, -1.0,   /*1.0, 1.0, 0.0, 1.0,*/   0.0, 0.0,

            // Top face
            -1.0,  1.0, -1.0,   /*0.0, 1.0, 0.0, 1.0,*/   0.0, 1.0,
            -1.0,  1.0,  1.0,   /*0.0, 1.0, 0.0, 1.0,*/   0.0, 0.0,
             1.0,  1.0,  1.0,   /*0.0, 1.0, 0.0, 1.0,*/   1.0, 0.0,
             1.0,  1.0, -1.0,   /*0.0, 1.0, 0.0, 1.0,*/   1.0, 1.0,

            // Bottom face
            -1.0, -1.0, -1.0,   /*1.0, 0.5, 0.5, 1.0,*/   1.0, 1.0,
             1.0, -1.0, -1.0,   /*1.0, 0.5, 0.5, 1.0,*/   0.0, 1.0,
             1.0, -1.0,  1.0,   /*1.0, 0.5, 0.5, 1.0,*/   0.0, 0.0,
            -1.0, -1.0,  1.0,   /*1.0, 0.5, 0.5, 1.0,*/   1.0, 0.0,

            // Right face
             1.0, -1.0, -1.0,   /*1.0, 0.0, 1.0, 1.0,*/   1.0, 0.0,
             1.0,  1.0, -1.0,   /*1.0, 0.0, 1.0, 1.0,*/   1.0, 1.0,
             1.0,  1.0,  1.0,   /*1.0, 0.0, 1.0, 1.0,*/   0.0, 1.0,
             1.0, -1.0,  1.0,   /*1.0, 0.0, 1.0, 1.0,*/   0.0, 0.0,

            // Left face
            -1.0, -1.0, -1.0,   /*0.0, 0.0, 1.0, 1.0,*/   0.0, 0.0,
            -1.0, -1.0,  1.0,   /*0.0, 0.0, 1.0, 1.0,*/   1.0, 0.0,
            -1.0,  1.0,  1.0,   /*0.0, 0.0, 1.0, 1.0,*/   1.0, 1.0,
            -1.0,  1.0, -1.0,   /*0.0, 0.0, 1.0, 1.0,*/   0.0, 1.0,
        ]);

        square.setIndices([
            0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face
            20, 21, 22,   20, 22, 23  // Left face
        ]);

        vao.enableAttributes();

        // vbo.bind();
        // vbo.addVertexAttribute(program.attributeList.aVertexPosition.location, 3);
        // vbo.addVertexAttribute(program.attributeList.aVertexColor.location, 4, 3);

        square.bind();
        square.addVertexAttribute(program.attributeList.aVertexPosition.location, 3);
        square.addVertexAttribute(program.attributeList.aTextureCoord.location, 2, 3);
        // square.addVertexAttribute(program.attributeList.aVertexColor.location, 4, 3);

        var rotation = 0;

        function drawAll() {
            f.clear();

            program.use();

            // vbo.bind();
            // mat4.translate(baseModelView, [-1.5, 0.0, -7.0], modelViewMatrix);
            // mat4.rotate(modelViewMatrix, rotation, [0.0, 1.0, 0.0]);
            // ubo.uPMatrix = perspectiveMatrix;
            // ubo.uMVMatrix = modelViewMatrix;
            // ubo.pushUniforms();
            // vbo.attachVertexAttributePointers();
            // vbo.draw();

            square.bind();
            mat4.translate(baseModelView, [0.0, 0.0, -7.0], modelViewMatrix);
            mat4.rotate(modelViewMatrix, rotation, [1.0, 1.0, 0.0]);
            ubo.pushUniform('uPMatrix', perspectiveMatrix);
            ubo.pushUniform('uMVMatrix', modelViewMatrix);
            square.attachVertexAttributePointers();
            square.draw();
        }

        function setRotation(newRotation) {
            rotation = newRotation;
            drawAll();
        }

        window.setRotation = setRotation;
    });
});
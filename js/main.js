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
    'gl/renderer/ActiveTextureSelector',
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
    ActiveTextureSelector,
    config
) {
    'use strict';

    var mat4 = glMatrix.mat4;
    var mat3 = glMatrix.mat3;
    var vec3 = glMatrix.vec3;
    var image = null;
    var vertexSource = ' \
    attribute vec3 aVertexPosition; \
    attribute vec4 aVertexColor; \
    attribute vec2 aTextureCoord; \
    attribute vec3 aVertexNormal; \
     \
    uniform mat4 uPMatrix; \
    uniform mat4 uMVMatrix; \
    uniform mat3 uNMatrix; \
     \
    uniform vec3 uAmbientColor; \
    uniform vec3 uLightingDirection; \
    uniform vec3 uDirectionalColor; \
     \
    varying vec4 vVertexColor; \
    varying vec2 vTextureCoord; \
     \
    varying vec3 vLightWeighting; \
     \
    void main(void) { \
        vTextureCoord = aTextureCoord; \
        vVertexColor = aVertexColor; \
        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); \
         \
        vec3 normal = uNMatrix * aVertexNormal; \
        float directionalLightWeighting = max(dot(normal, uLightingDirection), 0.0); \
        vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting; \
    }';
    var fragmentSource = ' \
    precision mediump float; \
    varying vec4 vVertexColor; \
    varying vec2 vTextureCoord; \
    varying vec3 vVertexNormal; \
     \
    varying vec3 vLightWeighting; \
     \
    uniform sampler2D uSampler; \
    void main(void) { \
        vec4 textureColor = texture2D(uSampler, vTextureCoord); \
        gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a); \
    }';
    var rotation = 0;

    var vbo, ubo, vao, program, f, gl, baseModelView, perspectiveMatrix, modelViewMatrix, square, texture, img, normalMatrix;

    function onImageLoaded() {
        setupScene();
        draw();
    }

    function setupScene() {
        var canvas = document.getElementById('the-gls');
        var context = new Context(canvas);
        gl = context.gl;

        var activeTextureSelector = new ActiveTextureSelector(gl);

        f = new Framebuffer(gl, canvas.width, canvas.height);
        f.enableDepth(true);

        program = new Program(
            gl,
            vertexSource,
            fragmentSource
        );

        perspectiveMatrix = mat4.create();
        mat4.perspective(45, f.width / f.height , 0.1, 100.0, perspectiveMatrix);

        baseModelView = mat4.create();
        mat4.identity(baseModelView);

        modelViewMatrix = mat4.create();
        normalMatrix = mat3.create();

        ubo = new UniformBufferObject(gl, program, activeTextureSelector);
        vao = new VertexArrayObject(gl, program, gl.FLOAT);
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

        texture = new Texture(gl);
        
        texture.setImage(img);
        program.use();
        ubo.pushUniform('uSampler', texture);
        // Ambient light
        ubo.pushUniform('uAmbientColor', [0.2, 0.2, 0.2]);
        // Directional Light
        var lightingDirection = vec3.create();
        vec3.normalize([-0.25, -0.25, -1.0], lightingDirection);
        vec3.scale(lightingDirection, -1);
        ubo.pushUniform('uLightingDirection', lightingDirection);
        ubo.pushUniform('uDirectionalColor', [0.8, 0.8, 0.8]);

        square = new IndexedVertexBufferObject(gl, gl.FLOAT);
        square.setVertices([
            // Front face
            -1.0, -1.0,  1.0,   1.0, 0.0, 0.0, 1.0,   0.0, 0.0,   0.0,  0.0,  1.0,
             1.0, -1.0,  1.0,   1.0, 0.0, 0.0, 1.0,   1.0, 0.0,   0.0,  0.0,  1.0,
             1.0,  1.0,  1.0,   1.0, 0.0, 0.0, 1.0,   1.0, 1.0,   0.0,  0.0,  1.0,
            -1.0,  1.0,  1.0,   1.0, 0.0, 0.0, 1.0,   0.0, 1.0,   0.0,  0.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,   1.0, 1.0, 0.0, 1.0,   1.0, 0.0,   0.0,  0.0, -1.0,
            -1.0,  1.0, -1.0,   1.0, 1.0, 0.0, 1.0,   1.0, 1.0,   0.0,  0.0, -1.0,
             1.0,  1.0, -1.0,   1.0, 1.0, 0.0, 1.0,   0.0, 1.0,   0.0,  0.0, -1.0,
             1.0, -1.0, -1.0,   1.0, 1.0, 0.0, 1.0,   0.0, 0.0,   0.0,  0.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,   0.0, 1.0, 0.0, 1.0,   0.0, 1.0,   0.0,  1.0,  0.0,
            -1.0,  1.0,  1.0,   0.0, 1.0, 0.0, 1.0,   0.0, 0.0,   0.0,  1.0,  0.0,
             1.0,  1.0,  1.0,   0.0, 1.0, 0.0, 1.0,   1.0, 0.0,   0.0,  1.0,  0.0,
             1.0,  1.0, -1.0,   0.0, 1.0, 0.0, 1.0,   1.0, 1.0,   0.0,  1.0,  0.0,

            // Bottom face
            -1.0, -1.0, -1.0,   1.0, 0.5, 0.5, 1.0,   1.0, 1.0,   0.0, -1.0,  0.0,
             1.0, -1.0, -1.0,   1.0, 0.5, 0.5, 1.0,   0.0, 1.0,   0.0, -1.0,  0.0,
             1.0, -1.0,  1.0,   1.0, 0.5, 0.5, 1.0,   0.0, 0.0,   0.0, -1.0,  0.0,
            -1.0, -1.0,  1.0,   1.0, 0.5, 0.5, 1.0,   1.0, 0.0,   0.0, -1.0,  0.0,

            // Right face
             1.0, -1.0, -1.0,   1.0, 0.0, 1.0, 1.0,   1.0, 0.0,   1.0,  0.0,  0.0,
             1.0,  1.0, -1.0,   1.0, 0.0, 1.0, 1.0,   1.0, 1.0,   1.0,  0.0,  0.0,
             1.0,  1.0,  1.0,   1.0, 0.0, 1.0, 1.0,   0.0, 1.0,   1.0,  0.0,  0.0,
             1.0, -1.0,  1.0,   1.0, 0.0, 1.0, 1.0,   0.0, 0.0,   1.0,  0.0,  0.0,

            // Left face
            -1.0, -1.0, -1.0,   0.0, 0.0, 1.0, 1.0,   0.0, 0.0,   -1.0,  0.0,  0.0,
            -1.0, -1.0,  1.0,   0.0, 0.0, 1.0, 1.0,   1.0, 0.0,   -1.0,  0.0,  0.0,
            -1.0,  1.0,  1.0,   0.0, 0.0, 1.0, 1.0,   1.0, 1.0,   -1.0,  0.0,  0.0,
            -1.0,  1.0, -1.0,   0.0, 0.0, 1.0, 1.0,   0.0, 1.0,   -1.0,  0.0,  0.0,
        ]);

        square.setIndices([
            0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face
            20, 21, 22,   20, 22, 23  // Left face
        ]);

        vao.bind();
        vao.addAttribute(program.attributeList.aVertexPosition.location, 3);
        vao.addAttribute(program.attributeList.aVertexColor.location, 4, 3);
        vao.addAttribute(program.attributeList.aTextureCoord.location, 2, 7);
        vao.addAttribute(program.attributeList.aVertexNormal.location, 3, 9);
        vao.enableAttributes();
        vao.attachVertexAttributePointers();

        // vbo.bind();
        // vbo.addVertexAttribute(program.attributeList.aVertexPosition.location, 3);
        // vbo.addVertexAttribute(program.attributeList.aVertexColor.location, 4, 3);

        square.bind();
        
        // square.addVertexAttribute(program.attributeList.aVertexColor.location, 4, 3);
        window.vao = vao;
    }

    function draw() {
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
        mat4.toInverseMat3(modelViewMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        ubo.pushUniform('uNMatrix', normalMatrix);
        // vao.attachVertexAttributePointers();
        square.draw();
    }

    function setRotation(newRotation) {
        rotation = newRotation;
        draw();
    }

    window.setRotation = setRotation;

    $(document).ready(function() {
        
        img = new Image();
        img.onload = onImageLoaded;
        
        img.src = 'img/megaman.jpg';
    });
});
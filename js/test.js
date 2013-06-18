requirejs.config({
    baseUrl: 'js',
    paths: {
        gl: 'gl',
        glMatrix: 'gl-matrix'
    },
    urlArgs: 'cb=' + new Date().getTime()
});

require([
    'File',
    'gl/objects/Renderable',
    'gl/renderer/Renderer',
    'RunLoop'
], function(
    File,
    Renderable,
    Renderer,
    RunLoop
) {
    'use strict';

    var dragonRenderable = new Renderable();
    dragonRenderable.position[1] = -0.5;
    dragonRenderable.position[2] = -3.0;
    dragonRenderable.scale[0] = dragonRenderable.scale[1] = dragonRenderable.scale[2] = 0.1;
    dragonRenderable.updateModelView();

    var bunnyRenderable = new Renderable();
    bunnyRenderable.position[0] = -1.1;
    bunnyRenderable.position[1] = -0.5;
    bunnyRenderable.position[2] = -3.0;
    bunnyRenderable.scale[0] = bunnyRenderable.scale[1] = bunnyRenderable.scale[2] = 4.0;
    bunnyRenderable.updateModelView();

    var teapotRenderable = new Renderable();
    teapotRenderable.position[0] = 1.5;
    teapotRenderable.position[2] = -3.0;
    teapotRenderable.scale[0] = teapotRenderable.scale[1] = teapotRenderable.scale[2] = 0.035;
    teapotRenderable.updateModelView();    

    var renderer = new Renderer(document.getElementById('the-gls'));
    var bunny;
    var dragon;
    var teapot;
    var vertexShader;
    var fragmentShader;
    var runLoop = new RunLoop();

    function allReady() {
        if (bunnyRenderable.vertices !== null && dragonRenderable.vertices !== null && teapotRenderable.vertices !== null && vertexShader !== undefined && fragmentShader !== undefined) {
            renderer.loadProgram(vertexShader, fragmentShader);
            runLoop.addCall(function(elapsed) {
                renderer.update(elapsed);
            }, RunLoop.UPDATE_CYCLE);
            runLoop.addCall(function() {
                renderer.render();
            }, RunLoop.RENDER_CYCLE);

            runLoop.start();
        }
    }

    bunny = new File();
    bunny.onload = function(content) {
        bunnyRenderable.inflateFromJSON(JSON.parse(content));
        bunnyRenderable.interleave();
        renderer.add(bunnyRenderable);
        allReady();
    };
    bunny.load('data/bunny.json');

    dragon = new File();
    dragon.onload = function(content) {
        dragonRenderable.inflateFromJSON(JSON.parse(content));
        dragonRenderable.interleave();
        renderer.add(dragonRenderable);
        allReady();
    };
    dragon.load('data/dragon.json');

    teapot = new File();
    teapot.onload = function(content) {
        teapotRenderable.inflateFromJSON(JSON.parse(content));
        teapotRenderable.interleave();
        renderer.add(teapotRenderable);
        allReady();
    };
    teapot.load('data/teapot.json');

    var vertexShaderFile = new File();
    vertexShaderFile.onload = function(content) {
        vertexShader = content;
        allReady();
    };
    vertexShaderFile.load('shader/BasicColor.vsh');

    var fragmentShaderFile = new File();
    fragmentShaderFile.onload = function(content) {
        fragmentShader = content;
        allReady();
    };
    fragmentShaderFile.load('shader/BasicColor.fsh');
});
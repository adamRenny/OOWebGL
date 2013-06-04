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

    var renderable = new Renderable();

    var renderer = new Renderer(document.getElementById('the-gls'));
    var bunny;
    var vertexShader;
    var fragmentShader;
    var runLoop = new RunLoop();

    function allReady() {
        if (renderable.vertices !== null && vertexShader !== undefined && fragmentShader !== undefined) {
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
        renderable.inflateFromJSON(JSON.parse(content));
        renderable.interleave();
        renderer.add(renderable);
        allReady();
    };
    bunny.load('data/dragon.json');

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
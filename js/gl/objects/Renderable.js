define(function(require) {
    'use strict';

    var glMatrix = require('glMatrix');

    var vec3 = glMatrix.vec3;

    var Renderable = function() {
        this.init();
    };

    Renderable.prototype.init = function() {
        this.vertices = null;
        this.indices = null;

        this.usesTransparency = false;
        this.isDirty = true;

        this.vbo = null;
    };

    Renderable.prototype.inflateFromJSON = function(content) {
        var vertices = content.vertices;
        var faces = content.faces;
        var colors = [];
        var i = 0;
        var length = vertices.length;

        for (; i < length; i++) {
            colors.push(Math.random() * 0.5);
            colors.push(Math.random() * 0.7);
            colors.push(Math.random() * 0.3);
            colors.push(1.0);
        }

        this.inflate(vertices, faces, colors);
    };

    Renderable.prototype.inflate = function(vertices, faces, colors) {
        this.vertices = vertices;
        this.faces = faces;
        this.colors = colors;
    };

    Renderable.prototype.interleave = function() {
        var vertexData = [];

        var count = this.vertices.length / 3;
        var i = 0;
        var VERTEX_COMPONENTS = 3;
        var COLOR_COMPONENTS = 4;

        var vertexIndex;
        var colorIndex;

        for (; i < count; i++) {
            vertexIndex = i * VERTEX_COMPONENTS;
            colorIndex = i * COLOR_COMPONENTS;

            vertexData.push(this.vertices[vertexIndex]);
            vertexData.push(this.vertices[vertexIndex + 1]);
            vertexData.push(this.vertices[vertexIndex + 2]);

            vertexData.push(this.colors[colorIndex]);
            vertexData.push(this.colors[colorIndex + 1]);
            vertexData.push(this.colors[colorIndex + 2]);
            vertexData.push(this.colors[colorIndex + 3]);
        }

        this.vertexData = vertexData;
    };

    Renderable.prototype.calculateVertexNormals = function(vertices, faces) {
        var start = new Date().getTime();
        // Assumed to have faces
        var i = 0;
        var j = 0;
        var normals = [];
        var vertexFaces = [];
        var lastIndex = 0;
        var faceVertexIndex = 0;
        var faceIndex = 0;
        var normalSum = [];

        for (i = 0; i < vertices.length / 3; i++) {
            while (lastIndex !== -1) {
                faceVertexIndex = faces.indexOf(i, lastIndex);
                if (faceVertexIndex === -1) {
                    break;
                }
                faceIndex = Math.floor(faceVertexIndex / 3);
                lastIndex = faceVertexIndex + 1;
                
                faceVertexIndex = 3 * faceIndex;

                vertexFaces.push(faces[faceVertexIndex]);
                vertexFaces.push(faces[faceVertexIndex + 1]);
                vertexFaces.push(faces[faceVertexIndex + 2]);
            }
            
            normalSum[0] = 0;
            normalSum[1] = 0;
            normalSum[2] = 0;

            for (j = 0; j < vertexFaces.length; j += 3) {
                faceVertexIndex = vertexFaces[j];
                var p1 = vec3.createFrom(
                    vertices[faceVertexIndex],
                    vertices[faceVertexIndex + 1],
                    vertices[faceVertexIndex + 2]
                );

                faceVertexIndex = vertexFaces[j + 1];
                var p2 = vec3.createFrom(
                    vertices[faceVertexIndex],
                    vertices[faceVertexIndex + 1],
                    vertices[faceVertexIndex + 2]
                );

                faceVertexIndex = vertexFaces[j + 2];
                var p3 = vec3.createFrom(
                    vertices[faceVertexIndex],
                    vertices[faceVertexIndex + 1],
                    vertices[faceVertexIndex + 2]
                );

                var u = vec3.create();
                vec3.subtract(p2, p1, u);

                var v = vec3.create();
                vec3.subtract(p3, p1, v);

                normalSum[0] += u[1] * v[2] - u[2] * v[1];
                normalSum[1] += u[2] * v[0] - u[0] * v[2];
                normalSum[2] += u[0] * v[1] - u[1] * v[0];
            }

            vec3.normalize(normalSum, normalSum);
            normals.push(normalSum[0]);
            normals.push(normalSum[1]);
            normals.push(normalSum[2]);

            vertexFaces.splice(0, vertexFaces.length);
            lastIndex = 0;
        }

        console.log((new Date().getTime() - start) / 1000);

        console.log(normals);

        return normals;
    };

    return Renderable;
});
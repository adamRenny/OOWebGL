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
        this.vertexData = null;
    };

    var WAVEFRONT_FIRST_CHAR_PARSER = /\s*(.)/;
    var WAVEFRONT_VERTEX_PARSER = /\s*v\s*(\-?\d+\.\d+(e\-?\d*)?)\s*(\-?\d+\.\d+(e\-?\d*)?)\s*(\-?\d+\.\d+(e\-?\d*)?)/;
    var WAVEFRONT_FACE_PARSER = /\s*f\s*(\d+)\s+(\d+)\s+(\d+)/;
    var WAVEFRONT_TEXTURE_COORD_PARSER = /\s*vt\s*(\-?\d+\.\d+(e\-?\d*)?)\s*(\-?\d+\.\d+(e\-?\d*)?)\s*(\-?\d+\.\d+(e\-?\d*)?)/;

    Renderable.prototype.inflateFromWavefrontObj = function(content) {
        var lines = content.split('\n');
        var i = 0;
        var length = lines.length;
        var line = null;
        var firstChar;
        var isFirst = true;
        var matches;

        var vertices = [];
        var faces = [];
        var colors = [];
        var textureCoords = [];
        var normals = [];

        var collections = [
            vertices,
            faces,
            colors,
            textureCoords,
            normals
        ];

        for (; i < length; i++) {
            line = lines[i];

            firstChar = line.match(WAVEFRONT_FIRST_CHAR_PARSER);

            if (firstChar === null) {
                continue;
            }

            switch (firstChar[1]) {
                // Vertex
                case 'v':
                    matches = line.match(WAVEFRONT_VERTEX_PARSER);
                    vertices.push(Number(matches[1]));
                    vertices.push(Number(matches[3]));
                    vertices.push(Number(matches[5]));

                    // push an arbitrary color
                    colors.push(Math.random() * 0.3);
                    colors.push(Math.random() * 0.8);
                    colors.push(Math.random() * 0.6);
                    colors.push(1.0);
                    break;
                // Face
                case 'f':
                    matches = line.match(WAVEFRONT_FACE_PARSER);
                    faces.push(parseInt(matches[1], 10) - 1);
                    faces.push(parseInt(matches[2], 10) - 1);
                    faces.push(parseInt(matches[3], 10) - 1);
                    break;

                // Texture Coordinate
                case 'vt':
                    matches = line.match(WAVEFRONT_TEXTURE_COORD_PARSER);
                    if (isFirst) {
                        console.log(matches);
                        isFirst = false;
                    }
                    textureCoords.push(Number(matches[1]));
                    textureCoords.push(Number(matches[3]));
                    textureCoords.push(Number(matches[5]));
                    break;
                default:
                    break;
            }
        }
        
        // this.calculateVertexNormals(vertices, faces);

        for (i = 0; i < collections.length; i++) {
            if (collections[i].length === 0) {
                collections[i] = undefined;
            }
        }

        this.inflate.apply(this, collections);
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

    Renderable.prototype.inflate = function(vertices, faces, colors, normals) {
        this.vertices = vertices;
        this.faces = faces;
        this.colors = colors;
        this.normals = normals;
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

    return Renderable;
});
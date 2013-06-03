#!/usr/bin/env node

'use strict';

var fs = require('fs');
var $ = require('./lib/jquery');
var glMatrix = require('./lib/gl-matrix');

var vec3 = glMatrix.vec3;

var Coordinate = function(x, y) {
    this.x = x;
    this.y = y;
};

var Vector = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
};

var FACE_NUMBERS = /(\d+)/g;
var SEPARATOR = '/';

var Vertex = function(content) {
    this.vertex = -1;
    this.normal = -1;
    this.texture = -1;

    var numbers = content.match(FACE_NUMBERS);
    var numberOfSeparators = content.split(SEPARATOR).length - 1;

    this.vertex = parseInt(numbers[0], 10) - 1;

    if (numbers.length === 3) {
        this.texture = parseInt(numbers[1], 10) - 1;
        this.normal = parseInt(numbers[2], 10) - 1;
    } else if (numberOfSeparators === 2) {
        this.normal = parseInt(numbers[1], 10) - 1;
    } else if (numbers.length === 2) {
        this.texture = parseInt(numbers[1], 10) - 1;
    }
};

Vertex.prototype.toString = function() {
    return this.vertex + '-' + this.texture + '-' + this.normal;
}

var Face = function(content) {
    var i = 0;
    var length = content.length;
    var vertices = [];

    for (; i < length; i++) {
        vertices.push(new Vertex(content[i]));
    }

    this.vertices = vertices;
};

Face.prototype.usesTexturesOrNormals = function() {
    var usesTexturesOrNormals = false;
    var vertex;

    for (var i = 0; i < this.vertices.length; i++) {
        vertex = this.vertices[i];
        usesTexturesOrNormals = (vertex.texture !== -1 || vertex.normal !== -1) && (vertex.normal !== vertex.vertex || vertex.texture !== vertex.vertex);
        if (usesTexturesOrNormals) {
            break;
        }
    }

    return usesTexturesOrNormals;
};

Face.prototype.toString = function() {
    var str = '';
    for (var i = 0; i < this.vertices.length; i++) {
        str += this.vertices[i].toString() + '\t';
    }
    return str;
}

function readFile(filename) {
    var $def = $.Deferred();

    fs.readFile(process.argv[2], 'utf8', function(error, value) {
        if (error !== null) {
            return $def.rejectWith(error);
        }

        return $def.resolveWith({}, [value]);
    });

    return $def.promise();
}

var SPACER = /\s+/;

function parseOBJ(content) {
    var lines = content.split('\n');

    var i = 0;
    var length = lines.length;
    var line;
    var lineType;
    var data = {
        vertices: [],
        textureCoords: [],
        normals: [],
        faces: []
    };
    var components;
    var spacerIndex;
    var facesNeedRemapping = false;

    for (; i < length; i++) {
        line = lines[i].trim();

        spacerIndex = line.search(SPACER);
        
        lineType = line.substr(0, spacerIndex);
        components = line.substr(spacerIndex).trim().split(SPACER);
        switch (lineType) {
            case 'f':
            var face = new Face(components);
                data.faces.push(
                    face
                );

                if (!facesNeedRemapping) {
                    facesNeedRemapping = face.usesTexturesOrNormals();
                }
                break;
            case 'v':
                data.vertices.push(
                    new Vector(Number(components[0]), Number(components[1]), Number(components[2]))
                );
                break;
            case 'vn':
                data.normals.push(
                    new Vector(Number(components[0]), Number(components[1]), Number(components[2]))
                );
                break;
            case 'vt':
                data.textureCoords.push(
                    new Coordinate(Number(components[0]), Number(components[1]))
                );
                break;
        }
    }

    var uniqueVertices = [];
    var vertexHash = {};

    var hasTextureCoordinates = data.textureCoords.length > 0;
    var hasNormals = data.normals.length > 0;

    var parsedData = {
        vertices: [],
        textureCoords: [],
        normals: [],
        faces: []
    };

    if (facesNeedRemapping) {

        // Parse face data to create undefined vertex points from existing texture, normal, and position data
        for (var i = 0; i < data.faces.length; i++) {
            var face = data.faces[i];
            for (var j = 0; j < face.vertices.length; j++) {
                var vertex = face.vertices[j];
                if (uniqueVertices.indexOf(vertex.toString()) === -1) {
                    vertex.index = uniqueVertices.length;
                    uniqueVertices.push(vertex.toString());
                    vertexHash[vertex.toString()] = vertex;
                } else {
                    vertex.index = uniqueVertices.indexOf(vertex.toString());
                }
            }
        }

        // Reorganize the vertices and create the undefined faces
        for (var i = 0; i < uniqueVertices.length; i++) {
            var vertex = vertexHash[uniqueVertices[i]];

            var index = vertex.vertex;
            parsedData.vertices.push(data.vertices[index].x);
            parsedData.vertices.push(data.vertices[index].y);
            parsedData.vertices.push(data.vertices[index].z);

            if (hasNormals) {
                if (vertex.normal === -1) {
                    parsedData.normals.push(0);
                    parsedData.normals.push(0);
                    parsedData.normals.push(0);
                } else {
                    index = vertex.normal;
                    parsedData.normals.push(data.normals[index].x);
                    parsedData.normals.push(data.normals[index].y);
                    parsedData.normals.push(data.normals[index].z);
                }
            }
            
            if (hasTextureCoordinates) {
                if (vertex.texture === -1) {
                    parsedData.textureCoords.push(0);
                    parsedData.textureCoords.push(0);
                } else {
                    index = vertex.texture;
                    parsedData.textureCoords.push(data.textureCoords[index].x);
                    parsedData.textureCoords.push(data.textureCoords[index].y);    
                }
            }
        }

        // Remap the vertices
        for (var i = 0; i < data.faces.length; i++) {
            var face = data.faces[i];

            for (var j = 0; j < face.vertices.length; j++) {
                parsedData.faces.push(face.vertices[j].index);
            }
        }
    } else {
        // Throw an error if normals, vertices, and texture coords have unequal data members
        for (var i = 0; i < data.vertices.length; i++) {
            parsedData.vertices.push(data.vertices[i].x);
            parsedData.vertices.push(data.vertices[i].y);
            parsedData.vertices.push(data.vertices[i].z);

            if (hasNormals) {
                parsedData.normals.push(data.normals[i].x);
                parsedData.normals.push(data.normals[i].y);
                parsedData.normals.push(data.normals[i].z);
            }

            if (hasTextureCoordinates) {
                parsedData.textureCoords.push(data.textureCoords[i].x);
                parsedData.textureCoords.push(data.textureCoords[i].y);
                parsedData.textureCoords.push(data.textureCoords[i].z);   
            }
        }

        for (var i = 0; i < data.faces.length; i++) {
            var face = data.faces[i];

            for (var j = 0; j < face.vertices.length; j++) {
                parsedData.faces.push(face.vertices[j].vertex);
            }
        }
    }

    if (!hasNormals) {
        parsedData.normals = undefined;
    }

    if (!hasTextureCoordinates) {
        parsedData.textureCoords = undefined;
    }

    console.log(JSON.stringify(parsedData));
}

readFile(process.argv[2]).then(parseOBJ);
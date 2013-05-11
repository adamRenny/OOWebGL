define(function(require) {
    var Texture = function Texture(gl) {
        this.gl = gl;
        this.image = null;

        this.init();
    };

    Texture.prototype.init = function() {
        this.texture = this.gl.createTexture();
    };

    Texture.prototype.destroy = function() {
        this.gl.deleteTexture(this.texture);
    };

    Texture.prototype.onContextLost = function() {
        this.gl = null;
        this.texture = null;
    };

    Texture.prototype.onContextRestored = function(gl) {
        this.gl = gl;

        this.init();
        this.setImage = this.image;
    };

    Texture.prototype.bind = function() {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    };

    Texture.prototype.setImage = function(image) {
        this.image = image;
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    };

    return Texture;
});
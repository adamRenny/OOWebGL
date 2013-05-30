define(function(require) {
    'use strict';

    var $ = require('jquery');

    var File = function() {
        this.src = '';
        this.onRequestCompleteHandler = this.onRequestComplete.bind(this);
    };

    File.prototype.onload = undefined;
    File.prototype.load = function(src) {
        this.src = src;

        $.ajax({
            url: src
        }).complete(this.onRequestCompleteHandler);
    };

    File.prototype.onRequestComplete = function(jqXHR, success) {
        if (this.onload && typeof this.onload === 'function') {
            this.onload(jqXHR.responseText);
        }
    };

    return File;
})
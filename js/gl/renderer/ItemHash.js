define(function(require) {
    'use strict';

    var ItemHash = function() {
        this.id = 0;
        this.hash = {};
        this.list = [];
    };

    ItemHash.prototype.hasItem = function(item) {
        return this.list.indexOf(item) !== -1;
    };

    ItemHash.prototype.getItemId = function(item) {
        var i = 0;
        var list = this.list;
        var length = list.length;
        var id = -1;

        for (; i < length; i++) {
            if (item === this.hash[list[i]].item) {
                id = list[i];
                break;
            }
        }

        return id;
    };

    ItemHash.prototype.getItemById = function(id) {
        return this.hash[id];
    };

    ItemHash.prototype.retainItem = function(item) {
        if (!this.hasItem(item)) {
            this.hash[this.id] = {
                item: item,
                id: this.id,
                retain: 0
            };
            this.list.push(item);
            this.id++;
        }

        var hashItem = this.hash[this.getItemIndex(item)];
        hashItem.retain++;

        return hashItem.retain;
    };

    ItemHash.prototype.releaseItem = function(item) {
        if (!this.hasItem(item)) {
            return 0;
        }

        var hashItem = this.hash[this.getItemIndex(item)];
        hashItem.retain--;
        if (hashItem.retain <= 0) {
            this.list.splice(this.list.indexOf(hashItem.item), 1);
            this.hash[hashItem.id] = undefined;
        }

        return hashItem.retain;
    };

    return ItemHash;
});
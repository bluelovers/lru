"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const events_1 = __importDefault(require("events"));
const inherits_1 = __importDefault(require("inherits"));
function LRUV0(opts) {
    // @ts-ignore
    if (!(this instanceof LRUV0))
        return new LRUV0(opts);
    if (typeof opts === 'number')
        opts = { max: opts };
    if (!opts)
        opts = {};
    // @ts-ignore
    events_1.default.EventEmitter.call(this);
    // @ts-ignore
    this.cache = {};
    this.head = this.tail = null;
    // @ts-ignore
    this.length = 0;
    this.max = opts.max || 1000;
    // @ts-ignore
    this.maxAge = opts.maxAge || 0;
}
inherits_1.default(LRUV0, events_1.default.EventEmitter);
Object.defineProperty(LRUV0.prototype, 'keys', {
    get: function () { return Object.keys(this.cache); },
});
LRUV0.prototype.clear = function () {
    this.cache = {};
    this.head = this.tail = null;
    this.length = 0;
};
LRUV0.prototype.remove = function (key) {
    if (typeof key !== 'string')
        key = '' + key;
    if (!this.cache.hasOwnProperty(key))
        return;
    var element = this.cache[key];
    delete this.cache[key];
    this._unlink(key, element.prev, element.next);
    return element.value;
};
LRUV0.prototype._unlink = function (key, prev, next) {
    this.length--;
    if (this.length === 0) {
        this.head = this.tail = null;
    }
    else {
        if (this.head === key) {
            this.head = prev;
            this.cache[this.head].next = null;
        }
        else if (this.tail === key) {
            this.tail = next;
            this.cache[this.tail].prev = null;
        }
        else {
            this.cache[prev].next = next;
            this.cache[next].prev = prev;
        }
    }
};
LRUV0.prototype.peek = function (key) {
    if (!this.cache.hasOwnProperty(key))
        return;
    var element = this.cache[key];
    if (!this._checkAge(key, element))
        return;
    return element.value;
};
LRUV0.prototype.set = function (key, value) {
    if (typeof key !== 'string')
        key = '' + key;
    var element;
    if (this.cache.hasOwnProperty(key)) {
        element = this.cache[key];
        element.value = value;
        if (this.maxAge)
            element.modified = Date.now();
        // If it's already the head, there's nothing more to do:
        if (key === this.head)
            return value;
        this._unlink(key, element.prev, element.next);
    }
    else {
        element = { value: value, modified: 0, next: null, prev: null };
        if (this.maxAge)
            element.modified = Date.now();
        this.cache[key] = element;
        // Eviction is only possible if the key didn't already exist:
        if (this.length === this.max)
            this.evict();
    }
    this.length++;
    element.next = null;
    element.prev = this.head;
    if (this.head)
        this.cache[this.head].next = key;
    this.head = key;
    if (!this.tail)
        this.tail = key;
    return value;
};
LRUV0.prototype._checkAge = function (key, element) {
    if (this.maxAge && (Date.now() - element.modified) > this.maxAge) {
        this.remove(key);
        this.emit('evict', { key: key, value: element.value });
        return false;
    }
    return true;
};
LRUV0.prototype.get = function (key) {
    if (typeof key !== 'string')
        key = '' + key;
    if (!this.cache.hasOwnProperty(key))
        return;
    var element = this.cache[key];
    if (!this._checkAge(key, element))
        return;
    if (this.head !== key) {
        if (key === this.tail) {
            this.tail = element.next;
            this.cache[this.tail].prev = null;
        }
        else {
            // Set prev.next -> element.next:
            this.cache[element.prev].next = element.next;
        }
        // Set element.next.prev -> element.prev:
        this.cache[element.next].prev = element.prev;
        // Element is the new head
        this.cache[this.head].next = key;
        element.prev = this.head;
        element.next = null;
        this.head = key;
    }
    return element.value;
};
LRUV0.prototype.evict = function () {
    if (!this.tail)
        return;
    var key = this.tail;
    var value = this.remove(this.tail);
    this.emit('evict', { key: key, value: value });
};
module.exports = LRUV0;
//# sourceMappingURL=v0.js.map
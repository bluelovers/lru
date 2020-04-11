"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LRUV1 = void 0;
const quick_lru_1 = __importDefault(require("quick-lru"));
const events_1 = require("events");
const options_1 = require("../options");
class LRUV1 extends quick_lru_1.default {
    constructor(maxSizeOrOpts) {
        let { onEviction, ...options } = options_1.handleOptions(maxSizeOrOpts);
        super({
            ...options,
            onEviction: (key, value) => {
                //console.dir(this)
                // @ts-ignore
                events_1.EventEmitter.prototype.emit.call(this, "evict" /* evict */, {
                    event: "evict" /* evict */,
                    key,
                    value,
                });
            },
        });
        // @ts-ignore
        events_1.EventEmitter.call(this);
        if (typeof onEviction !== 'undefined' && typeof onEviction !== null) {
            // @ts-ignore
            events_1.EventEmitter.prototype.on.call(this, "evict" /* evict */, (entry => onEviction(entry.key, entry.value, "evict" /* evict */)));
        }
    }
    remove(key) {
        return this.delete(key);
    }
    get length() {
        return this.size;
    }
    keysArray() {
        return [...this.keys()];
    }
}
exports.LRUV1 = LRUV1;
Object.keys(events_1.EventEmitter.prototype)
    .forEach(prop => {
    if (!(prop in LRUV1.prototype) && typeof events_1.EventEmitter.prototype[prop] === 'function') {
        LRUV1.prototype[prop] = events_1.EventEmitter.prototype[prop];
    }
});
exports.default = LRUV1;
//# sourceMappingURL=v1.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOptions = void 0;
function handleOptions(options) {
    var _a, _b;
    if (typeof options === 'number') {
        options = {
            maxSize: options,
        };
    }
    return {
        ...options,
        maxSize: (_b = (_a = options === null || options === void 0 ? void 0 : options.maxSize) !== null && _a !== void 0 ? _a : options === null || options === void 0 ? void 0 : options.max) !== null && _b !== void 0 ? _b : 1000,
    };
}
exports.handleOptions = handleOptions;
exports.default = handleOptions;
//# sourceMappingURL=options.js.map
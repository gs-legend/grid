"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interior = {
    getTemplate(styleProperties) {
        const { color, pattern, patternColor } = styleProperties.interior;
        return {
            name: "Interior",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Color: color,
                            Pattern: pattern,
                            PatternColor: patternColor
                        }
                    }]
            }
        };
    }
};
exports.default = interior;
//# sourceMappingURL=interior.js.map
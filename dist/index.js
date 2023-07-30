/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 285:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.patchFile = exports.VersionType = void 0;
const fs = __importStar(__nccwpck_require__(147));
var VersionType;
(function (VersionType) {
    VersionType[VersionType["CSProject"] = 0] = "CSProject";
    VersionType[VersionType["NPM"] = 1] = "NPM";
    VersionType[VersionType["SetupPython"] = 2] = "SetupPython";
    VersionType[VersionType["InitPython"] = 3] = "InitPython";
    VersionType[VersionType["CFXManifest"] = 4] = "CFXManifest";
    VersionType[VersionType["Gemspec"] = 5] = "Gemspec";
    VersionType[VersionType["PyProject"] = 6] = "PyProject";
})(VersionType || (exports.VersionType = VersionType = {}));
// *should* comply with PEP440
const version = "v?((?:[0-9]+!)?[0-9]+(?:.[0-9]+)*(?:[-_.]?(?:a|b|c|rc|alpha|beta|pre|preview)[-_.]?(?:[0-9]+)?)?(?:-[0-9]+|[-_.]?(?:post|rev|r)[-_.]?(?:[0-9]+)?)?(?:[-_.]?dev[-_.]?(?:[0-9]+)?)?(?:\\+[a-z0-9]+(?:[-_.][a-z0-9]+)*)?)";
const regexes = {
    [VersionType.CSProject]: new RegExp("(<Version>)" + version + "(</Version>)"),
    [VersionType.NPM]: new RegExp("(\"version\": *\")" + version + "(\")"),
    [VersionType.SetupPython]: new RegExp("(version ?= ?[\"'])" + version + "([\"'])"),
    [VersionType.InitPython]: new RegExp("(__version__ ?= ?[\"'])" + version + "([\"'])"),
    [VersionType.CFXManifest]: new RegExp("(version [\"'])" + version + "([\"'])"),
    [VersionType.Gemspec]: new RegExp("(spec\\.version *= *[\"'`])" + version + "([\"'`])"),
    [VersionType.PyProject]: new RegExp("(version = \")" + version + "(\")")
};
async function patchFile(file, version, versionType) {
    const regex = regexes[versionType];
    if (regex === null) {
        throw new Error(`Invalid version type: ${versionType}`);
    }
    const contents = fs.readFileSync(file, "utf-8");
    const matches = regex.exec(contents);
    if (matches == null) {
        throw new Error(`No match found on ${file} for type ${versionType}`);
    }
    const newContents = contents.replaceAll(new RegExp(regex, "g"), `$1${version}$3`);
    fs.writeFileSync(file, newContents);
}
exports.patchFile = patchFile;


/***/ }),

/***/ 147:
/***/ ((module) => {

module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.patchFile = exports.VersionType = void 0;
var patchers_1 = __nccwpck_require__(285);
Object.defineProperty(exports, "VersionType", ({ enumerable: true, get: function () { return patchers_1.VersionType; } }));
Object.defineProperty(exports, "patchFile", ({ enumerable: true, get: function () { return patchers_1.patchFile; } }));

})();

module.exports = __webpack_exports__;
/******/ })()
;
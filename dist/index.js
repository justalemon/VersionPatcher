var __webpack_exports__ = {};

var __createBinding = (undefined && undefined.__createBinding) || (Object.create ? (function(o, m, k, k2) {
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
var __setModuleDefault = (undefined && undefined.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (undefined && undefined.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const patchers_1 = require("./patchers");
const glob = __importStar(require("@actions/glob"));
const names = {
    [patchers_1.VersionType.CSProject]: ".csproj",
    [patchers_1.VersionType.NPM]: "package.json for npm",
    [patchers_1.VersionType.SetupPython]: "setuptools setup.py",
    [patchers_1.VersionType.InitPython]: "__init__.py for Python Package",
    [patchers_1.VersionType.CFXManifest]: "fxmanifest.lua for cfx.re",
    [patchers_1.VersionType.Gemspec]: "Bundler gemspec",
    [patchers_1.VersionType.PyProject]: "pyproject.toml"
};
function toBoolean(input) {
    return input.toLowerCase().trim() === "true";
}
async function run() {
    try {
        let version = core.getInput("version").trim();
        const useTag = toBoolean(core.getInput("use-tag"));
        if (useTag) {
            const context = github.context;
            if (context.eventName === "release") {
                const payload = context.payload;
                version = payload.release.tag_name;
                console.log("Using version from Release Tag " + version);
            }
        }
        if (!version) {
            core.error("No version was specified to patch!");
            return;
        }
        if (toBoolean(core.getInput("trim")) && (version.indexOf("v") === 0 || version.indexOf("V") === 0)) {
            version = version.substring(1);
            console.log("Trimmed v from the beginning");
        }
        console.log(`Using Version ${version}`);
        core.setOutput("version", version);
        const patches = {
            [patchers_1.VersionType.CSProject]: core.getInput("csproj-files"),
            [patchers_1.VersionType.NPM]: core.getInput("npm-files"),
            [patchers_1.VersionType.SetupPython]: core.getInput("setuppy-files"),
            [patchers_1.VersionType.InitPython]: core.getInput("initpy-files"),
            [patchers_1.VersionType.CFXManifest]: core.getInput("fxmanifest-files"),
            [patchers_1.VersionType.Gemspec]: core.getInput("gemspec-files"),
            [patchers_1.VersionType.PyProject]: core.getInput("pyproject-files")
        };
        for (const [versionType, glob_str] of Object.entries(patches)) {
            const name = names[versionType];
            if (glob_str.length == 0) {
                console.log(`Skipping ${name} as no glob was specified`);
                continue;
            }
            const files = await (await glob.create(glob_str)).glob();
            if (files.length == 0) {
                core.setFailed(`No files found matching glob ${glob_str} for format ${name}`);
            }
            for (const file of files) {
                console.log(`Patching ${file} as ${name}`);
                await (0, patchers_1.patchFile)(file, version, versionType);
            }
        }
    }
    catch (e) {
        if (e instanceof Error) {
            core.setFailed(e.message);
        }
    }
}
run();


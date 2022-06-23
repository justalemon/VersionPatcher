const core = require("@actions/core");
const patchers = require("./patchers.js");

function toBoolean(input: string) {
    return input.toLowerCase().trim() === "true";
}

async function run() {
    try
    {
        let version = core.getInput("version").trim();

        if (!version)
        {
            throw "No version was specified to patch!";
        }

        if (toBoolean(core.getInput("trim")) && (version.indexOf("v") === 0 || version.indexOf("V") === 0))
        {
            version = version.substring(1);
            console.log("Trimmed v from the beginning");
        }

        const csproj = core.getInput("csproj-files");
        const npm = core.getInput("npm-files");
        const setuppy = core.getInput("setuppy-files");
        const initpy = core.getInput("initpy-files");
        const fxmanifest = core.getInput("fxmanifest-files");

        if (csproj)
        {
            await patchers.patchcsproj(csproj, version);
        }

        if (npm)
        {
            await patchers.patchnpm(npm, version);
        }

        if (setuppy)
        {
            await patchers.patchsetuppy(setuppy, version);
        }

        if (initpy)
        {
            await patchers.patchinitpy(initpy, version);
        }

        if (fxmanifest)
        {
            await patchers.patchinitpy(fxmanifest, version);
        }
    }
    catch (e)
    {
        core.setFailed(e);
    }
}

run();

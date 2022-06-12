const core = require("@actions/core");
const patchers = require("./patchers.js");

async function run() {
    try
    {
        const version = core.getInput("version");

        if (!version)
        {
            throw "No version was specified to patch!";
        }

        const csproj = core.getInput("csproj-files");
        const npm = core.getInput("npm-files");
        const setuppy = core.getInput("setuppy-files");
        const initpy = core.getInput("initpy-files");

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
    }
    catch (e)
    {
        core.setFailed(e);
    }
}

run();

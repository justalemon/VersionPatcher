const core = require("@actions/core");
const patchers = require("patchers")

async function run() {
    try
    {
        const version = core.getInput("version");

        if (!version)
        {
            core.setFailed("No version was specified to patch!");
            return;
        }

        const csproj = core.getInput("csproj-files");
        const npm = core.getInput("npm-files");
        const setuppy = core.getInput("setuppy-files");

        if (csproj)
        {
            await patchers.patchcsproj(csproj, version);
        }

        if (npm)
        {
            await patchers.patchnpm(npm, version)
        }

        if (setuppy)
        {
            await patchers.patchsetuppy(setuppy, version)
        }
    }
    catch (e)
    {
        core.setFailed(e);
    }
}

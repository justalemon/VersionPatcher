import * as core from "@actions/core";
import * as github from "@actions/github";
import * as patchers from "./patchers";
import {ReleaseEvent} from "@octokit/webhooks-definitions/schema";

function toBoolean(input: string) {
    return input.toLowerCase().trim() === "true";
}

async function run() {
    try
    {
        let version = core.getInput("version").trim();
        const useTag = toBoolean(core.getInput("use-tag"));

        if (useTag)
        {
            const context = github.context;

            if (context.eventName === "release")
            {
                const payload = context.payload as ReleaseEvent;
                version = payload.release.tag_name;
                console.log("Using version from Release Tag " + version);
            }
        }

        if (!version)
        {
            throw "No version was specified to patch!";
        }

        if (toBoolean(core.getInput("trim")) && (version.indexOf("v") === 0 || version.indexOf("V") === 0))
        {
            version = version.substring(1);
            console.log("Trimmed v from the beginning");
        }

        console.log(`Using Version ${version}`);
        core.setOutput("version", version);

        const csproj = core.getInput("csproj-files");
        const npm = core.getInput("npm-files");
        const setuppy = core.getInput("setuppy-files");
        const initpy = core.getInput("initpy-files");
        const fxmanifest = core.getInput("fxmanifest-files");

        if (csproj)
        {
            const csproj_done = await patchers.patchcsproj(csproj, version);
            if (!csproj_done)
            {
                throw "Couldn't find any csproj files to match";
            }
        }

        if (npm)
        {
            const npm_done = await patchers.patchnpm(npm, version);
            if (!npm_done)
            {
                throw "Couldn't find any csproj files to match";
            }
        }

        if (setuppy)
        {
            const setuppy_done = await patchers.patchsetuppy(setuppy, version);
            if (!setuppy_done)
            {
                throw "Couldn't find any csproj files to match";
            }
        }

        if (initpy)
        {
            const initpy_done = await patchers.patchinitpy(initpy, version);
            if (!initpy_done)
            {
                throw "Couldn't find any csproj files to match";
            }
        }

        if (fxmanifest)
        {
            const fxmanifest_done = await patchers.patchinitpy(fxmanifest, version);
            if (!fxmanifest_done)
            {
                throw "Couldn't find any csproj files to match";
            }
        }
    }
    catch (e)
    {
        if (e instanceof Error)
        {
            core.setFailed(e.message);
        }
    }
}

run();

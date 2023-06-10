import * as core from "@actions/core";
import * as github from "@actions/github";
import {patch, VersionType} from "./patchers";
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
            core.error("No version was specified to patch!");
            return;
        }

        if (toBoolean(core.getInput("trim")) && (version.indexOf("v") === 0 || version.indexOf("V") === 0))
        {
            version = version.substring(1);
            console.log("Trimmed v from the beginning");
        }

        console.log(`Using Version ${version}`);
        core.setOutput("version", version);
        
        const patches: Record<VersionType, string> = {
            [VersionType.CSProject]: core.getInput("csproj-files"),
            [VersionType.NPM]: core.getInput("npm-files"),
            [VersionType.SetupPython]: core.getInput("setuppy-files"),
            [VersionType.InitPython]: core.getInput("initpy-files"),
            [VersionType.CFXManifest]: core.getInput("fxmanifest-files"),
            [VersionType.Gemspec]: core.getInput("gemspec-files")
        };

        for (const [format, glob] of (Object.entries(patches) as unknown as ([VersionType, string])[])) {
            if (!glob) {
                continue;
            }
            
            await patch(glob, version, format);
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

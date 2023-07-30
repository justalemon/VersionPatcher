import * as core from "@actions/core";
import * as github from "@actions/github";
import { patchFile, VersionType } from "./patchers";
import { ReleaseEvent } from "@octokit/webhooks-types/schema";
import * as glob from "@actions/glob";

const names = {
    [VersionType.CSProject]: ".csproj",
    [VersionType.NPM]: "package.json for npm",
    [VersionType.SetupPython]: "setuptools setup.py",
    [VersionType.InitPython]: "__init__.py for Python Package",
    [VersionType.CFXManifest]: "fxmanifest.lua for cfx.re",
    [VersionType.Gemspec]: "Bundler gemspec",
    [VersionType.PyProject]: "pyproject.toml"
};

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
            [VersionType.Gemspec]: core.getInput("gemspec-files"),
            [VersionType.PyProject]: core.getInput("pyproject-files")
        };

        for (const [versionType, glob_str] of (Object.entries(patches) as unknown as ([VersionType, string])[])) {
            if (!glob_str) {
                continue;
            }

            const files = await (await glob.create(glob_str)).glob();

            if (files.length == 0) {
                core.setFailed(`No files found matching glob ${glob_str} for format ${names[versionType]}`);
            }

            for (const file of files)
            {
                console.log(`Patching ${file} as ${names[versionType]}`);
                await patchFile(file, version, versionType);
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

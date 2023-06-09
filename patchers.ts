import * as fs from "fs";
import * as glob from "@actions/glob";

export enum VersionType {
    CSProject = 0,
    NPM = 1,
    SetupPython = 2,
    InitPython = 3,
    CFXManifest = 4
}

// *should* comply with PEP440
const regex_version = "v?((?:[0-9]+!)?[0-9]+(?:.[0-9]+)*(?:[-_.]?(?:a|b|c|rc|alpha|beta|pre|preview)[-_.]?(?:[0-9]+)?)?(?:-[0-9]+|[-_.]?(?:post|rev|r)[-_.]?(?:[0-9]+)?)?(?:[-_.]?dev[-_.]?(?:[0-9]+)?)?(?:\\+[a-z0-9]+(?:[-_.][a-z0-9]+)*)?)";

const regexes = {
    [VersionType.CSProject]: new RegExp("(<Version>)" + regex_version + "(</Version>)"),
    [VersionType.NPM]: new RegExp("(\"version\": *\")" + regex_version + "(\")"),
    [VersionType.SetupPython]: new RegExp("(version ?= ?[\"'])" + regex_version + "([\"'])"),
    [VersionType.InitPython]: new RegExp("(__version__ ?= ?[\"'])" + regex_version + "([\"'])"),
    [VersionType.CFXManifest]: new RegExp("(version [\"'])" + regex_version + "([\"'])")
};

async function patchWithRegex(file: string, version: string, versionType: VersionType)
{
    const regex: null | RegExp = regexes[versionType];
    
    if (regex === null) {
        throw `Invalid version type: ${versionType}`;
    }
    
    const contents = fs.readFileSync(file, "utf-8");
    const matches = regex.exec(contents);

    if (matches == null)
    {
        throw `No match found on ${file}`;
    }
    
    const newContents = contents.replaceAll(new RegExp(regex, "g"), `$1${version}$3`);

    fs.writeFileSync(file, newContents);
}

export async function patch(glob_str: string, version: string, versionType: VersionType)
{
    let patched = false;

    for await (const file of (await glob.create(glob_str)).globGenerator())
    {
        console.log(`Patching ${versionType} version in file ${file}`);
        await patchWithRegex(file, version, versionType);
        patched = true;
    }

    return patched;
}

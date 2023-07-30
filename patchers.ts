import * as fs from "fs";

export enum VersionType {
    CSProject = 0,
    NPM = 1,
    SetupPython = 2,
    InitPython = 3,
    CFXManifest = 4,
    Gemspec = 5,
    PyProject = 6
}

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

export async function patchFile(file: string, version: string, versionType: VersionType)
{
    const regex: null | RegExp = regexes[versionType];
    
    if (regex === null) {
        throw new Error(`Invalid version type: ${versionType}`);
    }
    
    const contents = fs.readFileSync(file, "utf-8");
    const matches = regex.exec(contents);

    if (matches == null)
    {
        throw new Error(`No match found on ${file} for type ${versionType}`);
    }
    
    const newContents = contents.replaceAll(new RegExp(regex, "g"), `$1${version}$3`);

    fs.writeFileSync(file, newContents);
}

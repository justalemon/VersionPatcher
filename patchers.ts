import * as fs from "fs";
import * as glob from "@actions/glob";
import xml2js from "xml2js";

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
    [VersionType.CSProject]: null,
    [VersionType.NPM]: null,
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
    
    const start = matches[1];
    const end = matches[3];

    const madeVersion = `${start}${version}${end}`;
    const newContents = contents.replace(regex, madeVersion);

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

export async function patchcsproj(glob_str: string, version: string)
{
    let patched = false;

    for await (const file of (await glob.create(glob_str)).globGenerator())
    {
        console.log(`Patching csproj version in file ${file}`);

        const contents = fs.readFileSync(file, "utf-8");

        new xml2js.Parser({}).parseString(contents, (err, result) => {
            if (err)
            {
                throw err;
            }

            let changed = false;

            const array = result["Project"]["PropertyGroup"];
            array.forEach((value: { [x: string]: string[]; }) => {
                if (value.hasOwnProperty("Version"))
                {
                    value["Version"] = [version];
                }
                changed = true;
            });

            if (!changed)
            {
                throw `No Version tag found in ${file}`;
            }

            const xml = new xml2js.Builder({headless: true}).buildObject(result);
            fs.writeFileSync(file, xml);

            patched = true;
        });
    }

    return patched;
}

export async function patchnpm(glob_str: string, version: string)
{
    let patched = false;

    for await (const file of (await glob.create(glob_str)).globGenerator())
    {
        console.log(`Patching package.json version in file ${file}`);

        const contents = fs.readFileSync(file).toString();
        const json = JSON.parse(contents);

        json["version"] = version;

        fs.writeFileSync(file, JSON.stringify(json, null, 4));

        patched = true;
    }

    return patched;
}

import * as fs from "fs";
import * as glob from "@actions/glob";
import xml2js from "xml2js";

// *should* comply with PEP440
const regex_version = "v?(?:[0-9]+!)?[0-9]+(?:.[0-9]+)*(?:[-_.]?(?:a|b|c|rc|alpha|beta|pre|preview)[-_.]?(?:[0-9]+)?)?(?:-[0-9]+|[-_.]?(?:post|rev|r)[-_.]?(?:[0-9]+)?)?(?:[-_.]?dev[-_.]?(?:[0-9]+)?)?(?:\\+[a-z0-9]+(?:[-_.][a-z0-9]+)*)?";

const regex_setup = new RegExp("version( ?)=( ?)([\"'])" + regex_version + "([\"'])");
const regex_init = new RegExp("__version__( ?)=( ?)([\"'])" + regex_version + "([\"'])");
const regex_fxmanifest = new RegExp("version( )([\"'])" + regex_version + "([\"'])");

async function patchWithRegex(file: string, version: string, regex: RegExp)
{
    const contents = fs.readFileSync(file, "utf-8");
    const matches = regex.exec(contents);

    if (contents.search(regex) === -1 || matches == null)
    {
        throw `No match found on ${file}`;
    }

    const one = matches[1];
    let two = matches[2];
    let three = matches[3];
    let four = matches[4];
    let equals = "=";

    if (typeof four === "undefined")
    {
        four = three;
        three = two;
        two = one;
        equals = "";
    }

    const spaceLeft = (one === " " || two === " ") ? " " : "";
    const spaceRight = equals ? spaceLeft : "";
    const quote = (three === "\"" && four === "\"") ? "\"" : "'";

    const madeVersion = `version${spaceLeft}${equals}${spaceRight}${quote}${version}${quote}`;
    const newContents = contents.replace(regex, madeVersion);

    fs.writeFileSync(file, newContents);
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

export async function patchsetuppy(glob_str: string, version: string)
{
    let patched = false;

    for await (const file of (await glob.create(glob_str)).globGenerator())
    {
        console.log(`Patching setup.py version in file ${file}`);
        await patchWithRegex(file, version, regex_setup);
        patched = true;
    }

    return patched;
}

export async function patchinitpy(glob_str: string, version: string)
{
    let patched = false;

    for await (const file of (await glob.create(glob_str)).globGenerator())
    {
        console.log(`Patching __init__.py version in file ${file}`);
        await patchWithRegex(file, version, regex_init);
        patched = true;
    }

    return patched;
}

export async function patchfxmanifest(glob_str: string, version: string)
{
    let patched = false;

    for await (const file of (await glob.create(glob_str)).globGenerator())
    {
        console.log(`Patching fxmanifest.lua version in file ${file}`);
        await patchWithRegex(file, version, regex_fxmanifest);
        patched = true;
    }

    return patched;
}

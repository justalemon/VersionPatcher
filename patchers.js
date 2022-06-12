const fs = require("fs");
const glob = require("@actions/glob");
const xml2js = require("xml2js");

// *should* comply with PEP440
const regex_setup = new RegExp("version( ?)=( ?)([\"'])v?(?:[0-9]+!)?[0-9]+(?:.[0-9]+)*(?:[-_.]?(?:a|b|c|rc|alpha|beta|pre|preview)[-_.]?(?:[0-9]+)?)?(?:-[0-9]+|[-_.]?(?:post|rev|r)[-_.]?(?:[0-9]+)?)?(?:[-_.]?dev[-_.]?(?:[0-9]+)?)?(?:\\+[a-z0-9]+(?:[-_.][a-z0-9]+)*)?([\"'])");
const regex_init = new RegExp("__version__( ?)=( ?)([\"'])v?(?:[0-9]+!)?[0-9]+(?:.[0-9]+)*(?:[-_.]?(?:a|b|c|rc|alpha|beta|pre|preview)[-_.]?(?:[0-9]+)?)?(?:-[0-9]+|[-_.]?(?:post|rev|r)[-_.]?(?:[0-9]+)?)?(?:[-_.]?dev[-_.]?(?:[0-9]+)?)?(?:\\+[a-z0-9]+(?:[-_.][a-z0-9]+)*)?([\"'])");

async function patchWithRegex(file, version, regex)
{
    const contents = fs.readFileSync(file, "utf-8");

    if (contents.search(regex) === -1)
    {
        throw `No match found on ${file}`;
    }

    const matches = regex.exec(contents);

    const space = (matches[1] === " " || matches[2] === " ") ? " " : "";
    const quote = (matches[3] === "\"" && matches[4] === "\"") ? "\"" : "'";

    const madeVersion = `version${space}=${space}${quote}${version}${quote}`;
    const newContents = contents.replace(regex, madeVersion);

    fs.writeFileSync(file, newContents);
}

exports.patchcsproj = async function (glob_str, version)
{
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
            array.forEach((value) => {
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
        });
    }
};

exports.patchnpm = async function (glob_str, version)
{
    const globber = await glob.create(glob_str);

    for await (const file of globber.globGenerator())
    {
        console.log(`Patching package.json version in file ${file}`);

        const contents = fs.readFileSync(file).toString();
        const json = JSON.parse(contents);

        json["version"] = version;

        fs.writeFileSync(file, JSON.stringify(json, null, 4));
    }
};

exports.patchsetuppy = async function (glob_str, version)
{
    for await (const file of (await glob.create(glob_str)).globGenerator())
    {
        console.log(`Patching setup.py version in file ${file}`);
        await patchWithRegex(file, version, regex_setup);
    }
};

exports.patchinitpy = async function (glob_str, version)
{
    for await (const file of (await glob.create(glob_str)).globGenerator())
    {
        console.log(`Patching __init__.py version in file ${file}`);
        await patchWithRegex(file, version, regex_init);
    }
};

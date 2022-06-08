const fs = require("fs");
const glob = require("@actions/glob");
const xml2js = require("xml2js");

// *should* comply with PEP440
const regex_setup = new RegExp("version( ?)=( ?)([\"'])v?(?:[0-9]+!)?[0-9]+(?:.[0-9]+)*(?:[-_.]?(?:a|b|c|rc|alpha|beta|pre|preview)[-_.]?(?:[0-9]+)?)?(?:-[0-9]+|[-_.]?(?:post|rev|r)[-_.]?(?:[0-9]+)?)?(?:[-_.]?dev[-_.]?(?:[0-9]+)?)?(?:\\+[a-z0-9]+(?:[-_.][a-z0-9]+)*)?([\"'])");
//const regex_init = new RegExp("__version__( ?)=( ?)([\"'])v?(?:[0-9]+!)?[0-9]+(?:.[0-9]+)*(?:[-_.]?(?:a|b|c|rc|alpha|beta|pre|preview)[-_.]?(?:[0-9]+)?)?(?:-[0-9]+|[-_.]?(?:post|rev|r)[-_.]?(?:[0-9]+)?)?(?:[-_.]?dev[-_.]?(?:[0-9]+)?)?(?:\\+[a-z0-9]+(?:[-_.][a-z0-9]+)*)?([\"'])");

exports.patchcsproj = async function (glob_str, version)
{
    for await (const file of (await glob.create(glob_str)).globGenerator())
    {
        console.log(`Patching csproj version in file ${file}`)

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
    console.log(`Patching package.json version in file ${file}`)

    const globber = await glob.create(glob_str);

    for await (const file of globber.globGenerator())
    {
        const contents = fs.readFileSync(file).toString();
        const json = JSON.parse(contents);

        json["version"] = version;

        fs.writeFileSync(file, JSON.stringify(json, null, 4));
    }
};

exports.patchsetuppy = async function (glob_str, version)
{
    console.log(`Patching setup.py version in file ${file}`)

    for await (const file of (await glob.create(glob_str)).globGenerator())
    {
        const contents = fs.readFileSync(file, "utf-8");

        if (contents.search(regex_setup) === -1)
        {
            throw `No match found on ${file}`;
        }

        const matches = regex_setup.exec(contents);

        const space = (matches[1] === " " || matches[2] === " ") ? " " : "";
        const quote = (matches[3] === "\"" && matches[4] === "\"") ? "\"" : "'";

        const madeVersion = `version${space}=${space}${quote}${version}${quote}`;
        const newContents = contents.replace(regex_setup, madeVersion);

        fs.writeFileSync(file, newContents);
    }
};

const core = require("@actions/core");
const fs = require("fs");
const glob = require("@actions/glob");
const xml2js = require("xml2js");

// *should* comply with PEP440
const regex_setuppy = new RegExp("__version__ ?= ?[\"']v?(?:([0-9]+)!)?([0-9]+(?:\\.[0-9]+)*)([-_\\.]?(a|b|c|rc|alpha|beta|pre|preview)[-_\\.]?([0-9]+)?)?((?:-([0-9]+))[-_\\.]?(post|rev|r)[-_\\.]?([0-9]+)?)?([-_\\.]?(dev)[-_\\.]?([0-9]+)?)?(?:\\+([a-z0-9]+(?:[-_\\.][a-z0-9]+)*))?[\"']");

exports.patchcsproj = async function (glob_str, version)
{
    for await (const file of (await glob.create(glob_str)).globGenerator())
    {
        const contents = fs.readFileSync(file, "utf-8");

        new xml2js.Parser({}).parseString(contents, (err, result) => {
            if (err)
            {
                core.setFailed(err);
                return;
            }

            let changed = false;

            const array = result["Project"]["PropertyGroup"];
            array.forEach((value, _) => {
                if (value.hasOwnProperty("Version"))
                {
                    value["Version"] = [version];
                }
                changed = true;
            });

            if (!changed)
            {
                core.setFailed("No Version tag found in " + file);
                return;
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
        const contents = fs.readFileSync(file).toString();
        const json = JSON.parse(contents);

        fs.writeFileSync(file, JSON.stringify(json));
    }
};

exports.patchsetuppy = async function (glob_str, version)
{
    const globber = await glob.create(glob_str);

    for await (const file of globber.globGenerator())
    {
        const contents = fs.readFileSync(file);

        // TODO: Find a way to reliably patch the setup.py file

        fs.writeFileSync(file, contents);
    }
};

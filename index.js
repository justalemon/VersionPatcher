const core = require("@actions/core");
const fs = require("fs");
const glob = require("@actions/glob");
const xml2js = require("xml2js");

async function run() {
    try
    {
        const version = core.getInput("version");

        if (!version)
        {
            core.setFailed("No version was specified to patch!");
            return;
        }

        const xml_parser = new xml2js.Parser({});
        const xml_builder = new xml2js.Builder({});

        const csproj = core.getInput("csproj-files");
        const npm = core.getInput("npm-files");
        const setuppy = core.getInput("setuppy-files");

        if (csproj)
        {
            const globber = await glob.create(csproj);

            for await (const file of globber.globGenerator())
            {
                const contents = fs.readFileSync(file);
                const parsed = xml_parser.parseString(contents);

                const xml = xml_builder.buildObject(parsed);
                fs.writeFileSync(file, xml);
            }
        }

        if (npm)
        {
            const globber = await glob.create(npm);

            for await (const file of globber.globGenerator())
            {
                const contents = fs.readFileSync(file).toString();
                const json = JSON.parse(contents);

                fs.writeFileSync(file, JSON.stringify(json));
            }
        }

        if (setuppy)
        {
            const globber = await glob.create(setuppy);

            for await (const file of globber.globGenerator())
            {
                const contents = fs.readFileSync(file);

                // TODO: Find a way to reliably patch the setup.py file

                fs.writeFileSync(file, contents);
            }
        }
    }
    catch (e)
    {
        core.setFailed(e);
    }
}

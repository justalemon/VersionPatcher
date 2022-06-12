const fs = require("fs");
const patchers = require("./patchers.js");

async function match(from, to, ready, callback) {
    if (fs.existsSync(to))
    {
        fs.unlinkSync(to);
    }

    fs.copyFileSync(from, to);

    await callback();

    const patched = fs.readFileSync(to, "utf-8");
    const sample = fs.readFileSync(ready, "utf-8");

    //fs.unlinkSync(to);

    expect(patched).toEqual(sample);
}

describe("patchers", () => {
    test("Patch csproj", async () => {
        const from = "files/csproj/TestProject.csproj";
        const to = "files/csproj/TestProject.Edit.csproj";
        const ready = "files/csproj/TestProject.Ready.csproj";

        await match(from, to, ready, async () => await patchers.patchcsproj(to, "2.3.4"));
    });

    test("Patch npm package.json", async () => {
        const from = "files/npm/package.json";
        const to = "files/npm/package.edit.json";
        const ready = "files/npm/package.ready.json";

        await match(from, to, ready, async () => await patchers.patchnpm(to, "2.3.4"));
    });

    test("Patch setup.py", async () => {
        const from = "files/setuppy/setup.py";
        const to = "files/setuppy/setup.edit.py";
        const ready = "files/setuppy/setup.ready.py";

        await match(from, to, ready, async () => await patchers.patchsetuppy(to, "2.3.4"));
    });

    test("Patch __init__.py", async () => {
        const from = "files/initpy/__init__.py";
        const to = "files/initpy/__init__.edit.py";
        const ready = "files/initpy/__init__.ready.py";

        await match(from, to, ready, async () => await patchers.patchsetuppy(to, "2.3.4"));
    });
});

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

    fs.unlinkSync(to);

    expect(patched).toEqual(sample);
}

describe("patchers", () => {
    test("Patch csproj", async () => {
        const from = "files/csproj/TestProject.csproj";
        const to = "files/csproj/TestProject.Edit.csproj";
        const ready = "files/csproj/TestProject.Ready.csproj";

        await match(from, to, ready, async () => await patchers.patchcsproj(to, "2.3.4"))
    });

        await patchers.patchcsproj(path, "2.3.4");

        const patched = fs.readFileSync(path, "utf-8");
        const done = fs.readFileSync("files/csproj/TestProject.Ready.csproj", "utf-8");

        expect(patched).toEqual(done);
    });
});

const fs = require("fs");
const patchers = require("./patchers.js");

describe("patchers", () => {
    test("Patch csproj", async () => {
        const path = "files/csproj/TestProject.Edit.csproj";

        if (fs.existsSync(path))
        {
            fs.unlinkSync(path);
        }

        fs.copyFileSync("files/csproj/TestProject.csproj", path);

        await patchers.patchcsproj(path, "2.3.4");

        const original = fs.readFileSync("files/csproj/TestProject.csproj", "utf-8");
        const patched = fs.readFileSync(path, "utf-8");
        const done = fs.readFileSync("files/csproj/TestProject.Ready.csproj", "utf-8");

        expect(patched).not.toEqual(original);
        expect(patched).toEqual(done);
    })
})

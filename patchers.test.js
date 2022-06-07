const fs = require("fs");
const patchers = require("./patchers.js");

describe("patchers", () => {
    test("Patch csproj", async () => {
        await patchers.patchcsproj("files/TestProject.csproj", "2.3.4");
        const patched = fs.readFileSync("files/TestProject.csproj", "utf-8");
        const sample = fs.readFileSync("files/TestProject.Ready.csproj", "utf-8");
        expect(patched).toEqual(sample);
    })
})

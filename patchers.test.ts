import * as fs from "fs";
import * as patchers from "./patchers";

type NoParamsCallback = () => void;

async function match(from: string, to: string, ready: string, callback: NoParamsCallback) {
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

    test("Invalid csproj", async () => {
        const done = await patchers.patchcsproj("invalid.csproj", "1.0");
        expect(done).toEqual(false);
    });

    test("Patch npm package.json", async () => {
        const from = "files/npm/package.json";
        const to = "files/npm/package.edit.json";
        const ready = "files/npm/package.ready.json";

        await match(from, to, ready, async () => await patchers.patchnpm(to, "2.3.4"));
    });

    test("Invalid npm package.json", async () => {
        const done = await patchers.patchnpm("invalid.json", "1.0");
        expect(done).toEqual(false);
    });

    test("Patch setup.py", async () => {
        const from = "files/setuppy/setup.py";
        const to = "files/setuppy/setup.edit.py";
        const ready = "files/setuppy/setup.ready.py";

        await match(from, to, ready, async () => await patchers.patchsetuppy(to, "2.3.4"));
    });

    test("Invalid setup.py", async () => {
        const done = await patchers.patchsetuppy("invalid.py", "1.0");
        expect(done).toEqual(false);
    });

    test("Patch __init__.py", async () => {
        const from = "files/initpy/__init__.py";
        const to = "files/initpy/__init__.edit.py";
        const ready = "files/initpy/__init__.ready.py";

        await match(from, to, ready, async () => await patchers.patchsetuppy(to, "2.3.4"));
    });

    test("Invalid __init__.py", async () => {
        const done = await patchers.patchinitpy("invalid.py", "1.0");
        expect(done).toEqual(false);
    });

    test("Patch fxmanifest.lua", async () => {
        const from = "files/fxmanifest/fxmanifest.lua";
        const to = "files/fxmanifest/fxmanifest.edit.lua";
        const ready = "files/fxmanifest/fxmanifest.ready.lua";

        await match(from, to, ready, async () => await patchers.patchfxmanifest(to, "2.3.4"));
    });

    test("Invalid fxmanifest.lua", async () => {
        const done = await patchers.patchfxmanifest("invalid.lua", "1.0");
        expect(done).toEqual(false);
    });
});

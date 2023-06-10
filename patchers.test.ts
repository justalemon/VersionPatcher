import * as fs from "fs";
import {patch, VersionType} from "./patchers";

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

        await match(from, to, ready, async () => await patch(to, "2.3.4", VersionType.CSProject));
    });

    test("Invalid csproj", async () => {
        await expect(async () => await patch("invalid.csproj", "1.0", VersionType.CSProject)).rejects.toThrow();
    });

    test("Patch npm package.json", async () => {
        const from = "files/npm/package.json";
        const to = "files/npm/package.edit.json";
        const ready = "files/npm/package.ready.json";

        await match(from, to, ready, async () => await patch(to, "2.3.4", VersionType.NPM));
    });

    test("Invalid npm package.json", async () => {
        await expect(async () => await patch("invalid.json", "1.0", VersionType.NPM)).rejects.toThrow();
    });

    test("Patch setup.py", async () => {
        const from = "files/setuppy/setup.py";
        const to = "files/setuppy/setup.edit.py";
        const ready = "files/setuppy/setup.ready.py";

        await match(from, to, ready, async () => await patch(to, "2.3.4", VersionType.SetupPython));
    });

    test("Invalid setup.py", async () => {
        await expect(async () => await patch("invalid.py", "1.0", VersionType.SetupPython)).rejects.toThrow();
    });

    test("Patch __init__.py", async () => {
        const from = "files/initpy/__init__.py";
        const to = "files/initpy/__init__.edit.py";
        const ready = "files/initpy/__init__.ready.py";

        await match(from, to, ready, async () => await patch(to, "2.3.4", VersionType.InitPython));
    });

    test("Invalid __init__.py", async () => {
        await expect(async () => await patch("invalid.py", "1.0", VersionType.InitPython)).rejects.toThrow();
    });

    test("Patch fxmanifest.lua", async () => {
        const from = "files/fxmanifest/fxmanifest.lua";
        const to = "files/fxmanifest/fxmanifest.edit.lua";
        const ready = "files/fxmanifest/fxmanifest.ready.lua";

        await match(from, to, ready, async () => await patch(to, "2.3.4", VersionType.CFXManifest));
    });

    test("Invalid fxmanifest.lua", async () => {
        await expect(async () => await patch("invalid.lua", "1.0", VersionType.CFXManifest)).rejects.toThrow();
    });
    
    test("Patch .gemspec", async () => {
        const from = "files/gemspec/octi.gemspec";
        const to = "files/gemspec/octi.edit.gemspec";
        const ready = "files/gemspec/octi.ready.gemspec";

        await match(from, to, ready, async () => await patch(to, "2.3.4", VersionType.Gemspec));
    });

    test("Invalid .gemspec", async () => {
        await expect(async () => await patch("invalid.gemspec", "1.0", VersionType.Gemspec)).rejects.toThrow();
    });
});

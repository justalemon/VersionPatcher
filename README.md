# VersionPatcher<br>[![GitHub Actions][actions-img]][actions-url] [![Patreon][patreon-img]][patreon-url] [![PayPal][paypal-img]][paypal-url] [![Discord][discord-img]][discord-url]

> Warning: The Action is currently in Beta and is not ready for production

VersionPatcher is a simple GitHub Action that helps you patch the version of your projects before compiling your code.

It supports the following project types:

| Programming Language  | Project File | Compiler or Manager | Remarks             |
|-----------------------|--------------|---------------------|---------------------|
| C#                    | *.csproj     | msbuild/dotnet      | VS 2017 and up only |
| JavaScript/TypeScript | package.json | dotnet              |                     |
| Python                | setup.py     | build/setuptools    |                     |

Please note that you need to have an existing dummy version for the script to pick up.

## Installation

To add the action to your workflow, you just add it as step in a job. This is an example of what it should look like:

```yml
      - name: Patch Versions
        uses: justalemon/VersionPatcher@master
        with:
          version: 1.0.0.${{ github.run_number }}
```

## Usage

There are a couple of options that you can change to tweak the patching process. They are specified in the with section and they are the following:

* version 
  * The version to apply to the patched project. Please make sure that the version that you are going to patch is compatible with the versioning used by your package manager.
* csproj-files
  * The glob to use for finding C# projects. It needs to be compatible with [@actions/glob](https://github.com/actions/toolkit/tree/main/packages/glob).
* npm-files
  * The glob to use for finding npm package.json files.  It needs to be compatible with [@actions/glob](https://github.com/actions/toolkit/tree/main/packages/glob).
* setuppy-files
  * The glob to use for finding Python/SetupTools setup.py files. It needs to be compatible with [@actions/glob](https://github.com/actions/toolkit/tree/main/packages/glob).

[actions-img]: https://img.shields.io/github/workflow/status/justalemon/VersionPatcher/Build%20Action?label=github%20actions
[actions-url]: https://github.com/justalemon/VersionPatcher/actions
[patreon-img]: https://img.shields.io/badge/support-patreon-FF424D.svg
[patreon-url]: https://www.patreon.com/lemonchan
[paypal-img]: https://img.shields.io/badge/support-paypal-0079C1.svg
[paypal-url]: https://paypal.me/justalemon
[discord-img]: https://img.shields.io/badge/discord-join-7289DA.svg
[discord-url]: https://discord.gg/Cf6sspj

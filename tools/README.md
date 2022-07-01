# tools

This folder contains tools used for development of the website.

## MogboardExporter

The mogboard exporter exports game data from the game files (and from CafeMaker for the Chinese game version) for use in the website.
The main exporter is used as follows, from the `MogboardExporter` project directory:

```powershell
dotnet run -- -s <sqpack> -o ..\..\..\data\game -l <languages>
```

For example, to export data for the four international version languages, with the default install directory, use:

```powershell
dotnet run -- -s "C:\Program Files (x86)\SquareEnix\FINAL FANTASY XIV - A Realm Reborn\game\sqpack" -o ..\..\..\data\game -l ja en fr de
```

## MogboardExporter.CafeMaker

The CafeMaker sub-project exports data from CafeMaker for use in the Chinese version of the website. It is used as followed, from its
project directory:

```powershell
dotnet run -- -o ..\..\..\data\game
```

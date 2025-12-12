using System.Text;
using System.Text.Json;
using CommandLine;
using Lumina;
using Lumina.Data;
using Lumina.Excel.Sheets;
using Lumina.Text.Payloads;
using Lumina.Text.ReadOnly;
using MogboardExporter.Data;

namespace MogboardExporter;

public class Program
{
    public class Options
    {
        [Option('s', "sqpack", Required = true, HelpText = "The path to your sqpack folder.")]
        public string SqPack { get; set; } = null!;

        [Option('o', "output", Required = true, HelpText = "The path to the output directory.")]
        public string Output { get; set; } = null!;

        [Option('l', "languages", Required = true, HelpText = "The languages to export data for.")]
        public IList<string> Languages { get; set; } = null!;
    }

    public static void Main(string[] args)
    {
        Parser.Default.ParseArguments<Options>(args)
            .WithParsed(o =>
            {
                Console.WriteLine("Beginning export.");
                var languages = Enum.GetValues<Language>().Where(lang => o.Languages.Any(l =>
                    string.Equals(l, LanguageUtil.GetLanguageStr(lang), StringComparison.InvariantCultureIgnoreCase)));
                foreach (var lang in languages)
                {
                    Console.WriteLine($"Exporting language {lang}...");
                    var langStr = LanguageUtil.GetLanguageStr(lang);
                    var gameData = new GameData(o.SqPack,
                        new LuminaOptions
                        {
                            DefaultExcelLanguage = lang,
                            PanicOnSheetChecksumMismatch = false,
                        }) ?? throw new InvalidOperationException();

                    Directory.CreateDirectory(Path.Combine(o.Output, langStr));

                    Console.WriteLine("Exporting item search categories...");
                    var itemSearchCategories = new Dictionary<uint, ItemSearchCategoryDump>();
                    foreach (var isc in gameData.GetExcelSheet<ItemSearchCategory>()!)
                    {
                        itemSearchCategories.Add(isc.RowId, new ItemSearchCategoryDump
                        {
                            Id = isc.RowId,
                            Name = isc.Name.ExtractText(),
                            Category = isc.Category,
                            Order = isc.Order,
                        });
                    }

                    File.WriteAllText(Path.Combine(o.Output, langStr, "isc.json"),
                        JsonSerializer.Serialize(itemSearchCategories));

                    Console.WriteLine("Exporting item UI categories...");
                    var itemUICategories = new Dictionary<uint, ItemUICategoryDump>();
                    foreach (var iuc in gameData.GetExcelSheet<ItemUICategory>()!)
                    {
                        itemUICategories.Add(iuc.RowId, new ItemUICategoryDump
                        {
                            Id = iuc.RowId,
                            Name = SeStringToHtml(iuc.Name, gameData),
                        });
                    }

                    File.WriteAllText(Path.Combine(o.Output, langStr, "iuc.json"),
                        JsonSerializer.Serialize(itemUICategories));

                    Console.WriteLine("Exporting classjob categories...");
                    var classJobCategories = new Dictionary<uint, ClassJobCategoryDump>();
                    foreach (var cjc in gameData.GetExcelSheet<ClassJobCategory>()!)
                    {
                        classJobCategories.Add(cjc.RowId, new ClassJobCategoryDump
                        {
                            Id = cjc.RowId,
                            Name = cjc.Name.ExtractText(),
                        });
                    }

                    File.WriteAllText(Path.Combine(o.Output, langStr, "cjc.json"),
                        JsonSerializer.Serialize(classJobCategories));

                    Console.WriteLine("Exporting item kinds...");
                    var itemKinds = new Dictionary<uint, ItemKindDump>();
                    foreach (var (id, names) in ItemKind.Sheet)
                    {
                        itemKinds.Add(id, new ItemKindDump
                        {
                            Id = id,
                            Name = names[lang],
                        });
                    }

                    File.WriteAllText(Path.Combine(o.Output, langStr, "itemKinds.json"),
                        JsonSerializer.Serialize(itemKinds));

                    Console.WriteLine("Exporting materia...");
                    var allMateria = new Dictionary<uint, MateriaDump>();
                    foreach (var materia in gameData.GetExcelSheet<Materia>()!)
                    {
                        allMateria.Add(materia.RowId, new MateriaDump
                        {
                            Id = materia.RowId,
                            Slots = materia.Value.ToArray(),
                            Items = materia.Item.Select(item => item.RowId).ToArray(),
                        });
                    }

                    File.WriteAllText(Path.Combine(o.Output, langStr, "materia.json"),
                        JsonSerializer.Serialize(allMateria));

                    Console.WriteLine("Exporting items...");
                    var items = new Dictionary<uint, ItemDump>();
                    foreach (var item in gameData.GetExcelSheet<Item>()!.Where(item => item.ItemSearchCategory.RowId > 0))
                    {
                        items.Add(item.RowId, new ItemDump
                        {
                            Id = item.RowId,
                            Name = SeStringToHtml(item.Name, gameData),
                            Description = SeStringToHtml(item.Description, gameData),
                            IconId = item.Icon,
                            LevelItem = item.LevelItem.RowId,
                            LevelEquip = item.LevelEquip,
                            Rarity = item.Rarity,
                            StackSize = item.StackSize,
                            ItemKind = ItemKind.GetItemKind(item.ItemUICategory.RowId, lang).Id,
                            CanBeHq = item.CanBeHq,
                            ItemSearchCategory = item.ItemSearchCategory.RowId,
                            ItemUICategory = item.ItemUICategory.RowId,
                            ClassJobCategory = item.ClassJobCategory.RowId,
                        });
                    }

                    File.WriteAllText(Path.Combine(o.Output, langStr, "items.json"), JsonSerializer.Serialize(items));
                }
            });
    }

    private static string SeStringToHtml(ReadOnlySeString seString, GameData gameData)
    {
        var sb = new StringBuilder();
        foreach (var payload in seString)
        {
            switch (payload.Type)
            {
                case ReadOnlySePayloadType.Text:
                    sb.Append(Encoding.UTF8.GetString(payload.Body.ToArray()));
                    break;
                case ReadOnlySePayloadType.Macro:
                    switch (payload.MacroCode)
                    {
                        case MacroCode.Color:
                            if (payload.TryGetExpression(out var expr) && expr.TryGetUInt(out var colorId))
                            {
                                if (colorId == 0)
                                {
                                    sb.Append("</span>");
                                }
                                else if (gameData.GetExcelSheet<UIColor>()!.TryGetRow(colorId, out var uiColor))
                                {
                                    sb.Append($"<span style=\"color:#{uiColor.Dark >> 8:X6}\">");
                                }
                            }
                            break;
                        case MacroCode.NewLine:
                            sb.Append("\n");
                            break;
                    }
                    break;
            }
        }
        return sb.ToString();
    }
}

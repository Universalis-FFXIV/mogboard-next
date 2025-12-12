using System.Text;
using System.Text.Json;
using CommandLine;
using Lumina;
using Lumina.Data;
using Lumina.Excel.GeneratedSheets;
using Lumina.Text.Payloads;
using MogboardExporter.Data;

namespace MogboardExporter;

public class Program
{
    public class Options
    {
        [Option('s', "sqpack", Required = true, HelpText = "The path to your sqpack folder.")]
        public string SqPack { get; set; }

        [Option('o', "output", Required = true, HelpText = "The path to the output directory.")]
        public string Output { get; set; }

        [Option('l', "languages", Required = true, HelpText = "The languages to export data for.")]
        public IList<string> Languages { get; set; }
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
                            Name = isc.Name.RawString,
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
                            Name = PayloadsToString(iuc.Name.Payloads, gameData),
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
                            Name = cjc.Name.RawString,
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
                            Slots = materia.Value,
                            Items = materia.Item.Select(item => item.Row).ToArray(),
                        });
                    }

                    File.WriteAllText(Path.Combine(o.Output, langStr, "materia.json"),
                        JsonSerializer.Serialize(allMateria));

                    Console.WriteLine("Building recipe usage index...");
                    var itemsUsedInRecipes = new HashSet<uint>();
                    var recipeType = typeof(Recipe);

                    foreach (var recipe in gameData.GetExcelSheet<Recipe>()!)
                    {
                        // Recipes have up to 10 ingredient slots (Item{Ingredient}[0-9])
                        // We use reflection to access these properties dynamically
                        for (int i = 0; i < 10; i++)
                        {
                            try
                            {
                                var propertyName = $"Item{{Ingredient}}[{i}]";
                                var property = recipeType.GetProperty(propertyName);

                                if (property != null)
                                {
                                    var value = property.GetValue(recipe);
                                    if (value != null)
                                    {
                                        // LazyRow<Item> has a Row property that contains the item ID
                                        var rowProperty = value.GetType().GetProperty("Row");
                                        if (rowProperty != null)
                                        {
                                            var itemId = (uint)rowProperty.GetValue(value)!;
                                            if (itemId > 0)
                                            {
                                                itemsUsedInRecipes.Add(itemId);
                                            }
                                        }
                                    }
                                }
                            }
                            catch
                            {
                                // If property doesn't exist or can't be accessed, continue
                                continue;
                            }
                        }
                    }
                    Console.WriteLine($"Found {itemsUsedInRecipes.Count} unique items used in recipes.");

                    Console.WriteLine("Exporting items...");
                    var items = new Dictionary<uint, ItemDump>();
                    foreach (var item in gameData.GetExcelSheet<Item>()!.Where(item => item.ItemSearchCategory.Row > 0))
                    {
                        items.Add(item.RowId, new ItemDump
                        {
                            Id = item.RowId,
                            Name = PayloadsToString(item.Name.Payloads, gameData),
                            Description = PayloadsToString(item.Description.Payloads, gameData),
                            IconId = item.Icon,
                            LevelItem = item.LevelItem.Row,
                            LevelEquip = item.LevelEquip,
                            Rarity = item.Rarity,
                            StackSize = item.StackSize,
                            ItemKind = ItemKind.GetItemKind(item.ItemUICategory.Row, lang).Id,
                            CanBeHq = item.CanBeHq,
                            ItemSearchCategory = item.ItemSearchCategory.Row,
                            ItemUICategory = item.ItemUICategory.Row,
                            ClassJobCategory = item.ClassJobCategory.Row,
                            IsUsedInRecipe = itemsUsedInRecipes.Contains(item.RowId),
                        });
                    }

                    File.WriteAllText(Path.Combine(o.Output, langStr, "items.json"), JsonSerializer.Serialize(items));
                }
            });
    }

    private static string PayloadsToString(IEnumerable<BasePayload> payloads, GameData gameData)
    {
        return payloads.Aggregate("", (text, payload) =>
        {
            var raw = payload.Data;
            if (raw.Length < 3)
            {
                return text + payload.RawString;
            }

            using var ms = new MemoryStream(raw.ToArray());
            var bytes = new BinaryReader(ms);
            var startByte = bytes.ReadByte();
            if (startByte != 0x02)
            {
                bytes.BaseStream.Seek(-1, SeekOrigin.Current);
            }

            var chunkType = startByte == 0x02 ? bytes.ReadByte() : 0;
            var chunkLength = startByte == 0x02 ? GetInteger(bytes) : (uint)raw.Length;

            string next;
            switch (chunkType)
            {
                case 0x48:
                {
                    var uiColorId = GetInteger(bytes);
                    if (uiColorId == 0)
                    {
                        return text + "</span>";
                    }

                    var uiColor = gameData.GetExcelSheet<UIColor>()!.GetRow(uiColorId)!;
                    var html = $"<span style=\"color:#{uiColor.UIForeground >> 8:X6}\">";
                    next = html;
                }
                    break;
                case 0x49: // 0x49 == UIGlow
                    next = "";
                    break;
                case 0x10:
                    next = "\n";
                    break;
                default:
                    try
                    {
                        next = Encoding.UTF8.GetString(bytes.ReadBytes(Convert.ToInt32(chunkLength)));
                    }
                    catch
                    {
                        Console.WriteLine($"Chunk type: {chunkType}\nChunk length: {chunkLength}");
                        throw;
                    }

                    break;
            }

            ms.Seek(0, SeekOrigin.End);
            return text + next;
        });
    }

    // ripped from Dalamud
    private static uint GetInteger(BinaryReader input)
    {
        uint marker = input.ReadByte();
        if (marker < 0xD0)
            return marker - 1;

        marker = (marker + 1) & 0b1111;

        Span<byte> ret = stackalloc byte[4];
        for (var i = 3; i >= 0; i--)
        {
            ret[i] = (marker & (1 << i)) == 0 ? (byte)0 : input.ReadByte();
        }

        return BitConverter.ToUInt32(ret);
    }
}
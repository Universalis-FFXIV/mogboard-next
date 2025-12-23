using System.Text.Json;
using System.Text.Json.Serialization;
using CommandLine;
using Lumina.Data;
using MogboardExporter.Data;

namespace MogboardExporter;

public class Program
{
    public class Options
    {
        [Option('o', "output", Required = true, HelpText = "The path to the output directory.")]
        public string Output { get; set; }
    }

    public static void Main(string[] args)
    {
        Parser.Default.ParseArguments<Options>(args)
            .WithParsed(o =>
            {
                Console.WriteLine("Beginning export.");
                Console.WriteLine("Exporting language chs...");
                const string langStr = "chs";
                Directory.CreateDirectory(Path.Combine(o.Output, langStr));

                using var http = new HttpClient();

                Console.WriteLine("Exporting item search categories...");
                var itemSearchCategories = new Dictionary<uint, ItemSearchCategoryDump>();
                var iscData = GetData<ItemSearchCategory>(http,
                    "https://xivapi-v2.xivcdn.com/api/sheet/ItemSearchCategory?fields=Name,Category,Order&limit=999999");
                foreach (var isc in iscData)
                {
                    itemSearchCategories.Add(isc.Id, new ItemSearchCategoryDump
                    {
                        Id = isc.Id,
                        Name = isc.Fields!.Name,
                        Category = isc.Fields.Category,
                        Order = isc.Fields.Order,
                    });
                }

                File.WriteAllText(Path.Combine(o.Output, langStr, "isc.json"),
                    JsonSerializer.Serialize(itemSearchCategories));

                Console.WriteLine("Exporting item UI categories...");
                var itemUICategories = new Dictionary<uint, ItemUICategoryDump>();
                var itemUICategoryData = GetData<ItemUICategory>(http,
                    "https://xivapi-v2.xivcdn.com/api/sheet/ItemUICategory?fields=Name&limit=999999");
                
                foreach (var iuc in itemUICategoryData)
                {
                    itemUICategories.Add(iuc.Id, new ItemUICategoryDump
                    {
                        Id = iuc.Id,
                        Name = iuc.Fields!.Name,
                    });
                }

                File.WriteAllText(Path.Combine(o.Output, langStr, "iuc.json"),
                    JsonSerializer.Serialize(itemUICategories));

                Console.WriteLine("Exporting classjob categories...");
                var classJobCategories = new Dictionary<uint, ClassJobCategoryDump>();
                var classJobCategoryData = GetData<ClassJobCategory>(http,
                    "https://xivapi-v2.xivcdn.com/api/sheet/ClassJobCategory?fields=Name&limit=999999");
                foreach (var cjc in classJobCategoryData)
                {
                    classJobCategories.Add(cjc.Id, new ClassJobCategoryDump
                    {
                        Id = cjc.Id,
                        Name = cjc.Fields!.Name,
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
                        Name = names[Language.English],
                    });
                }

                File.WriteAllText(Path.Combine(o.Output, langStr, "itemKinds.json"),
                    JsonSerializer.Serialize(itemKinds));

                Console.WriteLine("Exporting materia...");
                var allMateria = new Dictionary<uint, MateriaDump>();
                var materiaData = GetData<Materia>(http, "https://xivapi-v2.xivcdn.com/api/sheet/Materia?fields=Item,Value&limit=999999");
                foreach (var materia in materiaData)
                {
                    allMateria.Add(materia.Id, new MateriaDump
                    {
                        Id = materia.Id,
                        Slots = materia.Fields!.Value,
                        Items = materia.Fields!.Item!.Select(item => item.Id).ToArray(),
                    });
                }

                File.WriteAllText(Path.Combine(o.Output, langStr, "materia.json"),
                    JsonSerializer.Serialize(allMateria));

                Console.WriteLine("Exporting items...");
                var items = new Dictionary<uint, ItemDump>();
                var itemData = GetData<Item>(http,
                    "https://xivapi-v2.xivcdn.com/api/sheet/Item?fields=Icon,Name,Description,LevelItem,LevelEquip,Rarity,StackSize,ItemKind,CanBeHq,ItemSearchCategory,ItemUICategory,ClassJobCategory&limit=999999");
                foreach (var item in itemData.Where(item => item.Fields!.ItemSearchCategory is { Id: > 0 }))
                {
                    items.Add(item.Id, new ItemDump
                    {
                        Id = item.Id,
                        Name = item.Fields!.Name,
                        Description = item.Fields!.Description,
                        IconId = item.Fields!.Icon?.Id ?? 0,
                        LevelItem = item.Fields!.LevelItem?.Id ?? 0,
                        LevelEquip = item.Fields!.LevelEquip,
                        Rarity = item.Fields!.Rarity,
                        StackSize = item.Fields!.StackSize,
                        ItemKind = ItemKind.GetItemKind(item.Fields!.ItemUICategory?.Id ?? 0, Language.ChineseSimplified).Id,
                        CanBeHq = item.Fields!.CanBeHq,
                        ItemSearchCategory = item.Fields!.ItemSearchCategory?.Id ?? 0,
                        ItemUICategory = item.Fields!.ItemUICategory?.Id ?? 0,
                        ClassJobCategory = item.Fields!.ClassJobCategory?.Id ?? 0,
                    });
                }

                File.WriteAllText(Path.Combine(o.Output, langStr, "items.json"), JsonSerializer.Serialize(items));
            });
    }

    private static XIVAPIRowWrapper<T>[] GetData<T>(HttpClient http, string uri)
    {
        uint? lastRow = 0;
        var data = new List<XIVAPIRowWrapper<T>>();
        do
        {
            var pageData = JsonSerializer.Deserialize<XIVAPIIndex<T>>(http
                .GetStringAsync(uri + $"&after={lastRow}")
                .GetAwaiter()
                .GetResult());
            data.AddRange(pageData!.Rows!);
            lastRow = pageData.Rows?.LastOrDefault()?.Id;
        } while (lastRow != null);
        return data.ToArray();
    }
}

public class XIVAPIIndex<T>
{
    [JsonPropertyName("rows")]
    public XIVAPIRowWrapper<T>[]? Rows { get; init; }
}

public class XIVAPIRowWrapper<T>
{
    [JsonPropertyName("row_id")]
    public uint Id { get; init; }

    [JsonPropertyName("fields")]
    public T? Fields { get; init; }
}

public class ClassJobCategory
{
    public string? Name { get; init; }
}

public class ItemUICategory
{
    public string? Name { get; init; }
}

public class ItemSearchCategory
{
    public string? Name { get; init; }

    public int Category { get; init; }

    public int Order { get; init; }
}

public class Materia
{
    public XIVAPIRowWrapper<object>[]? Item { get; init; }

    public short[]? Value { get; init; }
}

public class Icon
{
    [JsonPropertyName("id")]
    public uint Id { get; init; }
}

public class Item
{
    public string? Name { get; init; }

    public string? Description { get; init; }

    public Icon? Icon { get; init; }

    public XIVAPIRowWrapper<object>? LevelItem { get; init; }

    public uint LevelEquip { get; init; }

    public uint Rarity { get; init; }

    public uint StackSize { get; init; }

    public bool CanBeHq { get; init; }

    public XIVAPIRowWrapper<ItemSearchCategory>? ItemSearchCategory { get; init; }

    public XIVAPIRowWrapper<ItemUICategory>? ItemUICategory { get; init; }

    public XIVAPIRowWrapper<ClassJobCategory>? ClassJobCategory { get; init; }
}
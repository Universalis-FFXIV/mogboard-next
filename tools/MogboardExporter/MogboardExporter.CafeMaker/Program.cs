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
                    "https://cafemaker.wakingsands.com/ItemSearchCategory?columns=ID,Name,Category,Order&limit=999999");
                foreach (var isc in iscData)
                {
                    itemSearchCategories.Add(isc.Id, new ItemSearchCategoryDump
                    {
                        Id = isc.Id,
                        Name = isc.Name,
                        Category = isc.Category,
                        Order = isc.Order,
                    });
                }

                File.WriteAllText(Path.Combine(o.Output, langStr, "isc.json"),
                    JsonSerializer.Serialize(itemSearchCategories));

                Console.WriteLine("Exporting item UI categories...");
                var itemUICategories = new Dictionary<uint, ItemUICategoryDump>();
                var itemUICategoryData = GetData<ItemUICategory>(http,
                    "https://cafemaker.wakingsands.com/ItemUICategory?columns=ID,Name&limit=999999");
                ;
                foreach (var iuc in itemUICategoryData)
                {
                    itemUICategories.Add(iuc.Id, new ItemUICategoryDump
                    {
                        Id = iuc.Id,
                        Name = iuc.Name,
                    });
                }

                File.WriteAllText(Path.Combine(o.Output, langStr, "iuc.json"),
                    JsonSerializer.Serialize(itemUICategories));

                Console.WriteLine("Exporting classjob categories...");
                var classJobCategories = new Dictionary<uint, ClassJobCategoryDump>();
                var classJobCategoryData = GetData<ClassJobCategory>(http,
                    "https://cafemaker.wakingsands.com/ClassJobCategory?columns=ID,Name&limit=999999");
                ;
                foreach (var cjc in classJobCategoryData)
                {
                    classJobCategories.Add(cjc.Id, new ClassJobCategoryDump
                    {
                        Id = cjc.Id,
                        Name = cjc.Name,
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
                        Name = names[Language.ChineseSimplified],
                    });
                }

                File.WriteAllText(Path.Combine(o.Output, langStr, "itemKinds.json"),
                    JsonSerializer.Serialize(itemKinds));

                Console.WriteLine("Exporting materia...");
                var allMateria = new Dictionary<uint, MateriaDump>();
                var materiaData = GetData<Materia>(http, "https://cafemaker.wakingsands.com/Materia?columns=ID,Value*,Item*&limit=999999");
                foreach (var materia in materiaData)
                {
                    allMateria.Add(materia.Id, new MateriaDump
                    {
                        Id = materia.Id,
                        Slots = new[]
                        {
                            materia.Value0, materia.Value1, materia.Value2, materia.Value3, materia.Value4,
                            materia.Value5, materia.Value6, materia.Value7, materia.Value8, materia.Value9,
                        },
                        Items = new []
                        {
                            materia.Item0?.Id ?? 0, materia.Item1?.Id ?? 0, materia.Item2?.Id ?? 0, materia.Item3?.Id ?? 0, materia.Item4?.Id ?? 0,
                            materia.Item5?.Id ?? 0, materia.Item6?.Id ?? 0, materia.Item7?.Id ?? 0, materia.Item8?.Id ?? 0, materia.Item9?.Id ?? 0,
                        },
                    });
                }

                File.WriteAllText(Path.Combine(o.Output, langStr, "materia.json"),
                    JsonSerializer.Serialize(allMateria));

                Console.WriteLine("Exporting items...");
                var items = new Dictionary<uint, ItemDump>();
                var itemData = GetData<Item>(http,
                    "https://cafemaker.wakingsands.com/Item?columns=ID,Name,Description,LevelItem,LevelEquip,Rarity,ItemKind,CanBeHq,ItemSearchCategory,ItemUICategory,ClassJobCategory&limit=999999");
                foreach (var item in itemData.Where(item => item.ItemSearchCategory is { Id: > 0 }))
                {
                    items.Add(item.Id, new ItemDump
                    {
                        Id = item.Id,
                        Name = item.Name,
                        Description = item.Description,
                        IconId = item.IconId,
                        LevelItem = item.LevelItem,
                        LevelEquip = item.LevelEquip,
                        Rarity = item.Rarity,
                        ItemKind = ItemKind.GetItemKind(item.ItemUICategory?.Id ?? 0, Language.ChineseSimplified).Id,
                        CanBeHq = item.CanBeHq == 1,
                        ItemSearchCategory = item.ItemSearchCategory?.Id ?? 0,
                        ItemUICategory = item.ItemUICategory?.Id ?? 0,
                        ClassJobCategory = item.ClassJobCategory?.Id ?? 0,
                    });
                }

                File.WriteAllText(Path.Combine(o.Output, langStr, "items.json"), JsonSerializer.Serialize(items));
            });
    }

    private static T[] GetData<T>(HttpClient http, string uri)
    {
        int? pageNext = 1;
        var data = new List<T>();
        do
        {
            var pageData = JsonSerializer.Deserialize<XIVAPIIndex<T>>(http
                .GetStringAsync(uri + $"&page={pageNext}")
                .GetAwaiter()
                .GetResult());
            data.AddRange(pageData!.Results!);
            pageNext = pageData!.Pagination!.PageNext;
        } while (pageNext != null);
        return data.ToArray();
    }
}

public class XIVAPIIndex<T>
{
    public PaginationData? Pagination { get; init; }
    
    public T[]? Results { get; init; }

    public class PaginationData
    {
        public int? PageNext { get; init; }
    }
}

public class ClassJobCategory
{
    [JsonPropertyName("ID")] public uint Id { get; init; }

    public string? Name { get; init; }
}

public class ItemUICategory
{
    [JsonPropertyName("ID")] public uint Id { get; init; }

    public string? Name { get; init; }
}

public class ItemSearchCategory
{
    [JsonPropertyName("ID")] public uint Id { get; init; }

    public string? Name { get; init; }

    public int Category { get; init; }

    public int Order { get; init; }
}

public class Materia
{
    [JsonPropertyName("ID")] public uint Id { get; init; }
    
    public MateriaItem? Item0 { get; init; }
    
    public MateriaItem? Item1 { get; init; }
    
    public MateriaItem? Item2 { get; init; }
    
    public MateriaItem? Item3 { get; init; }
    
    public MateriaItem? Item4 { get; init; }
    
    public MateriaItem? Item5 { get; init; }
    
    public MateriaItem? Item6 { get; init; }
    
    public MateriaItem? Item7 { get; init; }
    
    public MateriaItem? Item8 { get; init; }
    
    public MateriaItem? Item9 { get; init; }

    public short Value0 { get; init; }

    public short Value1 { get; init; }

    public short Value2 { get; init; }

    public short Value3 { get; init; }

    public short Value4 { get; init; }

    public short Value5 { get; init; }

    public short Value6 { get; init; }

    public short Value7 { get; init; }

    public short Value8 { get; init; }

    public short Value9 { get; init; }

    public class MateriaItem
    {
        [JsonPropertyName("ID")] public uint Id { get; init; }
    }
}

public class Item
{
    [JsonPropertyName("ID")] public uint Id { get; init; }

    public string? Name { get; init; }

    public string? Description { get; init; }

    public uint IconId { get; init; }

    public uint LevelItem { get; init; }

    public uint LevelEquip { get; init; }

    public uint Rarity { get; init; }

    public uint StackSize { get; init; }

    public int CanBeHq { get; init; }

    public ItemSearchCategory? ItemSearchCategory { get; init; }

    public ItemUICategory? ItemUICategory { get; init; }

    public ClassJobCategory? ClassJobCategory { get; init; }
}
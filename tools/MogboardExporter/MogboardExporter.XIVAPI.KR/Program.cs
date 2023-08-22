using System.Net;
using System.Text.Json.Serialization;
using CommandLine;
using Lumina.Data;
using MogboardExporter.Data;
using Newtonsoft.Json;
using XIVAPI.KR.Data.Dto;
using JsonSerializer = System.Text.Json.JsonSerializer;

namespace MogboardExporter;

public class Program
{
    public class Options
    {
        [Option('o', "output", Required = true, HelpText = "The path to the output directory.")]
        public string Output { get; set; }
    }

    private const string URL = "https://localhost:44341"; //TODO: Change this to the real URL

    public static void Main(string[] args)
    {
        Parser.Default.ParseArguments<Options>(args)
              .WithParsed(o =>
              {
                  Console.WriteLine("Beginning export.");
                  Console.WriteLine("Exporting language ko...");
                  const string langStr = "ko";
                  Directory.CreateDirectory(Path.Combine(o.Output, langStr));

                  using var http = new HttpClient();
                  using var wc = new WebClient();

                  Console.WriteLine("Exporting item search categories...");
                  var itemSearchCategories = new Dictionary<uint, ItemSearchCategoryDump>();
                  var json = wc.DownloadString($"{URL}/api/itemsearchcategory");
                  var data = JsonConvert.DeserializeObject<ItemSearchCategoryDto[]>(json);
                  foreach (var isc in data)
                  {
                      itemSearchCategories.Add((uint) isc.Id, new ItemSearchCategoryDump
                      {
                          Id = (uint) isc.Id,
                          Name = isc.Name,
                          Category = isc.Category,
                          Order = isc.Order,
                      });
                  }

                  File.WriteAllText(Path.Combine(o.Output, langStr, "isc.json"),
                      JsonSerializer.Serialize(itemSearchCategories));

                  Console.WriteLine("Exporting item UI categories...");
                  var itemUICategories = new Dictionary<uint, ItemUICategoryDump>();
                  json = wc.DownloadString($"{URL}/api/itemuicategory");
                  var itemUICategoryData = JsonConvert.DeserializeObject<ItemUICategoryDto[]>(json);
                  foreach (var iuc in itemUICategoryData)
                  {
                      itemUICategories.Add((uint) iuc.Id, new ItemUICategoryDump
                      {
                          Id = (uint) iuc.Id,
                          Name = iuc.Name,
                      });
                  }

                  File.WriteAllText(Path.Combine(o.Output, langStr, "iuc.json"),
                      JsonSerializer.Serialize(itemUICategories));

                  Console.WriteLine("Exporting classjob categories...");
                  var classJobCategories = new Dictionary<uint, ClassJobCategoryDump>();
                  json = wc.DownloadString($"{URL}/api/classjobcategory");
                  var classJobCategoryData = JsonConvert.DeserializeObject<ClassJobCategoryDto[]>(json);
                  foreach (var cjc in classJobCategoryData)
                  {
                      classJobCategories.Add((uint) cjc.Id, new ClassJobCategoryDump
                      {
                          Id = (uint) cjc.Id,
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
                          Name = names[Language.Korean],
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
                          Items = new[]
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
                  json = wc.DownloadString($"{URL}/api/item");
                  var itemData = JsonConvert.DeserializeObject<ItemDto[]>(json);
                  foreach (var item in itemData.Where(item => item.ItemSearchCategory > 0))
                  {
                      items.Add((uint) item.Id, new ItemDump
                      {
                          Id = (uint) item.Id,
                          Name = item.Name,
                          Description = item.Description,
                          IconId = (uint) item.IconId,
                          LevelItem = (uint) item.ItemLevel,
                          LevelEquip = (uint) item.EquipLevel,
                          Rarity = (uint) item.Rarity,
                          ItemKind = ItemKind.GetItemKind((uint) item.ItemUICategory, Language.ChineseSimplified).Id,
                          CanBeHq = item.CanBeHq,
                          ItemSearchCategory = (uint) item.ItemSearchCategory,
                          ItemUICategory = (uint) item.ItemUICategory,
                          ClassJobCategory = (uint) item.ClassJobCategory,
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

public class Materia
{
    [JsonPropertyName("ID")]
    public uint Id { get; init; }

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
        [JsonPropertyName("ID")]
        public uint Id { get; init; }
    }
}
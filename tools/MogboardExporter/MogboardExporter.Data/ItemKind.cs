using System.Text.Json.Serialization;
using Lumina.Data;

namespace MogboardExporter.Data;

public class ItemKind
{
    [JsonPropertyName("ID")]
    public uint Id { get; init; }
    
    public string? Name { get; init; }

    public static ItemKind GetItemKind(uint itemUiCategory, Language lang)
    {
        var id = ItemKindItemUICategoryMap.FirstOrDefault(x => x.Value.Contains(itemUiCategory)).Key;
        if (id == 0)
        {
            id = 7;
        }

        var name = Sheet[id][lang];
        return new ItemKind
        {
            Id = id,
            Name = name,
        };
    }
    
    // https://discord.com/channels/474518001173921794/474519195963490305/481092599026024458
    // "ItemKind is custom"
    public static readonly IDictionary<uint, IDictionary<Language, string>> Sheet =
        new Dictionary<uint, IDictionary<Language, string>>
        {
            {
                1, new Dictionary<Language, string>
                {
                    { Language.Japanese, "武器" },
                    { Language.English, "Arms" },
                    { Language.French, "Armes" },
                    { Language.German, "Waffen" },
                    { Language.ChineseSimplified, "武器" },
                    { Language.Korean, "" },
                }
            },
            {
                2, new Dictionary<Language, string>
                {
                    { Language.Japanese, "道具" },
                    { Language.English, "Tools" },
                    { Language.French, "Outils" },
                    { Language.German, "Werkzeuge" },
                    { Language.ChineseSimplified, "道具" },
                    { Language.Korean, "" },
                }
            },
            {
                3, new Dictionary<Language, string>
                {
                    { Language.Japanese, "防具" },
                    { Language.English, "Armor" },
                    { Language.French, "Armures" },
                    { Language.German, "Rüstung" },
                    { Language.ChineseSimplified, "防具" },
                    { Language.Korean, "" },
                }
            },
            {
                4, new Dictionary<Language, string>
                {
                    { Language.Japanese, "アクセサリ" },
                    { Language.English, "Accessories" },
                    { Language.French, "Accessoires" },
                    { Language.German, "Accessoires" },
                    { Language.ChineseSimplified, "饰品" },
                    { Language.Korean, "" },
                }
            },
            {
                5, new Dictionary<Language, string>
                {
                    { Language.Japanese, "薬品・調理品" },
                    { Language.English, "Medicines & Meals" },
                    { Language.French, "Consommables" },
                    { Language.German, "Arznei/Gerichte" },
                    { Language.ChineseSimplified, "药品食品" },
                    { Language.Korean, "" },
                }
            },
            {
                6, new Dictionary<Language, string>
                {
                    { Language.Japanese, "素材" },
                    { Language.English, "Materials" },
                    { Language.French, "Matériaux" },
                    { Language.German, "Materialien" },
                    { Language.ChineseSimplified, "素材" },
                    { Language.Korean, "" },
                }
            },
            {
                7, new Dictionary<Language, string>
                {
                    { Language.Japanese, "その他" },
                    { Language.English, "Other" },
                    { Language.French, "Autres" },
                    { Language.German, "Anderes" },
                    { Language.ChineseSimplified, "其它" },
                    { Language.Korean, "" },
                }
            },
        };

    private static readonly IDictionary<uint, IList<uint>> ItemKindItemUICategoryMap = new Dictionary<uint, IList<uint>>
    {
        // Arms
        {
            1, new List<uint>
            {
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                84, 87, 88, 89, 96, 97, 98
            }
        },
        // Tools
        {
            2, new List<uint>
            {
                12, 13, 14, 15, 16, 17, 18, 19, 20,
                21, 22, 23, 24, 25, 26, 27, 28, 29,
                30, 31, 32, 33, 99
            }
        },
        // Armor
        { 3, new List<uint> { 11, 34, 35, 36, 37, 38, 39 } },
        // Accessories
        { 4, new List<uint> { 40, 41, 42, 43 } },
        // Medicines and meals
        { 5, new List<uint> { 44, 45, 46, 47 } },
        // Materials
        { 6, new List<uint> { 48, 49, 50, 51, 52, 53, 54, 55, 56 } },
    };
}
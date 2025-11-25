using System.Text.Json.Serialization;

namespace MogboardExporter.Data;

public class ClassJobCategoryDump
{
    [JsonPropertyName("id")] public uint Id { get; init; }

    [JsonPropertyName("name")] public string? Name { get; init; }
}

public class ItemUICategoryDump
{
    [JsonPropertyName("id")] public uint Id { get; init; }

    [JsonPropertyName("name")] public string? Name { get; init; }
}

public class ItemSearchCategoryDump
{
    [JsonPropertyName("id")] public uint Id { get; init; }

    [JsonPropertyName("name")] public string? Name { get; init; }
    
    [JsonPropertyName("category")] public int Category { get; init; }
    
    [JsonPropertyName("order")] public int Order { get; init; }
}

public class ItemKindDump
{
    [JsonPropertyName("id")] public uint Id { get; init; }

    [JsonPropertyName("name")] public string? Name { get; init; }
}

public class MateriaDump
{
    [JsonPropertyName("id")] public uint Id { get; init; }
    
    [JsonPropertyName("slots")] public short[]? Slots { get; init; }
    
    [JsonPropertyName("items")] public uint[]? Items { get; init; }
}

public class ItemDump
{
    [JsonPropertyName("id")] public uint Id { get; init; }

    [JsonPropertyName("name")] public string? Name { get; init; }

    [JsonPropertyName("description")] public string? Description { get; init; }

    [JsonPropertyName("iconId")] public uint IconId { get; init; }

    [JsonPropertyName("levelItem")] public uint LevelItem { get; init; }

    [JsonPropertyName("levelEquip")] public uint LevelEquip { get; init; }

    [JsonPropertyName("rarity")] public uint Rarity { get; init; }

    [JsonPropertyName("itemKind")] public uint ItemKind { get; init; }

    [JsonPropertyName("stackSize")] public uint StackSize { get; init; }

    [JsonPropertyName("canBeHq")] public bool CanBeHq { get; init; }

    [JsonPropertyName("itemSearchCategory")]
    public uint ItemSearchCategory { get; init; }

    [JsonPropertyName("itemUiCategory")] public uint ItemUICategory { get; init; }

    [JsonPropertyName("classJobCategory")] public uint ClassJobCategory { get; init; }

    [JsonPropertyName("isUsedInRecipe")] public bool IsUsedInRecipe { get; init; }
}
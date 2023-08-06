using System.Text.Json.Serialization;

namespace XIVAPI.KR.Data.Dto;

public record ItemDto
{
    [JsonPropertyName("ID")]
    public int Id { get; init; }

    [JsonPropertyName("Name")]
    public string Name { get; init; } = string.Empty;

    [JsonPropertyName("Description")]
    public string Description { get; init; } = string.Empty;

    [JsonPropertyName("IconId")]
    public int IconId { get; init; }

    [JsonPropertyName("LevelItem")]
    public int ItemLevel { get; init; }

    [JsonPropertyName("LevelEquip")]
    public int EquipLevel { get; init; }

    [JsonPropertyName("Rarity")]
    public int Rarity { get; init; }

    [JsonPropertyName("ItemKind")]
    public int ItemKind { get; init; }

    [JsonPropertyName("StackSize")]
    public int StackSize { get; init; }

    [JsonPropertyName("CanBeHq")]
    public bool CanBeHq { get; init; }

    [JsonPropertyName("ItemSearchCategory")]
    public int ItemSearchCategory { get; init; }

    [JsonPropertyName("ItemUICategory")]
    public int ItemUICategory { get; init; }

    [JsonPropertyName("ClassJobCategory")]
    public int ClassJobCategory { get; init; }
}
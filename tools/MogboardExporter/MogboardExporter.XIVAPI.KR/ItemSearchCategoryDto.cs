using Newtonsoft.Json;

namespace XIVAPI.KR.Data.Dto;

public sealed record ItemSearchCategoryDto
{
    [JsonProperty("Category")]
    public int Category { get; init; }

    [JsonProperty("ID")]
    public int Id { get; init; }

    [JsonProperty("Name")]
    public string Name { get; init; } = string.Empty;

    [JsonProperty("Order")]
    public int Order { get; init; }
}
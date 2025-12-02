namespace GP9CrimsonBookstore.Models;

public class Book
{
    public string ISBN { get; set; } = string.Empty;
    public string BookTitle { get; set; } = string.Empty;
    public string Course { get; set; } = string.Empty;
    public string Major { get; set; } = string.Empty;
    public string? ImageURL { get; set; }
}


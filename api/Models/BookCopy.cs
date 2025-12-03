namespace GP9CrimsonBookstore.Models;

public class BookCopy
{
    public int CopyID { get; set; }
    public string ISBN { get; set; } = string.Empty;
    public int BookEdition { get; set; }
    public int YearPrinted { get; set; }
    public int Price { get; set; }
    public string Conditions { get; set; } = string.Empty;
    public DateTime DateAdded { get; set; }
    public string CopyStatus { get; set; } = string.Empty;
}


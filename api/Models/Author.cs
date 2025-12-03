namespace GP9CrimsonBookstore.Models;

public class Author
{
    public int AuthorID { get; set; }
    public string ISBN { get; set; } = string.Empty;
    public string AuthorFName { get; set; } = string.Empty;
    public string AuthorLName { get; set; } = string.Empty;
}


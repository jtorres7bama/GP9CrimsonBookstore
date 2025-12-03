namespace GP9CrimsonBookstore.Models;

public class Staff
{
    public int StaffID { get; set; }
    public string StaffName { get; set; } = string.Empty;
    public string SPassword { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
}


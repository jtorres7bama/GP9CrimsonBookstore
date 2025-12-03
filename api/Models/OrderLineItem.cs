namespace GP9CrimsonBookstore.Models;

public class OrderLineItem
{
    public int OrderID { get; set; }
    public int TransactionID { get; set; }
    public int CopyID { get; set; }
    public string OrderStatus { get; set; } = string.Empty;
    public int StaffID { get; set; }
}


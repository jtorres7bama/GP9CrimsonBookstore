using Microsoft.AspNetCore.Mvc;
using GP9CrimsonBookstore.Models;
using GP9CrimsonBookstore.Services;
using MySqlConnector;

namespace GP9CrimsonBookstore.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrderLineItemsController : ControllerBase
{
    private readonly DatabaseService _db;

    public OrderLineItemsController(DatabaseService db)
    {
        _db = db;
    }

    // GET: api/orderlineitems
    [HttpGet]
    public async Task<IActionResult> GetAllOrderLineItems()
    {
        try
        {
            var items = await _db.QueryAsync(
                "SELECT OrderID, TransactionID, CopyID, OrderStatus, StaffID FROM OrderLineItems ORDER BY OrderID",
                reader => new OrderLineItem
                {
                    OrderID = reader.GetInt32(reader.GetOrdinal("OrderID")),
                    TransactionID = reader.GetInt32(reader.GetOrdinal("TransactionID")),
                    CopyID = reader.GetInt32(reader.GetOrdinal("CopyID")),
                    OrderStatus = reader.GetString(reader.GetOrdinal("OrderStatus")),
                    StaffID = reader.GetInt32(reader.GetOrdinal("StaffID"))
                }
            );

            return Ok(items);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving order line items", error = ex.Message });
        }
    }

    // GET: api/orderlineitems/{orderId}
    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetOrderLineItem(int orderId)
    {
        try
        {
            var items = await _db.QueryAsync(
                "SELECT OrderID, TransactionID, CopyID, OrderStatus, StaffID FROM OrderLineItems WHERE OrderID = @OrderID",
                reader => new OrderLineItem
                {
                    OrderID = reader.GetInt32(reader.GetOrdinal("OrderID")),
                    TransactionID = reader.GetInt32(reader.GetOrdinal("TransactionID")),
                    CopyID = reader.GetInt32(reader.GetOrdinal("CopyID")),
                    OrderStatus = reader.GetString(reader.GetOrdinal("OrderStatus")),
                    StaffID = reader.GetInt32(reader.GetOrdinal("StaffID"))
                },
                new { OrderID = orderId }
            );

            if (items.Count == 0)
            {
                return NotFound(new { message = $"Order line item with ID {orderId} not found" });
            }

            return Ok(items[0]);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving order line item", error = ex.Message });
        }
    }

    // GET: api/orderlineitems/transaction/{transactionId}
    [HttpGet("transaction/{transactionId}")]
    public async Task<IActionResult> GetOrderLineItemsByTransaction(int transactionId)
    {
        try
        {
            var items = await _db.QueryAsync(
                "SELECT OrderID, TransactionID, CopyID, OrderStatus, StaffID FROM OrderLineItems WHERE TransactionID = @TransactionID ORDER BY OrderID",
                reader => new OrderLineItem
                {
                    OrderID = reader.GetInt32(reader.GetOrdinal("OrderID")),
                    TransactionID = reader.GetInt32(reader.GetOrdinal("TransactionID")),
                    CopyID = reader.GetInt32(reader.GetOrdinal("CopyID")),
                    OrderStatus = reader.GetString(reader.GetOrdinal("OrderStatus")),
                    StaffID = reader.GetInt32(reader.GetOrdinal("StaffID"))
                },
                new { TransactionID = transactionId }
            );

            return Ok(items);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving order line items for transaction", error = ex.Message });
        }
    }

    // GET: api/orderlineitems/status/{status}
    [HttpGet("status/{status}")]
    public async Task<IActionResult> GetOrderLineItemsByStatus(string status)
    {
        try
        {
            var items = await _db.QueryAsync(
                "SELECT OrderID, TransactionID, CopyID, OrderStatus, StaffID FROM OrderLineItems WHERE OrderStatus = @OrderStatus ORDER BY OrderID",
                reader => new OrderLineItem
                {
                    OrderID = reader.GetInt32(reader.GetOrdinal("OrderID")),
                    TransactionID = reader.GetInt32(reader.GetOrdinal("TransactionID")),
                    CopyID = reader.GetInt32(reader.GetOrdinal("CopyID")),
                    OrderStatus = reader.GetString(reader.GetOrdinal("OrderStatus")),
                    StaffID = reader.GetInt32(reader.GetOrdinal("StaffID"))
                },
                new { OrderStatus = status }
            );

            return Ok(items);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving order line items by status", error = ex.Message });
        }
    }

    // POST: api/orderlineitems
    [HttpPost]
    public async Task<IActionResult> CreateOrderLineItem([FromBody] OrderLineItem item)
    {
        try
        {
            if (item.TransactionID <= 0 || item.CopyID <= 0 || item.StaffID <= 0 || string.IsNullOrWhiteSpace(item.OrderStatus))
            {
                return BadRequest(new { message = "TransactionID, CopyID, StaffID, and OrderStatus are required" });
            }

            var rowsAffected = await _db.ExecuteAsync(
                "INSERT INTO OrderLineItems (TransactionID, CopyID, OrderStatus, StaffID) VALUES (@TransactionID, @CopyID, @OrderStatus, @StaffID)",
                new
                {
                    TransactionID = item.TransactionID,
                    CopyID = item.CopyID,
                    OrderStatus = item.OrderStatus,
                    StaffID = item.StaffID
                }
            );

            if (rowsAffected > 0)
            {
                // Get the newly created item with its ID
                var newItems = await _db.QueryAsync(
                    "SELECT OrderID, TransactionID, CopyID, OrderStatus, StaffID FROM OrderLineItems WHERE TransactionID = @TransactionID AND CopyID = @CopyID ORDER BY OrderID DESC LIMIT 1",
                    reader => new OrderLineItem
                    {
                        OrderID = reader.GetInt32(reader.GetOrdinal("OrderID")),
                        TransactionID = reader.GetInt32(reader.GetOrdinal("TransactionID")),
                        CopyID = reader.GetInt32(reader.GetOrdinal("CopyID")),
                        OrderStatus = reader.GetString(reader.GetOrdinal("OrderStatus")),
                        StaffID = reader.GetInt32(reader.GetOrdinal("StaffID"))
                    },
                    new
                    {
                        TransactionID = item.TransactionID,
                        CopyID = item.CopyID
                    }
                );

                if (newItems.Count > 0)
                {
                    return CreatedAtAction(nameof(GetOrderLineItem), new { orderId = newItems[0].OrderID }, newItems[0]);
                }
            }

            return BadRequest(new { message = "Failed to create order line item" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error creating order line item", error = ex.Message });
        }
    }

    // PUT: api/orderlineitems/{orderId}
    [HttpPut("{orderId}")]
    public async Task<IActionResult> UpdateOrderLineItem(int orderId, [FromBody] OrderLineItem item)
    {
        try
        {
            if (orderId != item.OrderID)
            {
                return BadRequest(new { message = "OrderID in URL does not match OrderID in body" });
            }

            var rowsAffected = await _db.ExecuteAsync(
                "UPDATE OrderLineItems SET TransactionID = @TransactionID, CopyID = @CopyID, OrderStatus = @OrderStatus, StaffID = @StaffID WHERE OrderID = @OrderID",
                new
                {
                    OrderID = orderId,
                    TransactionID = item.TransactionID,
                    CopyID = item.CopyID,
                    OrderStatus = item.OrderStatus,
                    StaffID = item.StaffID
                }
            );

            if (rowsAffected == 0)
            {
                return NotFound(new { message = $"Order line item with ID {orderId} not found" });
            }

            return Ok(new { message = "Order line item updated successfully", item });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating order line item", error = ex.Message });
        }
    }

    // DELETE: api/orderlineitems/{orderId}
    [HttpDelete("{orderId}")]
    public async Task<IActionResult> DeleteOrderLineItem(int orderId)
    {
        try
        {
            var rowsAffected = await _db.ExecuteAsync(
                "DELETE FROM OrderLineItems WHERE OrderID = @OrderID",
                new { OrderID = orderId }
            );

            if (rowsAffected == 0)
            {
                return NotFound(new { message = $"Order line item with ID {orderId} not found" });
            }

            return Ok(new { message = "Order line item deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error deleting order line item", error = ex.Message });
        }
    }
}


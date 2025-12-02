using Microsoft.AspNetCore.Mvc;
using GP9CrimsonBookstore.Models;
using GP9CrimsonBookstore.Services;
using MySqlConnector;

namespace GP9CrimsonBookstore.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly DatabaseService _db;

    public TransactionsController(DatabaseService db)
    {
        _db = db;
    }

    // GET: api/transactions
    [HttpGet]
    public async Task<IActionResult> GetAllTransactions()
    {
        try
        {
            var transactions = await _db.QueryAsync(
                "SELECT TransactionID, DateOfTransaction, CustomerID FROM Transactions ORDER BY DateOfTransaction DESC",
                reader => new Transaction
                {
                    TransactionID = reader.GetInt32(reader.GetOrdinal("TransactionID")),
                    DateOfTransaction = reader.GetDateTime(reader.GetOrdinal("DateOfTransaction")),
                    CustomerID = reader.GetInt32(reader.GetOrdinal("CustomerID"))
                }
            );

            return Ok(transactions);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving transactions", error = ex.Message });
        }
    }

    // GET: api/transactions/{transactionId}
    [HttpGet("{transactionId}")]
    public async Task<IActionResult> GetTransaction(int transactionId)
    {
        try
        {
            var transactions = await _db.QueryAsync(
                "SELECT TransactionID, DateOfTransaction, CustomerID FROM Transactions WHERE TransactionID = @TransactionID",
                reader => new Transaction
                {
                    TransactionID = reader.GetInt32(reader.GetOrdinal("TransactionID")),
                    DateOfTransaction = reader.GetDateTime(reader.GetOrdinal("DateOfTransaction")),
                    CustomerID = reader.GetInt32(reader.GetOrdinal("CustomerID"))
                },
                new { TransactionID = transactionId }
            );

            if (transactions.Count == 0)
            {
                return NotFound(new { message = $"Transaction with ID {transactionId} not found" });
            }

            return Ok(transactions[0]);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving transaction", error = ex.Message });
        }
    }

    // GET: api/transactions/customer/{customerId}
    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetTransactionsByCustomer(int customerId)
    {
        try
        {
            var transactions = await _db.QueryAsync(
                "SELECT TransactionID, DateOfTransaction, CustomerID FROM Transactions WHERE CustomerID = @CustomerID ORDER BY DateOfTransaction DESC",
                reader => new Transaction
                {
                    TransactionID = reader.GetInt32(reader.GetOrdinal("TransactionID")),
                    DateOfTransaction = reader.GetDateTime(reader.GetOrdinal("DateOfTransaction")),
                    CustomerID = reader.GetInt32(reader.GetOrdinal("CustomerID"))
                },
                new { CustomerID = customerId }
            );

            return Ok(transactions);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving transactions for customer", error = ex.Message });
        }
    }

    // POST: api/transactions
    [HttpPost]
    public async Task<IActionResult> CreateTransaction([FromBody] Transaction transaction)
    {
        try
        {
            if (transaction.CustomerID <= 0)
            {
                return BadRequest(new { message = "CustomerID is required and must be greater than 0" });
            }

            var rowsAffected = await _db.ExecuteAsync(
                "INSERT INTO Transactions (DateOfTransaction, CustomerID) VALUES (@DateOfTransaction, @CustomerID)",
                new
                {
                    DateOfTransaction = transaction.DateOfTransaction,
                    CustomerID = transaction.CustomerID
                }
            );

            if (rowsAffected > 0)
            {
                // Get the newly created transaction with its ID
                var newTransactions = await _db.QueryAsync(
                    "SELECT TransactionID, DateOfTransaction, CustomerID FROM Transactions WHERE CustomerID = @CustomerID AND DateOfTransaction = @DateOfTransaction ORDER BY TransactionID DESC LIMIT 1",
                    reader => new Transaction
                    {
                        TransactionID = reader.GetInt32(reader.GetOrdinal("TransactionID")),
                        DateOfTransaction = reader.GetDateTime(reader.GetOrdinal("DateOfTransaction")),
                        CustomerID = reader.GetInt32(reader.GetOrdinal("CustomerID"))
                    },
                    new
                    {
                        CustomerID = transaction.CustomerID,
                        DateOfTransaction = transaction.DateOfTransaction
                    }
                );

                if (newTransactions.Count > 0)
                {
                    return CreatedAtAction(nameof(GetTransaction), new { transactionId = newTransactions[0].TransactionID }, newTransactions[0]);
                }
            }

            return BadRequest(new { message = "Failed to create transaction" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error creating transaction", error = ex.Message });
        }
    }

    // PUT: api/transactions/{transactionId}
    [HttpPut("{transactionId}")]
    public async Task<IActionResult> UpdateTransaction(int transactionId, [FromBody] Transaction transaction)
    {
        try
        {
            if (transactionId != transaction.TransactionID)
            {
                return BadRequest(new { message = "TransactionID in URL does not match TransactionID in body" });
            }

            var rowsAffected = await _db.ExecuteAsync(
                "UPDATE Transactions SET DateOfTransaction = @DateOfTransaction, CustomerID = @CustomerID WHERE TransactionID = @TransactionID",
                new
                {
                    TransactionID = transactionId,
                    DateOfTransaction = transaction.DateOfTransaction,
                    CustomerID = transaction.CustomerID
                }
            );

            if (rowsAffected == 0)
            {
                return NotFound(new { message = $"Transaction with ID {transactionId} not found" });
            }

            return Ok(new { message = "Transaction updated successfully", transaction });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating transaction", error = ex.Message });
        }
    }

    // DELETE: api/transactions/{transactionId}
    [HttpDelete("{transactionId}")]
    public async Task<IActionResult> DeleteTransaction(int transactionId)
    {
        try
        {
            var rowsAffected = await _db.ExecuteAsync(
                "DELETE FROM Transactions WHERE TransactionID = @TransactionID",
                new { TransactionID = transactionId }
            );

            if (rowsAffected == 0)
            {
                return NotFound(new { message = $"Transaction with ID {transactionId} not found" });
            }

            return Ok(new { message = "Transaction deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error deleting transaction", error = ex.Message });
        }
    }
}


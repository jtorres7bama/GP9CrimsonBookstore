using Microsoft.AspNetCore.Mvc;
using GP9CrimsonBookstore.Models;
using GP9CrimsonBookstore.Services;
using MySqlConnector;

namespace GP9CrimsonBookstore.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly DatabaseService _db;

    public CustomersController(DatabaseService db)
    {
        _db = db;
    }

    // GET: api/customers
    [HttpGet]
    public async Task<IActionResult> GetAllCustomers()
    {
        try
        {
            var customers = await _db.QueryAsync(
                "SELECT CustomerID, CustomerName, CPassword, Email, CreatedDate FROM Customers ORDER BY CustomerName",
                reader => new Customer
                {
                    CustomerID = reader.GetInt32(reader.GetOrdinal("CustomerID")),
                    CustomerName = reader.GetString(reader.GetOrdinal("CustomerName")),
                    CPassword = reader.GetString(reader.GetOrdinal("CPassword")),
                    Email = reader.GetString(reader.GetOrdinal("Email")),
                    CreatedDate = reader.GetDateTime(reader.GetOrdinal("CreatedDate"))
                }
            );

            return Ok(customers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving customers", error = ex.Message });
        }
    }

    // GET: api/customers/{customerId}
    [HttpGet("{customerId}")]
    public async Task<IActionResult> GetCustomer(int customerId)
    {
        try
        {
            var customers = await _db.QueryAsync(
                "SELECT CustomerID, CustomerName, CPassword, Email, CreatedDate FROM Customers WHERE CustomerID = @CustomerID",
                reader => new Customer
                {
                    CustomerID = reader.GetInt32(reader.GetOrdinal("CustomerID")),
                    CustomerName = reader.GetString(reader.GetOrdinal("CustomerName")),
                    CPassword = reader.GetString(reader.GetOrdinal("CPassword")),
                    Email = reader.GetString(reader.GetOrdinal("Email")),
                    CreatedDate = reader.GetDateTime(reader.GetOrdinal("CreatedDate"))
                },
                new { CustomerID = customerId }
            );

            if (customers.Count == 0)
            {
                return NotFound(new { message = $"Customer with ID {customerId} not found" });
            }

            return Ok(customers[0]);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving customer", error = ex.Message });
        }
    }

    // POST: api/customers
    [HttpPost]
    public async Task<IActionResult> CreateCustomer([FromBody] Customer customer)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(customer.CustomerName) || string.IsNullOrWhiteSpace(customer.Email) || string.IsNullOrWhiteSpace(customer.CPassword))
            {
                return BadRequest(new { message = "CustomerName, Email, and CPassword are required" });
            }

            var rowsAffected = await _db.ExecuteAsync(
                "INSERT INTO Customers (CustomerName, CPassword, Email, CreatedDate) VALUES (@CustomerName, @CPassword, @Email, @CreatedDate)",
                new
                {
                    CustomerName = customer.CustomerName,
                    CPassword = customer.CPassword,
                    Email = customer.Email,
                    CreatedDate = customer.CreatedDate
                }
            );

            if (rowsAffected > 0)
            {
                // Get the newly created customer with its ID
                var newCustomers = await _db.QueryAsync(
                    "SELECT CustomerID, CustomerName, CPassword, Email, CreatedDate FROM Customers WHERE Email = @Email ORDER BY CustomerID DESC LIMIT 1",
                    reader => new Customer
                    {
                        CustomerID = reader.GetInt32(reader.GetOrdinal("CustomerID")),
                        CustomerName = reader.GetString(reader.GetOrdinal("CustomerName")),
                        CPassword = reader.GetString(reader.GetOrdinal("CPassword")),
                        Email = reader.GetString(reader.GetOrdinal("Email")),
                        CreatedDate = reader.GetDateTime(reader.GetOrdinal("CreatedDate"))
                    },
                    new { Email = customer.Email }
                );

                if (newCustomers.Count > 0)
                {
                    return CreatedAtAction(nameof(GetCustomer), new { customerId = newCustomers[0].CustomerID }, newCustomers[0]);
                }
            }

            return BadRequest(new { message = "Failed to create customer" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error creating customer", error = ex.Message });
        }
    }

    // PUT: api/customers/{customerId}
    [HttpPut("{customerId}")]
    public async Task<IActionResult> UpdateCustomer(int customerId, [FromBody] Customer customer)
    {
        try
        {
            if (customerId != customer.CustomerID)
            {
                return BadRequest(new { message = "CustomerID in URL does not match CustomerID in body" });
            }

            var rowsAffected = await _db.ExecuteAsync(
                "UPDATE Customers SET CustomerName = @CustomerName, CPassword = @CPassword, Email = @Email, CreatedDate = @CreatedDate WHERE CustomerID = @CustomerID",
                new
                {
                    CustomerID = customerId,
                    CustomerName = customer.CustomerName,
                    CPassword = customer.CPassword,
                    Email = customer.Email,
                    CreatedDate = customer.CreatedDate
                }
            );

            if (rowsAffected == 0)
            {
                return NotFound(new { message = $"Customer with ID {customerId} not found" });
            }

            return Ok(new { message = "Customer updated successfully", customer });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating customer", error = ex.Message });
        }
    }

    // DELETE: api/customers/{customerId}
    [HttpDelete("{customerId}")]
    public async Task<IActionResult> DeleteCustomer(int customerId)
    {
        try
        {
            var rowsAffected = await _db.ExecuteAsync(
                "DELETE FROM Customers WHERE CustomerID = @CustomerID",
                new { CustomerID = customerId }
            );

            if (rowsAffected == 0)
            {
                return NotFound(new { message = $"Customer with ID {customerId} not found" });
            }

            return Ok(new { message = "Customer deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error deleting customer", error = ex.Message });
        }
    }
}


using Microsoft.AspNetCore.Mvc;
using GP9CrimsonBookstore.Models;
using GP9CrimsonBookstore.Services;
using MySqlConnector;

namespace GP9CrimsonBookstore.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StaffsController : ControllerBase
{
    private readonly DatabaseService _db;

    public StaffsController(DatabaseService db)
    {
        _db = db;
    }

    // GET: api/staffs
    [HttpGet]
    public async Task<IActionResult> GetAllStaffs()
    {
        try
        {
            var staffs = await _db.QueryAsync(
                "SELECT StaffID, StaffName, SPassword, Email, CreatedDate FROM Staffs ORDER BY StaffName",
                reader => new Staff
                {
                    StaffID = reader.GetInt32(reader.GetOrdinal("StaffID")),
                    StaffName = reader.GetString(reader.GetOrdinal("StaffName")),
                    SPassword = reader.GetString(reader.GetOrdinal("SPassword")),
                    Email = reader.GetString(reader.GetOrdinal("Email")),
                    CreatedDate = reader.GetDateTime(reader.GetOrdinal("CreatedDate"))
                }
            );

            return Ok(staffs);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving staffs", error = ex.Message });
        }
    }

    // GET: api/staffs/{staffId}
    [HttpGet("{staffId}")]
    public async Task<IActionResult> GetStaff(int staffId)
    {
        try
        {
            var staffs = await _db.QueryAsync(
                "SELECT StaffID, StaffName, SPassword, Email, CreatedDate FROM Staffs WHERE StaffID = @StaffID",
                reader => new Staff
                {
                    StaffID = reader.GetInt32(reader.GetOrdinal("StaffID")),
                    StaffName = reader.GetString(reader.GetOrdinal("StaffName")),
                    SPassword = reader.GetString(reader.GetOrdinal("SPassword")),
                    Email = reader.GetString(reader.GetOrdinal("Email")),
                    CreatedDate = reader.GetDateTime(reader.GetOrdinal("CreatedDate"))
                },
                new { StaffID = staffId }
            );

            if (staffs.Count == 0)
            {
                return NotFound(new { message = $"Staff with ID {staffId} not found" });
            }

            return Ok(staffs[0]);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving staff", error = ex.Message });
        }
    }

    // POST: api/staffs
    [HttpPost]
    public async Task<IActionResult> CreateStaff([FromBody] Staff staff)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(staff.StaffName) || string.IsNullOrWhiteSpace(staff.Email) || string.IsNullOrWhiteSpace(staff.SPassword))
            {
                return BadRequest(new { message = "StaffName, Email, and SPassword are required" });
            }

            var rowsAffected = await _db.ExecuteAsync(
                "INSERT INTO Staffs (StaffName, SPassword, Email, CreatedDate) VALUES (@StaffName, @SPassword, @Email, @CreatedDate)",
                new
                {
                    StaffName = staff.StaffName,
                    SPassword = staff.SPassword,
                    Email = staff.Email,
                    CreatedDate = staff.CreatedDate
                }
            );

            if (rowsAffected > 0)
            {
                // Get the newly created staff with its ID
                var newStaffs = await _db.QueryAsync(
                    "SELECT StaffID, StaffName, SPassword, Email, CreatedDate FROM Staffs WHERE Email = @Email ORDER BY StaffID DESC LIMIT 1",
                    reader => new Staff
                    {
                        StaffID = reader.GetInt32(reader.GetOrdinal("StaffID")),
                        StaffName = reader.GetString(reader.GetOrdinal("StaffName")),
                        SPassword = reader.GetString(reader.GetOrdinal("SPassword")),
                        Email = reader.GetString(reader.GetOrdinal("Email")),
                        CreatedDate = reader.GetDateTime(reader.GetOrdinal("CreatedDate"))
                    },
                    new { Email = staff.Email }
                );

                if (newStaffs.Count > 0)
                {
                    return CreatedAtAction(nameof(GetStaff), new { staffId = newStaffs[0].StaffID }, newStaffs[0]);
                }
            }

            return BadRequest(new { message = "Failed to create staff" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error creating staff", error = ex.Message });
        }
    }

    // PUT: api/staffs/{staffId}
    [HttpPut("{staffId}")]
    public async Task<IActionResult> UpdateStaff(int staffId, [FromBody] Staff staff)
    {
        try
        {
            if (staffId != staff.StaffID)
            {
                return BadRequest(new { message = "StaffID in URL does not match StaffID in body" });
            }

            var rowsAffected = await _db.ExecuteAsync(
                "UPDATE Staffs SET StaffName = @StaffName, SPassword = @SPassword, Email = @Email, CreatedDate = @CreatedDate WHERE StaffID = @StaffID",
                new
                {
                    StaffID = staffId,
                    StaffName = staff.StaffName,
                    SPassword = staff.SPassword,
                    Email = staff.Email,
                    CreatedDate = staff.CreatedDate
                }
            );

            if (rowsAffected == 0)
            {
                return NotFound(new { message = $"Staff with ID {staffId} not found" });
            }

            return Ok(new { message = "Staff updated successfully", staff });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating staff", error = ex.Message });
        }
    }

    // DELETE: api/staffs/{staffId}
    [HttpDelete("{staffId}")]
    public async Task<IActionResult> DeleteStaff(int staffId)
    {
        try
        {
            var rowsAffected = await _db.ExecuteAsync(
                "DELETE FROM Staffs WHERE StaffID = @StaffID",
                new { StaffID = staffId }
            );

            if (rowsAffected == 0)
            {
                return NotFound(new { message = $"Staff with ID {staffId} not found" });
            }

            return Ok(new { message = "Staff deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error deleting staff", error = ex.Message });
        }
    }

    // POST: api/staffs/convert-customer/{customerId}
    [HttpPost("convert-customer/{customerId}")]
    public async Task<IActionResult> ConvertCustomerToStaff(int customerId)
    {
        try
        {
            // First, get the customer details
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

            var customer = customers[0];

            // Check if a staff with this email already exists
            var existingStaffs = await _db.QueryAsync(
                "SELECT StaffID FROM Staffs WHERE Email = @Email",
                reader => reader.GetInt32(reader.GetOrdinal("StaffID")),
                new { Email = customer.Email }
            );

            if (existingStaffs.Count > 0)
            {
                return BadRequest(new { message = $"A staff member with email {customer.Email} already exists" });
            }

            // Create new staff record from customer data
            var rowsAffected = await _db.ExecuteAsync(
                "INSERT INTO Staffs (StaffName, SPassword, Email, CreatedDate) VALUES (@StaffName, @SPassword, @Email, @CreatedDate)",
                new
                {
                    StaffName = customer.CustomerName,
                    SPassword = customer.CPassword,
                    Email = customer.Email,
                    CreatedDate = DateTime.Now
                }
            );

            if (rowsAffected > 0)
            {
                // Get the newly created staff
                var newStaffs = await _db.QueryAsync(
                    "SELECT StaffID, StaffName, SPassword, Email, CreatedDate FROM Staffs WHERE Email = @Email ORDER BY StaffID DESC LIMIT 1",
                    reader => new Staff
                    {
                        StaffID = reader.GetInt32(reader.GetOrdinal("StaffID")),
                        StaffName = reader.GetString(reader.GetOrdinal("StaffName")),
                        SPassword = reader.GetString(reader.GetOrdinal("SPassword")),
                        Email = reader.GetString(reader.GetOrdinal("Email")),
                        CreatedDate = reader.GetDateTime(reader.GetOrdinal("CreatedDate"))
                    },
                    new { Email = customer.Email }
                );

                if (newStaffs.Count > 0)
                {
                    return Ok(new { message = "Customer successfully converted to staff", staff = newStaffs[0] });
                }
            }

            return BadRequest(new { message = "Failed to convert customer to staff" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error converting customer to staff", error = ex.Message });
        }
    }

    // POST: api/staffs/deactivate/{staffId}
    [HttpPost("deactivate/{staffId}")]
    public async Task<IActionResult> DeactivateStaff(int staffId)
    {
        try
        {
            // Check if staff exists
            var staffs = await _db.QueryAsync(
                "SELECT StaffID FROM Staffs WHERE StaffID = @StaffID",
                reader => reader.GetInt32(reader.GetOrdinal("StaffID")),
                new { StaffID = staffId }
            );

            if (staffs.Count == 0)
            {
                return NotFound(new { message = $"Staff with ID {staffId} not found" });
            }

            // Check if already inactive
            var inactiveStaffs = await _db.QueryAsync(
                "SELECT StaffID FROM InactiveStaffs WHERE StaffID = @StaffID",
                reader => reader.GetInt32(reader.GetOrdinal("StaffID")),
                new { StaffID = staffId }
            );

            if (inactiveStaffs.Count > 0)
            {
                return BadRequest(new { message = "Staff is already inactive" });
            }

            // Create InactiveStaffs table if it doesn't exist (idempotent)
            try
            {
                await _db.ExecuteAsync(
                    "CREATE TABLE IF NOT EXISTS InactiveStaffs (StaffID INT NOT NULL PRIMARY KEY, CONSTRAINT FK_InactiveStaffs FOREIGN KEY (StaffID) REFERENCES Staffs(StaffID) ON DELETE CASCADE)",
                    null
                );
            }
            catch
            {
                // Table might already exist, ignore error
            }

            // Mark staff as inactive
            var rowsAffected = await _db.ExecuteAsync(
                "INSERT INTO InactiveStaffs (StaffID) VALUES (@StaffID)",
                new { StaffID = staffId }
            );

            if (rowsAffected > 0)
            {
                return Ok(new { message = "Staff successfully deactivated" });
            }

            return BadRequest(new { message = "Failed to deactivate staff" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error deactivating staff", error = ex.Message });
        }
    }

    // POST: api/staffs/activate/{staffId}
    [HttpPost("activate/{staffId}")]
    public async Task<IActionResult> ActivateStaff(int staffId)
    {
        try
        {
            // Check if staff exists
            var staffs = await _db.QueryAsync(
                "SELECT StaffID FROM Staffs WHERE StaffID = @StaffID",
                reader => reader.GetInt32(reader.GetOrdinal("StaffID")),
                new { StaffID = staffId }
            );

            if (staffs.Count == 0)
            {
                return NotFound(new { message = $"Staff with ID {staffId} not found" });
            }

            // Remove from inactive list
            var rowsAffected = await _db.ExecuteAsync(
                "DELETE FROM InactiveStaffs WHERE StaffID = @StaffID",
                new { StaffID = staffId }
            );

            if (rowsAffected > 0)
            {
                return Ok(new { message = "Staff successfully activated" });
            }

            return BadRequest(new { message = "Staff is not currently inactive" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error activating staff", error = ex.Message });
        }
    }

    // GET: api/staffs/inactive
    [HttpGet("inactive")]
    public async Task<IActionResult> GetInactiveStaffs()
    {
        try
        {
            // Create table if it doesn't exist
            try
            {
                await _db.ExecuteAsync(
                    "CREATE TABLE IF NOT EXISTS InactiveStaffs (StaffID INT NOT NULL PRIMARY KEY, CONSTRAINT FK_InactiveStaffs FOREIGN KEY (StaffID) REFERENCES Staffs(StaffID) ON DELETE CASCADE)",
                    null
                );
            }
            catch
            {
                // Table might already exist, ignore error
            }

            // Try to query inactive staffs, return empty list if table doesn't exist
            try
            {
                var inactiveStaffIds = await _db.QueryAsync(
                    "SELECT StaffID FROM InactiveStaffs",
                    reader => reader.GetInt32(reader.GetOrdinal("StaffID"))
                );

                return Ok(inactiveStaffIds);
            }
            catch
            {
                // Table doesn't exist yet, return empty list
                return Ok(new List<int>());
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving inactive staffs", error = ex.Message });
        }
    }
}


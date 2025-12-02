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
}


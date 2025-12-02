using Microsoft.AspNetCore.Mvc;
using GP9CrimsonBookstore.Services;
using MySqlConnector;

namespace GP9CrimsonBookstore.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    private readonly DatabaseService _db;

    public TestController(DatabaseService db)
    {
        _db = db;
    }

    [HttpGet("connection")]
    public async Task<IActionResult> TestConnection()
    {
        try
        {
            // Simple query to test connection
            var bookCount = await _db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM Books");
            
            return Ok(new 
            { 
                success = true, 
                message = "Database connection successful!",
                bookCount = bookCount
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new 
            { 
                success = false, 
                message = "Database connection failed",
                error = ex.Message 
            });
        }
    }

    [HttpGet("books")]
    public async Task<IActionResult> GetBooks()
    {
        try
        {
            var books = await _db.QueryAsync(
                "SELECT ISBN, BookTitle, Course, Major, ImageURL FROM Books LIMIT 5",
                reader => new
                {
                    isbn = reader.GetString(reader.GetOrdinal("ISBN")),
                    bookTitle = reader.GetString(reader.GetOrdinal("BookTitle")),
                    course = reader.GetString(reader.GetOrdinal("Course")),
                    major = reader.GetString(reader.GetOrdinal("Major")),
                    imageUrl = reader.IsDBNull(reader.GetOrdinal("ImageURL")) ? null : reader.GetString(reader.GetOrdinal("ImageURL"))
                }
            );

            return Ok(new { success = true, books });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new 
            { 
                success = false, 
                message = "Failed to fetch books",
                error = ex.Message 
            });
        }
    }
}


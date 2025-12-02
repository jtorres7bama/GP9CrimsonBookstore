using Microsoft.AspNetCore.Mvc;
using GP9CrimsonBookstore.Models;
using GP9CrimsonBookstore.Services;
using MySqlConnector;

namespace GP9CrimsonBookstore.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookCopyController : ControllerBase
{
    private readonly DatabaseService _db;

    public BookCopyController(DatabaseService db)
    {
        _db = db;
    }

    // GET: api/bookcopy
    [HttpGet]
    public async Task<IActionResult> GetAllBookCopies()
    {
        try
        {
            var copies = await _db.QueryAsync(
                "SELECT CopyID, ISBN, BookEdition, YearPrinted, Price, Conditions, DateAdded, CopyStatus FROM BookCopy ORDER BY CopyID",
                reader => new BookCopy
                {
                    CopyID = reader.GetInt32(reader.GetOrdinal("CopyID")),
                    ISBN = reader.GetString(reader.GetOrdinal("ISBN")),
                    BookEdition = reader.GetInt32(reader.GetOrdinal("BookEdition")),
                    YearPrinted = reader.GetInt32(reader.GetOrdinal("YearPrinted")),
                    Price = reader.GetInt32(reader.GetOrdinal("Price")),
                    Conditions = reader.GetString(reader.GetOrdinal("Conditions")),
                    DateAdded = reader.GetDateTime(reader.GetOrdinal("DateAdded")),
                    CopyStatus = reader.GetString(reader.GetOrdinal("CopyStatus"))
                }
            );

            return Ok(copies);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving book copies", error = ex.Message });
        }
    }

    // GET: api/bookcopy/{copyId}
    [HttpGet("{copyId}")]
    public async Task<IActionResult> GetBookCopy(int copyId)
    {
        try
        {
            var copies = await _db.QueryAsync(
                "SELECT CopyID, ISBN, BookEdition, YearPrinted, Price, Conditions, DateAdded, CopyStatus FROM BookCopy WHERE CopyID = @CopyID",
                reader => new BookCopy
                {
                    CopyID = reader.GetInt32(reader.GetOrdinal("CopyID")),
                    ISBN = reader.GetString(reader.GetOrdinal("ISBN")),
                    BookEdition = reader.GetInt32(reader.GetOrdinal("BookEdition")),
                    YearPrinted = reader.GetInt32(reader.GetOrdinal("YearPrinted")),
                    Price = reader.GetInt32(reader.GetOrdinal("Price")),
                    Conditions = reader.GetString(reader.GetOrdinal("Conditions")),
                    DateAdded = reader.GetDateTime(reader.GetOrdinal("DateAdded")),
                    CopyStatus = reader.GetString(reader.GetOrdinal("CopyStatus"))
                },
                new { CopyID = copyId }
            );

            if (copies.Count == 0)
            {
                return NotFound(new { message = $"Book copy with ID {copyId} not found" });
            }

            return Ok(copies[0]);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving book copy", error = ex.Message });
        }
    }

    // GET: api/bookcopy/book/{isbn}
    [HttpGet("book/{isbn}")]
    public async Task<IActionResult> GetBookCopiesByISBN(string isbn)
    {
        try
        {
            var copies = await _db.QueryAsync(
                "SELECT CopyID, ISBN, BookEdition, YearPrinted, Price, Conditions, DateAdded, CopyStatus FROM BookCopy WHERE ISBN = @ISBN ORDER BY CopyID",
                reader => new BookCopy
                {
                    CopyID = reader.GetInt32(reader.GetOrdinal("CopyID")),
                    ISBN = reader.GetString(reader.GetOrdinal("ISBN")),
                    BookEdition = reader.GetInt32(reader.GetOrdinal("BookEdition")),
                    YearPrinted = reader.GetInt32(reader.GetOrdinal("YearPrinted")),
                    Price = reader.GetInt32(reader.GetOrdinal("Price")),
                    Conditions = reader.GetString(reader.GetOrdinal("Conditions")),
                    DateAdded = reader.GetDateTime(reader.GetOrdinal("DateAdded")),
                    CopyStatus = reader.GetString(reader.GetOrdinal("CopyStatus"))
                },
                new { ISBN = isbn }
            );

            return Ok(copies);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving book copies", error = ex.Message });
        }
    }

    // GET: api/bookcopy/status/{status}
    [HttpGet("status/{status}")]
    public async Task<IActionResult> GetBookCopiesByStatus(string status)
    {
        try
        {
            var copies = await _db.QueryAsync(
                "SELECT CopyID, ISBN, BookEdition, YearPrinted, Price, Conditions, DateAdded, CopyStatus FROM BookCopy WHERE CopyStatus = @CopyStatus ORDER BY CopyID",
                reader => new BookCopy
                {
                    CopyID = reader.GetInt32(reader.GetOrdinal("CopyID")),
                    ISBN = reader.GetString(reader.GetOrdinal("ISBN")),
                    BookEdition = reader.GetInt32(reader.GetOrdinal("BookEdition")),
                    YearPrinted = reader.GetInt32(reader.GetOrdinal("YearPrinted")),
                    Price = reader.GetInt32(reader.GetOrdinal("Price")),
                    Conditions = reader.GetString(reader.GetOrdinal("Conditions")),
                    DateAdded = reader.GetDateTime(reader.GetOrdinal("DateAdded")),
                    CopyStatus = reader.GetString(reader.GetOrdinal("CopyStatus"))
                },
                new { CopyStatus = status }
            );

            return Ok(copies);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving book copies by status", error = ex.Message });
        }
    }

    // POST: api/bookcopy
    [HttpPost]
    public async Task<IActionResult> CreateBookCopy([FromBody] BookCopy bookCopy)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(bookCopy.ISBN) || string.IsNullOrWhiteSpace(bookCopy.Conditions) || string.IsNullOrWhiteSpace(bookCopy.CopyStatus))
            {
                return BadRequest(new { message = "ISBN, Conditions, and CopyStatus are required" });
            }

            var rowsAffected = await _db.ExecuteAsync(
                "INSERT INTO BookCopy (ISBN, BookEdition, YearPrinted, Price, Conditions, DateAdded, CopyStatus) VALUES (@ISBN, @BookEdition, @YearPrinted, @Price, @Conditions, @DateAdded, @CopyStatus)",
                new
                {
                    ISBN = bookCopy.ISBN,
                    BookEdition = bookCopy.BookEdition,
                    YearPrinted = bookCopy.YearPrinted,
                    Price = bookCopy.Price,
                    Conditions = bookCopy.Conditions,
                    DateAdded = bookCopy.DateAdded,
                    CopyStatus = bookCopy.CopyStatus
                }
            );

            if (rowsAffected > 0)
            {
                // Get the newly created copy with its ID
                var newCopies = await _db.QueryAsync(
                    "SELECT CopyID, ISBN, BookEdition, YearPrinted, Price, Conditions, DateAdded, CopyStatus FROM BookCopy WHERE ISBN = @ISBN AND BookEdition = @BookEdition AND YearPrinted = @YearPrinted AND Price = @Price ORDER BY CopyID DESC LIMIT 1",
                    reader => new BookCopy
                    {
                        CopyID = reader.GetInt32(reader.GetOrdinal("CopyID")),
                        ISBN = reader.GetString(reader.GetOrdinal("ISBN")),
                        BookEdition = reader.GetInt32(reader.GetOrdinal("BookEdition")),
                        YearPrinted = reader.GetInt32(reader.GetOrdinal("YearPrinted")),
                        Price = reader.GetInt32(reader.GetOrdinal("Price")),
                        Conditions = reader.GetString(reader.GetOrdinal("Conditions")),
                        DateAdded = reader.GetDateTime(reader.GetOrdinal("DateAdded")),
                        CopyStatus = reader.GetString(reader.GetOrdinal("CopyStatus"))
                    },
                    new
                    {
                        ISBN = bookCopy.ISBN,
                        BookEdition = bookCopy.BookEdition,
                        YearPrinted = bookCopy.YearPrinted,
                        Price = bookCopy.Price
                    }
                );

                if (newCopies.Count > 0)
                {
                    return CreatedAtAction(nameof(GetBookCopy), new { copyId = newCopies[0].CopyID }, newCopies[0]);
                }
            }

            return BadRequest(new { message = "Failed to create book copy" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error creating book copy", error = ex.Message });
        }
    }

    // PUT: api/bookcopy/{copyId}
    [HttpPut("{copyId}")]
    public async Task<IActionResult> UpdateBookCopy(int copyId, [FromBody] BookCopy bookCopy)
    {
        try
        {
            if (copyId != bookCopy.CopyID)
            {
                return BadRequest(new { message = "CopyID in URL does not match CopyID in body" });
            }

            var rowsAffected = await _db.ExecuteAsync(
                "UPDATE BookCopy SET ISBN = @ISBN, BookEdition = @BookEdition, YearPrinted = @YearPrinted, Price = @Price, Conditions = @Conditions, DateAdded = @DateAdded, CopyStatus = @CopyStatus WHERE CopyID = @CopyID",
                new
                {
                    CopyID = copyId,
                    ISBN = bookCopy.ISBN,
                    BookEdition = bookCopy.BookEdition,
                    YearPrinted = bookCopy.YearPrinted,
                    Price = bookCopy.Price,
                    Conditions = bookCopy.Conditions,
                    DateAdded = bookCopy.DateAdded,
                    CopyStatus = bookCopy.CopyStatus
                }
            );

            if (rowsAffected == 0)
            {
                return NotFound(new { message = $"Book copy with ID {copyId} not found" });
            }

            return Ok(new { message = "Book copy updated successfully", bookCopy });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating book copy", error = ex.Message });
        }
    }

    // DELETE: api/bookcopy/{copyId}
    [HttpDelete("{copyId}")]
    public async Task<IActionResult> DeleteBookCopy(int copyId)
    {
        try
        {
            var rowsAffected = await _db.ExecuteAsync(
                "DELETE FROM BookCopy WHERE CopyID = @CopyID",
                new { CopyID = copyId }
            );

            if (rowsAffected == 0)
            {
                return NotFound(new { message = $"Book copy with ID {copyId} not found" });
            }

            return Ok(new { message = "Book copy deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error deleting book copy", error = ex.Message });
        }
    }
}


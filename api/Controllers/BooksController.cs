using Microsoft.AspNetCore.Mvc;
using GP9CrimsonBookstore.Models;
using GP9CrimsonBookstore.Services;
using MySqlConnector;

namespace GP9CrimsonBookstore.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly DatabaseService _db;

    public BooksController(DatabaseService db)
    {
        _db = db;
    }

    // GET: api/books
    [HttpGet]
    public async Task<IActionResult> GetAllBooks()
    {
        try
        {
            var books = await _db.QueryAsync(
                "SELECT ISBN, BookTitle, Course, Major, NumberOfCopies, ImageURL FROM Books ORDER BY BookTitle",
                reader => new Book
                {
                    ISBN = reader.GetString(reader.GetOrdinal("ISBN")),
                    BookTitle = reader.GetString(reader.GetOrdinal("BookTitle")),
                    Course = reader.GetString(reader.GetOrdinal("Course")),
                    Major = reader.GetString(reader.GetOrdinal("Major")),
                    NumberOfCopies = reader.GetInt32(reader.GetOrdinal("NumberOfCopies")),
                    ImageURL = reader.IsDBNull(reader.GetOrdinal("ImageURL")) ? null : reader.GetString(reader.GetOrdinal("ImageURL"))
                }
            );

            return Ok(books);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving books", error = ex.Message });
        }
    }

    // GET: api/books/{isbn}
    [HttpGet("{isbn}")]
    public async Task<IActionResult> GetBook(string isbn)
    {
        try
        {
            var books = await _db.QueryAsync(
                "SELECT ISBN, BookTitle, Course, Major, NumberOfCopies, ImageURL FROM Books WHERE ISBN = @ISBN",
                reader => new Book
                {
                    ISBN = reader.GetString(reader.GetOrdinal("ISBN")),
                    BookTitle = reader.GetString(reader.GetOrdinal("BookTitle")),
                    Course = reader.GetString(reader.GetOrdinal("Course")),
                    Major = reader.GetString(reader.GetOrdinal("Major")),
                    NumberOfCopies = reader.GetInt32(reader.GetOrdinal("NumberOfCopies")),
                    ImageURL = reader.IsDBNull(reader.GetOrdinal("ImageURL")) ? null : reader.GetString(reader.GetOrdinal("ImageURL"))
                },
                new { ISBN = isbn }
            );

            if (books.Count == 0)
            {
                return NotFound(new { message = $"Book with ISBN {isbn} not found" });
            }

            return Ok(books[0]);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving book", error = ex.Message });
        }
    }

    // POST: api/books
    [HttpPost]
    public async Task<IActionResult> CreateBook([FromBody] Book book)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(book.ISBN) || string.IsNullOrWhiteSpace(book.BookTitle))
            {
                return BadRequest(new { message = "ISBN and BookTitle are required" });
            }

            var rowsAffected = await _db.ExecuteAsync(
                "INSERT INTO Books (ISBN, BookTitle, Course, Major, NumberOfCopies, ImageURL) VALUES (@ISBN, @BookTitle, @Course, @Major, @NumberOfCopies, @ImageURL)",
                new
                {
                    ISBN = book.ISBN,
                    BookTitle = book.BookTitle,
                    Course = book.Course,
                    Major = book.Major,
                    NumberOfCopies = book.NumberOfCopies,
                    ImageURL = book.ImageURL
                }
            );

            if (rowsAffected > 0)
            {
                return CreatedAtAction(nameof(GetBook), new { isbn = book.ISBN }, book);
            }

            return BadRequest(new { message = "Failed to create book" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error creating book", error = ex.Message });
        }
    }

    // PUT: api/books/{isbn}
    [HttpPut("{isbn}")]
    public async Task<IActionResult> UpdateBook(string isbn, [FromBody] Book book)
    {
        try
        {
            if (isbn != book.ISBN)
            {
                return BadRequest(new { message = "ISBN in URL does not match ISBN in body" });
            }

            var rowsAffected = await _db.ExecuteAsync(
                "UPDATE Books SET BookTitle = @BookTitle, Course = @Course, Major = @Major, NumberOfCopies = @NumberOfCopies, ImageURL = @ImageURL WHERE ISBN = @ISBN",
                new
                {
                    ISBN = isbn,
                    BookTitle = book.BookTitle,
                    Course = book.Course,
                    Major = book.Major,
                    NumberOfCopies = book.NumberOfCopies,
                    ImageURL = book.ImageURL
                }
            );

            if (rowsAffected == 0)
            {
                return NotFound(new { message = $"Book with ISBN {isbn} not found" });
            }

            return Ok(new { message = "Book updated successfully", book });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating book", error = ex.Message });
        }
    }

    // DELETE: api/books/{isbn}
    [HttpDelete("{isbn}")]
    public async Task<IActionResult> DeleteBook(string isbn)
    {
        try
        {
            var rowsAffected = await _db.ExecuteAsync(
                "DELETE FROM Books WHERE ISBN = @ISBN",
                new { ISBN = isbn }
            );

            if (rowsAffected == 0)
            {
                return NotFound(new { message = $"Book with ISBN {isbn} not found" });
            }

            return Ok(new { message = "Book deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error deleting book", error = ex.Message });
        }
    }
}


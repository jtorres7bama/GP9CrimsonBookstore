using Microsoft.AspNetCore.Mvc;
using GP9CrimsonBookstore.Models;
using GP9CrimsonBookstore.Services;
using MySqlConnector;

namespace GP9CrimsonBookstore.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthorsController : ControllerBase
{
    private readonly DatabaseService _db;

    public AuthorsController(DatabaseService db)
    {
        _db = db;
    }

    // GET: api/authors
    [HttpGet]
    public async Task<IActionResult> GetAllAuthors()
    {
        try
        {
            var authors = await _db.QueryAsync(
                "SELECT AuthorID, ISBN, AuthorFName, AuthorLName FROM Authors ORDER BY AuthorLName, AuthorFName",
                reader => new Author
                {
                    AuthorID = reader.GetInt32(reader.GetOrdinal("AuthorID")),
                    ISBN = reader.GetString(reader.GetOrdinal("ISBN")),
                    AuthorFName = reader.GetString(reader.GetOrdinal("AuthorFName")),
                    AuthorLName = reader.GetString(reader.GetOrdinal("AuthorLName"))
                }
            );

            return Ok(authors);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving authors", error = ex.Message });
        }
    }

    // GET: api/authors/{authorId}
    [HttpGet("{authorId}")]
    public async Task<IActionResult> GetAuthor(int authorId)
    {
        try
        {
            var authors = await _db.QueryAsync(
                "SELECT AuthorID, ISBN, AuthorFName, AuthorLName FROM Authors WHERE AuthorID = @AuthorID",
                reader => new Author
                {
                    AuthorID = reader.GetInt32(reader.GetOrdinal("AuthorID")),
                    ISBN = reader.GetString(reader.GetOrdinal("ISBN")),
                    AuthorFName = reader.GetString(reader.GetOrdinal("AuthorFName")),
                    AuthorLName = reader.GetString(reader.GetOrdinal("AuthorLName"))
                },
                new { AuthorID = authorId }
            );

            if (authors.Count == 0)
            {
                return NotFound(new { message = $"Author with ID {authorId} not found" });
            }

            return Ok(authors[0]);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving author", error = ex.Message });
        }
    }

    // GET: api/authors/book/{isbn}
    [HttpGet("book/{isbn}")]
    public async Task<IActionResult> GetAuthorsByBook(string isbn)
    {
        try
        {
            var authors = await _db.QueryAsync(
                "SELECT AuthorID, ISBN, AuthorFName, AuthorLName FROM Authors WHERE ISBN = @ISBN ORDER BY AuthorLName, AuthorFName",
                reader => new Author
                {
                    AuthorID = reader.GetInt32(reader.GetOrdinal("AuthorID")),
                    ISBN = reader.GetString(reader.GetOrdinal("ISBN")),
                    AuthorFName = reader.GetString(reader.GetOrdinal("AuthorFName")),
                    AuthorLName = reader.GetString(reader.GetOrdinal("AuthorLName"))
                },
                new { ISBN = isbn }
            );

            return Ok(authors);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving authors for book", error = ex.Message });
        }
    }

    // POST: api/authors
    [HttpPost]
    public async Task<IActionResult> CreateAuthor([FromBody] Author author)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(author.ISBN) || string.IsNullOrWhiteSpace(author.AuthorFName) || string.IsNullOrWhiteSpace(author.AuthorLName))
            {
                return BadRequest(new { message = "ISBN, AuthorFName, and AuthorLName are required" });
            }

            var rowsAffected = await _db.ExecuteAsync(
                "INSERT INTO Authors (ISBN, AuthorFName, AuthorLName) VALUES (@ISBN, @AuthorFName, @AuthorLName)",
                new
                {
                    ISBN = author.ISBN,
                    AuthorFName = author.AuthorFName,
                    AuthorLName = author.AuthorLName
                }
            );

            if (rowsAffected > 0)
            {
                // Get the newly created author with its ID
                var newAuthors = await _db.QueryAsync(
                    "SELECT AuthorID, ISBN, AuthorFName, AuthorLName FROM Authors WHERE ISBN = @ISBN AND AuthorFName = @AuthorFName AND AuthorLName = @AuthorLName ORDER BY AuthorID DESC LIMIT 1",
                    reader => new Author
                    {
                        AuthorID = reader.GetInt32(reader.GetOrdinal("AuthorID")),
                        ISBN = reader.GetString(reader.GetOrdinal("ISBN")),
                        AuthorFName = reader.GetString(reader.GetOrdinal("AuthorFName")),
                        AuthorLName = reader.GetString(reader.GetOrdinal("AuthorLName"))
                    },
                    new { ISBN = author.ISBN, AuthorFName = author.AuthorFName, AuthorLName = author.AuthorLName }
                );

                if (newAuthors.Count > 0)
                {
                    return CreatedAtAction(nameof(GetAuthor), new { authorId = newAuthors[0].AuthorID }, newAuthors[0]);
                }
            }

            return BadRequest(new { message = "Failed to create author" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error creating author", error = ex.Message });
        }
    }

    // PUT: api/authors/{authorId}
    [HttpPut("{authorId}")]
    public async Task<IActionResult> UpdateAuthor(int authorId, [FromBody] Author author)
    {
        try
        {
            if (authorId != author.AuthorID)
            {
                return BadRequest(new { message = "AuthorID in URL does not match AuthorID in body" });
            }

            var rowsAffected = await _db.ExecuteAsync(
                "UPDATE Authors SET ISBN = @ISBN, AuthorFName = @AuthorFName, AuthorLName = @AuthorLName WHERE AuthorID = @AuthorID",
                new
                {
                    AuthorID = authorId,
                    ISBN = author.ISBN,
                    AuthorFName = author.AuthorFName,
                    AuthorLName = author.AuthorLName
                }
            );

            if (rowsAffected == 0)
            {
                return NotFound(new { message = $"Author with ID {authorId} not found" });
            }

            return Ok(new { message = "Author updated successfully", author });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating author", error = ex.Message });
        }
    }

    // DELETE: api/authors/{authorId}
    [HttpDelete("{authorId}")]
    public async Task<IActionResult> DeleteAuthor(int authorId)
    {
        try
        {
            var rowsAffected = await _db.ExecuteAsync(
                "DELETE FROM Authors WHERE AuthorID = @AuthorID",
                new { AuthorID = authorId }
            );

            if (rowsAffected == 0)
            {
                return NotFound(new { message = $"Author with ID {authorId} not found" });
            }

            return Ok(new { message = "Author deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error deleting author", error = ex.Message });
        }
    }
}


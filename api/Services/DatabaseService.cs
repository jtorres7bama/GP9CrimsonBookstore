using MySqlConnector;

namespace GP9CrimsonBookstore.Services;

public class DatabaseService
{
    private readonly string _connectionString;

    public DatabaseService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
    }

    // Execute a query that returns data (SELECT)
    public async Task<List<T>> QueryAsync<T>(string sql, Func<MySqlDataReader, T> map, object? parameters = null)
    {
        var results = new List<T>();
        
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();
        
        using var command = new MySqlCommand(sql, connection);
        
        if (parameters != null)
        {
            foreach (var prop in parameters.GetType().GetProperties())
            {
                command.Parameters.AddWithValue($"@{prop.Name}", prop.GetValue(parameters));
            }
        }
        
        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            results.Add(map(reader));
        }
        
        return results;
    }

    // Execute a query that doesn't return data (INSERT, UPDATE, DELETE)
    public async Task<int> ExecuteAsync(string sql, object? parameters = null)
    {
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();
        
        using var command = new MySqlCommand(sql, connection);
        
        if (parameters != null)
        {
            foreach (var prop in parameters.GetType().GetProperties())
            {
                command.Parameters.AddWithValue($"@{prop.Name}", prop.GetValue(parameters));
            }
        }
        
        return await command.ExecuteNonQueryAsync();
    }

    // Execute a query that returns a single value (e.g., COUNT, MAX, etc.)
    public async Task<T?> ExecuteScalarAsync<T>(string sql, object? parameters = null)
    {
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();
        
        using var command = new MySqlCommand(sql, connection);
        
        if (parameters != null)
        {
            foreach (var prop in parameters.GetType().GetProperties())
            {
                command.Parameters.AddWithValue($"@{prop.Name}", prop.GetValue(parameters));
            }
        }
        
        var result = await command.ExecuteScalarAsync();
        if (result == null || result == DBNull.Value)
        {
            return default(T);
        }
        
        // Handle numeric conversions properly
        if (result is T directValue)
        {
            return directValue;
        }
        
        // Convert numeric types
        if (typeof(T) == typeof(int) && result is long longValue)
        {
            return (T)(object)(int)longValue;
        }
        
        return (T)Convert.ChangeType(result, typeof(T));
    }
}


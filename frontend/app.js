// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const app = document.getElementById('app');

// Current user session
let currentUser = null;

// Initialize app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
  // DOM is already loaded
  setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
  const registerBtn = document.getElementById('registerBtn');
  const loginBtn = document.getElementById('loginBtn');

  if (registerBtn) {
    registerBtn.addEventListener('click', showRegisterForm);
    console.log('Register button listener attached');
  } else {
    console.error('Register button not found');
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', showLoginForm);
    console.log('Login button listener attached');
  } else {
    console.error('Login button not found');
  }
}

// Show registration form
function showRegisterForm() {
  // Remove header if it exists
  removeHeader();
  
  const mainContent = app.querySelector('main');
  mainContent.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow">
          <div class="card-body p-4">
            <h2 class="card-title text-center mb-4">Register</h2>
            <form id="registerForm">
              <div class="mb-3">
                <label for="customerName" class="form-label">Full Name</label>
                <input type="text" class="form-control" id="customerName" required>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" required>
              </div>
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-danger btn-lg">Confirm Registration</button>
                <button type="button" class="btn btn-outline-secondary" onclick="showLandingPage()">Back</button>
              </div>
            </form>
            <div id="registerMessage" class="mt-3"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add form submit handler
  const form = document.getElementById('registerForm');
  form.addEventListener('submit', handleRegister);
}

// Show login form
function showLoginForm() {
  // Remove header if it exists
  removeHeader();
  
  const mainContent = app.querySelector('main');
  mainContent.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow">
          <div class="card-body p-4">
            <h2 class="card-title text-center mb-4">Login</h2>
            <form id="loginForm">
              <div class="mb-3">
                <label for="loginEmail" class="form-label">Email</label>
                <input type="email" class="form-control" id="loginEmail" required>
              </div>
              <div class="mb-3">
                <label for="loginPassword" class="form-label">Password</label>
                <input type="password" class="form-control" id="loginPassword" required>
              </div>
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-danger btn-lg">Login</button>
                <button type="button" class="btn btn-outline-secondary" onclick="showLandingPage()">Back</button>
              </div>
            </form>
            <div id="loginMessage" class="mt-3"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add form submit handler
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', handleLogin);
}

// Show landing page (global function for onclick handlers)
window.showLandingPage = function() {
  // Clear current user session
  currentUser = null;
  sessionStorage.removeItem('currentUser');
  
  // Remove header
  removeHeader();
  
  const mainContent = app.querySelector('main');
  mainContent.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow">
          <div class="card-body text-center p-5">
            <h2 class="card-title mb-4">Welcome</h2>
            <p class="card-text text-muted mb-4">Please login or register to continue</p>
            <div class="d-grid gap-3">
              <button type="button" class="btn btn-danger btn-lg" id="loginBtn">Login</button>
              <button type="button" class="btn btn-outline-danger btn-lg" id="registerBtn">Register</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Re-setup event listeners
  setupEventListeners();
};

// Handle registration form submission
async function handleRegister(e) {
  e.preventDefault();

  const messageDiv = document.getElementById('registerMessage');
  messageDiv.innerHTML = '';

  // Get form values
  const customerName = document.getElementById('customerName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  // Validate inputs
  if (!customerName || !email || !password) {
    showMessage('Please fill in all fields', 'danger');
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage('Please enter a valid email address', 'danger');
    return;
  }

  // Create customer object
  const customer = {
    customerID: 0,
    customerName: customerName,
    email: email,
    cPassword: password,
    createdDate: new Date().toISOString()
  };

  try {
    // Show loading state
    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';

    // Make API call
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customer)
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      throw new Error(`Server returned invalid response. Status: ${response.status}`);
    }

    if (response.ok) {
      showMessage(`Registration successful! Welcome, ${data.customerName}. Your Customer ID is: ${data.customerID}`, 'success');
      // Clear form
      document.getElementById('registerForm').reset();
    } else {
      showMessage(data.message || 'Registration failed. Please try again.', 'danger');
    }
  } catch (error) {
    console.error('Registration error:', error);
    const errorMsg = error.message || 'Error connecting to server. Please make sure the API is running on http://localhost:5000';
    showMessage(errorMsg, 'danger');
  } finally {
    // Restore button state
    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Registration';
    }
  }
}

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();

  const messageDiv = document.getElementById('loginMessage');
  messageDiv.innerHTML = '';

  // Get form values
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  // Validate inputs
  if (!email || !password) {
    showLoginMessage('Please fill in all fields', 'danger');
    return;
  }

  try {
    // Show loading state
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    // Get all customers to find matching email and password
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
    } catch (fetchError) {
      // Network error or CORS issue
      if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
        throw new Error('Failed to connect to server. Please make sure the API is running on http://localhost:5000 and CORS is configured correctly.');
      }
      throw fetchError;
    }

    let customers;
    try {
      customers = await response.json();
    } catch (jsonError) {
      throw new Error(`Server returned invalid response. Status: ${response.status}. Make sure the API is running on http://localhost:5000`);
    }

    if (response.ok) {
      // Find customer with matching email and password
      const customer = customers.find(c => c.email === email && c.cPassword === password);

      if (customer) {
        // Login successful
        currentUser = customer;
        sessionStorage.setItem('currentUser', JSON.stringify(customer));
        showHomePageInternal();
      } else {
        showLoginMessage('Invalid email or password', 'danger');
      }
    } else {
      showLoginMessage(`Server error: ${response.status}. ${customers?.message || ''}`, 'danger');
    }
  } catch (error) {
    console.error('Login error:', error);
    let errorMsg = 'Error connecting to server. ';
    if (error.message) {
      errorMsg = error.message;
    } else if (error.name === 'TypeError') {
      errorMsg = 'Failed to connect to server. Please make sure the API is running on http://localhost:5000';
    } else {
      errorMsg += 'Please make sure the API is running on http://localhost:5000';
    }
    showLoginMessage(errorMsg, 'danger');
  } finally {
    // Restore button state
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  }
}

// Store books data
let allBooksData = [];
let filteredBooksData = [];

// Show home page (internal function)
async function showHomePageInternal() {
  // Add header
  addHeader();
  
  const mainContent = app.querySelector('main');
  mainContent.innerHTML = `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <h2 class="mb-4">Welcome to Crimson Bookstore</h2>
          <p class="lead">Browse our collection of textbooks and course materials.</p>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title mb-3">Search & Filter</h5>
              <div class="row g-3">
                <div class="col-md-3">
                  <label for="searchTitle" class="form-label">Title</label>
                  <input type="text" class="form-control" id="searchTitle" placeholder="Search by title...">
                </div>
                <div class="col-md-3">
                  <label for="searchAuthor" class="form-label">Author</label>
                  <input type="text" class="form-control" id="searchAuthor" placeholder="Search by author...">
                </div>
                <div class="col-md-2">
                  <label for="searchISBN" class="form-label">ISBN</label>
                  <input type="text" class="form-control" id="searchISBN" placeholder="Search by ISBN...">
                </div>
                <div class="col-md-2">
                  <label for="filterMajor" class="form-label">Major</label>
                  <input type="text" class="form-control" id="filterMajor" placeholder="Filter by major...">
                </div>
                <div class="col-md-2">
                  <label for="filterCourse" class="form-label">Course</label>
                  <input type="text" class="form-control" id="filterCourse" placeholder="Filter by course...">
                </div>
              </div>
              <div class="row mt-3">
                <div class="col-md-3">
                  <label for="sortBy" class="form-label">Sort By</label>
                  <select class="form-select" id="sortBy">
                    <option value="title">Title (A-Z)</option>
                    <option value="price-asc">Price (Low to High)</option>
                    <option value="price-desc">Price (High to Low)</option>
                    <option value="date-asc">Date Posted (Oldest First)</option>
                    <option value="date-desc">Date Posted (Newest First)</option>
                  </select>
                </div>
                <div class="col-md-3 d-flex align-items-end">
                  <button type="button" class="btn btn-outline-secondary" id="clearFiltersBtn">Clear Filters</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Books Display Section -->
      <div class="row">
        <div class="col-12">
          <div id="booksContainer" class="row">
            <div class="col-12 text-center">
              <div class="spinner-border text-danger" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Loading books...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Setup event listeners for search/filter
  setupSearchFilters();
  
  // Load books
  await loadBooks();
}

// Setup search and filter event listeners
function setupSearchFilters() {
  const searchInputs = ['searchTitle', 'searchAuthor', 'searchISBN', 'filterMajor', 'filterCourse'];
  searchInputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', filterAndDisplayBooks);
    }
  });

  const sortSelect = document.getElementById('sortBy');
  if (sortSelect) {
    sortSelect.addEventListener('change', filterAndDisplayBooks);
  }

  const clearBtn = document.getElementById('clearFiltersBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearFilters);
  }
}

// Clear all filters
function clearFilters() {
  document.getElementById('searchTitle').value = '';
  document.getElementById('searchAuthor').value = '';
  document.getElementById('searchISBN').value = '';
  document.getElementById('filterMajor').value = '';
  document.getElementById('filterCourse').value = '';
  document.getElementById('sortBy').value = 'title';
  filterAndDisplayBooks();
}

// Load books from API
async function loadBooks() {
  try {
    // Fetch books
    const booksResponse = await fetch(`${API_BASE_URL}/books`);
    const books = await booksResponse.json();

    if (!booksResponse.ok) {
      throw new Error('Failed to load books');
    }

    // Fetch authors
    const authorsResponse = await fetch(`${API_BASE_URL}/authors`);
    const authors = await authorsResponse.json();

    // Fetch book copies for price and date
    const copiesResponse = await fetch(`${API_BASE_URL}/bookcopy`);
    const copies = await copiesResponse.json();

    // Combine data
    allBooksData = books.map(book => {
      const bookAuthors = authors.filter(a => a.isbn === book.isbn);
      const bookCopies = copies.filter(c => c.isbn === book.isbn);
      
      // Get lowest price and most recent date
      const prices = bookCopies.map(c => c.price).filter(p => p > 0);
      const dates = bookCopies.map(c => new Date(c.dateAdded)).filter(d => !isNaN(d.getTime()));
      
      return {
        ...book,
        authors: bookAuthors,
        minPrice: prices.length > 0 ? Math.min(...prices) : null,
        maxPrice: prices.length > 0 ? Math.max(...prices) : null,
        latestDate: dates.length > 0 ? new Date(Math.max(...dates)) : null,
        copyCount: bookCopies.length
      };
    });

    filteredBooksData = [...allBooksData];
    filterAndDisplayBooks();
  } catch (error) {
    console.error('Error loading books:', error);
    const container = document.getElementById('booksContainer');
    if (container) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger" role="alert">
            Error loading books. Please try again later.
          </div>
        </div>
      `;
    }
  }
}

// Filter and display books
function filterAndDisplayBooks() {
  const titleFilter = document.getElementById('searchTitle').value.toLowerCase().trim();
  const authorFilter = document.getElementById('searchAuthor').value.toLowerCase().trim();
  const isbnFilter = document.getElementById('searchISBN').value.toLowerCase().trim();
  const majorFilter = document.getElementById('filterMajor').value.toLowerCase().trim();
  const courseFilter = document.getElementById('filterCourse').value.toLowerCase().trim();
  const sortBy = document.getElementById('sortBy').value;

  // Filter books
  filteredBooksData = allBooksData.filter(book => {
    const matchesTitle = !titleFilter || book.bookTitle.toLowerCase().includes(titleFilter);
    const matchesISBN = !isbnFilter || book.isbn.toLowerCase().includes(isbnFilter);
    const matchesMajor = !majorFilter || book.major.toLowerCase().includes(majorFilter);
    const matchesCourse = !courseFilter || book.course.toLowerCase().includes(courseFilter);
    
    const matchesAuthor = !authorFilter || book.authors.some(a => 
      `${a.authorFName} ${a.authorLName}`.toLowerCase().includes(authorFilter)
    );

    return matchesTitle && matchesAuthor && matchesISBN && matchesMajor && matchesCourse;
  });

  // Sort books
  filteredBooksData.sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.bookTitle.localeCompare(b.bookTitle);
      case 'price-asc':
        return (a.minPrice || Infinity) - (b.minPrice || Infinity);
      case 'price-desc':
        return (b.minPrice || 0) - (a.minPrice || 0);
      case 'date-asc':
        return (a.latestDate || new Date(0)) - (b.latestDate || new Date(0));
      case 'date-desc':
        return (b.latestDate || new Date(0)) - (a.latestDate || new Date(0));
      default:
        return 0;
    }
  });

  // Display books
  displayBooks();
}

// Display books in the container
function displayBooks() {
  const container = document.getElementById('booksContainer');
  
  if (filteredBooksData.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info" role="alert">
          No books found matching your search criteria.
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredBooksData.map(book => {
    const authorsList = book.authors.length > 0 
      ? book.authors.map(a => `${a.authorFName} ${a.authorLName}`).join(', ')
      : 'Unknown Author';
    
    const priceDisplay = book.minPrice 
      ? (book.minPrice === book.maxPrice 
          ? `$${book.minPrice}` 
          : `$${book.minPrice} - $${book.maxPrice}`)
      : 'Price not available';
    
    const dateDisplay = book.latestDate 
      ? new Date(book.latestDate).toLocaleDateString()
      : 'Date not available';

    return `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100 shadow-sm" style="cursor: pointer;" onclick="showBookDetail('${book.isbn}')">
          <div class="card-body">
            <h5 class="card-title">${escapeHtml(book.bookTitle)}</h5>
            <p class="card-text text-muted small mb-2">
              <strong>Author(s):</strong> ${escapeHtml(authorsList)}<br>
              <strong>ISBN:</strong> ${book.isbn}<br>
              <strong>Course:</strong> ${escapeHtml(book.course)}<br>
              <strong>Major:</strong> ${escapeHtml(book.major)}<br>
              <strong>Price:</strong> ${priceDisplay}<br>
              <strong>Date Posted:</strong> ${dateDisplay}
            </p>
          </div>
          <div class="card-footer bg-transparent">
            <small class="text-muted">${book.copyCount} copy(ies) available</small>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Show book detail page (placeholder for now)
window.showBookDetail = function(isbn) {
  // This will be implemented later
  alert(`Book detail page for ISBN: ${isbn} - Coming soon!`);
};

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show home page (global function for onclick handlers)
window.showHomePage = function() {
  showHomePageInternal();
};

// Add header ribbon (global function)
window.addHeader = function() {
  // Remove existing header if any
  removeHeader();
  
  const header = app.querySelector('header');
  if (header) {
    header.innerHTML = `
      <div class="container">
        <div class="d-flex justify-content-between align-items-center">
          <h1 class="mb-0">Crimson Bookstore</h1>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-outline-light" onclick="showHomePage()">Home Page</button>
            <button type="button" class="btn btn-outline-light" id="orderHistoryBtn">Customer Order History</button>
            <button type="button" class="btn btn-outline-light" id="cartBtn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cart" viewBox="0 0 16 16">
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              Shopping Cart
            </button>
          </div>
        </div>
      </div>
    `;
  }
};

// Remove header ribbon
function removeHeader() {
  const header = app.querySelector('header');
  if (header) {
    header.innerHTML = `
      <div class="container">
        <h1 class="text-center mb-0">Crimson Bookstore</h1>
      </div>
    `;
  }
}

// Show login message
function showLoginMessage(message, type) {
  const messageDiv = document.getElementById('loginMessage');
  messageDiv.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

// Show message to user
function showMessage(message, type) {
  const messageDiv = document.getElementById('registerMessage');
  messageDiv.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}


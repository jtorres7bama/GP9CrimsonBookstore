// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const app = document.getElementById('app');

// Current user session
let currentUser = null;

// Shopping cart
let shoppingCart = [];

// Initialize app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already loaded
  initializeApp();
}

// Initialize app and check for existing session
function initializeApp() {
  // Load cart from sessionStorage
  const savedCart = sessionStorage.getItem('shoppingCart');
  if (savedCart) {
    try {
      shoppingCart = JSON.parse(savedCart);
    } catch (error) {
      console.error('Error parsing saved cart:', error);
      shoppingCart = [];
    }
  }

  // Check if user is already logged in
  const savedUser = sessionStorage.getItem('currentUser');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      // User is logged in, show home page
      showHomePageInternal();
    } catch (error) {
      console.error('Error parsing saved user:', error);
      sessionStorage.removeItem('currentUser');
      setupEventListeners();
    }
  } else {
    // No user session, show landing page
    setupEventListeners();
  }
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

// Logout function (global function)
window.logout = async function() {
  // Release all reserved copies back to "In Store"
  for (const item of shoppingCart) {
    try {
      const copyResponse = await fetch(`${API_BASE_URL}/bookcopy/${item.copyID}`);
      if (copyResponse.ok) {
        const copy = await copyResponse.json();
        if (copy.copyStatus === 'Reserved') {
          copy.copyStatus = 'In Store';
          await fetch(`${API_BASE_URL}/bookcopy/${item.copyID}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(copy)
          });
        }
      }
    } catch (error) {
      console.error('Error releasing reserved copy:', error);
    }
  }

  // Clear cart
  shoppingCart = [];
  saveCart();

  // Clear current user session
  currentUser = null;
  sessionStorage.removeItem('currentUser');
  
  // Show landing page
  showLandingPage();
};

// Show landing page (global function for onclick handlers)
window.showLandingPage = function() {
  // Clear current user session if not already cleared
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
      
      // Filter out sold copies for available count
      const availableCopies = bookCopies.filter(c => c.copyStatus !== 'Sold');
      
      // Get lowest price and most recent date from available copies only
      const prices = availableCopies.map(c => c.price).filter(p => p > 0);
      const dates = availableCopies.map(c => new Date(c.dateAdded)).filter(d => !isNaN(d.getTime()));
      
      return {
        ...book,
        authors: bookAuthors,
        minPrice: prices.length > 0 ? Math.min(...prices) : null,
        maxPrice: prices.length > 0 ? Math.max(...prices) : null,
        latestDate: dates.length > 0 ? new Date(Math.max(...dates)) : null,
        copyCount: availableCopies.length
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

// Show book detail page
window.showBookDetail = async function(isbn) {
  // Add header
  addHeader();
  
  const mainContent = app.querySelector('main');
  mainContent.innerHTML = `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <div id="bookDetailContainer">
            <div class="text-center">
              <div class="spinner-border text-danger" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Loading book details...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Load book details
  await loadBookDetail(isbn);
};

// Load book detail data
async function loadBookDetail(isbn) {
  try {
    // Fetch book details
    const bookResponse = await fetch(`${API_BASE_URL}/books/${isbn}`);
    if (!bookResponse.ok) {
      throw new Error('Book not found');
    }
    const book = await bookResponse.json();

    // Fetch authors for this book
    const authorsResponse = await fetch(`${API_BASE_URL}/authors/book/${isbn}`);
    const authors = authorsResponse.ok ? await authorsResponse.json() : [];

    // Fetch available copies (excluding sold)
    const copiesResponse = await fetch(`${API_BASE_URL}/bookcopy/book/${isbn}`);
    const allCopies = copiesResponse.ok ? await copiesResponse.json() : [];
    const availableCopies = allCopies.filter(c => c.copyStatus !== 'Sold');

    // Display book details
    displayBookDetail(book, authors, availableCopies);
  } catch (error) {
    console.error('Error loading book detail:', error);
    const container = document.getElementById('bookDetailContainer');
    if (container) {
      container.innerHTML = `
        <div class="alert alert-danger" role="alert">
          Error loading book details. Please try again later.
        </div>
        <button type="button" class="btn btn-secondary mt-3" onclick="showHomePage()">Back to Home</button>
      `;
    }
  }
}

// Display book detail information
function displayBookDetail(book, authors, availableCopies) {
  const container = document.getElementById('bookDetailContainer');
  
  const authorsList = authors.length > 0 
    ? authors.map(a => `${a.authorFName} ${a.authorLName}`).join(', ')
    : 'Unknown Author';

  const priceRange = availableCopies.length > 0
    ? (() => {
        const prices = availableCopies.map(c => c.price).filter(p => p > 0);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        return minPrice === maxPrice ? `$${minPrice}` : `$${minPrice} - $${maxPrice}`;
      })()
    : 'No copies available';

  container.innerHTML = `
    <div class="row">
      <div class="col-md-8">
        <div class="card shadow">
          <div class="card-body">
            <h2 class="card-title mb-4">${escapeHtml(book.bookTitle)}</h2>
            
            <div class="mb-3">
              <h5>Author(s)</h5>
              <p class="text-muted">${escapeHtml(authorsList)}</p>
            </div>

            <div class="mb-3">
              <h5>ISBN</h5>
              <p class="text-muted">${book.isbn}</p>
            </div>

            <div class="mb-3">
              <h5>Course</h5>
              <p class="text-muted">${escapeHtml(book.course)}</p>
            </div>

            <div class="mb-3">
              <h5>Major</h5>
              <p class="text-muted">${escapeHtml(book.major)}</p>
            </div>

            <div class="mb-3">
              <h5>Price Range</h5>
              <p class="text-muted fs-5 fw-bold text-danger">${priceRange}</p>
            </div>

            <div class="mb-3">
              <h5>Available Copies</h5>
              ${availableCopies.length > 0 ? `
                <div class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>Edition</th>
                        <th>Year Printed</th>
                        <th>Condition</th>
                        <th>Price</th>
                        <th>Date Added</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${availableCopies.map(copy => `
                        <tr>
                          <td>${copy.bookEdition}</td>
                          <td>${copy.yearPrinted}</td>
                          <td><span class="badge bg-info">${escapeHtml(copy.conditions)}</span></td>
                          <td>$${copy.price}</td>
                          <td>${new Date(copy.dateAdded).toLocaleDateString()}</td>
                          <td><span class="badge bg-success">${escapeHtml(copy.copyStatus)}</span></td>
                          <td>
                            <button type="button" class="btn btn-danger btn-sm" onclick="addToCart(${copy.copyID}, '${book.isbn}')">
                              Add to Cart
                            </button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              ` : `
                <p class="text-muted">No copies currently available</p>
              `}
            </div>

            <div class="mt-4">
              <button type="button" class="btn btn-outline-secondary btn-lg" onclick="showHomePage()">
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Add to cart function
window.addToCart = async function(copyID, isbn) {
  try {
    // Check if item is already in cart
    const existingItem = shoppingCart.find(item => item.copyID === copyID);
    
    if (existingItem) {
      // Item already in cart, increase quantity if available
      const copyResponse = await fetch(`${API_BASE_URL}/bookcopy/${copyID}`);
      if (copyResponse.ok) {
        const copy = await copyResponse.json();
        if (copy.copyStatus === 'Sold') {
          alert('This copy is no longer available');
          return;
        }
        // Quantity is already 1, can't add more of the same copy
        alert('This copy is already in your cart');
        return;
      }
    }

    // Fetch copy details
    const copyResponse = await fetch(`${API_BASE_URL}/bookcopy/${copyID}`);
    if (!copyResponse.ok) {
      alert('Error adding item to cart');
      return;
    }
    const copy = await copyResponse.json();

    // Check if copy is available
    if (copy.copyStatus === 'Sold') {
      alert('This copy is no longer available');
      return;
    }

    // Mark copy as "Reserved" if it's not already reserved
    if (copy.copyStatus !== 'Reserved') {
      copy.copyStatus = 'Reserved';
      const updateResponse = await fetch(`${API_BASE_URL}/bookcopy/${copyID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(copy)
      });

      if (!updateResponse.ok) {
        alert('Error reserving copy. Please try again.');
        return;
      }
    }

    // Fetch book details for display
    const bookResponse = await fetch(`${API_BASE_URL}/books/${isbn}`);
    const book = bookResponse.ok ? await bookResponse.json() : { bookTitle: 'Unknown', isbn: isbn };

    // Fetch authors
    const authorsResponse = await fetch(`${API_BASE_URL}/authors/book/${isbn}`);
    const authors = authorsResponse.ok ? await authorsResponse.json() : [];

    // Add to cart
    const cartItem = {
      copyID: copy.copyID,
      isbn: isbn,
      bookTitle: book.bookTitle,
      authors: authors,
      edition: copy.bookEdition,
      yearPrinted: copy.yearPrinted,
      condition: copy.conditions,
      price: copy.price,
      quantity: 1,
      maxQuantity: 1 // Each copy can only be added once
    };

    shoppingCart.push(cartItem);
    saveCart();
    
    // Refresh header to update cart count
    addHeader();
    
    // Show success message
    alert(`Added "${book.bookTitle}" to cart!`);
  } catch (error) {
    console.error('Error adding to cart:', error);
    alert('Error adding item to cart. Please try again.');
  }
};

// Save cart to sessionStorage
function saveCart() {
  sessionStorage.setItem('shoppingCart', JSON.stringify(shoppingCart));
}

// Show shopping cart page
window.showCartPage = async function() {
  // Add header
  addHeader();
  
  const mainContent = app.querySelector('main');
  mainContent.innerHTML = `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <h2 class="mb-4">Shopping Cart</h2>
          <div id="cartContainer">
            <div class="text-center">
              <div class="spinner-border text-danger" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Loading cart...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Load and display cart
  await loadAndDisplayCart();
};

// Load and display cart items
async function loadAndDisplayCart() {
  const container = document.getElementById('cartContainer');

  if (shoppingCart.length === 0) {
    container.innerHTML = `
      <div class="alert alert-info" role="alert">
        Your cart is empty.
      </div>
      <button type="button" class="btn btn-outline-secondary mt-3" onclick="showHomePage()">
        Continue Shopping
      </button>
    `;
    return;
  }

  // Verify items are still available and update cart
  const verifiedCart = [];
  for (const item of shoppingCart) {
    try {
      const copyResponse = await fetch(`${API_BASE_URL}/bookcopy/${item.copyID}`);
      if (copyResponse.ok) {
        const copy = await copyResponse.json();
        if (copy.copyStatus !== 'Sold') {
          verifiedCart.push(item);
        }
      }
    } catch (error) {
      console.error('Error verifying cart item:', error);
    }
  }

  // Update cart if items were removed
  if (verifiedCart.length !== shoppingCart.length) {
    shoppingCart = verifiedCart;
    saveCart();
  }

  displayCart();
}

// Display cart items
function displayCart() {
  const container = document.getElementById('cartContainer');
  
  if (shoppingCart.length === 0) {
    container.innerHTML = `
      <div class="alert alert-info" role="alert">
        Your cart is empty.
      </div>
      <button type="button" class="btn btn-outline-secondary mt-3" onclick="showHomePage()">
        Continue Shopping
      </button>
    `;
    return;
  }

  // Calculate totals
  const subtotal = shoppingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal; // No tax/shipping for now

  const authorsList = shoppingCart.map(item => {
    if (item.authors && item.authors.length > 0) {
      return item.authors.map(a => `${a.authorFName} ${a.authorLName}`).join(', ');
    }
    return 'Unknown Author';
  });

  container.innerHTML = `
    <div class="row">
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">Cart Items</h5>
            ${shoppingCart.map((item, index) => `
              <div class="card mb-3" id="cartItem-${item.copyID}">
                <div class="card-body">
                  <div class="row align-items-center">
                    <div class="col-md-6">
                      <h6 class="mb-1">${escapeHtml(item.bookTitle)}</h6>
                      <p class="text-muted small mb-1">
                        <strong>Author(s):</strong> ${escapeHtml(authorsList[index])}<br>
                        <strong>ISBN:</strong> ${item.isbn}<br>
                        <strong>Edition:</strong> ${item.edition}<br>
                        <strong>Year:</strong> ${item.yearPrinted}<br>
                        <strong>Condition:</strong> <span class="badge bg-info">${escapeHtml(item.condition)}</span>
                      </p>
                    </div>
                    <div class="col-md-2 text-center">
                      <label class="form-label small">Quantity</label>
                      <div class="input-group input-group-sm">
                        <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity(${item.copyID}, -1)">-</button>
                        <input type="number" class="form-control text-center" id="qty-${item.copyID}" value="${item.quantity}" min="1" max="${item.maxQuantity}" readonly>
                        <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity(${item.copyID}, 1)">+</button>
                      </div>
                      <small class="text-muted">Max: ${item.maxQuantity}</small>
                    </div>
                    <div class="col-md-2 text-center">
                      <label class="form-label small">Price</label>
                      <p class="mb-0 fw-bold">$${item.price.toFixed(2)}</p>
                    </div>
                    <div class="col-md-2 text-center">
                      <label class="form-label small">Subtotal</label>
                      <p class="mb-0 fw-bold text-danger">$${(item.price * item.quantity).toFixed(2)}</p>
                      <button class="btn btn-sm btn-outline-danger mt-2" onclick="removeFromCart(${item.copyID})">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">Order Summary</h5>
            <div class="d-flex justify-content-between mb-2">
              <span>Subtotal:</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
            <hr>
            <div class="d-flex justify-content-between mb-3">
              <strong>Total:</strong>
              <strong class="text-danger fs-5">$${total.toFixed(2)}</strong>
            </div>
            <button type="button" class="btn btn-danger btn-lg w-100" onclick="checkout()">
              Checkout
            </button>
            <button type="button" class="btn btn-outline-secondary w-100 mt-2" onclick="showHomePage()">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Update quantity
window.updateQuantity = function(copyID, change) {
  const item = shoppingCart.find(i => i.copyID === copyID);
  if (!item) return;

  const newQuantity = item.quantity + change;
  
  if (newQuantity < 1) {
    removeFromCart(copyID);
    return;
  }

  if (newQuantity > item.maxQuantity) {
    alert(`Maximum quantity is ${item.maxQuantity}`);
    return;
  }

  item.quantity = newQuantity;
  saveCart();
  displayCart();
};

// Remove item from cart
window.removeFromCart = async function(copyID) {
  if (confirm('Are you sure you want to remove this item from your cart?')) {
    try {
      // Get the copy and change status back to "In Store" if it was "Reserved"
      const copyResponse = await fetch(`${API_BASE_URL}/bookcopy/${copyID}`);
      if (copyResponse.ok) {
        const copy = await copyResponse.json();
        if (copy.copyStatus === 'Reserved') {
          copy.copyStatus = 'In Store';
          await fetch(`${API_BASE_URL}/bookcopy/${copyID}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(copy)
          });
        }
      }
    } catch (error) {
      console.error('Error updating copy status:', error);
    }

    shoppingCart = shoppingCart.filter(item => item.copyID !== copyID);
    saveCart();
    addHeader(); // Refresh header to update cart count
    displayCart();
  }
};

// Show checkout page
window.checkout = function() {
  if (shoppingCart.length === 0) {
    alert('Your cart is empty');
    return;
  }
  showCheckoutPage();
};

// Show checkout page
function showCheckoutPage() {
  // Add header
  addHeader();
  
  const mainContent = app.querySelector('main');
  
  // Calculate totals
  const subtotal = shoppingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;

  const authorsList = shoppingCart.map(item => {
    if (item.authors && item.authors.length > 0) {
      return item.authors.map(a => `${a.authorFName} ${a.authorLName}`).join(', ');
    }
    return 'Unknown Author';
  });

  mainContent.innerHTML = `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <h2 class="mb-4">Checkout</h2>
        </div>
      </div>
      <div class="row">
        <div class="col-md-8">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title mb-4">Order Summary</h5>
              ${shoppingCart.map((item, index) => `
                <div class="card mb-3">
                  <div class="card-body">
                    <h6 class="mb-1">${escapeHtml(item.bookTitle)}</h6>
                    <p class="text-muted small mb-2">
                      <strong>Author(s):</strong> ${escapeHtml(authorsList[index])}<br>
                      <strong>ISBN:</strong> ${item.isbn}<br>
                      <strong>Edition:</strong> ${item.edition} | <strong>Year:</strong> ${item.yearPrinted}<br>
                      <strong>Condition:</strong> <span class="badge bg-info">${escapeHtml(item.condition)}</span>
                    </p>
                    <div class="d-flex justify-content-between align-items-center">
                      <span>Quantity: <strong>${item.quantity}</strong></span>
                      <span class="fw-bold">$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title mb-4">Order Total</h5>
              <div class="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
              </div>
              <hr>
              <div class="d-flex justify-content-between mb-4">
                <strong>Total:</strong>
                <strong class="text-danger fs-5">$${total.toFixed(2)}</strong>
              </div>
              <button type="button" class="btn btn-danger btn-lg w-100" id="confirmPurchaseBtn" onclick="confirmPurchase()">
                Confirm Purchase
              </button>
              <button type="button" class="btn btn-outline-secondary w-100 mt-2" onclick="showCartPage()">
                Back to Cart
              </button>
              <div id="checkoutMessage" class="mt-3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Confirm purchase
window.confirmPurchase = async function() {
  if (!currentUser) {
    alert('Please log in to complete your purchase');
    showLandingPage();
    return;
  }

  if (shoppingCart.length === 0) {
    alert('Your cart is empty');
    return;
  }

  if (!currentUser || !currentUser.customerID) {
    alert('User session error. Please log in again.');
    showLandingPage();
    return;
  }

  const confirmBtn = document.getElementById('confirmPurchaseBtn');
  const messageDiv = document.getElementById('checkoutMessage');
  
  try {
    // Disable button and show loading
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Processing...';
    messageDiv.innerHTML = '';

    // Step 1: Validate stock atomically - check all copies are still available
    const validationErrors = [];
    for (const item of shoppingCart) {
      try {
        const copyResponse = await fetch(`${API_BASE_URL}/bookcopy/${item.copyID}`);
        if (!copyResponse.ok) {
          validationErrors.push(`${item.bookTitle} - Copy not found`);
          continue;
        }
        const copy = await copyResponse.json();
        if (copy.copyStatus === 'Sold') {
          validationErrors.push(`${item.bookTitle} - Copy is already sold`);
        }
      } catch (error) {
        validationErrors.push(`${item.bookTitle} - Error validating`);
      }
    }

    if (validationErrors.length > 0) {
      messageDiv.innerHTML = `
        <div class="alert alert-danger" role="alert">
          <strong>Validation Failed:</strong><br>
          ${validationErrors.map(e => `• ${e}`).join('<br>')}<br><br>
          Please return to your cart and remove unavailable items.
        </div>
      `;
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirm Purchase';
      return;
    }

    // Step 2: Get all staff to randomly assign
    const staffResponse = await fetch(`${API_BASE_URL}/staffs`);
    if (!staffResponse.ok) {
      throw new Error('Failed to fetch staff');
    }
    const staffs = await staffResponse.json();
    if (staffs.length === 0) {
      throw new Error('No staff available to process order');
    }

    // Step 3: Create Transaction
    // Format date as YYYY-MM-DD for MySQL date type
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const transaction = {
      transactionID: 0,
      dateOfTransaction: dateString + 'T00:00:00', // Add time component for .NET DateTime parsing
      customerID: currentUser.customerID
    };
    
    console.log('Creating transaction:', transaction); // Debug log

    const transactionResponse = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transaction)
    });

    if (!transactionResponse.ok) {
      let errorMessage = 'Failed to create transaction';
      try {
        const errorData = await transactionResponse.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        errorMessage = `Server returned status ${transactionResponse.status}`;
      }
      throw new Error(errorMessage);
    }

    const createdTransaction = await transactionResponse.json();

    // Step 4: Create OrderLineItems and update copy status
    const orderResults = [];
    for (const item of shoppingCart) {
      // Randomly assign staff
      const randomStaff = staffs[Math.floor(Math.random() * staffs.length)];

      // Create OrderLineItem
      const orderItem = {
        orderID: 0,
        transactionID: createdTransaction.transactionID,
        copyID: item.copyID,
        orderStatus: 'Fulfilled',
        staffID: randomStaff.staffID
      };

      const orderResponse = await fetch(`${API_BASE_URL}/orderlineitems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderItem)
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(`Failed to create order for ${item.bookTitle}: ${errorData.message || 'Unknown error'}`);
      }

      // Update copy status to "Sold"
      const copyResponse = await fetch(`${API_BASE_URL}/bookcopy/${item.copyID}`);
      if (!copyResponse.ok) {
        throw new Error(`Failed to fetch copy ${item.copyID}`);
      }
      const copy = await copyResponse.json();

      copy.copyStatus = 'Sold';

      const updateResponse = await fetch(`${API_BASE_URL}/bookcopy/${item.copyID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(copy)
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to update copy status for ${item.bookTitle}`);
      }

      orderResults.push({
        book: item.bookTitle,
        success: true
      });
    }

    // Step 5: Clear cart and show success
    shoppingCart = [];
    saveCart();
    addHeader(); // Refresh header to update cart count

    messageDiv.innerHTML = `
      <div class="alert alert-success" role="alert">
        <h5>Purchase Confirmed!</h5>
        <p>Your order has been successfully processed.</p>
        <p><strong>Transaction ID:</strong> ${createdTransaction.transactionID}</p>
        <p>Thank you for your purchase!</p>
      </div>
    `;

    // Clear cart display after 3 seconds and redirect to home
    setTimeout(() => {
      showHomePageInternal();
    }, 3000);

  } catch (error) {
    console.error('Purchase error:', error);
    messageDiv.innerHTML = `
      <div class="alert alert-danger" role="alert">
        <strong>Error processing purchase:</strong><br>
        ${error.message || 'An unexpected error occurred. Please try again.'}
      </div>
    `;
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Confirm Purchase';
  }
};

// Show order history page
window.showOrderHistory = async function() {
  if (!currentUser) {
    alert('Please log in to view your order history');
    showLandingPage();
    return;
  }

  // Add header
  addHeader();
  
  const mainContent = app.querySelector('main');
  mainContent.innerHTML = `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <h2 class="mb-4">Order History</h2>
          <div id="orderHistoryContainer">
            <div class="text-center">
              <div class="spinner-border text-danger" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Loading order history...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Load order history
  await loadOrderHistory();
};

// Load order history for current customer
async function loadOrderHistory() {
  const container = document.getElementById('orderHistoryContainer');

  try {
    // Fetch all transactions for this customer
    const transactionsResponse = await fetch(`${API_BASE_URL}/transactions/customer/${currentUser.customerID}`);
    if (!transactionsResponse.ok) {
      throw new Error('Failed to load transactions');
    }
    const transactions = await transactionsResponse.json();

    if (transactions.length === 0) {
      container.innerHTML = `
        <div class="alert alert-info" role="alert">
          You have no orders yet.
        </div>
        <button type="button" class="btn btn-outline-secondary mt-3" onclick="showHomePage()">
          Start Shopping
        </button>
      `;
      return;
    }

    // Fetch order line items for all transactions to get status
    const ordersWithStatus = [];
    for (const transaction of transactions) {
      try {
        const orderItemsResponse = await fetch(`${API_BASE_URL}/orderlineitems/transaction/${transaction.transactionID}`);
        if (orderItemsResponse.ok) {
          const orderItems = await orderItemsResponse.json();
          
          // Get the most common status (or first status if all same)
          const statuses = orderItems.map(item => item.orderStatus);
          const statusCounts = {};
          statuses.forEach(status => {
            statusCounts[status] = (statusCounts[status] || 0) + 1;
          });
          
          // Get the most common status
          let mostCommonStatus = statuses[0];
          let maxCount = 0;
          for (const [status, count] of Object.entries(statusCounts)) {
            if (count > maxCount) {
              maxCount = count;
              mostCommonStatus = status;
            }
          }

          ordersWithStatus.push({
            transaction: transaction,
            status: mostCommonStatus,
            itemCount: orderItems.length
          });
        } else {
          // If no order items found, still show transaction
          ordersWithStatus.push({
            transaction: transaction,
            status: 'Unknown',
            itemCount: 0
          });
        }
      } catch (error) {
        console.error('Error loading order items:', error);
        ordersWithStatus.push({
          transaction: transaction,
          status: 'Unknown',
          itemCount: 0
        });
      }
    }

    // Display orders
    displayOrderHistory(ordersWithStatus);
  } catch (error) {
    console.error('Error loading order history:', error);
    container.innerHTML = `
      <div class="alert alert-danger" role="alert">
        Error loading order history. Please try again later.
      </div>
      <button type="button" class="btn btn-outline-secondary mt-3" onclick="showHomePage()">
        Back to Home
      </button>
    `;
  }
}

// Display order history
function displayOrderHistory(orders) {
  const container = document.getElementById('orderHistoryContainer');

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'fulfilled':
        return 'bg-success';
      case 'processing':
        return 'bg-warning';
      case 'new':
        return 'bg-info';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  container.innerHTML = `
    <div class="card">
      <div class="card-body">
        <h5 class="card-title mb-4">Your Orders</h5>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(order => {
                const date = new Date(order.transaction.dateOfTransaction);
                const dateString = date.toLocaleDateString();
                return `
                  <tr style="cursor: pointer;" onclick="showOrderDetail(${order.transaction.transactionID})">
                    <td>#${order.transaction.transactionID}</td>
                    <td>${dateString}</td>
                    <td>${order.itemCount} item(s)</td>
                    <td>
                      <span class="badge ${getStatusBadgeClass(order.status)}">
                        ${escapeHtml(order.status)}
                      </span>
                    </td>
                    <td>
                      <button type="button" class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); showOrderDetail(${order.transaction.transactionID})">
                        View Details
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div class="mt-3">
          <button type="button" class="btn btn-outline-secondary" onclick="showHomePage()">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  `;
}

// Show order detail page (placeholder for now)
window.showOrderDetail = function(transactionID) {
  // This will be implemented next
  alert(`Order detail page for Transaction ID: ${transactionID} - Coming soon!`);
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
    const cartCount = shoppingCart.length > 0 ? ` (${shoppingCart.length})` : '';
    header.innerHTML = `
      <div class="container">
        <div class="d-flex justify-content-between align-items-center">
          <h1 class="mb-0">Crimson Bookstore</h1>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-outline-light" onclick="showHomePage()">Home Page</button>
            <button type="button" class="btn btn-outline-light" id="orderHistoryBtn" onclick="showOrderHistory()">Customer Order History</button>
            <button type="button" class="btn btn-outline-light" id="cartBtn" onclick="showCartPage()">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cart" viewBox="0 0 16 16">
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              Shopping Cart${cartCount}
            </button>
            <button type="button" class="btn btn-outline-light" onclick="logout()">Logout</button>
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


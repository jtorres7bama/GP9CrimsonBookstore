// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const app = document.getElementById('app');

// Current user session
let currentUser = null;

// Current admin session
let currentAdmin = null;

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

  // Check if admin is already logged in
  const savedAdmin = sessionStorage.getItem('currentAdmin');
  if (savedAdmin) {
    try {
      currentAdmin = JSON.parse(savedAdmin);
      // Admin is logged in, show admin dashboard
      showAdminDashboard();
    } catch (error) {
      console.error('Error parsing saved admin:', error);
      sessionStorage.removeItem('currentAdmin');
      // Check for customer session
      checkCustomerSession();
    }
  } else {
    // Check if customer is already logged in
    checkCustomerSession();
  }
}

// Check customer session
function checkCustomerSession() {
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
  const adminLoginBtn = document.getElementById('adminLoginBtn');

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

  if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', showAdminLoginForm);
    console.log('Admin login button listener attached');
  } else {
    console.error('Admin login button not found');
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
  // Clear current user and admin sessions if not already cleared
  currentUser = null;
  currentAdmin = null;
  sessionStorage.removeItem('currentUser');
  sessionStorage.removeItem('currentAdmin');
  
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
              <button type="button" class="btn btn-danger btn-lg" id="loginBtn">Customer Login</button>
              <button type="button" class="btn btn-outline-danger btn-lg" id="registerBtn">Register</button>
              <hr class="my-2">
              <button type="button" class="btn btn-dark btn-lg" id="adminLoginBtn">Admin Login</button>
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

// Show admin login form
function showAdminLoginForm() {
  // Remove header if it exists
  removeHeader();
  
  const mainContent = app.querySelector('main');
  mainContent.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow">
          <div class="card-body p-4">
            <h2 class="card-title text-center mb-4">Admin Login</h2>
            <form id="adminLoginForm">
              <div class="mb-3">
                <label for="adminEmail" class="form-label">Email</label>
                <input type="email" class="form-control" id="adminEmail" required>
              </div>
              <div class="mb-3">
                <label for="adminPassword" class="form-label">Password</label>
                <input type="password" class="form-control" id="adminPassword" required>
              </div>
              <div id="adminLoginMessage"></div>
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-dark btn-lg">Login</button>
                <button type="button" class="btn btn-outline-secondary" onclick="showLandingPage()">Back</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach form handler
  const form = document.getElementById('adminLoginForm');
  form.addEventListener('submit', handleAdminLogin);
}

// Handle admin login form submission
async function handleAdminLogin(e) {
  e.preventDefault();

  const messageDiv = document.getElementById('adminLoginMessage');
  messageDiv.innerHTML = '';

  // Get form values
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value.trim();

  // Validate inputs
  if (!email || !password) {
    showAdminLoginMessage('Please fill in all fields', 'danger');
    return;
  }

  try {
    // Show loading state
    const submitBtn = document.querySelector('#adminLoginForm button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    // Get all staff to find matching email and password
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/staffs`, {
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

    let staffs;
    try {
      staffs = await response.json();
    } catch (jsonError) {
      throw new Error(`Server returned invalid response. Status: ${response.status}. Make sure the API is running on http://localhost:5000`);
    }

    if (response.ok) {
      // Find staff with matching email and password
      const staff = staffs.find(s => s.email === email && s.sPassword === password);

      if (staff) {
        // Login successful
        currentAdmin = staff;
        sessionStorage.setItem('currentAdmin', JSON.stringify(staff));
        // Clear any customer session
        currentUser = null;
        sessionStorage.removeItem('currentUser');
        showAdminDashboard();
      } else {
        showAdminLoginMessage('Invalid email or password', 'danger');
      }
    } else {
      showAdminLoginMessage(`Server error: ${response.status}. ${staffs?.message || ''}`, 'danger');
    }
  } catch (error) {
    console.error('Admin login error:', error);
    let errorMsg = 'Error connecting to server. ';
    if (error.message) {
      errorMsg = error.message;
    } else if (error.name === 'TypeError') {
      errorMsg = 'Failed to connect to server. Please make sure the API is running on http://localhost:5000';
    } else {
      errorMsg += 'Please make sure the API is running on http://localhost:5000';
    }
    showAdminLoginMessage(errorMsg, 'danger');
  } finally {
    // Restore button state
    const submitBtn = document.querySelector('#adminLoginForm button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  }
}

// Show admin login message
function showAdminLoginMessage(message, type) {
  const messageDiv = document.getElementById('adminLoginMessage');
  messageDiv.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">${escapeHtml(message)}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
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
          
          if (orderItems && orderItems.length > 0) {
            // Get the most common status (or first status if all same)
            const statuses = orderItems.map(item => item.orderStatus).filter(s => s);
            if (statuses.length > 0) {
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
              // Order items exist but no status
              ordersWithStatus.push({
                transaction: transaction,
                status: 'Unknown',
                itemCount: orderItems.length
              });
            }
          } else {
            // Empty order items array - older order
            ordersWithStatus.push({
              transaction: transaction,
              status: 'Legacy Order',
              itemCount: 0
            });
          }
        } else {
          // If no order items found, still show transaction (older orders)
          ordersWithStatus.push({
            transaction: transaction,
            status: 'Legacy Order',
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

// Show order detail page
window.showOrderDetail = async function(transactionID) {
  // Add header
  addHeader();
  
  const mainContent = app.querySelector('main');
  mainContent.innerHTML = `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <h2 class="mb-4">Order Details</h2>
          <div id="orderDetailContainer">
            <div class="text-center">
              <div class="spinner-border text-danger" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Load order details
  await loadOrderDetail(transactionID);
};

// Load order detail data
async function loadOrderDetail(transactionID) {
  const container = document.getElementById('orderDetailContainer');

  try {
    // Fetch transaction details
    const transactionResponse = await fetch(`${API_BASE_URL}/transactions/${transactionID}`);
    if (!transactionResponse.ok) {
      throw new Error('Transaction not found');
    }
    const transaction = await transactionResponse.json();

    // Verify this transaction belongs to the current user
    if (transaction.customerID !== currentUser.customerID) {
      container.innerHTML = `
        <div class="alert alert-danger" role="alert">
          You do not have permission to view this order.
        </div>
        <button type="button" class="btn btn-outline-secondary mt-3" onclick="showOrderHistory()">
          Back to Order History
        </button>
      `;
      return;
    }

    // Fetch order line items for this transaction
    let orderItems = [];
    try {
      const orderItemsResponse = await fetch(`${API_BASE_URL}/orderlineitems/transaction/${transactionID}`);
      if (orderItemsResponse.ok) {
        orderItems = await orderItemsResponse.json();
      } else {
        // For older orders, order items might not exist - that's okay
        console.log('No order items found for transaction, may be an older order');
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
      // Continue anyway - older orders might not have order line items
    }

    // If no order items, show transaction info only
    if (orderItems.length === 0) {
      container.innerHTML = `
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">Transaction Information</h5>
            <div class="row">
              <div class="col-md-6">
                <p class="mb-2"><strong>Transaction ID:</strong> #${transaction.transactionID}</p>
                <p class="mb-2"><strong>Date:</strong> ${new Date(transaction.dateOfTransaction).toLocaleDateString()}</p>
                <p class="mb-2"><strong>Time:</strong> ${new Date(transaction.dateOfTransaction).toLocaleTimeString()}</p>
              </div>
              <div class="col-md-6">
                <p class="mb-2"><strong>Customer ID:</strong> ${transaction.customerID}</p>
                <p class="mb-2"><strong>Customer Name:</strong> ${escapeHtml(currentUser.customerName)}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="alert alert-info" role="alert">
          This is an older order. Detailed line items are not available.
        </div>
        <button type="button" class="btn btn-outline-secondary mt-3" onclick="showOrderHistory()">
          Back to Order History
        </button>
      `;
      return;
    }

    // Fetch details for each order item
    const detailedItems = [];
    for (const item of orderItems) {
      try {
        // Fetch book copy details
        const copyResponse = await fetch(`${API_BASE_URL}/bookcopy/${item.copyID}`);
        if (!copyResponse.ok) {
          // Copy might not exist anymore - skip this item
          console.warn(`Copy ${item.copyID} not found, skipping`);
          continue;
        }
        const copy = await copyResponse.json();

        // Fetch book details
        let book = { bookTitle: 'Unknown Book', isbn: copy.isbn || 'Unknown' };
        try {
          const bookResponse = await fetch(`${API_BASE_URL}/books/${copy.isbn}`);
          if (bookResponse.ok) {
            book = await bookResponse.json();
          }
        } catch (error) {
          console.error('Error fetching book:', error);
        }

        // Fetch authors
        let authors = [];
        try {
          const authorsResponse = await fetch(`${API_BASE_URL}/authors/book/${copy.isbn}`);
          if (authorsResponse.ok) {
            authors = await authorsResponse.json();
          }
        } catch (error) {
          console.error('Error fetching authors:', error);
        }

        // Fetch staff details
        let staff = { staffName: 'Unknown Staff' };
        if (item.staffID) {
          try {
            const staffResponse = await fetch(`${API_BASE_URL}/staffs/${item.staffID}`);
            if (staffResponse.ok) {
              staff = await staffResponse.json();
            }
          } catch (error) {
            console.error('Error fetching staff:', error);
          }
        }

        detailedItems.push({
          orderItem: item,
          copy: copy,
          book: book,
          authors: authors,
          staff: staff
        });
      } catch (error) {
        console.error('Error loading item details:', error);
        // Continue processing other items even if one fails
      }
    }

    // If we couldn't load any detailed items, show what we can
    if (detailedItems.length === 0 && orderItems.length > 0) {
      container.innerHTML = `
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">Transaction Information</h5>
            <div class="row">
              <div class="col-md-6">
                <p class="mb-2"><strong>Transaction ID:</strong> #${transaction.transactionID}</p>
                <p class="mb-2"><strong>Date:</strong> ${new Date(transaction.dateOfTransaction).toLocaleDateString()}</p>
                <p class="mb-2"><strong>Time:</strong> ${new Date(transaction.dateOfTransaction).toLocaleTimeString()}</p>
              </div>
              <div class="col-md-6">
                <p class="mb-2"><strong>Customer ID:</strong> ${transaction.customerID}</p>
                <p class="mb-2"><strong>Customer Name:</strong> ${escapeHtml(currentUser.customerName)}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="alert alert-warning" role="alert">
          This order has ${orderItems.length} item(s), but detailed information is not available. This may be an older order.
        </div>
        <button type="button" class="btn btn-outline-secondary mt-3" onclick="showOrderHistory()">
          Back to Order History
        </button>
      `;
      return;
    }

    // Display order details
    displayOrderDetail(transaction, detailedItems);
  } catch (error) {
    console.error('Error loading order detail:', error);
    container.innerHTML = `
      <div class="alert alert-danger" role="alert">
        Error loading order details. Please try again later.
      </div>
      <button type="button" class="btn btn-outline-secondary mt-3" onclick="showOrderHistory()">
        Back to Order History
      </button>
    `;
  }
}

// Display order detail information
function displayOrderDetail(transaction, detailedItems) {
  const container = document.getElementById('orderDetailContainer');

  const transactionDate = new Date(transaction.dateOfTransaction);
  const dateString = transactionDate.toLocaleDateString();
  const timeString = transactionDate.toLocaleTimeString();

  // Calculate totals
  const subtotal = detailedItems.reduce((sum, item) => sum + (item.copy.price * 1), 0);
  const total = subtotal;

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
    <div class="row">
      <div class="col-md-12">
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">Transaction Information</h5>
            <div class="row">
              <div class="col-md-6">
                <p class="mb-2"><strong>Transaction ID:</strong> #${transaction.transactionID}</p>
                <p class="mb-2"><strong>Date:</strong> ${dateString}</p>
                <p class="mb-2"><strong>Time:</strong> ${timeString}</p>
              </div>
              <div class="col-md-6">
                <p class="mb-2"><strong>Customer ID:</strong> ${transaction.customerID}</p>
                <p class="mb-2"><strong>Customer Name:</strong> ${escapeHtml(currentUser.customerName)}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">Order Line Items</h5>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Author(s)</th>
                    <th>ISBN</th>
                    <th>Edition</th>
                    <th>Year</th>
                    <th>Condition</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                    <th>Status</th>
                    <th>Staff</th>
                  </tr>
                </thead>
                <tbody>
                  ${detailedItems.map(item => {
                    const authorsList = item.authors.length > 0 
                      ? item.authors.map(a => `${a.authorFName} ${a.authorLName}`).join(', ')
                      : 'Unknown Author';
                    const itemSubtotal = item.copy.price * 1; // Quantity is always 1 per copy
                    return `
                      <tr>
                        <td>${escapeHtml(item.book.bookTitle)}</td>
                        <td>${escapeHtml(authorsList)}</td>
                        <td>${item.book.isbn}</td>
                        <td>${item.copy.bookEdition}</td>
                        <td>${item.copy.yearPrinted}</td>
                        <td><span class="badge bg-info">${escapeHtml(item.copy.conditions)}</span></td>
                        <td>1</td>
                        <td>$${item.copy.price.toFixed(2)}</td>
                        <td>$${itemSubtotal.toFixed(2)}</td>
                        <td>
                          <span class="badge ${getStatusBadgeClass(item.orderItem.orderStatus)}">
                            ${escapeHtml(item.orderItem.orderStatus)}
                          </span>
                        </td>
                        <td>${escapeHtml(item.staff.staffName)}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="8" class="text-end"><strong>Total:</strong></td>
                    <td><strong class="text-danger fs-5">$${total.toFixed(2)}</strong></td>
                    <td colspan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div class="mt-3">
          <button type="button" class="btn btn-outline-secondary" onclick="showOrderHistory()">
            Back to Order History
          </button>
        </div>
      </div>
    </div>
  `;
}

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

// Add admin header ribbon
window.addAdminHeader = function() {
  // Remove existing header if any
  removeHeader();
  
  const header = app.querySelector('header');
  if (header) {
    header.innerHTML = `
      <div class="container">
        <div class="d-flex justify-content-between align-items-center">
          <h1 class="mb-0">Crimson Bookstore - Admin</h1>
          <div class="d-flex gap-2 flex-wrap">
            <button type="button" class="btn btn-outline-light" onclick="showAdminDashboard()">Admin Dashboard</button>
            <button type="button" class="btn btn-outline-light" onclick="showInventoryManagement()">Inventory Management</button>
            <button type="button" class="btn btn-outline-light" onclick="showOrderManagement()">Order Management</button>
            <button type="button" class="btn btn-outline-light" onclick="showUserManagement()">User Management</button>
            <button type="button" class="btn btn-outline-light" onclick="adminLogout()">Logout</button>
          </div>
        </div>
      </div>
    `;
  }
};

// Show admin dashboard
window.showAdminDashboard = function() {
  addAdminHeader();
  
  const mainContent = app.querySelector('main');
  mainContent.innerHTML = `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <h2 class="mb-4">Admin Dashboard</h2>
          <p class="text-muted">Welcome, ${escapeHtml(currentAdmin.staffName)}!</p>
          
          <div class="row mt-4">
            <div class="col-md-6 mb-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Admin Information</h5>
                  <p class="mb-1"><strong>Staff ID:</strong> ${currentAdmin.staffID}</p>
                  <p class="mb-1"><strong>Name:</strong> ${escapeHtml(currentAdmin.staffName)}</p>
                  <p class="mb-1"><strong>Email:</strong> ${escapeHtml(currentAdmin.email)}</p>
                  <p class="mb-0"><strong>Created:</strong> ${new Date(currentAdmin.createdDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-4">
            <h5 class="mb-4">Admin Features</h5>
            <div class="row g-3">
              <div class="col-md-4">
                <div class="card h-100 shadow-sm" style="cursor: pointer;" onclick="showInventoryManagement()">
                  <div class="card-body text-center">
                    <h5 class="card-title">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="mb-3" viewBox="0 0 16 16">
                        <!-- Book cover (left side) -->
                        <path d="M2 2v12c0 .5.5 1 1 1h6V2H3c-.5 0-1 .5-1 1z" fill="currentColor" opacity="0.9"/>
                        <!-- Book pages (right side, slightly open) -->
                        <path d="M9 2v12h4c.5 0 1-.5 1-1V3c0-.5-.5-1-1-1H9z" fill="white" stroke="currentColor" stroke-width="0.5"/>
                        <!-- Page lines inside -->
                        <line x1="10" y1="4" x2="12" y2="4" stroke="currentColor" stroke-width="0.3" opacity="0.5"/>
                        <line x1="10" y1="5.5" x2="12.5" y2="5.5" stroke="currentColor" stroke-width="0.3" opacity="0.5"/>
                        <line x1="10" y1="7" x2="12" y2="7" stroke="currentColor" stroke-width="0.3" opacity="0.5"/>
                        <line x1="10" y1="8.5" x2="12.5" y2="8.5" stroke="currentColor" stroke-width="0.3" opacity="0.5"/>
                        <line x1="10" y1="10" x2="12" y2="10" stroke="currentColor" stroke-width="0.3" opacity="0.5"/>
                        <!-- Title scribbles on cover -->
                        <path d="M3 3.5 Q3.5 3 4 3.5 T5 3.5" stroke="white" stroke-width="0.8" fill="none"/>
                        <path d="M3 5 Q3.5 4.5 4 5 T5 5" stroke="white" stroke-width="0.8" fill="none"/>
                        <path d="M3 6.5 Q3.5 6 4 6.5 T5 6.5" stroke="white" stroke-width="0.8" fill="none"/>
                        <!-- Book binding/spine -->
                        <rect x="2" y="2" width="1" height="12" fill="currentColor" opacity="0.7"/>
                      </svg>
                    </h5>
                    <h5 class="card-title">Inventory Management</h5>
                    <p class="card-text text-muted">Manage books, book copies, and inventory levels</p>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card h-100 shadow-sm" style="cursor: pointer;" onclick="showOrderManagement()">
                  <div class="card-body text-center">
                    <h5 class="card-title">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-receipt mb-3" viewBox="0 0 16 16">
                        <path d="M1.92.506a.5.5 0 0 1 .434.14L3 1.293l.646-.647a.5.5 0 0 1 .708 0L5 1.293l.646-.647a.5.5 0 0 1 .708 0L7 1.293l.646-.647a.5.5 0 0 1 .708 0L9 1.293l.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .801.13l.5 1A.5.5 0 0 1 15 2v12a.5.5 0 0 1-.053.224l-.5 1a.5.5 0 0 1-.8.13L13 14.707l-.646.647a.5.5 0 0 1-.708 0L11 14.707l-.646.647a.5.5 0 0 1-.708 0L9 14.707l-.646.647a.5.5 0 0 1-.708 0L7 14.707l-.646.647a.5.5 0 0 1-.708 0L5 14.707l-.646.647a.5.5 0 0 1-.708 0L3 14.707l-.646.647a.5.5 0 0 1-.801-.13l-.5-1A.5.5 0 0 1 1 14V2a.5.5 0 0 1 .053-.224l.5-1a.5.5 0 0 1 .367-.27zm.217 1.338L2 2.118v11.764l.137.274.51-.51a.5.5 0 0 1 .707 0l.646.647.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.509.509.137-.274V2.118l-.137-.274-.51.51a.5.5 0 0 1-.707 0L12 1.707l-.646.647a.5.5 0 0 1-.708 0L10 1.707l-.646.647a.5.5 0 0 1-.708 0L8 1.707l-.646.647a.5.5 0 0 1-.708 0L6 1.707l-.646.647a.5.5 0 0 1-.708 0L4 1.707l-.646.647a.5.5 0 0 1-.708 0l-.509-.509z"/>
                        <path d="M3 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m8-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5"/>
                      </svg>
                    </h5>
                    <h5 class="card-title">Order Management</h5>
                    <p class="card-text text-muted">View and manage all customer orders and transactions</p>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card h-100 shadow-sm" style="cursor: pointer;" onclick="showUserManagement()">
                  <div class="card-body text-center">
                    <h5 class="card-title">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-people mb-3" viewBox="0 0 16 16">
                        <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.629 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A3 3 0 0 1 7 11c.35 0 .69.04 1.016.107M4.92 10A5.5 5.5 0 0 0 4 11H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
                      </svg>
                    </h5>
                    <h5 class="card-title">User Management</h5>
                    <p class="card-text text-muted">Manage customer accounts and staff members</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Admin logout
window.adminLogout = function() {
  currentAdmin = null;
  sessionStorage.removeItem('currentAdmin');
  showLandingPage();
};

// Inventory Management Page
window.showInventoryManagement = async function() {
  addAdminHeader();
  
  const mainContent = app.querySelector('main');
  mainContent.innerHTML = `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <h2 class="mb-4">Inventory Management</h2>
          <p class="lead">Manage books, inventory, and book copies.</p>
        </div>
      </div>

      <!-- Admin Action Buttons -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title mb-3">Admin Actions</h5>
              <div class="d-flex gap-2 flex-wrap">
                <button type="button" class="btn btn-success" onclick="showAddBookForm()">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                  </svg>
                  Add New Book
                </button>
                <button type="button" class="btn btn-info" onclick="showTotalStockTable()">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-table" viewBox="0 0 16 16">
                    <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm15 2h-4v3h4zm0 4h-4v3h4zm0 4h-4v3h3a1 1 0 0 0 1-1zm-5 3v-3H6v3zm0 4v-3H6v3zm0-8V4H6v3zM1 4v3h4V4zm0 4v3h4V8zm0 4v3h3a1 1 0 0 0 1-1v-2zm4-8v3h4V4zm0 4v3h4V8z"/>
                  </svg>
                  View Total Stock
                </button>
              </div>
            </div>
          </div>
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
                  <label for="adminSearchTitle" class="form-label">Title</label>
                  <input type="text" class="form-control" id="adminSearchTitle" placeholder="Search by title...">
                </div>
                <div class="col-md-3">
                  <label for="adminSearchAuthor" class="form-label">Author</label>
                  <input type="text" class="form-control" id="adminSearchAuthor" placeholder="Search by author...">
                </div>
                <div class="col-md-2">
                  <label for="adminSearchISBN" class="form-label">ISBN</label>
                  <input type="text" class="form-control" id="adminSearchISBN" placeholder="Search by ISBN...">
                </div>
                <div class="col-md-2">
                  <label for="adminFilterMajor" class="form-label">Major</label>
                  <input type="text" class="form-control" id="adminFilterMajor" placeholder="Filter by major...">
                </div>
                <div class="col-md-2">
                  <label for="adminFilterCourse" class="form-label">Course</label>
                  <input type="text" class="form-control" id="adminFilterCourse" placeholder="Filter by course...">
                </div>
              </div>
              <div class="row mt-3">
                <div class="col-md-3">
                  <label for="adminSortBy" class="form-label">Sort By</label>
                  <select class="form-select" id="adminSortBy">
                    <option value="title">Title (A-Z)</option>
                    <option value="price-asc">Price (Low to High)</option>
                    <option value="price-desc">Price (High to Low)</option>
                    <option value="date-asc">Date Posted (Oldest First)</option>
                    <option value="date-desc">Date Posted (Newest First)</option>
                  </select>
                </div>
                <div class="col-md-3 d-flex align-items-end">
                  <button type="button" class="btn btn-outline-secondary" id="adminClearFiltersBtn">Clear Filters</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Books Display Section -->
      <div class="row">
        <div class="col-12">
          <div id="adminBooksContainer" class="row">
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
  setupAdminSearchFilters();
  
  // Load books
  await loadAdminBooks();
};

// Admin books data storage
let adminAllBooksData = [];
let adminFilteredBooksData = [];

// Setup admin search and filter event listeners
function setupAdminSearchFilters() {
  const searchInputs = ['adminSearchTitle', 'adminSearchAuthor', 'adminSearchISBN', 'adminFilterMajor', 'adminFilterCourse'];
  searchInputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', filterAndDisplayAdminBooks);
    }
  });

  const sortSelect = document.getElementById('adminSortBy');
  if (sortSelect) {
    sortSelect.addEventListener('change', filterAndDisplayAdminBooks);
  }

  const clearBtn = document.getElementById('adminClearFiltersBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearAdminFilters);
  }
}

// Clear all admin filters
function clearAdminFilters() {
  document.getElementById('adminSearchTitle').value = '';
  document.getElementById('adminSearchAuthor').value = '';
  document.getElementById('adminSearchISBN').value = '';
  document.getElementById('adminFilterMajor').value = '';
  document.getElementById('adminFilterCourse').value = '';
  document.getElementById('adminSortBy').value = 'title';
  filterAndDisplayAdminBooks();
}

// Load books for admin
async function loadAdminBooks() {
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
    adminAllBooksData = books.map(book => {
      const bookAuthors = authors.filter(a => a.isbn === book.isbn);
      const bookCopies = copies.filter(c => c.isbn === book.isbn);
      
      // Get all copies (including sold) for admin view
      const allCopies = bookCopies;
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
        copyCount: availableCopies.length,
        totalCopyCount: allCopies.length
      };
    });

    adminFilteredBooksData = [...adminAllBooksData];
    filterAndDisplayAdminBooks();
  } catch (error) {
    console.error('Error loading books:', error);
    const container = document.getElementById('adminBooksContainer');
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

// Filter and display admin books
function filterAndDisplayAdminBooks() {
  const titleFilter = document.getElementById('adminSearchTitle').value.toLowerCase().trim();
  const authorFilter = document.getElementById('adminSearchAuthor').value.toLowerCase().trim();
  const isbnFilter = document.getElementById('adminSearchISBN').value.toLowerCase().trim();
  const majorFilter = document.getElementById('adminFilterMajor').value.toLowerCase().trim();
  const courseFilter = document.getElementById('adminFilterCourse').value.toLowerCase().trim();
  const sortBy = document.getElementById('adminSortBy').value;

  // Filter books
  adminFilteredBooksData = adminAllBooksData.filter(book => {
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
  adminFilteredBooksData.sort((a, b) => {
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
  displayAdminBooks();
}

// Display admin books with edit/delete buttons
function displayAdminBooks() {
  const container = document.getElementById('adminBooksContainer');
  
  if (adminFilteredBooksData.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info" role="alert">
          No books found matching your search criteria.
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = adminFilteredBooksData.map(book => {
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
        <div class="card h-100 shadow-sm">
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
            <div class="d-flex justify-content-between align-items-center mb-2">
              <small class="text-muted">${book.copyCount} available / ${book.totalCopyCount} total</small>
            </div>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-sm btn-primary flex-fill" onclick="editBook('${book.isbn}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                  <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 9.207 2.5 1.207l1.586 1.586L10.5 9.207z"/>
                </svg>
                Edit
              </button>
              <button type="button" class="btn btn-sm btn-danger flex-fill" onclick="deleteBook('${book.isbn}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                </svg>
                Delete
              </button>
              <button type="button" class="btn btn-sm btn-warning flex-fill" onclick="manageBookCopiesForBook('${book.isbn}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-boxes" viewBox="0 0 16 16">
                  <path d="M7.752.066a.5.5 0 0 1 .496 0l3.75 2.143a.5.5 0 0 1 .252.434v3.995l3.498 2A.5.5 0 0 1 16 9.07v4.286a.5.5 0 0 1-.252.434l-3.75 2.143a.5.5 0 0 1-.496 0l-3.502-2-3.502 2.001a.5.5 0 0 1-.496 0l-3.75-2.143A.5.5 0 0 1 0 13.357V9.071a.5.5 0 0 1 .252-.434L3.75 6.638V2.643a.5.5 0 0 1 .252-.434zM4.25 7.504 1.508 9.071l2.742 1.567 2.742-1.567zM7.5 9.933l-2.75 1.571v3.134l2.75-1.571zm1 3.134 2.75 1.571v-3.134L8.5 9.933zm.508-3.996 2.742 1.567 2.742-1.567-2.742-1.567zm2.242-2.433V3.504L8.5 5.076V8.21zM7.5 8.21V5.076L4.75 3.504v3.134zM5.258 2.643 8 4.21l2.742-1.567L8 1.076zM15 9.933l-2.75 1.571v3.134L15 13.067zM3.75 14.638v-3.134L1 9.933v3.134z"/>
                </svg>
                Copies
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Placeholder functions for admin actions (to be implemented)
window.showAddBookForm = function() {
  // Create modal HTML
  const modalHTML = `
    <div class="modal fade" id="addBookModal" tabindex="-1" aria-labelledby="addBookModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addBookModalLabel">Add New Book</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="addBookForm">
              <div class="mb-3">
                <label for="newBookISBN" class="form-label">ISBN <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="newBookISBN" required maxlength="13" placeholder="e.g., 9780000000001">
                <small class="form-text text-muted">13-character ISBN</small>
              </div>
              <div class="mb-3">
                <label for="newBookTitle" class="form-label">Book Title <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="newBookTitle" required maxlength="20" placeholder="Enter book title">
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="newBookCourse" class="form-label">Course <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" id="newBookCourse" required maxlength="20" placeholder="e.g., MATH101">
                </div>
                <div class="col-md-6 mb-3">
                  <label for="newBookMajor" class="form-label">Major <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" id="newBookMajor" required maxlength="20" placeholder="e.g., Mathematics">
                </div>
              </div>
              <div class="mb-3">
                <label for="newBookImageURL" class="form-label">Image URL (Optional)</label>
                <input type="url" class="form-control" id="newBookImageURL" maxlength="100" placeholder="https://example.com/image.jpg">
              </div>
              <div class="mb-3">
                <label class="form-label">Authors <span class="text-danger">*</span></label>
                <div id="authorsContainer">
                  <div class="author-entry mb-2">
                    <div class="row g-2">
                      <div class="col-md-5">
                        <input type="text" class="form-control author-fname" placeholder="First Name" required maxlength="15">
                      </div>
                      <div class="col-md-5">
                        <input type="text" class="form-control author-lname" placeholder="Last Name" required maxlength="15">
                      </div>
                      <div class="col-md-2">
                        <button type="button" class="btn btn-danger w-100 remove-author" style="display: none;">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <button type="button" class="btn btn-sm btn-outline-secondary" id="addAuthorBtn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                  </svg>
                  Add Another Author
                </button>
              </div>
              <div id="addBookMessage"></div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-success" onclick="handleAddBook()">Add Book</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  const existingModal = document.getElementById('addBookModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Initialize Bootstrap modal
  const modalElement = document.getElementById('addBookModal');
  const modal = new bootstrap.Modal(modalElement);
  
  // Clean up modal when hidden
  modalElement.addEventListener('hidden.bs.modal', function() {
    modalElement.remove();
  });
  
  modal.show();

  // Setup event listeners
  setupAddBookFormListeners();
  
  // Update remove buttons visibility
  updateRemoveButtons();
};

// Setup event listeners for add book form
function setupAddBookFormListeners() {
  // Add author button
  const addAuthorBtn = document.getElementById('addAuthorBtn');
  if (addAuthorBtn) {
    addAuthorBtn.addEventListener('click', addAuthorField);
  }

  // Remove author buttons
  document.querySelectorAll('.remove-author').forEach(btn => {
    btn.addEventListener('click', function() {
      this.closest('.author-entry').remove();
      updateRemoveButtons();
    });
  });
}

// Add another author field
function addAuthorField() {
  const container = document.getElementById('authorsContainer');
  const newAuthorHTML = `
    <div class="author-entry mb-2">
      <div class="row g-2">
        <div class="col-md-5">
          <input type="text" class="form-control author-fname" placeholder="First Name" required maxlength="15">
        </div>
        <div class="col-md-5">
          <input type="text" class="form-control author-lname" placeholder="Last Name" required maxlength="15">
        </div>
        <div class="col-md-2">
          <button type="button" class="btn btn-danger w-100 remove-author">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', newAuthorHTML);
  
  // Attach event listener to new remove button
  const newRemoveBtn = container.querySelector('.author-entry:last-child .remove-author');
  if (newRemoveBtn) {
    newRemoveBtn.addEventListener('click', function() {
      this.closest('.author-entry').remove();
      updateRemoveButtons();
    });
  }
  
  updateRemoveButtons();
}

// Update remove buttons visibility (hide if only one author)
function updateRemoveButtons() {
  const authorEntries = document.querySelectorAll('.author-entry');
  authorEntries.forEach((entry, index) => {
    const removeBtn = entry.querySelector('.remove-author');
    if (removeBtn) {
      removeBtn.style.display = authorEntries.length > 1 ? 'block' : 'none';
    }
  });
}

// Handle add book form submission
async function handleAddBook() {
  const messageDiv = document.getElementById('addBookMessage');
  messageDiv.innerHTML = '';

  // Get form values
  const isbn = document.getElementById('newBookISBN').value.trim();
  const bookTitle = document.getElementById('newBookTitle').value.trim();
  const course = document.getElementById('newBookCourse').value.trim();
  const major = document.getElementById('newBookMajor').value.trim();
  const imageURL = document.getElementById('newBookImageURL').value.trim();

  // Validate required fields
  if (!isbn || !bookTitle || !course || !major) {
    messageDiv.innerHTML = '<div class="alert alert-danger">Please fill in all required fields.</div>';
    return;
  }

  // Collect authors
  const authorEntries = document.querySelectorAll('.author-entry');
  const authors = [];
  let hasInvalidAuthor = false;

  authorEntries.forEach(entry => {
    const fname = entry.querySelector('.author-fname').value.trim();
    const lname = entry.querySelector('.author-lname').value.trim();
    if (fname && lname) {
      authors.push({ authorFName: fname, authorLName: lname });
    } else if (fname || lname) {
      hasInvalidAuthor = true;
    }
  });

  if (authors.length === 0) {
    messageDiv.innerHTML = '<div class="alert alert-danger">Please add at least one author.</div>';
    return;
  }

  if (hasInvalidAuthor) {
    messageDiv.innerHTML = '<div class="alert alert-danger">Please complete all author fields or remove incomplete entries.</div>';
    return;
  }

  try {
    // Disable submit button
    const submitBtn = document.querySelector('#addBookModal .btn-success');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding...';

    // Create book
    const bookData = {
      isbn: isbn,
      bookTitle: bookTitle,
      course: course,
      major: major,
      imageURL: imageURL || null
    };

    const bookResponse = await fetch(`${API_BASE_URL}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookData)
    });

    if (!bookResponse.ok) {
      const errorData = await bookResponse.json();
      throw new Error(errorData.message || 'Failed to create book');
    }

    // Create authors
    const authorPromises = authors.map(author => 
      fetch(`${API_BASE_URL}/authors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isbn: isbn,
          authorFName: author.authorFName,
          authorLName: author.authorLName
        })
      })
    );

    const authorResults = await Promise.all(authorPromises);
    const failedAuthors = authorResults.filter(r => !r.ok);

    if (failedAuthors.length > 0) {
      console.warn('Some authors failed to create');
    }

    // Success - close modal and refresh
    const modal = bootstrap.Modal.getInstance(document.getElementById('addBookModal'));
    modal.hide();

    // Refresh the book list
    await loadAdminBooks();

    // Show success message
    alert('Book added successfully!');
  } catch (error) {
    console.error('Error adding book:', error);
    messageDiv.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message || 'Error adding book. Please try again.')}</div>`;
  } finally {
    // Re-enable submit button
    const submitBtn = document.querySelector('#addBookModal .btn-success');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add Book';
    }
  }
}

window.showEditBookForm = function() {
  alert('Edit Book functionality will be implemented here. Please select a book to edit.');
};

window.editBook = async function(isbn) {
  try {
    // Fetch book details
    const bookResponse = await fetch(`${API_BASE_URL}/books/${isbn}`);
    if (!bookResponse.ok) {
      alert('Book not found');
      return;
    }
    const book = await bookResponse.json();

    // Fetch authors
    const authorsResponse = await fetch(`${API_BASE_URL}/authors/book/${isbn}`);
    const authors = authorsResponse.ok ? await authorsResponse.json() : [];

    // Create modal HTML
    const authorsHTML = authors.map((author, index) => `
      <div class="author-entry mb-2" data-author-id="${author.authorID}">
        <div class="row g-2">
          <div class="col-md-5">
            <input type="text" class="form-control author-fname" placeholder="First Name" required maxlength="15" value="${escapeHtml(author.authorFName)}">
          </div>
          <div class="col-md-5">
            <input type="text" class="form-control author-lname" placeholder="Last Name" required maxlength="15" value="${escapeHtml(author.authorLName)}">
          </div>
          <div class="col-md-2">
            <button type="button" class="btn btn-danger w-100 remove-author">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    const modalHTML = `
      <div class="modal fade" id="editBookModal" tabindex="-1" aria-labelledby="editBookModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="editBookModalLabel">Edit Book</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="editBookForm">
                <div class="mb-3">
                  <label for="editBookISBN" class="form-label">ISBN</label>
                  <input type="text" class="form-control" id="editBookISBN" value="${book.isbn}" readonly>
                  <small class="form-text text-muted">ISBN cannot be changed</small>
                </div>
                <div class="mb-3">
                  <label for="editBookTitle" class="form-label">Book Title <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" id="editBookTitle" required maxlength="20" value="${escapeHtml(book.bookTitle)}">
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="editBookCourse" class="form-label">Course <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="editBookCourse" required maxlength="20" value="${escapeHtml(book.course)}">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="editBookMajor" class="form-label">Major <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="editBookMajor" required maxlength="20" value="${escapeHtml(book.major)}">
                  </div>
                </div>
                <div class="mb-3">
                  <label for="editBookImageURL" class="form-label">Image URL (Optional)</label>
                  <input type="url" class="form-control" id="editBookImageURL" maxlength="100" value="${book.imageURL ? escapeHtml(book.imageURL) : ''}">
                </div>
                <div class="mb-3">
                  <label class="form-label">Authors <span class="text-danger">*</span></label>
                  <div id="editAuthorsContainer">
                    ${authorsHTML || `
                      <div class="author-entry mb-2">
                        <div class="row g-2">
                          <div class="col-md-5">
                            <input type="text" class="form-control author-fname" placeholder="First Name" required maxlength="15">
                          </div>
                          <div class="col-md-5">
                            <input type="text" class="form-control author-lname" placeholder="Last Name" required maxlength="15">
                          </div>
                          <div class="col-md-2">
                            <button type="button" class="btn btn-danger w-100 remove-author" style="display: none;">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    `}
                  </div>
                  <button type="button" class="btn btn-sm btn-outline-secondary" id="editAddAuthorBtn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                    </svg>
                    Add Another Author
                  </button>
                </div>
                <div id="editBookMessage"></div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" onclick="handleEditBook()">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('editBookModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Initialize Bootstrap modal
    const modalElement = document.getElementById('editBookModal');
    const modal = new bootstrap.Modal(modalElement);
    
    // Clean up modal when hidden
    modalElement.addEventListener('hidden.bs.modal', function() {
      modalElement.remove();
    });
    
    modal.show();

    // Setup event listeners
    setupEditBookFormListeners();
    updateEditRemoveButtons();
  } catch (error) {
    console.error('Error loading book for edit:', error);
    alert('Error loading book details. Please try again.');
  }
};

// Setup event listeners for edit book form
function setupEditBookFormListeners() {
  // Add author button
  const addAuthorBtn = document.getElementById('editAddAuthorBtn');
  if (addAuthorBtn) {
    addAuthorBtn.addEventListener('click', addEditAuthorField);
  }

  // Remove author buttons
  document.querySelectorAll('#editAuthorsContainer .remove-author').forEach(btn => {
    btn.addEventListener('click', function() {
      this.closest('.author-entry').remove();
      updateEditRemoveButtons();
    });
  });
}

// Add another author field for edit form
function addEditAuthorField() {
  const container = document.getElementById('editAuthorsContainer');
  const newAuthorHTML = `
    <div class="author-entry mb-2">
      <div class="row g-2">
        <div class="col-md-5">
          <input type="text" class="form-control author-fname" placeholder="First Name" required maxlength="15">
        </div>
        <div class="col-md-5">
          <input type="text" class="form-control author-lname" placeholder="Last Name" required maxlength="15">
        </div>
        <div class="col-md-2">
          <button type="button" class="btn btn-danger w-100 remove-author">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', newAuthorHTML);
  
  // Attach event listener to new remove button
  const newRemoveBtn = container.querySelector('.author-entry:last-child .remove-author');
  if (newRemoveBtn) {
    newRemoveBtn.addEventListener('click', function() {
      this.closest('.author-entry').remove();
      updateEditRemoveButtons();
    });
  }
  
  updateEditRemoveButtons();
}

// Update remove buttons visibility for edit form
function updateEditRemoveButtons() {
  const authorEntries = document.querySelectorAll('#editAuthorsContainer .author-entry');
  authorEntries.forEach((entry, index) => {
    const removeBtn = entry.querySelector('.remove-author');
    if (removeBtn) {
      removeBtn.style.display = authorEntries.length > 1 ? 'block' : 'none';
    }
  });
}

// Handle edit book form submission
async function handleEditBook() {
  const messageDiv = document.getElementById('editBookMessage');
  messageDiv.innerHTML = '';

  // Get form values
  const isbn = document.getElementById('editBookISBN').value.trim();
  const bookTitle = document.getElementById('editBookTitle').value.trim();
  const course = document.getElementById('editBookCourse').value.trim();
  const major = document.getElementById('editBookMajor').value.trim();
  const imageURL = document.getElementById('editBookImageURL').value.trim();

  // Validate required fields
  if (!isbn || !bookTitle || !course || !major) {
    messageDiv.innerHTML = '<div class="alert alert-danger">Please fill in all required fields.</div>';
    return;
  }

  // Collect authors
  const authorEntries = document.querySelectorAll('#editAuthorsContainer .author-entry');
  const authors = [];
  const existingAuthorIds = [];
  let hasInvalidAuthor = false;

  authorEntries.forEach(entry => {
    const authorId = entry.getAttribute('data-author-id');
    const fname = entry.querySelector('.author-fname').value.trim();
    const lname = entry.querySelector('.author-lname').value.trim();
    if (fname && lname) {
      authors.push({ 
        authorID: authorId ? parseInt(authorId) : null,
        authorFName: fname, 
        authorLName: lname 
      });
      if (authorId) {
        existingAuthorIds.push(parseInt(authorId));
      }
    } else if (fname || lname) {
      hasInvalidAuthor = true;
    }
  });

  if (authors.length === 0) {
    messageDiv.innerHTML = '<div class="alert alert-danger">Please add at least one author.</div>';
    return;
  }

  if (hasInvalidAuthor) {
    messageDiv.innerHTML = '<div class="alert alert-danger">Please complete all author fields or remove incomplete entries.</div>';
    return;
  }

  try {
    // Disable submit button
    const submitBtn = document.querySelector('#editBookModal .btn-primary');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    // Update book
    const bookData = {
      isbn: isbn,
      bookTitle: bookTitle,
      course: course,
      major: major,
      imageURL: imageURL || null
    };

    const bookResponse = await fetch(`${API_BASE_URL}/books/${isbn}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookData)
    });

    if (!bookResponse.ok) {
      const errorData = await bookResponse.json();
      throw new Error(errorData.message || 'Failed to update book');
    }

    // Get current authors to determine which to delete
    const currentAuthorsResponse = await fetch(`${API_BASE_URL}/authors/book/${isbn}`);
    const currentAuthors = currentAuthorsResponse.ok ? await currentAuthorsResponse.json() : [];
    const authorsToDelete = currentAuthors.filter(a => !existingAuthorIds.includes(a.authorID));

    // Delete removed authors
    for (const author of authorsToDelete) {
      await fetch(`${API_BASE_URL}/authors/${author.authorID}`, {
        method: 'DELETE'
      });
    }

    // Update or create authors
    for (const author of authors) {
      if (author.authorID) {
        // Update existing author
        await fetch(`${API_BASE_URL}/authors/${author.authorID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            authorID: author.authorID,
            isbn: isbn,
            authorFName: author.authorFName,
            authorLName: author.authorLName
          })
        });
      } else {
        // Create new author
        await fetch(`${API_BASE_URL}/authors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            isbn: isbn,
            authorFName: author.authorFName,
            authorLName: author.authorLName
          })
        });
      }
    }

    // Success - close modal and refresh
    const modal = bootstrap.Modal.getInstance(document.getElementById('editBookModal'));
    modal.hide();

    // Refresh the book list
    await loadAdminBooks();

    // Show success message
    alert('Book updated successfully!');
  } catch (error) {
    console.error('Error updating book:', error);
    messageDiv.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message || 'Error updating book. Please try again.')}</div>`;
  } finally {
    // Re-enable submit button
    const submitBtn = document.querySelector('#editBookModal .btn-primary');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Changes';
    }
  }
}

window.showDeleteBookForm = function() {
  alert('Delete Book functionality will be implemented here.');
};

window.deleteBook = function(isbn) {
  if (confirm(`Are you sure you want to delete the book with ISBN ${isbn}? This action cannot be undone.`)) {
    alert(`Delete Book functionality will be implemented here for ISBN: ${isbn}`);
  }
};

window.showManageBookCopies = function() {
  alert('Manage Book Copies functionality will be implemented here.');
};

window.manageBookCopiesForBook = async function(isbn) {
  addAdminHeader();
  
  const mainContent = app.querySelector('main');
  mainContent.innerHTML = `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">Manage Book Copies</h2>
            <button type="button" class="btn btn-outline-secondary" onclick="showInventoryManagement()">
              Back to Inventory Management
            </button>
          </div>
          
          <!-- Book Details Section -->
          <div id="bookDetailsSection" class="card mb-4">
            <div class="card-body">
              <div class="text-center">
                <div class="spinner-border text-danger" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading book details...</p>
              </div>
            </div>
          </div>
          
          <!-- Book Copies Section -->
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Book Copies</h5>
              <button type="button" class="btn btn-success btn-sm" onclick="showAddCopyForm('${isbn}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                </svg>
                Add New Copy
              </button>
            </div>
            <div class="card-body">
              <div id="copiesContainer">
                <div class="text-center">
                  <div class="spinner-border text-danger" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-2">Loading copies...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Load book details and copies
  await loadBookCopiesPage(isbn);
};

// Load book details and copies for management page
async function loadBookCopiesPage(isbn) {
  try {
    // Fetch book details
    const bookResponse = await fetch(`${API_BASE_URL}/books/${isbn}`);
    if (!bookResponse.ok) {
      throw new Error('Book not found');
    }
    const book = await bookResponse.json();

    // Fetch authors
    const authorsResponse = await fetch(`${API_BASE_URL}/authors/book/${isbn}`);
    const authors = authorsResponse.ok ? await authorsResponse.json() : [];

    // Display book details
    const bookDetailsSection = document.getElementById('bookDetailsSection');
    const authorsList = authors.length > 0 
      ? authors.map(a => `${a.authorFName} ${a.authorLName}`).join(', ')
      : 'Unknown Author';

    bookDetailsSection.innerHTML = `
      <div class="card-body">
        <h4 class="card-title">${escapeHtml(book.bookTitle)}</h4>
        <div class="row mt-3">
          <div class="col-md-6">
            <p class="mb-2"><strong>ISBN:</strong> ${book.isbn}</p>
            <p class="mb-2"><strong>Author(s):</strong> ${escapeHtml(authorsList)}</p>
            <p class="mb-2"><strong>Course:</strong> ${escapeHtml(book.course)}</p>
          </div>
          <div class="col-md-6">
            <p class="mb-2"><strong>Major:</strong> ${escapeHtml(book.major)}</p>
            <p class="mb-2"><strong>Image URL:</strong> ${book.imageURL ? escapeHtml(book.imageURL) : 'Not set'}</p>
          </div>
        </div>
      </div>
    `;

    // Fetch all copies (including sold)
    const copiesResponse = await fetch(`${API_BASE_URL}/bookcopy/book/${isbn}`);
    const copies = copiesResponse.ok ? await copiesResponse.json() : [];

    // Display copies
    displayBookCopies(copies, isbn);
  } catch (error) {
    console.error('Error loading book copies page:', error);
    const bookDetailsSection = document.getElementById('bookDetailsSection');
    bookDetailsSection.innerHTML = `
      <div class="card-body">
        <div class="alert alert-danger">Error loading book details. Please try again.</div>
      </div>
    `;
  }
}

// Display book copies in a table
function displayBookCopies(copies, isbn) {
  const container = document.getElementById('copiesContainer');

  if (copies.length === 0) {
    container.innerHTML = `
      <div class="alert alert-info">
        No copies found for this book. Click "Add New Copy" to add one.
      </div>
    `;
    return;
  }

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'in store':
        return 'bg-success';
      case 'reserved':
        return 'bg-warning';
      case 'sold':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  container.innerHTML = `
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th>Copy ID</th>
            <th>Edition</th>
            <th>Year Printed</th>
            <th>Price</th>
            <th>Condition</th>
            <th>Date Added</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${copies.map(copy => `
            <tr>
              <td>${copy.copyID}</td>
              <td>${copy.bookEdition}</td>
              <td>${copy.yearPrinted}</td>
              <td>$${copy.price}</td>
              <td><span class="badge bg-info">${escapeHtml(copy.conditions)}</span></td>
              <td>${new Date(copy.dateAdded).toLocaleDateString()}</td>
              <td><span class="badge ${getStatusBadgeClass(copy.copyStatus)}">${escapeHtml(copy.copyStatus)}</span></td>
              <td>
                <div class="btn-group btn-group-sm" role="group">
                  <button type="button" class="btn btn-primary" onclick="editBookCopy(${copy.copyID}, '${isbn}')" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                      <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 9.207 2.5 1.207l1.586 1.586L10.5 9.207z"/>
                    </svg>
                  </button>
                  <button type="button" class="btn btn-danger" onclick="deleteBookCopy(${copy.copyID}, '${isbn}')" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                      <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Show add copy form modal
window.showAddCopyForm = function(isbn) {
  const modalHTML = `
    <div class="modal fade" id="addCopyModal" tabindex="-1" aria-labelledby="addCopyModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addCopyModalLabel">Add New Book Copy</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="addCopyForm">
              <input type="hidden" id="addCopyISBN" value="${isbn}">
              <div class="mb-3">
                <label for="newCopyEdition" class="form-label">Edition <span class="text-danger">*</span></label>
                <input type="number" class="form-control" id="newCopyEdition" required min="1" value="1">
              </div>
              <div class="mb-3">
                <label for="newCopyYear" class="form-label">Year Printed <span class="text-danger">*</span></label>
                <input type="number" class="form-control" id="newCopyYear" required min="1900" max="${new Date().getFullYear() + 1}" value="${new Date().getFullYear()}">
              </div>
              <div class="mb-3">
                <label for="newCopyPrice" class="form-label">Price ($) <span class="text-danger">*</span></label>
                <input type="number" class="form-control" id="newCopyPrice" required min="0" step="1" value="0">
              </div>
              <div class="mb-3">
                <label for="newCopyCondition" class="form-label">Condition <span class="text-danger">*</span></label>
                <select class="form-select" id="newCopyCondition" required>
                  <option value="">Select condition...</option>
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="newCopyStatus" class="form-label">Status <span class="text-danger">*</span></label>
                <select class="form-select" id="newCopyStatus" required>
                  <option value="In Store" selected>In Store</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
              <div id="addCopyMessage"></div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-success" onclick="handleAddCopy()">Add Copy</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  const existingModal = document.getElementById('addCopyModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Initialize Bootstrap modal
  const modalElement = document.getElementById('addCopyModal');
  const modal = new bootstrap.Modal(modalElement);
  
  // Clean up modal when hidden
  modalElement.addEventListener('hidden.bs.modal', function() {
    modalElement.remove();
  });
  
  modal.show();
};

// Handle add copy form submission
async function handleAddCopy() {
  const messageDiv = document.getElementById('addCopyMessage');
  messageDiv.innerHTML = '';

  const isbn = document.getElementById('addCopyISBN').value;
  const edition = parseInt(document.getElementById('newCopyEdition').value);
  const year = parseInt(document.getElementById('newCopyYear').value);
  const price = parseInt(document.getElementById('newCopyPrice').value);
  const condition = document.getElementById('newCopyCondition').value;
  const status = document.getElementById('newCopyStatus').value;

  // Validate
  if (!edition || !year || price < 0 || !condition || !status) {
    messageDiv.innerHTML = '<div class="alert alert-danger">Please fill in all required fields.</div>';
    return;
  }

  try {
    const submitBtn = document.querySelector('#addCopyModal .btn-success');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding...';

    const copyData = {
      copyID: 0, // Will be auto-generated
      isbn: isbn,
      bookEdition: edition,
      yearPrinted: year,
      price: price,
      conditions: condition,
      dateAdded: new Date().toISOString().split('T')[0] + 'T00:00:00',
      copyStatus: status
    };

    const response = await fetch(`${API_BASE_URL}/bookcopy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(copyData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create book copy');
    }

    // Success - close modal and refresh
    const modal = bootstrap.Modal.getInstance(document.getElementById('addCopyModal'));
    modal.hide();

    // Refresh the copies list
    await loadBookCopiesPage(isbn);

    alert('Book copy added successfully!');
  } catch (error) {
    console.error('Error adding copy:', error);
    messageDiv.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message || 'Error adding copy. Please try again.')}</div>`;
  } finally {
    const submitBtn = document.querySelector('#addCopyModal .btn-success');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add Copy';
    }
  }
}

// Show edit copy form modal
window.editBookCopy = async function(copyID, isbn) {
  try {
    // Fetch copy details
    const copyResponse = await fetch(`${API_BASE_URL}/bookcopy/${copyID}`);
    if (!copyResponse.ok) {
      alert('Copy not found');
      return;
    }
    const copy = await copyResponse.json();

    const modalHTML = `
      <div class="modal fade" id="editCopyModal" tabindex="-1" aria-labelledby="editCopyModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="editCopyModalLabel">Edit Book Copy #${copyID}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="editCopyForm">
                <input type="hidden" id="editCopyID" value="${copyID}">
                <input type="hidden" id="editCopyISBN" value="${isbn}">
                <div class="mb-3">
                  <label for="editCopyEdition" class="form-label">Edition <span class="text-danger">*</span></label>
                  <input type="number" class="form-control" id="editCopyEdition" required min="1" value="${copy.bookEdition}">
                </div>
                <div class="mb-3">
                  <label for="editCopyYear" class="form-label">Year Printed <span class="text-danger">*</span></label>
                  <input type="number" class="form-control" id="editCopyYear" required min="1900" max="${new Date().getFullYear() + 1}" value="${copy.yearPrinted}">
                </div>
                <div class="mb-3">
                  <label for="editCopyPrice" class="form-label">Price ($) <span class="text-danger">*</span></label>
                  <input type="number" class="form-control" id="editCopyPrice" required min="0" step="1" value="${copy.price}">
                </div>
                <div class="mb-3">
                  <label for="editCopyCondition" class="form-label">Condition <span class="text-danger">*</span></label>
                  <select class="form-select" id="editCopyCondition" required>
                    <option value="">Select condition...</option>
                    <option value="New" ${copy.conditions === 'New' ? 'selected' : ''}>New</option>
                    <option value="Like New" ${copy.conditions === 'Like New' ? 'selected' : ''}>Like New</option>
                    <option value="Good" ${copy.conditions === 'Good' ? 'selected' : ''}>Good</option>
                    <option value="Fair" ${copy.conditions === 'Fair' ? 'selected' : ''}>Fair</option>
                    <option value="Poor" ${copy.conditions === 'Poor' ? 'selected' : ''}>Poor</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="editCopyDateAdded" class="form-label">Date Added <span class="text-danger">*</span></label>
                  <input type="date" class="form-control" id="editCopyDateAdded" required value="${new Date(copy.dateAdded).toISOString().split('T')[0]}">
                </div>
                <div class="mb-3">
                  <label for="editCopyStatus" class="form-label">Status <span class="text-danger">*</span></label>
                  <select class="form-select" id="editCopyStatus" required>
                    <option value="In Store" ${copy.copyStatus === 'In Store' ? 'selected' : ''}>In Store</option>
                    <option value="Reserved" ${copy.copyStatus === 'Reserved' ? 'selected' : ''}>Reserved</option>
                    <option value="Sold" ${copy.copyStatus === 'Sold' ? 'selected' : ''}>Sold</option>
                  </select>
                </div>
                <div id="editCopyMessage"></div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" onclick="handleEditCopy()">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('editCopyModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Initialize Bootstrap modal
    const modalElement = document.getElementById('editCopyModal');
    const modal = new bootstrap.Modal(modalElement);
    
    // Clean up modal when hidden
    modalElement.addEventListener('hidden.bs.modal', function() {
      modalElement.remove();
    });
    
    modal.show();
  } catch (error) {
    console.error('Error loading copy for edit:', error);
    alert('Error loading copy details. Please try again.');
  }
};

// Handle edit copy form submission
async function handleEditCopy() {
  const messageDiv = document.getElementById('editCopyMessage');
  messageDiv.innerHTML = '';

  const copyID = parseInt(document.getElementById('editCopyID').value);
  const isbn = document.getElementById('editCopyISBN').value;
  const edition = parseInt(document.getElementById('editCopyEdition').value);
  const year = parseInt(document.getElementById('editCopyYear').value);
  const price = parseInt(document.getElementById('editCopyPrice').value);
  const condition = document.getElementById('editCopyCondition').value;
  const dateAdded = document.getElementById('editCopyDateAdded').value;
  const status = document.getElementById('editCopyStatus').value;

  // Validate
  if (!edition || !year || price < 0 || !condition || !dateAdded || !status) {
    messageDiv.innerHTML = '<div class="alert alert-danger">Please fill in all required fields.</div>';
    return;
  }

  try {
    const submitBtn = document.querySelector('#editCopyModal .btn-primary');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    const copyData = {
      copyID: copyID,
      isbn: isbn,
      bookEdition: edition,
      yearPrinted: year,
      price: price,
      conditions: condition,
      dateAdded: dateAdded + 'T00:00:00',
      copyStatus: status
    };

    const response = await fetch(`${API_BASE_URL}/bookcopy/${copyID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(copyData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update book copy');
    }

    // Success - close modal and refresh
    const modal = bootstrap.Modal.getInstance(document.getElementById('editCopyModal'));
    modal.hide();

    // Refresh the copies list
    await loadBookCopiesPage(isbn);

    alert('Book copy updated successfully!');
  } catch (error) {
    console.error('Error updating copy:', error);
    messageDiv.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message || 'Error updating copy. Please try again.')}</div>`;
  } finally {
    const submitBtn = document.querySelector('#editCopyModal .btn-primary');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Changes';
    }
  }
}

// Delete book copy
window.deleteBookCopy = async function(copyID, isbn) {
  if (!confirm(`Are you sure you want to delete copy #${copyID}? This action cannot be undone.`)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/bookcopy/${copyID}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete book copy');
    }

    // Refresh the copies list
    await loadBookCopiesPage(isbn);

    alert('Book copy deleted successfully!');
  } catch (error) {
    console.error('Error deleting copy:', error);
    alert(`Error deleting copy: ${error.message || 'Please try again.'}`);
  }
};

window.showTotalStockTable = async function() {
  addAdminHeader();
  
  const mainContent = app.querySelector('main');
  mainContent.innerHTML = `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">Total Stock Report</h2>
            <button type="button" class="btn btn-outline-secondary" onclick="showInventoryManagement()">
              Back to Inventory Management
            </button>
          </div>
          <div id="stockTableContainer">
            <div class="text-center">
              <div class="spinner-border text-danger" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Loading stock data...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  await loadStockTable();
};

// Load and display stock table
async function loadStockTable() {
  try {
    // Fetch all data
    const booksResponse = await fetch(`${API_BASE_URL}/books`);
    const books = await booksResponse.json();
    
    const copiesResponse = await fetch(`${API_BASE_URL}/bookcopy`);
    const copies = await copiesResponse.json();

    // Calculate stock statistics
    const stockData = books.map(book => {
      const bookCopies = copies.filter(c => c.isbn === book.isbn);
      const available = bookCopies.filter(c => c.copyStatus === 'In Store' || c.copyStatus === 'Reserved').length;
      const sold = bookCopies.filter(c => c.copyStatus === 'Sold').length;
      const total = bookCopies.length;
      
      return {
        isbn: book.isbn,
        title: book.bookTitle,
        course: book.course,
        major: book.major,
        total: total,
        available: available,
        sold: sold
      };
    });

    // Sort by total stock (descending)
    stockData.sort((a, b) => b.total - a.total);

    // Calculate totals
    const grandTotal = stockData.reduce((sum, book) => sum + book.total, 0);
    const grandAvailable = stockData.reduce((sum, book) => sum + book.available, 0);
    const grandSold = stockData.reduce((sum, book) => sum + book.sold, 0);

    // Display table
    const container = document.getElementById('stockTableContainer');
    container.innerHTML = `
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead class="table-dark">
                <tr>
                  <th>ISBN</th>
                  <th>Title</th>
                  <th>Course</th>
                  <th>Major</th>
                  <th class="text-end">Total Copies</th>
                  <th class="text-end">Available</th>
                  <th class="text-end">Sold</th>
                </tr>
              </thead>
              <tbody>
                ${stockData.map(book => `
                  <tr>
                    <td>${book.isbn}</td>
                    <td>${escapeHtml(book.title)}</td>
                    <td>${escapeHtml(book.course)}</td>
                    <td>${escapeHtml(book.major)}</td>
                    <td class="text-end"><strong>${book.total}</strong></td>
                    <td class="text-end text-success"><strong>${book.available}</strong></td>
                    <td class="text-end text-danger"><strong>${book.sold}</strong></td>
                  </tr>
                `).join('')}
                <tr class="table-info fw-bold">
                  <td colspan="4" class="text-end">TOTAL:</td>
                  <td class="text-end">${grandTotal}</td>
                  <td class="text-end text-success">${grandAvailable}</td>
                  <td class="text-end text-danger">${grandSold}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading stock table:', error);
    const container = document.getElementById('stockTableContainer');
    if (container) {
      container.innerHTML = `
        <div class="alert alert-danger" role="alert">
          Error loading stock data. Please try again later.
        </div>
      `;
    }
  }
}

window.showOrderManagement = function() {
  addAdminHeader();
  const mainContent = app.querySelector('main');
  mainContent.innerHTML = `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <h2 class="mb-4">Order Management</h2>
          <div class="alert alert-info">
            <p class="mb-0">Order management functionality will be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

window.showUserManagement = function() {
  addAdminHeader();
  const mainContent = app.querySelector('main');
  mainContent.innerHTML = `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <h2 class="mb-4">User Management</h2>
          <div class="alert alert-info">
            <p class="mb-0">User management functionality will be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

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


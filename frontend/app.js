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

    const data = await response.json();

    if (response.ok) {
      showMessage(`Registration successful! Welcome, ${data.customerName}. Your Customer ID is: ${data.customerID}`, 'success');
      // Clear form
      document.getElementById('registerForm').reset();
    } else {
      showMessage(data.message || 'Registration failed. Please try again.', 'danger');
    }
  } catch (error) {
    showMessage('Error connecting to server. Please make sure the API is running.', 'danger');
    console.error('Registration error:', error);
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
    const response = await fetch(`${API_BASE_URL}/customers`);
    const customers = await response.json();

    if (response.ok) {
      // Find customer with matching email and password
      const customer = customers.find(c => c.email === email && c.cPassword === password);

      if (customer) {
        // Login successful
        currentUser = customer;
        sessionStorage.setItem('currentUser', JSON.stringify(customer));
        showHomePage();
      } else {
        showLoginMessage('Invalid email or password', 'danger');
      }
    } else {
      showLoginMessage('Error connecting to server', 'danger');
    }
  } catch (error) {
    showLoginMessage('Error connecting to server. Please make sure the API is running.', 'danger');
    console.error('Login error:', error);
  } finally {
    // Restore button state
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  }
}

// Show home page
function showHomePage() {
  // Add header
  addHeader();
  
  const mainContent = app.querySelector('main');
  mainContent.innerHTML = `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <h2 class="mb-4">Welcome to Crimson Bookstore</h2>
          <p class="lead">Browse our collection of textbooks and course materials.</p>
          <div class="row mt-5">
            <div class="col-md-12">
              <h3>Featured Books</h3>
              <p class="text-muted">Book catalog coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

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

// Show home page (global function)
window.showHomePage = function() {
  showHomePage();
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


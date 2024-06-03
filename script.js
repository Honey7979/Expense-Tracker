// Mock authentication for demo purposes
let isAuthenticated = false;
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];

document.getElementById('login-btn').addEventListener('click', login);
document.getElementById('signup-btn').addEventListener('click', signup);
document.getElementById('logout-btn').addEventListener('click', logout);
document.getElementById('add-expense-btn').addEventListener('click', addExpense);
document.getElementById('export-btn').addEventListener('click', exportData);
document.getElementById('show-signup').addEventListener('click', showSignup);
document.getElementById('show-login').addEventListener('click', showLogin);

function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    console.log("Trying to login with email:", email, "and password:", password); // Debug log

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        isAuthenticated = true;
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser)); // Save current user to local storage
        console.log("Login successful for user:", user); // Debug log
        toggleAuthContainers();
        loadUserData(user);
    } else {
        console.log("Login failed for email:", email, "with password:", password); // Debug log
        console.log("Current users list:", users); // Debug log to show all users
        alert('Invalid login credentials');
    }
}

function signup() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (users.find(u => u.email === email)) {
        alert('User already exists');
    } else {
        const newUser = { email, password, expenses: [] };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users)); // Save users to local storage
        console.log("Signup successful for user:", newUser); // Debug log
        console.log("Current users list after signup:", JSON.stringify(users, null, 2)); // Debug log to show all users
        alert('Signup successful. Please login.');
        showLogin();
    }
}

function logout() {
    isAuthenticated = false;
    currentUser = null;
    localStorage.removeItem('currentUser'); // Remove current user from local storage
    toggleAuthContainers();
}

function showSignup() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
}

function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('signup-form').classList.add('hidden');
}

function toggleAuthContainers() {
    document.getElementById('auth-container').classList.toggle('hidden', isAuthenticated);
    document.getElementById('tracker-container').classList.toggle('hidden', !isAuthenticated);
}

function loadUserData(user) {
    expenses = user.expenses;
    displayExpenses();
    updateSummary();
    updateChart();
}

function addExpense() {
    const name = document.getElementById('expense-name').value;
    const amount = document.getElementById('expense-amount').value;
    const category = document.getElementById('expense-category').value;

    if (name === '' || amount === '') {
        alert('Please enter both name and amount');
        return;
    }

    const expense = { name, amount: parseFloat(amount), category };
    currentUser.expenses.push(expense);
    localStorage.setItem('users', JSON.stringify(users)); // Update users in local storage
    loadUserData(currentUser); // Reload user data to update the view
}

function displayExpenses() {
    const expensesList = document.getElementById('expenses-list');
    expensesList.innerHTML = '';
    currentUser.expenses.forEach((expense, index) => {
        const expenseItem = document.createElement('div');
        expenseItem.className = 'expense-item';
        expenseItem.innerHTML = `
            <span>${expense.name} (${expense.category})</span>
            <span>$${expense.amount.toFixed(2)}</span>
            <button onclick="deleteExpense(${index})">X</button>
        `;
        expensesList.appendChild(expenseItem);
    });
}

function updateSummary() {
    const summary = document.getElementById('summary');
    const total = currentUser.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    summary.textContent = `Total Expenses: $${total.toFixed(2)}`;
}

function deleteExpense(index) {
    currentUser.expenses.splice(index, 1);
    localStorage.setItem('users', JSON.stringify(users)); // Update users in local storage
    loadUserData(currentUser); // Reload user data to update the view
}

function exportData() {
    let csvContent = "data:text/csv;charset=utf-8,Name,Amount,Category\n";
    currentUser.expenses.forEach(expense => {
        csvContent += `${expense.name},${expense.amount},${expense.category}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expenses.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function updateChart() {
    const ctx = document.getElementById('expenses-chart').getContext('2d');
    const categories = [...new Set(currentUser.expenses.map(expense => expense.category))];
    const data = categories.map(category => {
        return currentUser.expenses.filter(expense => expense.category === category).reduce((sum, expense) => sum + expense.amount, 0);
    });

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: data,
                backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#66bb6a', '#ffa726', '#ab47bc', '#26a69a'],
            }]
        },
        options: {
            responsive: true
        }
    });
}

// Load current user from local storage if available
window.addEventListener('load', () => {
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (storedUser) {
        const user = users.find(u => u.email === storedUser.email && u.password === storedUser.password);
        if (user) {
            isAuthenticated = true;
            currentUser = user;
            toggleAuthContainers();
            loadUserData(user);
        }
    }
});

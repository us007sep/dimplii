/* =====================================================
   LIBRARY MANAGEMENT SYSTEM
   NIELIT O Level Project
   ===================================================== */

// ---------- DATA STORAGE (localStorage) ----------
let books = JSON.parse(localStorage.getItem('lms_books')) || [];
let members = JSON.parse(localStorage.getItem('lms_members')) || [];
let transactions = JSON.parse(localStorage.getItem('lms_transactions')) || [];
let currentUser = JSON.parse(localStorage.getItem('lms_currentUser')) || null;

const FINE_PER_DAY = 5; // Rs per day for late return
const LOAN_DAYS = 14;

// ---------- INITIALIZE DEFAULT DATA ----------
function initializeData() {
    // Create default admin if not exists
    let admins = JSON.parse(localStorage.getItem('lms_admins')) || [];
    if (admins.length === 0) {
        admins.push({ username: 'admin', password: 'admin123', name: 'Administrator' });
        localStorage.setItem('lms_admins', JSON.stringify(admins));
    }

    // Seed sample books if library is empty
    if (books.length === 0) {
        books = [
            { id: 1, title: 'The Alchemist', author: 'Paulo Coelho', isbn: '978-0062315007', category: 'Fiction', year: 1988, totalCopies: 3, availableCopies: 3 },
            { id: 2, title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', isbn: '978-8173711466', category: 'Biography', year: 1999, totalCopies: 2, availableCopies: 2 },
            { id: 3, title: 'Let Us C', author: 'Yashavant Kanetkar', isbn: '978-8183331630', category: 'Technology', year: 2017, totalCopies: 5, availableCopies: 5 },
            { id: 4, title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '978-0553380163', category: 'Science', year: 1988, totalCopies: 2, availableCopies: 2 },
            { id: 5, title: 'India After Gandhi', author: 'Ramachandra Guha', isbn: '978-0060958589', category: 'History', year: 2007, totalCopies: 2, availableCopies: 2 }
        ];
        localStorage.setItem('lms_books', JSON.stringify(books));
    }
}

// ---------- SAVE TO STORAGE ----------
function saveAll() {
    localStorage.setItem('lms_books', JSON.stringify(books));
    localStorage.setItem('lms_members', JSON.stringify(members));
    localStorage.setItem('lms_transactions', JSON.stringify(transactions));
    if (currentUser) localStorage.setItem('lms_currentUser', JSON.stringify(currentUser));
    else localStorage.removeItem('lms_currentUser');
}

// ---------- TOAST NOTIFICATIONS ----------
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ'}</span><span>${message}</span>`;
    toast.className = 'toast show ' + type;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.className = 'toast'; }, 2800);
}

// ---------- LIVE CLOCK ----------
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: true });
    const date = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const display = `🕐 ${date} | ${time}`;
    const a = document.getElementById('live-clock-admin');
    const m = document.getElementById('live-clock-member');
    if (a) a.textContent = display;
    if (m) m.textContent = display;
}
setInterval(updateClock, 1000);

// ---------- TIME-BASED GREETING ----------
function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    if (h < 21) return 'Good Evening';
    return 'Good Night';
}
function setGreeting() {
    const g = getGreeting();
    const a = document.getElementById('greeting-admin');
    const m = document.getElementById('greeting-member');
    if (a) a.textContent = g;
    if (m) m.textContent = g;
}

// ---------- ANIMATED COUNTER ----------
function animateCounter(el, target, duration = 900) {
    const start = parseInt(el.textContent) || 0;
    const startTime = performance.now();
    function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const value = Math.floor(start + (target - start) * eased);
        el.textContent = value;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
    }
    requestAnimationFrame(tick);
}

// ---------- CONFETTI CELEBRATION ----------
function celebrate() {
    const colors = ['#ec4899', '#f472b6', '#fbcfe8', '#db2777', '#be185d', '#fda4af', '#ffc107'];
    for (let i = 0; i < 40; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random() * 100 + 'vw';
        c.style.background = colors[Math.floor(Math.random() * colors.length)];
        c.style.animationDelay = (Math.random() * 0.5) + 's';
        c.style.animationDuration = (2 + Math.random() * 2) + 's';
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 4000);
    }
}

// ---------- AUTH ----------
function switchAuth(form) {
    document.getElementById('login-form').style.display = form === 'login' ? 'block' : 'none';
    document.getElementById('signup-form').style.display = form === 'signup' ? 'block' : 'none';
}

function signup() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const password = document.getElementById('signup-password').value;

    if (!name || !email || !phone || !password) {
        showToast('Please fill all fields', 'error'); return;
    }
    if (members.find(m => m.email === email)) {
        showToast('Email already registered', 'error'); return;
    }

    const newMember = {
        id: members.length ? Math.max(...members.map(m => m.id)) + 1 : 1,
        name, email, phone, password,
        joinDate: new Date().toISOString().split('T')[0]
    };
    members.push(newMember);
    saveAll();
    celebrate();
    showToast('Registration successful! Please login.', 'success');
    switchAuth('login');
}

function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const role = document.getElementById('login-role').value;

    if (!username || !password) {
        showToast('Enter username and password', 'error'); return;
    }

    if (role === 'admin') {
        const admins = JSON.parse(localStorage.getItem('lms_admins')) || [];
        const admin = admins.find(a => a.username === username && a.password === password);
        if (admin) {
            currentUser = { role: 'admin', name: admin.name, username: admin.username };
            saveAll();
            showToast('Welcome, ' + admin.name, 'success');
            showAdminDashboard();
        } else {
            showToast('Invalid admin credentials', 'error');
        }
    } else {
        const member = members.find(m => (m.email === username || m.name === username) && m.password === password);
        if (member) {
            currentUser = { role: 'member', id: member.id, name: member.name, email: member.email };
            saveAll();
            showToast('Welcome, ' + member.name, 'success');
            showMemberDashboard();
        } else {
            showToast('Invalid member credentials', 'error');
        }
    }
}

function logout() {
    currentUser = null;
    saveAll();
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('auth-page').classList.add('active');
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    showToast('Logged out successfully', 'info');
}

// ---------- DASHBOARDS ----------
function showAdminDashboard() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('admin-page').classList.add('active');
    document.getElementById('admin-name').textContent = currentUser.name;
    setGreeting();
    updateClock();
    showSection('dashboard-section');
    refreshAll();
}

function showMemberDashboard() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('member-page').classList.add('active');
    document.getElementById('member-name').textContent = currentUser.name;
    setGreeting();
    updateClock();
    showSection('m-browse-section');
    renderMemberBooks();
    renderMyBooks();
    renderProfile();
}

function showSection(id) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(id)) {
            link.classList.add('active');
        }
    });

    const titles = {
        'dashboard-section': 'Dashboard',
        'add-book-section': 'Add Book',
        'view-books-section': 'View Books',
        'issue-book-section': 'Issue Book',
        'return-book-section': 'Return Book',
        'members-section': 'Members',
        'transactions-section': 'Transactions',
        'm-browse-section': 'Browse Books',
        'm-my-books-section': 'My Books',
        'm-profile-section': 'My Profile'
    };
    const t = titles[id];
    if (document.getElementById('page-title')) document.getElementById('page-title').textContent = t;
    if (document.getElementById('m-page-title')) document.getElementById('m-page-title').textContent = t;

    if (id === 'dashboard-section') updateStats();
    if (id === 'view-books-section') renderBooks();
    if (id === 'issue-book-section') populateIssueDropdowns();
    if (id === 'return-book-section') renderReturnTable();
    if (id === 'members-section') renderMembers();
    if (id === 'transactions-section') renderTransactions();
}

// ---------- ADMIN: BOOKS ----------
function addBook() {
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const isbn = document.getElementById('book-isbn').value.trim();
    const category = document.getElementById('book-category').value;
    const copies = parseInt(document.getElementById('book-copies').value);
    const year = parseInt(document.getElementById('book-year').value) || new Date().getFullYear();

    if (!title || !author || !isbn || !copies) {
        showToast('Please fill all fields', 'error'); return;
    }

    const newBook = {
        id: books.length ? Math.max(...books.map(b => b.id)) + 1 : 1,
        title, author, isbn, category, year,
        totalCopies: copies,
        availableCopies: copies
    };
    books.push(newBook);
    saveAll();
    showToast('Book added successfully', 'success');

    document.getElementById('book-title').value = '';
    document.getElementById('book-author').value = '';
    document.getElementById('book-isbn').value = '';
    document.getElementById('book-copies').value = 1;
    document.getElementById('book-year').value = '';
    updateStats();
}

function renderBooks() {
    const tbody = document.querySelector('#books-table tbody');
    const search = (document.getElementById('search-books').value || '').toLowerCase();
    tbody.innerHTML = '';
    const filtered = books.filter(b =>
        b.title.toLowerCase().includes(search) ||
        b.author.toLowerCase().includes(search) ||
        b.category.toLowerCase().includes(search)
    );
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#999;padding:20px;">No books found</td></tr>';
        return;
    }
    filtered.forEach(b => {
        tbody.innerHTML += `
            <tr>
                <td>${b.id}</td>
                <td>${b.title}</td>
                <td>${b.author}</td>
                <td>${b.category}</td>
                <td>${b.isbn}</td>
                <td>${b.year}</td>
                <td>${b.totalCopies}</td>
                <td>${b.availableCopies}</td>
                <td><button class="btn-small" onclick="deleteBook(${b.id})">Delete</button></td>
            </tr>`;
    });
}

function deleteBook(id) {
    if (!confirm('Delete this book?')) return;
    const issued = transactions.find(t => t.bookId === id && !t.returnDate);
    if (issued) { showToast('Cannot delete — book is currently issued', 'error'); return; }
    books = books.filter(b => b.id !== id);
    saveAll();
    renderBooks();
    updateStats();
    showToast('Book deleted', 'success');
}

// ---------- ADMIN: ISSUE BOOK ----------
function populateIssueDropdowns() {
    const bookSel = document.getElementById('issue-book-select');
    const memSel = document.getElementById('issue-member-select');

    bookSel.innerHTML = '<option value="">-- Select Book --</option>';
    books.filter(b => b.availableCopies > 0).forEach(b => {
        bookSel.innerHTML += `<option value="${b.id}">${b.title} (Available: ${b.availableCopies})</option>`;
    });

    memSel.innerHTML = '<option value="">-- Select Member --</option>';
    members.forEach(m => {
        memSel.innerHTML += `<option value="${m.id}">${m.name} (${m.email})</option>`;
    });

    const today = new Date();
    const due = new Date();
    due.setDate(today.getDate() + LOAN_DAYS);
    document.getElementById('issue-date').value = today.toISOString().split('T')[0];
    document.getElementById('due-date').value = due.toISOString().split('T')[0];
}

function issueBook() {
    const bookId = parseInt(document.getElementById('issue-book-select').value);
    const memberId = parseInt(document.getElementById('issue-member-select').value);
    const issueDate = document.getElementById('issue-date').value;
    const dueDate = document.getElementById('due-date').value;

    if (!bookId || !memberId || !issueDate || !dueDate) {
        showToast('Please complete all fields', 'error'); return;
    }

    const book = books.find(b => b.id === bookId);
    if (!book || book.availableCopies <= 0) {
        showToast('Book not available', 'error'); return;
    }

    const trans = {
        id: transactions.length ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
        bookId, memberId, issueDate, dueDate,
        returnDate: null, fine: 0
    };
    transactions.push(trans);
    book.availableCopies--;
    saveAll();
    celebrate();
    showToast('Book issued successfully', 'success');
    populateIssueDropdowns();
    updateStats();
}

// ---------- ADMIN: RETURN BOOK ----------
function renderReturnTable() {
    const tbody = document.querySelector('#return-table tbody');
    tbody.innerHTML = '';
    const pending = transactions.filter(t => !t.returnDate);
    if (pending.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;padding:20px;">No pending returns</td></tr>';
        return;
    }
    pending.forEach(t => {
        const book = books.find(b => b.id === t.bookId);
        const member = members.find(m => m.id === t.memberId);
        const fine = calculateFine(t.dueDate);
        tbody.innerHTML += `
            <tr>
                <td>${t.id}</td>
                <td>${book ? book.title : 'N/A'}</td>
                <td>${member ? member.name : 'N/A'}</td>
                <td>${t.issueDate}</td>
                <td>${t.dueDate}</td>
                <td>${fine > 0 ? 'Rs ' + fine : '-'}</td>
                <td><button class="btn-issue" onclick="returnBook(${t.id})">Return</button></td>
            </tr>`;
    });
}

function calculateFine(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff * FINE_PER_DAY : 0;
}

function returnBook(transId) {
    const t = transactions.find(x => x.id === transId);
    if (!t) return;
    const fine = calculateFine(t.dueDate);
    t.returnDate = new Date().toISOString().split('T')[0];
    t.fine = fine;
    const book = books.find(b => b.id === t.bookId);
    if (book) book.availableCopies++;
    saveAll();
    showToast(fine > 0 ? `Book returned. Fine: Rs ${fine}` : 'Book returned successfully', 'success');
    renderReturnTable();
    updateStats();
}

// ---------- ADMIN: MEMBERS ----------
function renderMembers() {
    const tbody = document.querySelector('#members-table tbody');
    tbody.innerHTML = '';
    if (members.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:20px;">No members registered</td></tr>';
        return;
    }
    members.forEach(m => {
        tbody.innerHTML += `
            <tr>
                <td>${m.id}</td>
                <td>${m.name}</td>
                <td>${m.email}</td>
                <td>${m.phone}</td>
                <td>${m.joinDate}</td>
                <td><button class="btn-small" onclick="deleteMember(${m.id})">Delete</button></td>
            </tr>`;
    });
}

function deleteMember(id) {
    if (!confirm('Delete this member?')) return;
    const pending = transactions.find(t => t.memberId === id && !t.returnDate);
    if (pending) { showToast('Member has pending books', 'error'); return; }
    members = members.filter(m => m.id !== id);
    saveAll();
    renderMembers();
    updateStats();
    showToast('Member removed', 'success');
}

// ---------- ADMIN: TRANSACTIONS ----------
function renderTransactions() {
    const tbody = document.querySelector('#transactions-table tbody');
    tbody.innerHTML = '';
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#999;padding:20px;">No transactions yet</td></tr>';
        return;
    }
    transactions.slice().reverse().forEach(t => {
        const book = books.find(b => b.id === t.bookId);
        const member = members.find(m => m.id === t.memberId);
        const status = t.returnDate
            ? '<span class="badge badge-returned">Returned</span>'
            : (calculateFine(t.dueDate) > 0
                ? '<span class="badge badge-overdue">Overdue</span>'
                : '<span class="badge badge-issued">Issued</span>');
        tbody.innerHTML += `
            <tr>
                <td>${t.id}</td>
                <td>${book ? book.title : 'N/A'}</td>
                <td>${member ? member.name : 'N/A'}</td>
                <td>${t.issueDate}</td>
                <td>${t.dueDate}</td>
                <td>${t.returnDate || '-'}</td>
                <td>${t.fine > 0 ? 'Rs ' + t.fine : '-'}</td>
                <td>${status}</td>
            </tr>`;
    });
}

// ---------- STATS ----------
function updateStats() {
    animateCounter(document.getElementById('total-books'), books.reduce((sum, b) => sum + b.totalCopies, 0));
    animateCounter(document.getElementById('available-books'), books.reduce((sum, b) => sum + b.availableCopies, 0));
    animateCounter(document.getElementById('issued-books-count'), transactions.filter(t => !t.returnDate).length);
    animateCounter(document.getElementById('total-members'), members.length);

    const tbody = document.querySelector('#recent-transactions tbody');
    tbody.innerHTML = '';
    const recent = transactions.slice(-5).reverse();
    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:20px;">No transactions yet</td></tr>';
        return;
    }
    recent.forEach(t => {
        const book = books.find(b => b.id === t.bookId);
        const member = members.find(m => m.id === t.memberId);
        const status = t.returnDate
            ? '<span class="badge badge-returned">Returned</span>'
            : (calculateFine(t.dueDate) > 0
                ? '<span class="badge badge-overdue">Overdue</span>'
                : '<span class="badge badge-issued">Issued</span>');
        tbody.innerHTML += `
            <tr>
                <td>${book ? book.title : 'N/A'}</td>
                <td>${member ? member.name : 'N/A'}</td>
                <td>${t.issueDate}</td>
                <td>${t.dueDate}</td>
                <td>${status}</td>
            </tr>`;
    });
}

function refreshAll() {
    updateStats();
}

// ---------- MEMBER: BROWSE ----------
function renderMemberBooks() {
    const grid = document.getElementById('member-books-grid');
    const search = (document.getElementById('m-search-books').value || '').toLowerCase();
    grid.innerHTML = '';
    const filtered = books.filter(b =>
        b.title.toLowerCase().includes(search) ||
        b.author.toLowerCase().includes(search) ||
        b.category.toLowerCase().includes(search)
    );
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="color:#999;">No books found.</p>';
        return;
    }
    filtered.forEach(b => {
        const availClass = b.availableCopies > 0 ? 'available' : 'unavailable';
        const availText = b.availableCopies > 0 ? `Available: ${b.availableCopies}/${b.totalCopies}` : 'Not Available';
        grid.innerHTML += `
            <div class="book-card">
                <span class="cat-tag">${b.category}</span>
                <h4>${b.title}</h4>
                <p>by ${b.author}</p>
                <p>Year: ${b.year}</p>
                <p>ISBN: ${b.isbn}</p>
                <p class="availability ${availClass}">${availText}</p>
            </div>`;
    });
}

// ---------- MEMBER: MY BOOKS ----------
function renderMyBooks() {
    const tbody = document.querySelector('#my-books-table tbody');
    tbody.innerHTML = '';
    if (!currentUser || currentUser.role !== 'member') return;
    const my = transactions.filter(t => t.memberId === currentUser.id);
    if (my.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;padding:20px;">You have not borrowed any books yet</td></tr>';
        return;
    }
    my.slice().reverse().forEach(t => {
        const book = books.find(b => b.id === t.bookId);
        const fine = t.returnDate ? t.fine : calculateFine(t.dueDate);
        const status = t.returnDate
            ? '<span class="badge badge-returned">Returned</span>'
            : (fine > 0
                ? '<span class="badge badge-overdue">Overdue</span>'
                : '<span class="badge badge-issued">Issued</span>');
        tbody.innerHTML += `
            <tr>
                <td>${book ? book.title : 'N/A'}</td>
                <td>${book ? book.author : 'N/A'}</td>
                <td>${t.issueDate}</td>
                <td>${t.dueDate}</td>
                <td>${t.returnDate || '-'}</td>
                <td>${fine > 0 ? 'Rs ' + fine : '-'}</td>
                <td>${status}</td>
            </tr>`;
    });
}

// ---------- MEMBER: PROFILE ----------
function renderProfile() {
    if (!currentUser || currentUser.role !== 'member') return;
    const m = members.find(x => x.id === currentUser.id);
    if (!m) return;
    const issuedCount = transactions.filter(t => t.memberId === m.id && !t.returnDate).length;
    const initials = m.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    document.getElementById('profile-details').innerHTML = `
        <div class="profile-avatar">${initials}</div>
        <p><strong>Name:</strong> ${m.name}</p>
        <p><strong>Email:</strong> ${m.email}</p>
        <p><strong>Phone:</strong> ${m.phone}</p>
        <p><strong>Member ID:</strong> ${m.id}</p>
        <p><strong>Join Date:</strong> ${m.joinDate}</p>
        <p><strong>Books Currently Borrowed:</strong> ${issuedCount}</p>
    `;
}

// ---------- INITIALIZE ON PAGE LOAD ----------
window.onload = function() {
    initializeData();
    if (currentUser) {
        if (currentUser.role === 'admin') showAdminDashboard();
        else showMemberDashboard();
    } else {
        document.getElementById('auth-page').classList.add('active');
    }
};

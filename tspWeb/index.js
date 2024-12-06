const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path'); // Import path module
const router = express.Router();

const app = express();
const port = 3000;

// Sample users (In production, this would come from a database)
const users = [
    {
        username: 'admin',
        password: bcrypt.hashSync('password123', 10),
        role: 'admin'
    },
    {
        username: 'user1',
        password: bcrypt.hashSync('userpassword', 10),
        role: 'authorizedUser'
    }
];



// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Explicitly set views path
app.use(express.static('public'));
// Serve static files from 'styles' and 'assets'
app.use(express.static(path.join(__dirname, 'styles')));
app.use(express.static(path.join(__dirname, 'assets')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/styles', express.static(path.join(__dirname, 'styles'))); // to use the CSS files
app.use('/assets', express.static(path.join(__dirname, 'assets')));// to use the assets folder





// Configure session
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true
}));


app.get('/api/stats', (req, res) => {
    // Replace these values with actual data
    const stats = {
        vestsMade: 120,
        donatedAmount: 5000
    };
    res.json(stats);  // Send data as JSON response
});







// Root Route
app.get('/', (req, res) => {
    res.render('public/welcome', { user: req.session.user || {}, currentPage: 'home' });
});




// // Routes for other pages that are publicly accessible
// Route for request an event page
app.get('/event-request', (req, res) => {
    res.render('public/eventRequest', { currentPage: 'eventRequest' });
});

// Route for past events page
app.get('/past-events', (req, res) => {
    res.render('public/pastEvents', { currentPage: 'pastEvents' });
});

// Route for volunteer staff recruitment page
app.get('/join-us', (req, res) => {
    res.render('public/joinUs', { currentPage: 'joinUs' });
});

// Route for contact us page
app.get('/contact-us', (req, res) => {
    res.render('public/contactUs', { currentPage: 'contactUs' });
});





// // Security Routes
// Route to display login page
app.get('/login', (req, res) => {
    // Render login page and pass any error message
    res.render('auth/login', { error: req.session.error || null });
    req.session.error = null;  // Clear the error after rendering
});

// Middleware for checking if the user is an admin
function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    } else {
        return res.status(403).send('Forbidden');
    }
}

// Handle login logic and set error in session (example)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if username and password match any user (this could come from a database)
    const user = users.find(u => u.username === username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        req.session.error = 'Invalid credentials. Please try again.';
        return res.redirect('/login');
    }

    req.session.user = user;  // Store user data in session
    res.redirect('/dashboard');
});




// // Routes for pages secured by admin access only
// Admin Dashboard route
app.get('/dashboard', isAdmin, (req, res) => {
    res.render('admin/adminDashboard', { user: req.session.user || {} });
});

/// Admin routes for managing users
app.get('/manage-users', isAdmin, (req, res) => {
    // The users array should be fetched from your database in a real app
    const userList = [
        { id: 1, username: 'admin', role: 'admin' },
        { id: 2, username: 'user1', role: 'authorizedUser' },
    ];

    res.render('admin/manageUsers', { user: req.session.user, users: userList });
});

// Route for deleting a user
app.get('/delete-user/:id', isAdmin, (req, res) => {
    const userId = req.params.id;
    // Delete the user by ID from the database (or mock the delete operation)
    // For now, just redirect back to manage users
    res.redirect('/manage-users');
});




// Admin routes for creating users
app.get('/create-users', isAdmin, (req, res) => {
    res.render('admin/createUsers', { user: req.session.user });
});

app.post('/create-users', isAdmin, (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Here you would insert the new user into your database.
    // For now, we are adding them to the users array:
    users.push({ username, password: hashedPassword, role });

    res.redirect('/manage-users'); // Redirect to manage users after creation
});

// Route to check if the username exists
router.get('/check-username', async (req, res) => {
    const { username } = req.query;
  
    try {
      const result = await db.query('SELECT COUNT(*) FROM users WHERE username = $1', [username]);
      const usernameTaken = result.rows[0].count > 0;
  
      res.json({ exists: usernameTaken });
    } catch (err) {
      console.error('Error checking username availability:', err);
      res.status(500).json({ exists: false });
    }
  });
  
  // Your other routes, like for creating users
  router.post('/create-users', async (req, res) => {
    // Your logic for creating a new user
  });
  
  module.exports = router;




// Admin routes for managing events
app.get('/manage-events', isAdmin, (req, res) => {
    // Render the manage events page
    res.render('admin/manageEvents', { user: req.session.user });
});



// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Could not log out. Please try again later.');
        }
        res.redirect('/login'); // Redirect to login page after logout
    });
});




// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
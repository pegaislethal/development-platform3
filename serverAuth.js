const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

const users = [
    {
        "username": 'admin',
        "password": 'admin123',
        "role": 'admin'
    },
    {
        "username": 'user',
        "password": 'user123',
        "role": 'user'
    }
];

// Function to generate JWT token
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
}

// Middleware to verify JWT token and extract user information
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token==null) return res.sendStatus(401)

    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if(err) return res.sendStatus(403)
        req.user = user
    next();
    })
}

// Login endpoint to generate JWT token
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        const accessToken = generateAccessToken({ username: user.username, role: user.role });
        res.json({ accessToken });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
});

// Dummy protected endpoint accessible only by admin
app.get('/admin-panel', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    res.json({ message: 'Admin-only endpoint accessed successfully' });
});

// Dummy protected endpoint accessible by both admin and user
app.get('/user/login', authenticateToken, (req, res) => {
    res.json({ message: 'User data endpoint accessed successfully', user: req.user });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

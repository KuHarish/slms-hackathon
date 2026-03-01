const http = require('http');

// First login to get a token
function loginAndTest() {
  const reqData = JSON.stringify({
    email: 'james.carter@university.edu', // from our mockData adminUser
    password: 'securepassword' // this won't work perfectly since the backend might not have this populated from frontend mock, we need to register an admin first
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(reqData)
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        if (parsed.token) {
          testAddBook(parsed.token);
        } else {
            console.error("Login failed, needed to create admin in backend.", parsed);
            createAdminAndTest();
        }
      } catch (e) {
          console.error(e);
      }
    });
  });

  req.on('error', (e) => console.error(e));
  req.write(reqData);
  req.end();
}

function createAdminAndTest() {
  const adminData = JSON.stringify({
    name: 'Admin Test',
    email: 'admin.book.test@example.com',
    password: 'password123'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(adminData)
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
         // Registered successfully, but we need to elevate role in DB directly then login.
         // Let's do a direct DB call to update role, then login
         const mongoose = require("mongoose");
         require("dotenv").config();
         mongoose.connect(process.env.MONGO_URI).then(async () => {
             const User = require("./models/User");
             await User.updateOne({ email: 'admin.book.test@example.com'}, { role: 'admin'});
             console.log("Admin elevated. Logging in...");
             
             // Now Login
             const loginData = JSON.stringify({
                email: 'admin.book.test@example.com',
                password: 'password123'
              });
             const loginOptions = { ...options, path: '/login' };
             
             const loginReq = http.request(loginOptions, (loginRes) => {
                let loginBody = '';
                loginRes.on('data', chunk => loginBody += chunk);
                loginRes.on('end', () => {
                    const parsed = JSON.parse(loginBody);
                    if(parsed.token) testAddBook(parsed.token);
                    mongoose.disconnect();
                });
             });
             loginReq.write(loginData);
             loginReq.end();
         });
    });
  });

  req.on('error', (e) => console.error(e));
  req.write(adminData);
  req.end();
}


function testAddBook(token) {
  const bookData = JSON.stringify({
        title: "Test Book Automation",
        author: "Agent",
        isbn: "978-0000000000",
        totalCopies: 5,
        publishedYear: 2026,
        category: "technology"
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/books',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': Buffer.byteLength(bookData)
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('Add Book Response Code:', res.statusCode);
      try {
        console.log('Add Book Body:', JSON.parse(body));
      } catch (e) {
        console.log('Add Book Body:', body);
      }
    });
  });

  req.on('error', (e) => console.error(e));
  req.write(bookData);
  req.end();
}

loginAndTest();

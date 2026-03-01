const http = require('http');

function makeRequest(path, data, callback) {
  const reqData = JSON.stringify(data);
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
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
        callback(null, res.statusCode, JSON.parse(body));
      } catch (e) {
        callback(null, res.statusCode, body);
      }
    });
  });

  req.on('error', (e) => callback(e));
  req.write(reqData);
  req.end();
}

makeRequest('/register', {
  name: 'Test Setup User',
  email: 'test_setup_auth@example.com',
  password: 'securepassword'
}, (err, status, body) => {
  if (err) return console.error("Register Error:", err);
  console.log("Register Response:", status, body);

  makeRequest('/login', {
    email: 'test_setup_auth@example.com',
    password: 'securepassword'
  }, (err, status, body) => {
    if (err) return console.error("Login Error:", err);
    console.log("Login Response:", status, body);
  });
});

const http = require('http');

const loginData = JSON.stringify({
  email: 'krishna@gmail.com',
  password: 'radhakrishna'
});

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/v1/users/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Login Status:', res.statusCode);
    console.log('Login Body:', data);
    const cookies = res.headers['set-cookie'];
    if (cookies) {
      console.log('Cookies received');
      const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
      
      const videoOptions = {
        hostname: 'localhost',
        port: 8000,
        path: '/api/v1/videos',
        method: 'GET',
        headers: {
          'Cookie': cookieHeader
        }
      };
      
      const vReq = http.request(videoOptions, (vRes) => {
        let vData = '';
        vRes.on('data', chunk => vData += chunk);
        vRes.on('end', () => {
          console.log('Videos Status:', vRes.statusCode);
          console.log('Videos Body:', vData.substring(0, 500) + '...');
        });
      });
      vReq.end();
    } else {
        console.log("No cookies received");
    }
  });
});

req.on('error', error => console.error(error));
req.write(loginData);
req.end();

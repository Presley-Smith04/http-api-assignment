const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT =process.env.PORT || process.env.NODE_PORT || 3000; 

//function to format responses as JSON or XML
const getResponse = (status, message, id = null, accept) => {
    if (accept === 'application/xml') {
        //xml response format
        let xmlResponse = `<response><message>${message}</message>`;
        if (id) xmlResponse += `<id>${id}</id>`;
        xmlResponse += `</response>`;
        return xmlResponse;
    }
    //default to JSON response
    return JSON.stringify(id ? { message, id } : { message });
};

//create the HTTP server
const server = http.createServer((req, res) => {
    const { url, headers } = req;
    
    //figure out if the client wants JSON or XML
    const accept = headers.accept.includes('application/xml') ? 'application/xml' : 'application/json';

    //serve the client-side HTML file
    if (url === '/') {
        fs.readFile(path.join(`${__dirname}/../client/client.html`), (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
        return;
    }

    //serve the CSS file
    if (url === '/styles.css') {
        fs.readFile(path.join(`${__dirname}/../client/style.css`), (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.end(data);
            }
        });
        return;
    }

    //default response values
    let status = 200;
    let message = 'Success';
    let id = null;

    ///badRequest (expects ?valid=true)
    if (url.startsWith('/badRequest')) {
        const valid = new URLSearchParams(url.split('?')[1]).get('valid');
        if (valid !== 'true') {
            status = 400;
            message = 'Bad Request';
            id = 'badRequest';
        }
    }
    ///unauthorized (expects ?loggedIn=yes)
    else if (url.startsWith('/unauthorized')) {
        const loggedIn = new URLSearchParams(url.split('?')[1]).get('loggedIn');
        if (loggedIn !== 'yes') {
            status = 401;
            message = 'Unauthorized';
            id = 'unauthorized';
        }
    }
    ///forbidden
    else if (url === '/forbidden') {
        status = 403;
        message = 'Forbidden';
        id = 'forbidden';
    }
    ///internal (server error simulation)
    else if (url === '/internal') {
        status = 500;
        message = 'Internal Server Error';
        id = 'internal';
    }
    ///notImplemented
    else if (url === '/notImplemented') {
        status = 501;
        message = 'Not Implemented';
        id = 'notImplemented';
    }
    //anything else = 404 Not Found
    else {
        status = 404;
        message = 'Not Found';
        id = 'notFound';
    }

    //get the response in the requested format (JSON/XML)
    const responseText = getResponse(status, message, id, accept);
    console.log(responseText);

    //send response back
    res.writeHead(status, { 'Content-Type': accept });
    res.end(responseText);
});

//start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

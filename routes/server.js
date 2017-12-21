const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3030;
// const api = require('./backend/routes');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/*', (request, response) => {
    response.sendFile(__dirname + '/public/index.html'); // For React/Redux
});


// app.use('/api', api);
console.log('URL is:', process.env.URL);
app.listen(PORT, error => {
    error
    ? console.error(error)
    : console.info(`==> 🌎 Listening on port ${PORT}. Visit localhost:${PORT}/ in your browser.`);
});

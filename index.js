const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('./public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.listen('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
	res.end();
});

app.listen(port, () => {
	console.log(`running on port ${port}`)
});
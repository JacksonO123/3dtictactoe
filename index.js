const express = require('express');
const app = express();
const fs = require('fs');
const port = 3000;

app.use(express.static('./public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res) => {
	res.end(fs.readFileSync('putlic/index.html'));
});

app.listen(port, () => {
	console.log(`running on port ${port}`)
});

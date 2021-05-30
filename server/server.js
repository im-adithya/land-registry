const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGOURI;
console.log(uri);
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false });

const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
})

const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const propertiesRouter = require('./routes/properties');

app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/properties', propertiesRouter);

/*app.use(express.static('../land-registry/build'))

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '../land-registry/build/index.html'), function (err) {
        if (err) {
            res.status(500).send(err)
        }
    })
})*/

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

const express = require('express');

const bodyParser = require('body-parser');
const cors = require('cors')
const admin = require('firebase-admin');

require('dotenv').config();


var serviceAccount = require("./burj-al-arabe-firebase-adminsdk-c611f-972dc82478.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://burj-al-arabe.firebaseio.com"
});


const pass = 'ArabianHorse79';
const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = 4000;
app.get('/', (req, res) => {
    res.send('Hello world');
})


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xsirj.mongodb.net/burjAlArabe?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookings = client.db("burjAlArabe").collection("bookings");
    console.log('db connection successfully!');

    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        console.log(newBooking)
    })

    app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            admin.auth().verifyIdToken(idToken)
                .then(function (decodedToken) {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    if (tokenEmail == queryEmail) {
                        bookings.find({ email: queryEmail })
                            .toArray((err, documents) => {
                                res.status(200).send(documents)
                            })
                    }
                    else{
                        res.status(401).send('unauthorized access');
                    }
                }).catch(function (error) {
                    // Handle error
                });
        }
        else{
            res.status(401).send('unauthorized access')
        }


    })

});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
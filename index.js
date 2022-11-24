const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
const app = express();
const port = process.env.Port || 5000;

//middleware
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b9snwll.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {

        const usersCollection = client.db('assignment').collection('users');
        const categoryName = client.db('assignment').collection('categoryName');
        const categoryDetailsCollection = client.db('assignment').collection('category');
        const bookingsCollection = client.db('assignment').collection('bookings');

        // --------------------------------------------

        app.post('/users', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);

        })

        //get category name

        app.get('/categoryName', async (req, res) => {
            const query = {};
            const cursor = await categoryName.find(query).toArray();
            res.send(cursor);
        })

        //onnek gula category ase kin2 ami jei category te dhukbo oi categoryr jnish porto dekhabe

        app.get('/category', async (req, res) => {
            let query = {};
            if (req.query.category_id) {
                console.log(req.query.category_id);
                query = {
                    category_id: req.query.category_id
                }
            }
            const cursor = await categoryDetailsCollection.find(query).toArray()
            // const review = await cursor.toArray();
            res.send(cursor)

        })


        //bookings
        app.post('/booking', async (req, res) => {
            const bookings = req.body;
            const result = await bookingsCollection.insertOne(bookings);
            res.send(result)
        })


    }
    finally {

    }

}
run().catch(console.log.dir)




app.use('/', (req, res) => {
    res.send('assignment12');
})

app.listen(port, () => {
    console.log(`server is running ${port}`);
})
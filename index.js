const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
const stripe = require("stripe")(process.env.STRIPE_KEY);
const port = process.env.Port || 5000;

const app = express();


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
        const paymentsCollection = client.db('assignment').collection('payments');
        const advertiseCollection = client.db('assignment').collection('advertise');

        // --------------------------------------------

        app.post('/users', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);

        })

        // app.get('/users', async (req, res) => {
        //     const query = {};
        //     const cursor = await usersCollection.find(query).toArray();
        //     res.send(cursor);
        // })

        //user seller  admin

        app.get('/users', async (req, res) => {
            let query = {}
            if (req.query.accountType) {
                query = {
                    accountType: req.query.accountType
                }
            }
            const cursor = await usersCollection.find(query).toArray();
            res.send(cursor);
        })

        //finding admin user seller

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({
                isSeller: user?.accountType === "seller",
                isAdmin: user?.accountType === "admin",
                isUser: user?.accountType === "user",


            });
        })

        //deleting  all buyers all sellers

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const cursor = await usersCollection.deleteOne(filter);
            res.send(cursor);
        })

        //verifying sellers
        app.put('/users/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    verified: true,
                }
            }
            const updatedResult = await usersCollection.updateOne(filter, updatedDoc)
            res.send(updatedResult);
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
            if (req.query.email) {
                // console.log(req.query.category_id);
                query = {
                    email: req.query.email
                }
            }

            if (req.query.category_id) {
                query = {
                    category_id: req.query.category_id
                }
            }

            const cursor = await categoryDetailsCollection.find(query).toArray()
            res.send(cursor)

        })

        //add products

        app.post('/category', async (req, res) => {
            const products = req.body;
            const result = await categoryDetailsCollection.insertOne(products);
            res.send(result);
        })

        app.delete('/category/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const cursor = await categoryDetailsCollection.deleteOne(filter);
            res.send(cursor);
        })


        //verify sellers
        app.put('/users/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    verified: true,
                }
            }
            const updatedResult = await usersCollection.updateOne(filter, updatedDoc)
            res.send(updatedResult);
        })

        // advertise
        app.put('/category/:id', async (req, res) => {
            // const payment = req.body;
            // const result = await paymentsCollection.insertOne(payment);
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    advertise: true,
                }
            }
            const updatedResult = await categoryDetailsCollection.updateOne(filter, updatedDoc)
            res.send(updatedResult);
        })




        // //ami ekta seller amr email diye jeigula produt add korsi oigula dekhabe shudhu
        // app.get('/category', async (req, res) => {
        //     let query = {};
        //     if (req.query.category_id) {
        //         // console.log(req.query.category_id);
        //         query = {
        //             category_id: req.query.category_id
        //         }
        //     }
        //     const cursor = await categoryDetailsCollection.find(query).toArray()
        //     res.send(cursor)

        // })


        //bookings
        app.post('/booking', async (req, res) => {
            const bookings = req.body;
            const result = await bookingsCollection.insertOne(bookings);
            res.send(result)
        })

        //amr email er shob bookings pabo
        app.get('/booking', async (req, res) => {
            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = await bookingsCollection.find(query).toArray();
            res.send(cursor);
        })

        app.get('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const booking = await bookingsCollection.findOne(query);
            res.send(booking);
        })

        //payment
        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.resalePrice;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            // && payment.categoryId
            //categoryDetailsCollection
            const id = payment.bookingId
            const filter = { _id: ObjectId(id) }
            const d = await bookingsCollection.findOne(filter)
            // console.log("247", d);

            const filter2 = { _id: ObjectId(d.categoryId) }
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await (bookingsCollection).updateOne(filter, updatedDoc)
            const updatedResult2 = await (categoryDetailsCollection).updateOne(filter2, updatedDoc)

            // console.log(updatedResult, updatedResult2);
            res.send(result);
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
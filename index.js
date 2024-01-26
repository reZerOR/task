const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

// ready made middleware
app.use(cors());
app.use(express.json());


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    // add database function here
    const UserCollection = client.db("endgametaskManagementApp").collection("user");
    const TasksCollection = client.db("endgametaskManagementApp").collection("tasks");


// user api

app.post("/user",async(req,res)=>{
  const user=req.body;
  console.log(user)
    const query={email:user.email}
    const existingUser=await UserCollection.findOne(query)
    if(existingUser){
      return res.send({message:"user already exists",insertedId:null})
    }
    const result=await UserCollection.insertOne(user)
    console.log(result)
    res.send(result)
})
app.get("/user",async(req,res)=>{
    const result=await UserCollection.find().toArray();
    console.log(result)
    res.send(result)
})

// Create Task API
app.post("/create-task",async(req,res)=>{
  const task=req.body;
    const result=await TasksCollection.insertOne(task)
    console.log(result)
    res.send(result)
})

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// root api
app.get("/", (req, res) => {
  res.send("Taskflow server is have running");
});



// where the server port is
app.listen(port, () => {
  console.log(`Taskflow is running on port: ${port}`);
});

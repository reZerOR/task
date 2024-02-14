const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { sendInvitation } = require("./emailService");
const {
  generateUniqueToken,
  validateAndExtractEmailFromToken,
} = require("./generateUniqueToken");
require("dotenv").config();

const app = express();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

// ready made middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

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
    const UserCollection = client
      .db("endgametaskManagementApp")
      .collection("user");
    const TaskCollection = client
      .db("endgametaskManagementApp")
      .collection("task");

    const CommentCollection = client
      .db("endgametaskManagementApp")
      .collection("comment");

    const BoardCollection = client
      .db("endgametaskManagementApp")
      .collection("board");

    // user api

    app.post("/user", async (req, res) => {
      const user = req.body;
      console.log(user);
      const query = { email: user.email };
      const existingUser = await UserCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await UserCollection.insertOne(user);
      console.log(result);
      res.send(result);
    });
    app.get("/user", async (req, res) => {
      const result = await UserCollection.find().toArray();
      console.log(result);
      res.send(result);
    });

    // add task
    app.post("/addtask", async (req, res) => {
      const task = req.body;
      const result = await TaskCollection.insertOne(task);
      res.send(result);
    });
    // get Task
    app.get("/addtask", async (req, res) => {
      const result = await TaskCollection.find().toArray();
      res.send(result);
    });

    // get single task
    app.get("/task/:id", async (req, res) => {
      const taskId = req.params.id;
      const query = { _id: taskId };
      const task = await TaskCollection.findOne(query);
      res.send(task);
    });

    // user added task
    app.get("/userAddedtask", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await TaskCollection.find(query).toArray();
      res.send(result);
    });

    // delete
    app.delete("/deletetask/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      console.log("deleted id", query);
      const result = await TaskCollection.deleteOne(query);
      res.send(result);
    });

    // update task

    app.get("/updatetask/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await TaskCollection.findOne(query);
      console.log("update", result);
      res.send(result);
    });

    app.patch("/updatetask/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {
        _id: new ObjectId(id),
      };
      const item = req.body;
      const updatedItem = {
        $set: {
          title: item.title,
          description: item.description,
          visibility: item.visibility,
        },
      };
      const result = await TaskCollection.updateOne(filter, updatedItem);
      res.send(result);
    });

    // update task status
    app.patch("/updateTaskStatus/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;

      const filter = {
        _id: new ObjectId(id),
      };

      const update = {
        $set: {
          status: status,
        },
      };

      const result = await TaskCollection.updateOne(filter, update);
      console.log(result);
      res.send(result);
    });

    // // Create Task API
    // app.post("/create-task",async(req,res)=>{
    //   const task=req.body;
    //     const result=await TasksCollection.insertOne(task)
    //     console.log(result)
    //     res.send(result)
    // })
    // app.get("/all-task",async(req,res)=>{
    //     const result=await TasksCollection.find().toArray();
    //     res.send(result)
    // })

    //get logged in user info

    app.get("/currentUserInfo/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);

      const query = {
        email: email,
      };

      const result = await UserCollection.findOne(query);
      if (result) {
        res.send(result);
      } else {
        res.send({});
      }
    });

    // update user profile info

    app.put("/updateUserInfo/:email", async (req, res) => {
      const email = req.params.email;
      const userInfo = req.body;
      console.log(userInfo, "gotted");
      console.log(email);

      const query = {
        email: email,
      };

      const updateDoc = {
        $set: {
          displayName: userInfo?.userName,
        },
      };

      if (userInfo.userImage) {
        updateDoc.$set.photoURL = userInfo.userImage;
      }

      const result = await UserCollection.updateOne(query, updateDoc);

      res.send(result);
    });

    app.patch("/userProfile/removePhoto/:id", async (req, res) => {
      const userId = req.params.id;
      console.log(userId, "got");
      const query = {
        _id: new ObjectId(userId),
      };
      const updateDoc = {
        $set: {
          photoURL: "",
        },
      };
      const result = await UserCollection.updateOne(query, updateDoc);

      res.send(result);
    });
    // add comment====================================================
    app.post("/comment", async (req, res) => {
      const comment = req.body;
      console.log(comment);
      const result = await CommentCollection.insertOne(comment);
      res.send(result);
    });

    // get comment ==================================================
    app.get("/comment", async (req, res) => {
      const result = await CommentCollection.find().toArray();
      res.send(result);
    });

    // email invitation
    // app.post('/send-invitation', (req, res) => {
    //   const { email } = req.body;

    //   const invitationLink = `https://taskflow.com/accept-invitation?token=${generateUniqueToken()}`;

    //   sendInvitation(email, invitationLink);

    //   // Respond to the client
    //   res.json({ message: 'Invitation sent successfully!' });
    // });

    // create board
    app.post("/createBoard", async (req, res) => {
      const board = req.body;
      const result = await BoardCollection.insertOne(board);
      res.send(result);
    });

    app.get("/getBoard/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email: email };
        const result = await BoardCollection.find(query).toArray();

        console.log(result);
        res.send(result);
      } catch (error) {
        console.error("Error fetching board:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    app.get("/singleboard/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await BoardCollection.findOne(query);
      console.log("update", result);
      res.send(result);
    });

    app.post("/send-invitation/:boardId", async (req, res) => {
      const { from, to } = req.body;
      const boardId=req.params.boardId;

      console.log(boardId, "from send invi");

      try {
        // Generate a unique token
        const token = generateUniqueToken();

        // Include the token in the invitation link
        const invitationLink = `http://localhost:5173/accept-invitation/${boardId}/${token}`;


        // Send the invitation with the generated token
        sendInvitation(from, to, invitationLink);

        // Respond to the client
        res.json({ message: "Invitation sent successfully!", token });
      } catch (error) {
        console.error("Error sending invitation:", error);
        res.status(500).json({ error: "Error sending invitation" });
      }
    });

    // app.get("/accept-invitation", async (req, res) => {
    //   try {
    //     const { token, boardId } = req.query;
    //     console.log("token", token);
    //     console.log("boardid frm accept invi", boardId);
    //     // Validate the token and extract the user's email
    //     // const userEmail = validateAndExtractEmailFromToken(token);

    //     // Perform any necessary operations (e.g., update user status)
    //     // For example, you might update the user's status in the database
    //     // const result = await updateUserStatus(userEmail, 'accepted');

    //     // Optionally, you can redirect the user to a success page
    //     // res.render("MailAcceptINvitation");

    //     // Alternatively, you can send a JSON response indicating success
    //     // res.json({ message: 'Invitation accepted successfully!' });
    //   } catch (error) {
    //     console.error("Error accepting invitation:", error);
    //     // Handle the error, e.g., redirect to an error page or send an error response
    //     res.status(500).json({ error: "Error accepting invitation" });
    //   }
    // });

    app.patch("/addMember/:boardId/:email", async(req,res)=>{
      const boardId= req.params.boardId;
      const email= req.params.email;

      console.log(boardId, email, "frommmmmmmmmmmmmmmmmm adsadas");

      const query={
        _id: new ObjectId(boardId)
      }

      const board = await BoardCollection.findOne(query);

      if (!board) {
          return res.status(404).send("Board not found");
      }

      let teamMemberArray = [];
      if (board.teamMember) {
          // If teamMember is already a string, convert it into an array
          if(board.teamMember.includes(email)){
            console.log("already email exists")
            return;
          }
          else{
            teamMemberArray = [...board.teamMember,email];
          }
         
      }
      else{
        teamMemberArray.push(email); // Add new email to the array
      }
  
      
  
      const updateDoc = {
          $set: { teamMember: teamMemberArray } // Set teamMember as the new array
      };

      const result= await BoardCollection.updateOne(query,updateDoc);
      res.send(result);

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

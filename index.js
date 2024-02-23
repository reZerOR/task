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
    const FileCollection = client
      .db("endgametaskManagementApp")
      .collection("file");

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
    app.get("/comment/:taskId", async (req, res) => {
   
      const id = req.params.taskId;
      const query = { taskId: id };
      const result = await CommentCollection.find(query).toArray();
      res.send(result);
    });
 
    // create board
    app.post("/createBoard", async (req, res) => {
      const board = req.body;
      const result = await BoardCollection.insertOne(board);
      res.send(result);
    });

    app.get("/getBoard/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = {
          $or: [
            { email: email },
            { teamMember: { $elemMatch: { $eq: email } } }
          ]
        };
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


    app.get("/currentUserMail/:email", async(req,res)=>{
      const email=req.params.email;

      const query={
        email: email
      }

      let isAdmin= false;

      const result= await BoardCollection.find(query).toArray();
      console.log(result, "result from isAdminnnn")

      if(result.length > 0){
        isAdmin=true;
        res.send({isAdmin})
      }
      else{
        
        res.send({isAdmin})
      }



    })



   // Due Date 
   app.patch('/dueDate/:id', async (req, res) => {
    try {
      const taskId = req.params.id;
      const dueDate = req.body.dueDate;
      console.log('Task ID:', taskId);
      console.log('Due Date:', dueDate);
      
      // Update the due date of the task in the database
      const filter = { _id: new ObjectId(taskId) };
      const update = { $set: { dueDate: dueDate } };
      const result = await TaskCollection.updateOne(filter, update);
      
      console.log('Update Result:', result);
      res.send(result);
    } catch (err) {
      console.error('Error updating due date:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

  // add task into the individual board 
  app.patch("/addTaskToBoard/:boardId", async (req, res) => {
    const boardId = req.params.boardId;
    const task = req.body;

    console.log(boardId, task, "from add task into the individual board");

    const query = {
        _id: new ObjectId(boardId)
    };

    const board = await BoardCollection.findOne(query);

    if (!board) {
        return res.status(404).send("Board not found");
    }

    // Ensure each task has a unique ID
    const taskId = new ObjectId();
    const taskWithId = { ...task, _id: taskId };

    let taskArray = [];
    if (board.tasks) {
        // If tasks array already exists, add the new task to it
        taskArray = [...board.tasks, taskWithId];
    } else {
        // If tasks array doesn't exist, create a new array with the task
        taskArray.push(taskWithId);
    }

    const updateDoc = {
        $set: { tasks: taskArray }
    };

    const result = await BoardCollection.updateOne(query, updateDoc);
    res.send(result);
});

// get task from individual board
app.get('/boards/:boardId/tasks', async (req, res) => {
 
    const boardId = req.params.boardId;
    const query = {
      _id: new ObjectId(boardId)
  };
    // Find the board by ID
    const board = await BoardCollection.findOne(query);
// Extract and send tasks
    const tasks = board.tasks || [];
    res.json({ tasks })
    // .send(tasks);
 
});

// get task id from board
app.get("/boardtask/:id", async (req, res) => {

  const taskId = req.params.id;
  
  // Find the task by ID
  const task = await BoardCollection.findOne({ "tasks._id": taskId });

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Extract the specific task based on the ID
  const specificTask = task.tasks.find(t => t._id.toString() === taskId);

  if (!specificTask) {
    return res.status(404).json({ error: 'Specific task not found' });
  }

  res.send(specificTask);

});

// delete task from the board
// app.delete("/deletetaskFromBoard/:id", async (req, res) => {
//   const taskId = req.params.id;
//   console.log("deleted id from board", taskId);
//   // Find the task by ID
//   const task = await BoardCollection.findOne({ "tasks._id": taskId });

//   if (!task) {
//     return res.status(404).json({ error: 'Task not found' });
//   }

//   // Extract the specific task based on the ID
//   const specificTask = task.tasks.find(t => t._id.toString() === taskId);
//   console.log("deleted id from board", specificTask);
//   const result = await BoardCollection.deleteOne(specificTask);

//   res.send(result);
// });
app.delete("/deletetaskFromBoard/:id", async (req, res) => {
  const taskId = req.params.id;
  console.log("from delete task from board",taskId)
 
    // Update the board document to pull the task with the given ID
    const query = { "tasks._id": new ObjectId(taskId) };
    console.log("Query:", query);
    
    const result = await BoardCollection.updateOne(
      query,
      { $pull: { tasks: { _id: new ObjectId(taskId) } } }
    );
 console.log("from delete task from board",result)
    if (result.nModified > 0) {
      res.status(200).json({ message: 'Task deleted successfully' });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
res.send(result)
});

// update task status in the board
app.patch("/updateStatusInBoard/:id", async (req, res) => {
  const id = req.params.id;
  const status = req.body.status;

  const filter = {
    "tasks._id": new ObjectId(id),
  };

  const update = {
    $set: {
      "tasks.$.status": status,
    },
  };

    const result = await BoardCollection.updateOne(filter, update);
console.log("from update status from board",result)
  res.send(result)
});


 // update task in the board

 app.get("/updatetaskInTheBoard/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const query = {"tasks._id": new ObjectId(id) };
  const result = await BoardCollection.findOne(query);
  console.log("update", result);
  res.send(result);
});

    app.patch("/updatetaskInTheBoard/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {
        "tasks._id": new ObjectId(id),
      };
      const item = req.body;
      const updatedItem = {
        $set: {
          "tasks.$.title": item.title,
          "tasks.$.description": item.description,
          "tasks.$.visibility": item.visibility,
        },
      };
      const result = await BoardCollection.updateOne(filter, updatedItem);
      res.send(result);
    });

    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;

      const amount = parseInt(price * 100);

      console.log(price, amount);


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

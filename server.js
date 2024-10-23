const mongoose = require('mongoose');
const Document = require('./Document');
const Comment = require('./Comments');
const User = require('./Users');
const { v4: uuidv4 } = require('uuid');

// const redis = require('redis');

// // Redis
// const redisClient = redis.createClient()

//   async function initRedis() {
//     try {
//       await redisClient.connect();
//       console.log('Redis client connected');
//     } catch (error) {
//       console.error('Error connecting to Redis:', error);
//     }
//   }
  
//   initRedis();


// MongoDB
mongoose.connect('mongodb://localhost:27017/docs');


const io = require('socket.io')(3001, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {

    socket.on('get-document', async (documentId) => {
        const document = await Document.findById(documentId);
        data =""
        namaNote = "Document";
        if (document) {
            data = document.data;
            namaNote = document.name;
        }
        socket.join(documentId);
        socket.emit('load-document', data, namaNote);        
    });

    socket.on('send-changes', (documentId, delta) => {
        socket.broadcast.to(documentId).emit('receive-changes', delta);
    });

    socket.on('save-document', async (documentId, name, owner, data) => {
        if (data != ''){
            const document = await Document.findById(documentId);
            if ((!document.write_access || document.write_access.length === 0) && (!document.read_access || document.read_access.length === 0)){ 
                await Document.findByIdAndUpdate(documentId, { 
                    name, 
                    owner, 
                    data, 
                    write_access: [], 
                    read_access: [] 
                });
            } else {
                await Document.findByIdAndUpdate(documentId, { 
                    name, 
                    owner, 
                    data 
                });
            }
        }
    });
});

async function findOrCreateDocument(id) {
    if (id == null) return;
    const document = await Document.findById(id);
    if (document) return document;
    return await Document.create({ _id: id, data: '' });
}

const express = require('express');
const app = express();
const cors = require("cors");
const e = require('express');
console.log("App listen at port 5000");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, resp) => {
    resp.send("App is Working");
});

// app.get('/set250', async (req, res) => {
//     await redisClient.set('mykey', '250', redis.print);
//     res.send('Key set');
// });

// app.get('/get250', async (req, res) => {
//     const value = await redisClient.get('mykey');
//     res.send(value);
// });


app.get("/api/notes", async (req, resp) => {
    const documents = await Document.find();
    resp.json(documents);
});

app.post('/api/notes/delete', async (req, res) => {
    console.log(req.body); 
    const notesId = req.body.id;

    await Document.deleteOne({ _id: notesId }).then(() => {
        res.send({
            message: 'Note was deleted',
        });
    }).catch((err) => {
        res.status(500).send({
            message: 'Error deleting note',
            error: err.message,
        });
    });
});

app.post('/api/notes/edit', async (req, res) => {
    const notesId = req.body.id;
    const notesName = req.body.name;

    await Document.findByIdAndUpdate(notesId, { name: notesName }).then((result) => {
        if (!result) {
            return res.status(404).send({
                message: 'Document not found',
            });
        }

        res.send({
            message: 'Note was edited',
        });
    }).catch((err) => {
        res.status(500).send({
            message: 'Error editing note',
            error: err.message,
        });
    });
});

app.post('/api/notes/getNoteById', async (req, res) => {
    const notesId = req.body.id;

    await Document.findById(notesId).then((result) => {
        if (!result) {
            return res.status(404).send({
                message: 'Document not found',
            });
        }
        res.send({
            message: 'Note was found',
            note: result,
        });
    }).catch((err) => {
        res.status(500).send({
            message: 'Error finding note',
            error: err.message,
        });
    });
});

app.post('/api/notes/addWriteAccess', async (req, res) => {
    const notesId = req.body.id;
    const email = req.body.email;

    await Document
        .findByIdAndUpdate(notesId, { $push: { write_access: email } })
        .then((result) => {
            if (!result) {
                return res.status(404).send({
                    message: 'Document not found',
                });
            }
            res.send({
                message: 'Write access was added',
            });
        }).catch((err) => {
            res.status(500).send({
                message: 'Error adding write access',
                error: err.message,
            });
        });
});

app.post('/api/notes/removeWriteAccess', async (req, res) => {
    const notesId = req.body.id;
    const email = req.body.email;

    await Document
        .findByIdAndUpdate(notesId, { $pull: { write_access: email } })
        .then((result) => {
            if (!result) {
                return res.status(404).send({
                    message: 'Document not found',
                });
            }
            res.send({
                message: 'Write access was removed',
            });
        }).catch((err) => {
            res.status(500).send({
                message: 'Error removing write access',
                error: err.message,
            });
        });
});



app.post('/api/notes/addReadAccess', async (req, res) => {
    const notesId = req.body.id;
    const email = req.body.email;

    await Document
        .findByIdAndUpdate(notesId, { $push: { read_access: email } })
        .then((result) => {
            console.log(result);
            if (!result) {
                return res.status(404).send({
                    message: 'Document not found',
                });
            }  
            res.send({
                message: 'Read access was added',
            });
        }).catch((err) => {
            res.status(500).send({
                message: 'Error adding read access',
                error: err.message,
            });
        });
});

app.post('/api/notes/removeReadAccess', async (req, res) => {
    const notesId = req.body.id;
    const email = req.body.email;

    await Document
        .findByIdAndUpdate(notesId, { $pull: { read_access: email } })
        .then((result) => {
            if (!result) {
                return res.status(404).send({
                    message: 'Document not found',
                });
            }
            res.send({
                message: 'Read access was removed',
            });
        }).catch((err) => {
            res.status(500).send({
                message: 'Error removing read access',
                error: err.message,
            });
        });
});

app.post('/api/notes/changePublicAccess', async (req, res) => {
    const notesId = req.body.id;
    const access = req.body.access;

    await Document
    .findByIdAndUpdate(notesId, { public_access: access })
    .then((result) => {
        if (!result) {
            return res.status(404).send({
                message: 'Document not found',
            });
        }
        res.send({
            message: 'Public access was added',
        });
    })
    .catch((err) => {
        res.status(500).send({
            message: 'Error adding public access',
            error: err.message,
        });
    });
});

app.post('/api/notes/changePublicPermission', async (req, res) => {
    const notesId = req.body.id;
    const permission = req.body.public_permission;

    await Document
    .findByIdAndUpdate(notesId, { public_permission: permission })
    .then((result) => {
        if (!result) {
            return res.status(404).send({
                message: 'Document not found',
            });
        }
        res.send({
            message: 'Public permission was added',
        });
    })
    .catch((err) => {
        res.status(500).send({
            message: 'Error adding public permission',
            error: err.message,
        });
    });
});

app.post('/api/comments/add', async (req, res) => {

    try{
        const { document_id, owner, comment } = req.body;
        const _id = uuidv4();
        const newComment = { _id, document_id, owner, comment };
        const makeComment = await Comment.create(newComment);   
        res.status(201).send(makeComment);
    }
    catch (error) {
        res.status(400).send(error);
    }
    
});

app.get('/api/comments/get', async (req, res) => {
    try {
        const comments = await Comment.find();
        res.status(200).send(comments);
    } catch (error) {
        res
        .status(400).send(error);
    }
});


app.post('/api/users/add', async (req, res) => {
    try {
        const { name, password, email, major, token } = req.body;
        const user = await User.findOne({ email: email });

        if (user) {
            res.status(400).send({ message: "User already exists" });
            return;
        }

        const _id = uuidv4();
        const newUser = { _id, name, password, email, major, token };
        const makeUser = await User.create(newUser);
        res.status(200).send(makeUser);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.post('/api/users/getByEmail', async (req, res) => {
    try {
        const email = req.body.email;
        const user = await User.findOne({ email:
            email });
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

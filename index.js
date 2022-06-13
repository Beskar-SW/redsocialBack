import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { MongoClient } from "mongodb";
import cors from "cors";
import "dotenv/config";

import { encrypt, decrypt } from "./encryptar.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use('/fotos', express.static('public/UsuariosFotos'));
app.use(cors());
const server = createServer(app);
const io = new Server(server);

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
    res.status(200).json({
        message: "Server is running"
    });
})

app.post("/login/:login", cors(), (req, res) => {

    const login = req.params.login;

    if (login === "login") {
        const user = req.body.username;
        const password = req.body.password;

        client.connect(err => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            } else {
                const collection = client.db(process.env.DB).collection("Usuarios");

                collection.findOne({ nombre: user }, (err, result) => {
                    if (result) {
                        if (decrypt(result['contraseña']) === `"${password}"`) {
                            res.status(200).json({
                                success: true,
                                message: "Login correcto",
                            });
                        } else {
                            res.status(200).json({
                                success: false,
                                message: "Login incorrecto",
                            });
                        }
                    }
                    else {
                        res.status(401).json({
                            "success": false,
                        });
                    }
                });
            }
        });

    } else if (login === "signup") {
        const user = req.body.username;
        const password = req.body.password;
        const email = req.body.email;

        client.connect(err => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            } else {
                const collection = client.db(process.env.DB).collection("Usuarios");
                //revisar si ya existe el usuario
                collection.findOne({ nombre: user }, (err, result) => {
                    if (result) {
                        res.status(200).json({
                            success: false,
                            message: "El usuario ya existe",
                        });
                    }
                    else {
                        //crear usuario
                        collection.insertOne({ nombre: user, contraseña: encrypt(password), correo: email, foto: "predeterminada.jpg", eliminado: false }, (err, result) => {
                            if (err) {
                                console.error(err);
                                res.sendStatus(500);
                            } else {
                                res.status(200).json({
                                    "success": true,
                                });
                            }
                        });
                    }
                })
            }

        })
    }
});

server.listen(process.env.PORT || 3001, () => {
    console.log(`Server is running on port ${process.env.PORT || 3001}`);
})
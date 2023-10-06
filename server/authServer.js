import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import { User } from "./models.js";

import Users from "./Users.js";

const app = express();


app.use(cors());
app.use(bodyParser.json());



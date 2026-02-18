import dotenv from "dotenv";
import express from "express";
import router from "./routes/lipanampesa.js";
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use('/api', router)


app.listen(PORT, () => 
  console.log(`Server running on port ${PORT}`));

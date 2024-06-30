const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });
const app = require("./app");

async function connectToMongoDB() {
  try {
    const mongoDB = await mongoose.connect(process.env.MONGO_CONNECT_URI, {});
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
}
connectToMongoDB();

const port = process.env.PORT || 8001;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

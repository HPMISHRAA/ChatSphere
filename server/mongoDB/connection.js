import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

const mongoDBConnect = async () => {
  try {
    let dbUrl = process.env.URL || process.env.MONGO_URL;
    
    // Use in-memory DB for testing or if no URL is provided
    if (!dbUrl || dbUrl === 'test') {
      mongoServer = await MongoMemoryServer.create();
      dbUrl = mongoServer.getUri();
      console.log("Using In-Memory MongoDB for testing");
    }

    await mongoose.connect(dbUrl, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("MongoDB - Connected");
  } catch (error) {
    console.log("Error - MongoDB Connection " + error);
  }
};

export default mongoDBConnect;

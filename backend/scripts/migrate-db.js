require("dotenv").config();
const { MongoClient } = require("mongodb");

async function runMigration() {
  const oldUri = process.env.MONGO_URI;
  if (!oldUri) {
    console.error("No MONGO_URI found in .env");
    process.exit(1);
  }

  // Construct new URI by appending slms_db if not already there
  // Old URI might be: mongodb://.../?ssl=true
  let newUri;
  if (oldUri.includes("?")) {
    newUri = oldUri.replace("?", "slms_db?");
  } else {
    newUri = oldUri.endsWith("/") ? `${oldUri}slms_db` : `${oldUri}/slms_db`;
  }

  console.log("Old URI:", oldUri);
  console.log("New URI:", newUri);

  const client = new MongoClient(oldUri);

  try {
    await client.connect();
    console.log("Connected successfully to server");

    // "test" is the default database if none is specified
    const oldDb = client.db("test");
    const newDb = client.db("slms_db");

    const collectionsToMigrate = [
      "users",
      "books",
      "transactions",
      "reviews",
      "notifications",
    ];

    for (const collName of collectionsToMigrate) {
      console.log(`\nMigrating collection: ${collName}`);
      const oldColl = oldDb.collection(collName);
      const newColl = newDb.collection(collName);

      // Fetch all docs
      const docs = await oldColl.find({}).toArray();
      console.log(`Found ${docs.length} documents in old ${collName}.`);

      if (docs.length > 0) {
        // Clear destination to ensure clean migration
        await newColl.deleteMany({});
        console.log(`Cleared existing documents in new ${collName} (if any).`);

        // Insert docs
        await newColl.insertMany(docs);
        console.log(`Successfully inserted ${docs.length} documents into new ${collName}.`);
      } else {
        console.log(`No documents to migrate for ${collName}.`);
      }
    }

    console.log("\nMigration completed successfully.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

runMigration();

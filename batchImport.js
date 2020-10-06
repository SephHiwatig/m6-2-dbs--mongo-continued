const { MongoClient } = require("mongodb");
const assert = require("assert");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const seats = {};
const row = ["A", "B", "C", "D", "E", "F", "G", "H"];
for (let r = 0; r < row.length; r++) {
  for (let s = 1; s < 13; s++) {
    seats[`${row[r]}-${s}`] = {
      price: 225,
      isBooked: false,
    };
  }
}

const batchImport = async () => {
  const seatArray = [];
  const keys = Object.keys(seats);
  keys.forEach((key) => {
    seatArray.push({
      _id: key,
      price: seats[key].price,
      isBooked: seats[key].isBooked,
    });
  });

  const client = await MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("ticket");
    const r = await db.collection("seats").insertMany(seatArray);
    assert.equal(seatArray.length, r.insertedCount);
  } catch (err) {
    console.log(err.stack);
  } finally {
    client.close();
  }
};

batchImport();

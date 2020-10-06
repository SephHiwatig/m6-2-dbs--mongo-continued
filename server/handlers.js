"use strict";
require("dotenv").config();
const { MONGO_URI } = process.env;
const { MongoClient } = require("mongodb");

let state;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const getSeats = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options);

  await client.connect();

  const db = client.db("ticket");

  const seats = await db.collection("seats").find().toArray();

  client.close();

  const seatObj = {};
  seats.forEach((seat) => {
    seatObj[seat._id] = {
      price: seat.price,
      isBooked: seat.isBooked,
    };
  });

  return res.json({
    seats: seatObj,
    numOfRows: 8,
    seatsPerRow: 12,
  });
};

const bookSeat = async (req, res) => {
  console.log(req.body);
  const { seatId, creditCard, expiration, fullName, email } = req.body;

  const client = await MongoClient(MONGO_URI, options);

  await client.connect();

  const db = client.db("ticket");

  const seat = await db.collection("seats").findOne({ _id: seatId });

  if (seat.isBooked) {
    client.close();
    return res.status(400).json({
      message: "This seat has already been booked!",
    });
  }

  if (!creditCard || !expiration) {
    client.close();
    return res.status(400).json({
      status: 400,
      message: "Please provide credit card information!",
    });
  }

  await db
    .collection("seats")
    .updateOne(
      { _id: seatId },
      { $set: { isBooked: true, bookedBy: fullName, email } },
      (err, result) => {
        if (err) {
          res.status(500).json({
            message:
              "An unknown error has occurred. Please try your request again.",
          });
        } else {
          res.status(200).json({
            status: 200,
            success: true,
          });
        }
        client.close();
      }
    );
};

module.exports = { getSeats, bookSeat };

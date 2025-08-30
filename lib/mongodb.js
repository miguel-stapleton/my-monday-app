import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) throw new Error("Missing MONGODB_URI");
if (!dbName) throw new Error("Missing MONGODB_DB");

let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export async function connectToDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { dbName }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

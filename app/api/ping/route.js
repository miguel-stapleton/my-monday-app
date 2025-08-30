import { connectToDB } from "@/lib/mongodb";
import Note from "@/models/Note";

export async function GET() {
  await connectToDB();
  await Note.create({ title: "hello", body: "world" });
  return Response.json({ ok: true });
}

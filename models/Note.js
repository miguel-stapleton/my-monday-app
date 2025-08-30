import mongoose from "mongoose";
const NoteSchema = new mongoose.Schema({ title: String, body: String }, { timestamps: true });
export default mongoose.models.Note || mongoose.model("Note", NoteSchema);

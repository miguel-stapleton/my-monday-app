import mongoose from "mongoose";

const FormConfigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  config: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      required: true
    },
    recordNamePrefix: {
      type: String,
      required: true
    },
    hairstylists: [{
      type: String
    }],
    makeupArtists: [{
      type: String
    }]
  }
}, { 
  timestamps: true 
});

export default mongoose.models.FormConfig || mongoose.model("FormConfig", FormConfigSchema);

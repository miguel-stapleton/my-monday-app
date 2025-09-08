import mongoose from "mongoose";

interface IFormConfig {
  name: string;
  config: {
    title: string;
    subtitle: string;
    recordNamePrefix: string;
    hairstylists: string[];
    makeupArtists: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

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

export default mongoose.models.FormConfig || mongoose.model<IFormConfig>("FormConfig", FormConfigSchema);

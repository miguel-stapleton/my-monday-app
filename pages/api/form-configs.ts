import type { NextApiRequest, NextApiResponse } from 'next'
import mongoose from 'mongoose'

interface FormConfigData {
  title: string
  subtitle: string
  recordNamePrefix: string
  hairstylists: string[]
  makeupArtists: string[]
}

interface SavedConfig {
  name: string
  config: FormConfigData
  createdAt: string
  updatedAt: string
}

type Data = {
  message?: string
  error?: string
  configs?: SavedConfig[]
  config?: SavedConfig
  details?: string
}

// Define schema inline for Vercel compatibility
const formConfigSchema = new mongoose.Schema({
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
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log(`[form-configs] ${req.method} request received`)
  
  // Set CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // Direct MongoDB connection for Vercel
    const mongoUri = process.env.MONGODB_URI
    const mongoDb = process.env.MONGODB_DB

    if (!mongoUri || !mongoDb) {
      console.error('[form-configs] Missing MongoDB environment variables')
      return res.status(500).json({ error: 'MongoDB configuration missing' })
    }

    console.log('[form-configs] Connecting to MongoDB directly...')
    
    // Use direct mongoose connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoUri, { dbName: mongoDb })
    }
    
    console.log('[form-configs] MongoDB connected successfully')

    // Get or create model inline
    const FormConfig = mongoose.models.FormConfig || mongoose.model('FormConfig', formConfigSchema)

    switch (req.method) {
      case 'GET':
        try {
          console.log('[form-configs] Fetching configurations from database...')
          const configs = await FormConfig.find({}).sort({ updatedAt: -1 })
          console.log(`[form-configs] Found ${configs.length} configurations`)
          const formattedConfigs = configs.map((config: any) => ({
            name: config.name,
            config: config.config,
            createdAt: config.createdAt.toISOString(),
            updatedAt: config.updatedAt.toISOString()
          }))
          return res.status(200).json({ configs: formattedConfigs })
        } catch (error: any) {
          console.error('[form-configs] Error fetching configs:', error)
          return res.status(500).json({ error: `Failed to fetch configurations: ${error.message || 'Unknown error'}` })
        }

      case 'POST':
        const { name, config, overwrite = false } = req.body

        console.log('[form-configs] POST request received:', { name, hasConfig: !!config, overwrite })

        if (!name || !config) {
          console.error('[form-configs] Missing required fields:', { name: !!name, config: !!config })
          return res.status(400).json({ error: 'Name and config are required' })
        }

        try {
          console.log('[form-configs] Checking for existing configuration...')
          const existingConfig = await FormConfig.findOne({ name })

          console.log('[form-configs] Existing config check:', { 
            existingConfig: !!existingConfig, 
            overwrite 
          })

          if (existingConfig && !overwrite) {
            console.log('[form-configs] Configuration name already exists, returning 409')
            return res.status(409).json({ error: 'Configuration name already exists' })
          }

          let savedConfig
          if (existingConfig && overwrite) {
            console.log('[form-configs] Updating existing configuration:', name)
            existingConfig.config = config
            savedConfig = await existingConfig.save()
          } else {
            console.log('[form-configs] Creating new configuration:', name)
            savedConfig = await FormConfig.create({ name, config })
          }

          console.log('[form-configs] Configuration saved successfully:', name)
          return res.status(200).json({ 
            message: 'Configuration saved successfully', 
            config: {
              name: savedConfig.name,
              config: savedConfig.config,
              createdAt: savedConfig.createdAt.toISOString(),
              updatedAt: savedConfig.updatedAt.toISOString()
            }
          })
        } catch (error: any) {
          console.error('[form-configs] Failed to save configuration:', error)
          if (error instanceof Error && 'code' in error && error.code === 11000) {
            return res.status(409).json({ error: 'Configuration name already exists' })
          }
          return res.status(500).json({ 
            error: `Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}` 
          })
        }

      case 'DELETE':
        const { name: deleteName } = req.query

        if (!deleteName || typeof deleteName !== 'string') {
          return res.status(400).json({ error: 'Configuration name is required' })
        }

        try {
          console.log('[form-configs] Deleting configuration:', deleteName)
          const deletedConfig = await FormConfig.findOneAndDelete({ name: deleteName })

          if (!deletedConfig) {
            return res.status(404).json({ error: 'Configuration not found' })
          }

          console.log('[form-configs] Configuration deleted successfully:', deleteName)
          return res.status(200).json({ message: 'Configuration deleted successfully' })
        } catch (error: any) {
          console.error('[form-configs] Failed to delete configuration:', error)
          return res.status(500).json({ error: `Failed to delete configuration: ${error.message || 'Unknown error'}` })
        }

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error: any) {
    console.error('[form-configs] Critical MongoDB error:', error)
    return res.status(500).json({ 
      error: `MongoDB connection failed: ${error.message || 'Unknown error'}`,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

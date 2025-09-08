import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDB } from '../../lib/mongodb'
import FormConfig from '../../models/FormConfig'

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log(`[form-configs] ${req.method} request received`)
  console.log(`[form-configs] Request URL: ${req.url}`)
  console.log(`[form-configs] Headers:`, req.headers)
  
  // Set CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    console.log('[form-configs] Attempting to connect to MongoDB...')
    await connectToDB()
    console.log('[form-configs] MongoDB connection successful')

    switch (req.method) {
      case 'GET':
        try {
          console.log('[form-configs] Fetching configurations from database...')
          const configs = await FormConfig.find({}).sort({ updatedAt: -1 })
          console.log(`[form-configs] Found ${configs.length} configurations`)
          const formattedConfigs = configs.map(config => ({
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
    console.error('[form-configs] Database connection error:', error)
    console.error('[form-configs] Error details:', {
      message: error.message,
      stack: error.stack,
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
      mongoDb: process.env.MONGODB_DB ? 'Set' : 'Not set'
    })
    return res.status(500).json({ 
      error: `Database connection failed: ${error.message || 'Unknown error'}`,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

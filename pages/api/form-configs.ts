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
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    await connectToDB()

    switch (req.method) {
      case 'GET':
        try {
          const configs = await FormConfig.find({}).sort({ updatedAt: -1 })
          const formattedConfigs = configs.map(config => ({
            name: config.name,
            config: config.config,
            createdAt: config.createdAt.toISOString(),
            updatedAt: config.updatedAt.toISOString()
          }))
          return res.status(200).json({ configs: formattedConfigs })
        } catch (error) {
          console.error('Error fetching configs:', error)
          return res.status(500).json({ error: 'Failed to fetch configurations' })
        }

      case 'POST':
        const { name, config, overwrite = false } = req.body

        console.log('POST request received:', { name, hasConfig: !!config, overwrite })

        if (!name || !config) {
          console.error('Missing required fields:', { name: !!name, config: !!config })
          return res.status(400).json({ error: 'Name and config are required' })
        }

        try {
          const existingConfig = await FormConfig.findOne({ name })

          console.log('Existing config check:', { 
            existingConfig: !!existingConfig, 
            overwrite 
          })

          if (existingConfig && !overwrite) {
            console.log('Configuration name already exists, returning 409')
            return res.status(409).json({ error: 'Configuration name already exists' })
          }

          let savedConfig
          if (existingConfig && overwrite) {
            console.log('Updating existing configuration:', name)
            existingConfig.config = config
            savedConfig = await existingConfig.save()
          } else {
            console.log('Creating new configuration:', name)
            savedConfig = await FormConfig.create({ name, config })
          }

          console.log('Configuration saved successfully:', name)
          return res.status(200).json({ 
            message: 'Configuration saved successfully', 
            config: {
              name: savedConfig.name,
              config: savedConfig.config,
              createdAt: savedConfig.createdAt.toISOString(),
              updatedAt: savedConfig.updatedAt.toISOString()
            }
          })
        } catch (error) {
          console.error('Failed to save configuration:', error)
          if (error.code === 11000) {
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
          const deletedConfig = await FormConfig.findOneAndDelete({ name: deleteName })

          if (!deletedConfig) {
            return res.status(404).json({ error: 'Configuration not found' })
          }

          return res.status(200).json({ message: 'Configuration deleted successfully' })
        } catch (error) {
          console.error('Failed to delete configuration:', error)
          return res.status(500).json({ error: 'Failed to delete configuration' })
        }

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Database connection error:', error)
    return res.status(500).json({ error: 'Database connection failed' })
  }
}

import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

interface FormConfig {
  title: string
  subtitle: string
  recordNamePrefix: string
  hairstylists: string[]
  makeupArtists: string[]
}

interface SavedConfig {
  name: string
  config: FormConfig
  createdAt: string
  updatedAt: string
}

type Data = {
  message?: string
  error?: string
  configs?: SavedConfig[]
  config?: SavedConfig
}

const CONFIGS_FILE = path.join(process.cwd(), 'data', 'form-configs.json')

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(CONFIGS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Load all configurations
const loadConfigs = (): SavedConfig[] => {
  try {
    ensureDataDir()
    if (fs.existsSync(CONFIGS_FILE)) {
      const data = fs.readFileSync(CONFIGS_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error loading configs:', error)
    return []
  }
}

// Save all configurations
const saveConfigs = (configs: SavedConfig[]) => {
  try {
    ensureDataDir()
    fs.writeFileSync(CONFIGS_FILE, JSON.stringify(configs, null, 2))
  } catch (error) {
    console.error('Error saving configs:', error)
    throw new Error('Failed to save configurations')
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    switch (req.method) {
      case 'GET':
        // Get all configurations
        const configs = loadConfigs()
        return res.status(200).json({ configs })

      case 'POST':
        // Save a new configuration
        const { name, config, overwrite = false } = req.body

        if (!name || !config) {
          return res.status(400).json({ error: 'Name and config are required' })
        }

        const existingConfigs = loadConfigs()
        const existingIndex = existingConfigs.findIndex(c => c.name === name)

        if (existingIndex >= 0 && !overwrite) {
          return res.status(409).json({ error: 'Configuration name already exists' })
        }

        const savedConfig: SavedConfig = {
          name,
          config,
          createdAt: existingIndex >= 0 ? existingConfigs[existingIndex].createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        if (existingIndex >= 0) {
          existingConfigs[existingIndex] = savedConfig
        } else {
          existingConfigs.push(savedConfig)
        }

        saveConfigs(existingConfigs)
        return res.status(200).json({ 
          message: 'Configuration saved successfully', 
          config: savedConfig 
        })

      case 'DELETE':
        // Delete a configuration
        const { name: deleteName } = req.query

        if (!deleteName || typeof deleteName !== 'string') {
          return res.status(400).json({ error: 'Configuration name is required' })
        }

        const allConfigs = loadConfigs()
        const filteredConfigs = allConfigs.filter(c => c.name !== deleteName)

        if (filteredConfigs.length === allConfigs.length) {
          return res.status(404).json({ error: 'Configuration not found' })
        }

        saveConfigs(filteredConfigs)
        return res.status(200).json({ message: 'Configuration deleted successfully' })

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Form configs API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

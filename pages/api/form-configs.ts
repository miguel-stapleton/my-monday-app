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
    console.log('Attempting to save configs:', configs.length, 'configurations')
    fs.writeFileSync(CONFIGS_FILE, JSON.stringify(configs, null, 2))
    console.log('Successfully saved configs to:', CONFIGS_FILE)
  } catch (error) {
    console.error('Error saving configs:', error)
    console.error('Configs file path:', CONFIGS_FILE)
    console.error('Configs data:', JSON.stringify(configs, null, 2))
    throw new Error(`Failed to save configurations: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
        // Test file system access first
        try {
          const testFile = path.join(process.cwd(), 'data', 'test-write.json')
          ensureDataDir()
          fs.writeFileSync(testFile, JSON.stringify({ test: true }))
          fs.unlinkSync(testFile) // Clean up test file
          console.log('File system write test: SUCCESS')
        } catch (testError) {
          console.error('File system write test: FAILED', testError)
          return res.status(500).json({ error: `File system access error: ${testError instanceof Error ? testError.message : 'Unknown error'}` })
        }

        // Save a new configuration
        const { name, config, overwrite = false } = req.body

        console.log('POST request received:', { name, hasConfig: !!config, overwrite })

        if (!name || !config) {
          console.error('Missing required fields:', { name: !!name, config: !!config })
          return res.status(400).json({ error: 'Name and config are required' })
        }

        const existingConfigs = loadConfigs()
        const existingIndex = existingConfigs.findIndex(c => c.name === name)

        console.log('Existing configs check:', { 
          totalConfigs: existingConfigs.length, 
          existingIndex, 
          overwrite 
        })

        if (existingIndex >= 0 && !overwrite) {
          console.log('Configuration name already exists, returning 409')
          return res.status(409).json({ error: 'Configuration name already exists' })
        }

        const savedConfig: SavedConfig = {
          name,
          config,
          createdAt: existingIndex >= 0 ? existingConfigs[existingIndex].createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        if (existingIndex >= 0) {
          console.log('Updating existing configuration at index:', existingIndex)
          existingConfigs[existingIndex] = savedConfig
        } else {
          console.log('Adding new configuration')
          existingConfigs.push(savedConfig)
        }

        try {
          saveConfigs(existingConfigs)
          console.log('Configuration saved successfully:', name)
          return res.status(200).json({ 
            message: 'Configuration saved successfully', 
            config: savedConfig 
          })
        } catch (saveError) {
          console.error('Failed to save configuration:', saveError)
          return res.status(500).json({ 
            error: `Failed to save configuration: ${saveError instanceof Error ? saveError.message : 'Unknown error'}` 
          })
        }

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

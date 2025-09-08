import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDB } from '../../lib/mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[test-mongodb] Starting MongoDB connection test...')
  
  // Check environment variables
  const envCheck = {
    MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
    MONGODB_DB: process.env.MONGODB_DB ? 'Set' : 'Not set',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL ? 'Yes' : 'No'
  }
  
  console.log('[test-mongodb] Environment variables:', envCheck)
  
  try {
    console.log('[test-mongodb] Attempting MongoDB connection...')
    const connection = await connectToDB()
    console.log('[test-mongodb] Connection successful!')
    
    // Try to get database info
    const dbName = connection.connection.db.databaseName
    console.log('[test-mongodb] Connected to database:', dbName)
    
    return res.status(200).json({
      success: true,
      message: 'MongoDB connection successful',
      database: dbName,
      environment: envCheck
    })
  } catch (error: any) {
    console.error('[test-mongodb] Connection failed:', error)
    
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      environment: envCheck
    })
  }
}

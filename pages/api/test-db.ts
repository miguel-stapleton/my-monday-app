import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDB } from '../../lib/mongodb'
import Note from '../../models/Note'

type Data = {
  message: string
  status: string
  dbName?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed', status: 'error' })
  }

  try {
    // Test MongoDB connection
    const connection = await connectToDB()
    
    // Test database operations
    const testNote = new Note({
      title: 'Connection Test',
      body: 'This is a test to verify MongoDB connection'
    })
    
    await testNote.save()
    await Note.findByIdAndDelete(testNote._id) // Clean up test data
    
    res.status(200).json({
      message: 'MongoDB connection successful',
      status: 'connected',
      dbName: connection.connection.db.databaseName
    })
  } catch (error) {
    console.error('MongoDB connection error:', error)
    res.status(500).json({
      message: 'MongoDB connection failed',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

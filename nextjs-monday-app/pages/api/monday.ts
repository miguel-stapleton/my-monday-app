import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

type Data = {
  message?: string
  error?: string
  data?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { query, variables } = req.body

    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MONDAY_API_TOKEN}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    const data = await response.json()

    if (data.errors) {
      return res.status(400).json({ error: 'Monday.com API error', data: data.errors })
    }

    res.status(200).json({ data: data.data })
  } catch (error) {
    console.error('Monday API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

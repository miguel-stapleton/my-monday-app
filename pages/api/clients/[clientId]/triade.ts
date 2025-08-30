import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  message?: string
  error?: string
  data?: any
}

interface TriadeUpdateData {
  beautyVenue: string
  mTravelFee: number
  mAvailability: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { clientId, t } = req.query
  const updateData: TriadeUpdateData = req.body

  // Validate required parameters
  if (!clientId || !t) {
    return res.status(400).json({ error: 'Missing clientId or token' })
  }

  // Validate token format
  if (typeof t !== 'string' || t.length < 30) {
    return res.status(403).json({ error: 'Invalid token' })
  }

  // Validate form data
  if (!updateData.beautyVenue || updateData.mTravelFee < 0 || !updateData.mAvailability) {
    return res.status(400).json({ error: 'Invalid form data' })
  }

  try {
    // First, verify the client exists and token is valid by fetching the item
    const verifyQuery = `
      query ($itemId: ID!) {
        items(ids: [$itemId]) {
          id
          name
          column_values {
            id
            title
            type
          }
        }
      }
    `

    const verifyResponse = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MONDAY_API_TOKEN}`,
      },
      body: JSON.stringify({
        query: verifyQuery,
        variables: { itemId: clientId },
      }),
    })

    const verifyData = await verifyResponse.json()

    if (verifyData.errors || !verifyData.data.items[0]) {
      return res.status(404).json({ error: 'Client not found' })
    }

    const item = verifyData.data.items[0]
    const columns = item.column_values

    // Map form fields to Monday.com column IDs
    const getColumnId = (titleKeywords: string[]) => {
      const column = columns.find((col: any) => 
        titleKeywords.some(keyword => 
          col.title.toLowerCase().includes(keyword.toLowerCase())
        )
      )
      return column?.id
    }

    // Find the correct column IDs for our fields
    const beautyVenueId = getColumnId(['venue', 'beauty venue'])
    const travelFeeId = getColumnId(['travel', 'fee', 'travelling fee']) 
    const availabilityId = getColumnId(['availability', 'available'])

    console.log('Column mappings for triade update:', {
      beautyVenueId,
      travelFeeId, 
      availabilityId
    })

    // Build column values object
    const columnValues: any = {}

    if (beautyVenueId) {
      columnValues[beautyVenueId] = updateData.beautyVenue
    }

    if (travelFeeId) {
      // For number columns, store as number
      columnValues[travelFeeId] = updateData.mTravelFee
    }

    if (availabilityId) {
      // Check column type to format appropriately
      const availabilityColumn = columns.find((col: any) => col.id === availabilityId)
      
      if (availabilityColumn?.type === 'status') {
        // For status columns, use label format
        columnValues[availabilityId] = { label: updateData.mAvailability }
      } else {
        // For text columns, use plain text
        columnValues[availabilityId] = updateData.mAvailability
      }
    }

    console.log('Column values for triade update:', columnValues)

    // Update the Monday.com item
    const updateMutation = `
      mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
        change_column_values (
          board_id: $boardId
          item_id: $itemId
          column_values: $columnValues
        ) {
          id
        }
      }
    `

    const updateVariables = {
      boardId: process.env.MONDAY_BOARD_ID,
      itemId: clientId,
      columnValues: JSON.stringify(columnValues)
    }

    const updateResponse = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MONDAY_API_TOKEN}`,
      },
      body: JSON.stringify({
        query: updateMutation,
        variables: updateVariables,
      }),
    })

    const updateResult = await updateResponse.json()

    if (updateResult.errors) {
      console.error('Monday.com update errors:', updateResult.errors)
      return res.status(400).json({ error: 'Failed to update client details', data: updateResult.errors })
    }

    res.status(200).json({ 
      message: 'Client details updated successfully',
      data: updateResult.data 
    })
  } catch (error) {
    console.error('Triade update error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

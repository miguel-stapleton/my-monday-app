import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  items?: Array<{ id: string; name: string }>
  board?: { id: string; name: string }
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { boardId, columnId } = req.query
  console.log('[API] board-items called with:', { boardId, columnId })

  if (!boardId) {
    return res.status(400).json({ error: 'Board ID is required' })
  }

  try {
    let targetBoardId = boardId as string

    // If columnId is provided, first get the column info to find the connected board
    if (columnId) {
      console.log('[API] Looking up column info for columnId:', columnId)
      const columnQuery = `
        query ($boardId: ID!) {
          boards(ids: [$boardId]) {
            columns {
              id
              title
              type
              settings_str
            }
          }
        }
      `

      const columnResponse = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MONDAY_API_TOKEN}`,
        },
        body: JSON.stringify({
          query: columnQuery,
          variables: { boardId },
        }),
      })

      const columnData = await columnResponse.json()
      console.log('[API] Column query response:', JSON.stringify(columnData, null, 2))
      
      if (columnData.data?.boards?.[0]?.columns) {
        const column = columnData.data.boards[0].columns.find((col: any) => col.id === columnId)
        console.log('[API] Found column:', column)
        if (column && column.type === 'board-relation' && column.settings_str) {
          try {
            const settings = JSON.parse(column.settings_str)
            console.log('[API] Column settings:', settings)
            if (settings.boardIds && settings.boardIds.length > 0) {
              targetBoardId = settings.boardIds[0].toString()
              console.log(`[API] Found connected board ID: ${targetBoardId} for column ${columnId}`)
            }
          } catch (e) {
            console.error('[API] Failed to parse column settings:', e)
          }
        } else {
          console.log('[API] Column not found or not board-relation type')
        }
      }
    }

    console.log('[API] Fetching items from board:', targetBoardId)
    const query = `
      query ($boardId: ID!) {
        boards(ids: [$boardId]) {
          id
          name
          items_page {
            items {
              id
              name
            }
          }
        }
      }
    `

    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MONDAY_API_TOKEN}`,
      },
      body: JSON.stringify({
        query,
        variables: { boardId: targetBoardId },
      }),
    })

    const data = await response.json()
    console.log('[API] Items query response:', JSON.stringify(data, null, 2))

    if (data.errors) {
      console.error('[API] Monday.com API errors:', data.errors)
      return res.status(400).json({ error: 'Failed to fetch board items' })
    }

    const board = data.data?.boards?.[0]
    const items = board?.items_page?.items || []
    console.log('[API] Returning items:', items)
    
    res.status(200).json({ items, board: board ? { id: board.id, name: board.name } : undefined })
  } catch (error) {
    console.error('[API] Board items fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

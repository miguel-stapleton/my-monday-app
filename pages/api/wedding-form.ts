import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  message?: string
  error?: string
  data?: any
}

interface WeddingFormData {
  brideName?: string
  email?: string
  weddingDate?: string
  beautyVenue?: string
  description?: string
  beautyServices?: string[]
  country?: string
  hairstylist?: string
  makeupArtist?: string
  recordNamePrefix?: string
  formType?: string
  services?: string[]
  hairstylistChoice?: string
  hairstylistSelection?: string
  // Add other custom fields here as needed
  Miguelchoice?: string
  Teresachoice?: string
  Lolachoice?: string
  HStatus?: string
  MStatus?: string
  '2nd e-mail'?: string
  muaSelection?: string
  Mdecision?: string
  Hdecision?: string}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const formData: WeddingFormData = req.body

    // Basic validation - only check for essential fields that are always required
    if (!formData.email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    // Hairstylist mapping to Monday.com board IDs
    const hairstylistMapping: { [key: string]: number } = {
      "Agne Kanapeckaite": 1265638640,
      "Lília Costa": 1265638655,
      "Andreia de Matos": 1265638749,
      "Eric Ribeiro": 1265638755,
      "Oksana Grybinnyk": 1265969559,
      "Joana Carvalho": 1909955242,
      "Olga Hilário": 1909963655
    }

    // Makeup artist mapping to Monday.com board IDs
    const muaMapping: { [key: string]: number } = {
      "Lola Carvalho (founder artist)": 1260830806,
      "Teresa Pilkington (founder artist)": 1260830819,
      "Miguel Stapleton (founder artist)": 1260830830,
      "Inês Aguiar (founder artist)": 1265637834,
      "Sofia Monteiro (fresh artist)": 1265637910,
      "Rita Nunes (fresh artist)": 1555231395,
      "Filipa Wahnon (fresh artist)": 1909973857,
      "Ana Neves (resident artist)": 1260830858,
      "Ana Roma (resident artist)": 1260830847,
      "Sara Jogo (resident artist)": 1909966794
    }

    // Board IDs for connect_boards functionality
    const MUA_BOARD_ID = '1260830748' // MUAs board
    const HS_BOARD_ID = '1265638639'  // HSs board (hairstylists board)

    // First, get the board columns to map the correct column IDs
    const boardQuery = `
      query ($boardId: ID!) {
        boards(ids: [$boardId]) {
          columns {
            id
            title
            type
          }
        }
      }
    `

    console.log('Environment check:', {
      hasMongoUri: !!process.env.MONGODB_URI,
      hasMongoDb: !!process.env.MONGODB_DB,
      hasMondayToken: !!process.env.MONDAY_API_TOKEN,
      hasMondayBoard: !!process.env.MONDAY_BOARD_ID,
      mondayTokenLength: process.env.MONDAY_API_TOKEN?.length || 0,
      mondayBoardId: process.env.MONDAY_BOARD_ID,
      boardIdType: typeof process.env.MONDAY_BOARD_ID,
      tokenStart: process.env.MONDAY_API_TOKEN?.substring(0, 10),
      tokenEnd: process.env.MONDAY_API_TOKEN?.substring(-10),
      tokenExists: !!process.env.MONDAY_API_TOKEN,
      tokenIsString: typeof process.env.MONDAY_API_TOKEN === 'string'
    })

    // Validate Monday.com token
    const mondayToken = process.env.MONDAY_API_TOKEN
    if (!mondayToken || mondayToken.trim() === '') {
      console.error('Monday.com API token is missing or empty')
      return res.status(400).json({ error: 'Monday.com API token not configured' })
    }

    // Ensure boardId is a string
    const boardId = String(process.env.MONDAY_BOARD_ID)
    console.log('Using board ID:', boardId, 'Type:', typeof boardId)
    console.log('Using token length:', mondayToken.length, 'First 10 chars:', mondayToken.substring(0, 10))

    // Test basic Monday.com API access first
    console.log('Testing Monday.com API access...')
    const testResponse = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MONDAY_API_TOKEN}`,
      },
      body: JSON.stringify({
        query: 'query { me { name } }'
      }),
    })
    
    const testData = await testResponse.json()
    console.log('Monday.com test response:', testData)

    const boardResponse = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MONDAY_API_TOKEN}`,
      },
      body: JSON.stringify({
        query: boardQuery,
        variables: { boardId: boardId },
      }),
    })

    console.log('Board response status:', boardResponse.status)
    console.log('Board response headers:', Object.fromEntries(boardResponse.headers.entries()))

    const boardData = await boardResponse.json()
    console.log('Board response data:', JSON.stringify(boardData, null, 2))

    if (boardData.errors) {
      console.error('Monday.com board query errors:', boardData.errors)
      return res.status(400).json({ 
        error: 'Failed to fetch board columns'
      })
    }

    if (!boardData.data || !boardData.data.boards || boardData.data.boards.length === 0) {
      console.error('No board data returned:', boardData)
      return res.status(400).json({ 
        error: 'Board not found or no access'
      })
    }

    const columns = boardData.data.boards[0]?.columns || []
    console.log('Available columns:', columns)

    // Map column titles to IDs
    const getColumnId = (title: string) => {
      const column = columns.find((col: any) => 
        col.title.toLowerCase().includes(title.toLowerCase()) ||
        col.title.toLowerCase().replace(/[^a-z0-9]/g, '').includes(title.toLowerCase().replace(/[^a-z0-9]/g, ''))
      )
      return column?.id
    }

    // Create column values object with actual column IDs
    const columnValues: any = {}
    
    // Map each field to its column ID with proper formatting
    const brideNameId = getColumnId("bride") || getColumnId("name")
    const emailId = getColumnId("email")
    const weddingDateId = getColumnId("wedding") || getColumnId("date")
    const beautyVenueId = getColumnId("venue") || getColumnId("beauty")
    const descriptionId = getColumnId("description") || getColumnId("observation")
    const servicesId = getColumnId("service")
    const countryId = getColumnId("country")

    // Format values according to Monday.com column types
    if (brideNameId) columnValues[brideNameId] = formData.brideName
    if (emailId) columnValues[emailId] = { email: formData.email, text: formData.email }
    if (weddingDateId) columnValues[weddingDateId] = { date: formData.weddingDate }
    if (beautyVenueId) columnValues[beautyVenueId] = formData.beautyVenue
    if (descriptionId) columnValues[descriptionId] = formData.description
    if (servicesId && formData.beautyServices) {
      // For multi-select dropdown, we need to format as labels array
      columnValues[servicesId] = { labels: formData.beautyServices }
    }
    if (countryId) {
      // For country column, use country code format
      const countryMap: { [key: string]: string } = {
        'Afghanistan': 'AF', 'Albania': 'AL', 'Algeria': 'DZ', 'Argentina': 'AR',
        'Australia': 'AU', 'Austria': 'AT', 'Bangladesh': 'BD', 'Belgium': 'BE',
        'Brazil': 'BR', 'Canada': 'CA', 'Chile': 'CL', 'China': 'CN',
        'Colombia': 'CO', 'Denmark': 'DK', 'Egypt': 'EG', 'Finland': 'FI',
        'France': 'FR', 'Germany': 'DE', 'Greece': 'GR', 'India': 'IN',
        'Indonesia': 'ID', 'Ireland': 'IE', 'Italy': 'IT', 'Japan': 'JP',
        'Mexico': 'MX', 'Netherlands': 'NL', 'New Zealand': 'NZ', 'Norway': 'NO',
        'Pakistan': 'PK', 'Philippines': 'PH', 'Poland': 'PL', 'Portugal': 'PT',
        'Russia': 'RU', 'South Africa': 'ZA', 'South Korea': 'KR', 'Spain': 'ES',
        'Sweden': 'SE', 'Switzerland': 'CH', 'Thailand': 'TH', 'Turkey': 'TR',
        'Ukraine': 'UA', 'United Kingdom': 'GB', 'United States': 'US', 'Vietnam': 'VN'
      }
      columnValues[countryId] = { countryCode: countryMap[formData.country || ''] || 'US' }
    }

    // Add conditional logic for hairstylist and makeup artist decisions
    const hdecisionId = 'status2' // Hdecision column ID
    const hstatusId = 'dup_of_mstatus' // HStatus column ID  
    const mdecisionId = 'status7' // Mdecision column ID
    const mstatusId = 'project_status' // MStatus column ID
    const muasId = 'connect_boards' // MUAs board relation column ID
    const hsId = 'connect_boards0' // HSs board relation column ID
    
    // Add support for choice fields
    const miguelchoiceId = 'status5' // Miguelchoice column ID
    const teresachoiceId = 'color7' // Teresachoice column ID  
    const lolachoiceId = 'color0' // Lolachoice column ID
    const secondEmailId = 'email__1' // 2nd e-mail column ID

    // Handle Hair service selection
    if (formData.beautyServices && formData.beautyServices.includes('Hair') && formData.hairstylist) {
      if (formData.hairstylist === "I don't know which hairstylist to choose") {
        if (hdecisionId) {
          columnValues[hdecisionId] = { label: "I don't know which hairstylist to choose!" }
        }
        // if (hstatusId) {
        //   columnValues[hstatusId] = { label: "undecided- inquire availabilities" }
        // }
      } else {
        if (hdecisionId) {
          columnValues[hdecisionId] = { label: "let me choose a specific hairstylist" }
        }
        // if (hstatusId) {
        //   columnValues[hstatusId] = { label: "Travelling fee + inquire artist" }
        // }
        // Add the selected hairstylist to HSs field
        if (hsId && hairstylistMapping[formData.hairstylist]) {
          columnValues[hsId] = { board_id: HS_BOARD_ID, item_ids: [hairstylistMapping[formData.hairstylist]] }
        }
      }
    }

    // Handle Make-up service selection
    if (formData.beautyServices && formData.beautyServices.includes('Make-up') && formData.makeupArtist) {
      if (formData.makeupArtist === "I don't know which make-up artist to choose") {
        if (mdecisionId) {
          columnValues[mdecisionId] = { label: "I don't know which make-up artist to choose!" }
        }
        // if (mstatusId) {
        //   columnValues[mstatusId] = { label: "undecided- inquire availabilities" }
        // }
      } else {
        if (mdecisionId) {
          columnValues[mdecisionId] = { label: "let me choose a specific make-up artist" }
        }
        // if (mstatusId) {
        //   columnValues[mstatusId] = { label: "Travelling fee + inquire artist" }
        // }
        // Add the selected makeup artist to MUAs field
        if (muasId && muaMapping[formData.makeupArtist]) {
          columnValues[muasId] = { board_id: parseInt(MUA_BOARD_ID), item_ids: [muaMapping[formData.makeupArtist]] }
        }
      }
    }

    // Handle MUA form hairstylist selection
    if (formData.hairstylistChoice) {
      if (formData.hairstylistChoice === 'no, thank you') {
        if (hstatusId) {
          columnValues[hstatusId] = { label: "not interested" }
        }
      } else if (formData.hairstylistChoice === "I don't know which hairstylist to choose") {
        if (hstatusId) {
          columnValues[hstatusId] = { label: "undecided- inquire availabilities" }
        }
      } else if (hairstylistMapping[formData.hairstylistChoice]) {
        // Specific hairstylist selected
        if (hsId) {
          columnValues[hsId] = { item_ids: [hairstylistMapping[formData.hairstylistChoice]] }
        }
        if (hstatusId) {
          columnValues[hstatusId] = { label: "Travelling fee + inquire artist" }
        }
      }
    }

    // Handle Mdecision and Hdecision fields for MUA forms
    if (formData.Mdecision) {
      const mdecisionId = 'status7' // Mdecision column ID
      columnValues[mdecisionId] = { label: formData.Mdecision }
    }

    if (formData.Hdecision) {
      const hdecisionId = 'status2' // Hdecision column ID
      columnValues[hdecisionId] = { label: formData.Hdecision }
    }
    // Handle MUA form artist choice columns
    if (formData.Lolachoice) {
      const lolachoiceId = 'color0' // Lola's choice column ID
      if (lolachoiceId) {
        columnValues[lolachoiceId] = { label: formData.Lolachoice }
      }
    }

    if (formData.Teresachoice) {
      const teresachoiceId = 'color7' // Teresa's choice column ID  
      if (teresachoiceId) {
        columnValues[teresachoiceId] = { label: formData.Teresachoice }
      }
    }

    if (formData.Miguelchoice) {
      const miguelchoiceId = 'status5' // Miguel's choice column ID
      if (miguelchoiceId) {
        columnValues[miguelchoiceId] = { label: formData.Miguelchoice }
      }
    }

    // Handle MUA form MStatus
    if (formData.MStatus) {
      const mstatusId = 'project_status' // MStatus column ID
      if (mstatusId) {
        columnValues[mstatusId] = { label: formData.MStatus }
      }
    }

    // Handle MUA form connect_boards (MUAs column)
    if (formData.muaSelection && formData.muaSelection.match(/^\d+$/)) {
      // If muaSelection is an ID (numeric string), use it for connect_boards
      const muasId = 'connect_boards' // MUAs column ID
      if (muasId) {
        columnValues[muasId] = { 
          board_id: parseInt(MUA_BOARD_ID), 
          item_ids: [parseInt(formData.muaSelection)] 
        }
      }
    }

    // Handle all custom Monday.com fields dynamically
    Object.keys(formData).forEach(fieldKey => {
      const fieldValue = formData[fieldKey as keyof typeof formData]
      if (!fieldValue) return

      // Map custom fields to their Monday column IDs
      switch (fieldKey) {
        case 'project_status':
        case 'MStatus':
          if (mstatusId && fieldValue) {
            columnValues[mstatusId] = { label: fieldValue }
          }
          break
        case 'dup_of_mstatus':  
        case 'HStatus':
          if (hstatusId && fieldValue) {
            columnValues[hstatusId] = { label: fieldValue }
          }
          break
        case 'status5':
        case 'Miguelchoice':
          if (miguelchoiceId && fieldValue) {
            columnValues[miguelchoiceId] = { label: fieldValue }
          }
          break
        case 'color7':
        case 'Teresachoice':
          if (teresachoiceId && fieldValue) {
            columnValues[teresachoiceId] = { label: fieldValue }
          }
          break
        case 'color0':
        case 'Lolachoice':
          if (lolachoiceId && fieldValue) {
            columnValues[lolachoiceId] = { label: fieldValue }
          }
          break
        case 'email__1':
        case '2nd e-mail':
          if (secondEmailId && fieldValue) {
            columnValues[secondEmailId] = { email: fieldValue, text: fieldValue }
          }
          break
      }
    })

    console.log('[DEBUG] Column values being sent to Monday.com:', JSON.stringify(columnValues, null, 2))
    console.log('[DEBUG] Column IDs found:', {
      mstatusId,
      hstatusId,
      hsId,
      muasId: 'connect_boards',
      miguelChoiceId: 'status5',
      lolaChoiceId: 'color0',
      teresaChoiceId: 'color7'
    })

    console.log('Column mappings:', {
      brideNameId, emailId, weddingDateId, beautyVenueId, 
      descriptionId, servicesId, countryId, hdecisionId, mdecisionId, muasId, hsId
    })
    console.log('Column values:', columnValues)

    // Create item in Monday.com board
    const mutation = `
      mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
        create_item (
          board_id: $boardId
          item_name: $itemName
          column_values: $columnValues
        ) {
          id
        }
      }
    `

    const variables = {
      boardId: boardId,
      itemName: `${formData.recordNamePrefix} - ${formData.brideName}`,
      columnValues: JSON.stringify(columnValues)
    }

    const createResponse = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MONDAY_API_TOKEN}`,
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    })

    const data = await createResponse.json()

    if (data.errors) {
      console.error('Monday.com API errors:', data.errors)
      return res.status(400).json({ error: 'Failed to create Monday.com item' })
    }

    res.status(200).json({ 
      message: 'Wedding form submitted successfully',
      data: data.data
    })
  } catch (error) {
    console.error('Wedding form submission error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

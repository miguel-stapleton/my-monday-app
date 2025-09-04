import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  message?: string
  error?: string
  data?: any
}

interface WeddingFormData {
  brideName: string
  email: string
  weddingDate: string
  beautyVenue: string
  description: string
  beautyServices: string[]
  country: string
  hairstylist: string
  makeupArtist: string
  recordNamePrefix: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const formData: WeddingFormData = req.body

    // Validate required fields
    if (!formData.brideName || !formData.email || !formData.weddingDate || 
        !formData.beautyVenue || !formData.country || formData.beautyServices.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

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

    const boardResponse = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MONDAY_API_TOKEN}`,
      },
      body: JSON.stringify({
        query: boardQuery,
        variables: { boardId: process.env.MONDAY_BOARD_ID },
      }),
    })

    const boardData = await boardResponse.json()

    if (boardData.errors) {
      console.error('Monday.com board query errors:', boardData.errors)
      return res.status(400).json({ error: 'Failed to fetch board columns', data: boardData.errors })
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
    if (servicesId) {
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
      columnValues[countryId] = { countryCode: countryMap[formData.country] || 'US' }
    }

    // Add conditional logic for hairstylist and makeup artist decisions
    const hdecisionId = 'status2' // Hdecision column ID
    const hstatusId = 'dup__of_mstatus' // HStatus column ID  
    const mdecisionId = 'status7' // Mdecision column ID
    const mstatusId = 'project_status' // MStatus column ID
    const muasId = 'connect_boards' // MUAs board relation column ID
    const hsId = 'connect_boards0' // HSs board relation column ID

    // Artist ID mappings
    const muaMapping: { [key: string]: number } = {
      'Lola Carvalho (founder artist)': 1260830806,
      'Teresa Pilkington (founder artist)': 1260830819,
      'Miguel Stapleton (founder artist)': 1260830830,
      'Inês Aguiar (founder artist)': 1265637834,
      'Sofia Monteiro (fresh artist)': 1265637910,
      'Rita Nunes (fresh artist)': 1555231395,
      'Filipa Wahnon (fresh artist)': 1909973857,
      'Ana Neves (resident artist)': 1260830858,
      'Ana Roma (resident artist)': 1260830847,
      'Sara Jogo (resident artist)': 1909966794
    }

    const hairstylistMapping: { [key: string]: number } = {
      'Agne Kanapeckaite': 1265638640,
      'Lília Costa': 1265638655,
      'Andreia de Matos': 1265638749,
      'Eric Ribeiro': 1265638755,
      'Oksana Grybinnyk': 1265969559,
      'Joana Carvalho': 1909955242,
      'Olga Hilário': 1909963655
    }

    // Handle Hair service selection
    if (formData.beautyServices.includes('Hair') && formData.hairstylist) {
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
          columnValues[hsId] = { item_ids: [hairstylistMapping[formData.hairstylist]] }
        }
      }
    }

    // Handle Make-up service selection
    if (formData.beautyServices.includes('Make-up') && formData.makeupArtist) {
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
          columnValues[muasId] = { item_ids: [muaMapping[formData.makeupArtist]] }
        }
      }
    }

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
      boardId: process.env.MONDAY_BOARD_ID,
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
      return res.status(400).json({ error: 'Failed to create Monday.com item', data: data.errors })
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

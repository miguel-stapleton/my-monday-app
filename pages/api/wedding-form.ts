import type { NextApiRequest, NextApiResponse } from 'next'

// ===== TYPES AND INTERFACES =====

interface ApiResponse {
  message?: string
  error?: string
  data?: any
}

interface WeddingFormData {
  // Basic form fields
  brideName?: string
  email?: string
  weddingDate?: string
  beautyVenue?: string
  description?: string
  beautyServices?: string[]
  country?: string
  recordNamePrefix?: string
  formType?: string
  
  // Artist selections
  hairstylist?: string
  makeupArtist?: string
  hairstylistChoice?: string
  hairstylistSelection?: string
  muaSelection?: string
  
  // Status fields
  HStatus?: string
  MStatus?: string
  Mdecision?: string
  Hdecision?: string
  
  // Artist choice fields
  Miguelchoice?: string
  Teresachoice?: string
  Lolachoice?: string
  
  // Additional fields
  '2nd e-mail'?: string
  services?: string[]
}

interface MondayColumn {
  id: string
  title: string
  type: string
}

interface MondayColumnValues {
  [columnId: string]: any
}

interface ArtistMapping {
  [key: string]: number
}

interface ColumnMapping {
  [key: string]: string
}

// ===== CUSTOM ERROR CLASSES =====

class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

class MondayApiError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message)
    this.name = 'MondayApiError'
  }
}

class ConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigurationError'
  }
}

// ===== CONSTANTS AND CONFIGURATIONS =====

class AppConstants {
  static readonly BOARD_IDS = {
    MUA: 1260830748,
    HAIRSTYLIST: 1260998854
  } as const

  static readonly HAIRSTYLIST_MAPPING: ArtistMapping = {
    "Agne Kanapeckaite": 1265638640,
    "Lília Costa": 1265638655,
    "Andreia de Matos": 1265638749,
    "Eric Ribeiro": 1265638755,
    "Oksana Grybinnyk": 1265969559,
    "Joana Carvalho": 1909955242,
    "Olga Hilário": 1909963655
  }

  static readonly MUA_MAPPING: ArtistMapping = {
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

  static readonly COLUMN_IDS: ColumnMapping = {
    hdecision: 'status2',
    hstatus: 'dup_of_mstatus',
    mdecision: 'status7',
    mstatus: 'project_status',
    muas: 'connect_boards',
    hairstylists: 'connect_boards0',
    miguelchoice: 'status5',
    teresachoice: 'color7',
    lolachoice: 'color0',
    secondEmail: 'email__1'
  }

  static readonly COUNTRY_CODES: { [key: string]: string } = {
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

  static readonly FIELD_MAPPINGS = [
    { field: 'brideName', searchTerms: ['bride', 'name'] },
    { field: 'email', searchTerms: ['email'] },
    { field: 'weddingDate', searchTerms: ['wedding', 'date'] },
    { field: 'beautyVenue', searchTerms: ['venue', 'beauty'] },
    { field: 'description', searchTerms: ['description', 'observation'] },
    { field: 'beautyServices', searchTerms: ['service'] },
    { field: 'country', searchTerms: ['country'] }
  ]
}

// ===== VALIDATION SERVICE =====

class ValidationService {
  static validateEnvironment(): void {
    const requiredEnvVars = ['MONDAY_API_TOKEN', 'MONDAY_BOARD_ID']
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new ConfigurationError(`${envVar} environment variable is missing`)
      }
    }
  }

  static validateFormData(formData: WeddingFormData): void {
    if (!formData.email) {
      throw new ValidationError('Email is required')
    }

    if (formData.email && !this.isValidEmail(formData.email)) {
      throw new ValidationError('Invalid email format')
    }

    if (formData.weddingDate && !this.isValidDate(formData.weddingDate)) {
      throw new ValidationError('Invalid wedding date format')
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private static isValidDate(date: string): boolean {
    return !isNaN(Date.parse(date))
  }
}

// ===== MONDAY.COM API SERVICE =====

class MondayApiService {
  private static async fetchMondayApi(query: string, variables?: any): Promise<any> {
    try {
      const response = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MONDAY_API_TOKEN}`,
        },
        body: JSON.stringify({ query, variables }),
      })

      if (!response.ok) {
        throw new MondayApiError(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.errors) {
        throw new MondayApiError(`Monday.com API error: ${JSON.stringify(data.errors)}`)
      }
      
      return data
    } catch (error) {
      if (error instanceof MondayApiError) {
        throw error
      }
      throw new MondayApiError('Failed to communicate with Monday.com API', error)
    }
  }

  static async getBoardColumns(boardId: string): Promise<MondayColumn[]> {
    const query = `
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
    
    const data = await this.fetchMondayApi(query, { boardId })
    
    if (!data.data?.boards?.[0]?.columns) {
      throw new MondayApiError('Board not found or no columns available')
    }
    
    return data.data.boards[0].columns
  }

  static async createItem(boardId: string, itemName: string, columnValues: MondayColumnValues): Promise<any> {
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
      boardId,
      itemName,
      columnValues: JSON.stringify(columnValues)
    }
    
    return await this.fetchMondayApi(mutation, variables)
  }
}

// ===== COLUMN MAPPING SERVICE =====

class ColumnMappingService {
  static findColumnId(columns: MondayColumn[], searchTerm: string): string | undefined {
    const column = columns.find((col: MondayColumn) => 
      col.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.title.toLowerCase().replace(/[^a-z0-9]/g, '').includes(searchTerm.toLowerCase().replace(/[^a-z0-9]/g, ''))
    )
    return column?.id
  }

  static mapBasicFields(formData: WeddingFormData, columns: MondayColumn[]): MondayColumnValues {
    const columnValues: MondayColumnValues = {}
    
    AppConstants.FIELD_MAPPINGS.forEach(({ field, searchTerms }) => {
      const columnId = searchTerms.map(term => this.findColumnId(columns, term)).find(id => id)
      const value = formData[field as keyof WeddingFormData]
      
      if (columnId && value) {
        columnValues[columnId] = this.formatFieldValue(field, value)
      }
    })
    
    return columnValues
  }

  private static formatFieldValue(field: string, value: any): any {
    switch (field) {
      case 'email':
        return { email: value, text: value }
      case 'weddingDate':
        return { date: value }
      case 'beautyServices':
        return { labels: value }
      case 'country':
        return { countryCode: AppConstants.COUNTRY_CODES[value as string] || 'US' }
      default:
        return value
    }
  }
}

// ===== ARTIST SELECTION SERVICE =====

class ArtistSelectionService {
  static mapArtistSelections(formData: WeddingFormData): MondayColumnValues {
    const columnValues: MondayColumnValues = {}
    
    // Handle makeup artist selection
    this.handleMakeupArtistSelection(formData, columnValues)
    
    // Handle hairstylist selection
    this.handleHairstylistSelection(formData, columnValues)
    
    return columnValues
  }

  private static handleMakeupArtistSelection(formData: WeddingFormData, columnValues: MondayColumnValues): void {
    let muaId: number | undefined

    console.log('[DEBUG] MUA Selection - formData.muaSelection:', formData.muaSelection)
    console.log('[DEBUG] MUA Selection - formData.makeupArtist:', formData.makeupArtist)

    if (formData.muaSelection) {
      // Check if muaSelection is a numeric ID (string or number)
      if (formData.muaSelection.match(/^\d+$/)) {
        // MUA form: use muaSelection ID directly
        muaId = parseInt(formData.muaSelection)
        console.log('[DEBUG] MUA Selection - Using numeric ID:', muaId)
      } else if (AppConstants.MUA_MAPPING[formData.muaSelection]) {
        // MUA form: muaSelection is artist name, map to ID
        muaId = AppConstants.MUA_MAPPING[formData.muaSelection]
        console.log('[DEBUG] MUA Selection - Mapped artist name to ID:', formData.muaSelection, '->', muaId)
      }
    } else if (formData.makeupArtist && AppConstants.MUA_MAPPING[formData.makeupArtist]) {
      // Inquiry form: use makeupArtist name mapping
      muaId = AppConstants.MUA_MAPPING[formData.makeupArtist]
      console.log('[DEBUG] MUA Selection - Inquiry form mapping:', formData.makeupArtist, '->', muaId)
    }

    if (muaId) {
      columnValues[AppConstants.COLUMN_IDS.muas] = { 
        board_id: AppConstants.BOARD_IDS.MUA, 
        item_ids: [muaId]
      }
      console.log('[DEBUG] MUA Selection - Final column value:', columnValues[AppConstants.COLUMN_IDS.muas])
    } else {
      console.log('[DEBUG] MUA Selection - No MUA ID found, column will be empty')
    }
  }

  private static handleHairstylistSelection(formData: WeddingFormData, columnValues: MondayColumnValues): void {
    let hairstylistId: number | undefined

    if (formData.hairstylistChoice && AppConstants.HAIRSTYLIST_MAPPING[formData.hairstylistChoice]) {
      // MUA form: use hairstylistChoice
      hairstylistId = AppConstants.HAIRSTYLIST_MAPPING[formData.hairstylistChoice]
    } else if (formData.hairstylist && AppConstants.HAIRSTYLIST_MAPPING[formData.hairstylist]) {
      // Inquiry form: use hairstylist
      hairstylistId = AppConstants.HAIRSTYLIST_MAPPING[formData.hairstylist]
    }

    if (hairstylistId) {
      columnValues[AppConstants.COLUMN_IDS.hairstylists] = { 
        board_id: AppConstants.BOARD_IDS.HAIRSTYLIST, 
        item_ids: [hairstylistId]
      }
    }
  }
}

// ===== DECISION MAPPING SERVICE =====

class DecisionMappingService {
  static mapDecisions(formData: WeddingFormData): MondayColumnValues {
    const columnValues: MondayColumnValues = {}
    
    // Handle inquiry form decisions
    this.handleInquiryFormDecisions(formData, columnValues)
    
    // Handle MUA form decisions
    this.handleMuaFormDecisions(formData, columnValues)
    
    return columnValues
  }

  private static handleInquiryFormDecisions(formData: WeddingFormData, columnValues: MondayColumnValues): void {
    // Handle hairstylist decisions for inquiry form
    if (formData.beautyServices?.includes('Hair') && formData.hairstylist) {
      if (formData.hairstylist === "I don't know which hairstylist to choose") {
        columnValues[AppConstants.COLUMN_IDS.hdecision] = { label: "I don't know which hairstylist to choose!" }
      } else {
        columnValues[AppConstants.COLUMN_IDS.hdecision] = { label: "let me choose a specific hairstylist" }
      }
    }
    
    // Handle makeup artist decisions for inquiry form
    if (formData.beautyServices?.includes('Make-up') && formData.makeupArtist) {
      if (formData.makeupArtist === "I don't know which make-up artist to choose") {
        columnValues[AppConstants.COLUMN_IDS.mdecision] = { label: "I don't know which make-up artist to choose!" }
      } else {
        columnValues[AppConstants.COLUMN_IDS.mdecision] = { label: "let me choose a specific make-up artist" }
      }
    }
  }

  private static handleMuaFormDecisions(formData: WeddingFormData, columnValues: MondayColumnValues): void {
    // Handle MUA form hairstylist decisions
    if (formData.hairstylistChoice) {
      switch (formData.hairstylistChoice) {
        case 'no, thank you':
          columnValues[AppConstants.COLUMN_IDS.hstatus] = { label: "not interested" }
          break
        case "I don't know which hairstylist to choose":
          columnValues[AppConstants.COLUMN_IDS.hstatus] = { label: "undecided- inquire availabilities" }
          break
        default:
          if (AppConstants.HAIRSTYLIST_MAPPING[formData.hairstylistChoice]) {
            columnValues[AppConstants.COLUMN_IDS.hstatus] = { label: "Travelling fee + inquire artist" }
          }
          break
      }
    }
  }
}

// ===== CUSTOM FIELDS SERVICE =====

class CustomFieldsService {
  static mapCustomFields(formData: WeddingFormData): MondayColumnValues {
    const columnValues: MondayColumnValues = {}
    
    // Handle explicit decision fields
    this.mapDecisionFields(formData, columnValues)
    
    // Handle artist choice fields
    this.mapArtistChoiceFields(formData, columnValues)
    
    // Handle status fields
    this.mapStatusFields(formData, columnValues)
    
    // Handle additional fields
    this.mapAdditionalFields(formData, columnValues)
    
    return columnValues
  }

  private static mapDecisionFields(formData: WeddingFormData, columnValues: MondayColumnValues): void {
    if (formData.Mdecision) {
      columnValues[AppConstants.COLUMN_IDS.mdecision] = { label: formData.Mdecision }
    }
    
    if (formData.Hdecision) {
      columnValues[AppConstants.COLUMN_IDS.hdecision] = { label: formData.Hdecision }
    }
  }

  private static mapArtistChoiceFields(formData: WeddingFormData, columnValues: MondayColumnValues): void {
    const artistChoices = [
      { field: 'Lolachoice', columnId: AppConstants.COLUMN_IDS.lolachoice },
      { field: 'Teresachoice', columnId: AppConstants.COLUMN_IDS.teresachoice },
      { field: 'Miguelchoice', columnId: AppConstants.COLUMN_IDS.miguelchoice }
    ]

    artistChoices.forEach(({ field, columnId }) => {
      const value = formData[field as keyof WeddingFormData]
      if (value) {
        columnValues[columnId] = { label: value }
      }
    })
  }

  private static mapStatusFields(formData: WeddingFormData, columnValues: MondayColumnValues): void {
    if (formData.MStatus) {
      columnValues[AppConstants.COLUMN_IDS.mstatus] = { label: formData.MStatus }
    }
    
    if (formData.HStatus) {
      columnValues[AppConstants.COLUMN_IDS.hstatus] = { label: formData.HStatus }
    }
  }

  private static mapAdditionalFields(formData: WeddingFormData, columnValues: MondayColumnValues): void {
    if (formData['2nd e-mail']) {
      columnValues[AppConstants.COLUMN_IDS.secondEmail] = { 
        email: formData['2nd e-mail'], 
        text: formData['2nd e-mail'] 
      }
    }
  }
}

// ===== FORM PROCESSING SERVICE =====

class FormProcessingService {
  static async processForm(formData: WeddingFormData): Promise<any> {
    // Validate environment and form data
    ValidationService.validateEnvironment()
    ValidationService.validateFormData(formData)

    const boardId = String(process.env.MONDAY_BOARD_ID)
    
    // Get board columns
    const columns = await MondayApiService.getBoardColumns(boardId)
    
    // Build column values using different services
    const basicValues = ColumnMappingService.mapBasicFields(formData, columns)
    const artistValues = ArtistSelectionService.mapArtistSelections(formData)
    const decisionValues = DecisionMappingService.mapDecisions(formData)
    const customValues = CustomFieldsService.mapCustomFields(formData)
    
    // Merge all column values
    const columnValues = {
      ...basicValues,
      ...artistValues,
      ...decisionValues,
      ...customValues
    }
    
    console.log('[DEBUG] Final column values:', JSON.stringify(columnValues, null, 2))
    
    // Create Monday.com item
    const itemName = `${formData.recordNamePrefix || 'Form'} - ${formData.brideName || 'Unknown'}`
    const result = await MondayApiService.createItem(boardId, itemName, columnValues)
    
    return result
  }
}

// ===== ERROR HANDLER =====

class ErrorHandler {
  static handleError(error: unknown, res: NextApiResponse<ApiResponse>): void {
    console.error('Wedding form submission error:', error)

    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message })
    } else if (error instanceof ConfigurationError) {
      res.status(500).json({ error: error.message })
    } else if (error instanceof MondayApiError) {
      res.status(502).json({ error: `Monday.com integration error: ${error.message}` })
    } else {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      })
    }
  }
}

// ===== MAIN HANDLER =====

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const formData: WeddingFormData = req.body
    const result = await FormProcessingService.processForm(formData)
    
    res.status(200).json({ 
      message: 'Wedding form submitted successfully',
      data: result.data
    })
    
  } catch (error) {
    ErrorHandler.handleError(error, res)
  }
}

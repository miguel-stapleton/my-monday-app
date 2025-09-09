import Head from 'next/head'
import { useState, useEffect } from 'react'

// Form Types
type FormType = 'inquiry' | 'mua'

interface FormTypeConfig {
  id: FormType
  label: string
  title: string
  subtitle: string
  recordNamePrefix: string
  submitButtonText: string
}

interface MUAConfig {
  artistName: string
  artistId: string
  choiceColumn: string
}

const muaArtistOptions: MUAConfig[] = [
  {
    artistName: 'Lola Carvalho (founder artist)',
    artistId: '1260830807', // Replace with actual Monday.com ID
    choiceColumn: 'color0' // Lolachoice column ID
  },
  {
    artistName: 'Teresa Pilkington (founder artist)', 
    artistId: '1260830808', // Fixed to match backend mapping
    choiceColumn: 'color7' // Teresachoice column ID
  },
  {
    artistName: 'Miguel Stapleton (founder artist)',
    artistId: '1260830809', // Fixed to match backend mapping
    choiceColumn: 'status5' // Miguelchoice column ID
  }
]

interface FormTypeConfig {
  id: FormType
  label: string
  title: string
  subtitle: string
  recordNamePrefix: string
  submitButtonText: string
}

const formTypeConfigs: Record<FormType, FormTypeConfig> = {
  inquiry: {
    id: 'inquiry',
    label: 'Inquiry Form',
    title: 'Wedding Beauty Services Form',
    subtitle: 'Submit your wedding beauty service requirements',
    recordNamePrefix: 'Wedding Beauty Service',
    submitButtonText: 'Submit Beauty info'
  },
  mua: {
    id: 'mua',
    label: 'MUA Form',
    title: 'Makeup Artist Application Form',
    subtitle: 'Apply to join our makeup artist team',
    recordNamePrefix: 'MUA Application',
    submitButtonText: 'Submit Application'
  }
}

interface FormData {
  brideName: string
  email: string
  weddingDate: string
  beautyVenue: string
  description: string
  country: string
  hairstylist: string
  makeupArtist: string
  hairstylistChoice: string
  services: string[]
  hStatus: string
  hairstylistSelection: string
  MStatus: string
  Lolachoice: string
  Teresachoice: string
  Miguelchoice: string
  muaSelection: string
  Mdecision: string
  Hdecision: string
}

interface FormField {
  id: string
  label: string
  title?: string
  subtitle?: string
  type: 'text' | 'email' | 'date' | 'textarea' | 'select' | 'multiselect' | 'checkbox'
  required: boolean
  enabled: boolean
  invisible?: boolean
  preselectedValue?: string
  mondayColumn?: string
  mondayColumnType?: string
  options?: string[]
  placeholder?: string
  helpText?: string
  editable?: boolean
  editableFields?: string[]
}

interface FormConfig {
  title: string
  subtitle: string
  recordNamePrefix: string
  fields: FormField[]
}

interface SavedConfig {
  name: string
  config: FormConfig & {
    hairstylists: string[]
    makeupArtists: string[]
  }
  createdAt: string
  updatedAt: string
}

interface SaveDialogState {
  isOpen: boolean
  configName: string
  isDuplicate: boolean
  existingConfigName?: string
}

const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria',
  'Bangladesh', 'Belgium', 'Brazil', 'Canada', 'Chile', 'China', 'Colombia',
  'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'Greece', 'India',
  'Indonesia', 'Ireland', 'Italy', 'Japan', 'Mexico', 'Netherlands',
  'New Zealand', 'Norway', 'Pakistan', 'Philippines', 'Poland', 'Portugal',
  'Russia', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland',
  'Thailand', 'Turkey', 'Ukraine', 'United Kingdom', 'United States', 'Vietnam'
]

const hairstylists = [
  "I don't know which hairstylist to choose",
  "Agne Kanapeckaite",
  "Lília Costa", 
  "Andreia de Matos",
  "Eric Ribeiro",
  "Oksana Grybbinyk",
  "Joana Carvalho",
  "Olga Hilário"
]

const makeupArtists = [
  "I don't know which make-up artist to choose",
  "Inês Aguiar (founder artist)",
  "Lola Carvalho (founder artist)",
  "Teresa Pilkington (founder artist)",
  "Miguel Stapleton (founder artist)",
  "Ana Neves (resident artist)",
  "Ana Roma (resident artist)",
  "Sara Jogo (resident artist)",
  "Sofia Monteiro (fresh artist)",
  "Rita Nunes (fresh artist)",
  "Filipa Wahnon (fresh artist)"
]

// Monday.com Clients board columns (Board ID: 1260828829)
const mondayClientsColumns = [
  { 
    id: 'project_status', 
    label: 'MStatus', 
    type: 'dropdown' as const,
    options: [
      "Travelling fee + inquire the artist",
      "inquire second option", 
      "undecided- inquire availabilities",
      "REVIEW",
      "rejected",
      "Direct choice",
      "wait for c to pay",
      "wait for c to accept", 
      "wait for c to choose",
      "not interested",
      "second option chosen, click a button",
      "FLAT RATE only",
      "MUA booked!",
      "reunião check"
    ]
  },
  { 
    id: 'dup_of_mstatus', 
    label: 'HStatus', 
    type: 'dropdown' as const,
    options: [
      "Travelling fee + inquire the artist",
      "Travelling fee + inquire second option",
      "undecided- inquire availabilities", 
      "REVIEW",
      "rejected",
      "wait for c to pay",
      "wait for c to accept",
      "wait for c to choose", 
      "not interested",
      "second option chosen, click a button",
      "H booked!"
    ]
  },
  { 
    id: 'connect_boards', 
    label: 'MUAs', 
    type: 'dropdown' as const,
    boardId: '1260830748',
    sourceColumn: 'text'
  },
  { 
    id: 'connect_boards0', 
    label: 'HSs', 
    type: 'connect_boards' as const,
    boardId: '1265638639',
    sourceColumn: 'text'
  },
  { 
    id: 'status5', 
    label: 'Miguelchoice', 
    type: 'dropdown' as const,
    options: ["Not my type", "yes, seems right to me!"]
  },
  { 
    id: 'color7', 
    label: 'Teresachoice', 
    type: 'dropdown' as const,
    options: ["Not my type", "yes, seems right to me!"]
  },
  { 
    id: 'color0', 
    label: 'Lolachoice', 
    type: 'dropdown' as const,
    options: ["Not my type", "yes, seems right to me!"]
  },
  { id: 'email__1', label: '2nd e-mail', type: 'email' as const }
]

const defaultInquiryFormFields: FormField[] = [
  {
    id: 'brideName',
    label: "Bride's Name",
    title: "Bride's Name",
    subtitle: "Please enter the bride's full name",
    type: 'text',
    required: true,
    enabled: true,
    invisible: false,
    preselectedValue: '',
    mondayColumn: 'bride_name',
    mondayColumnType: 'text',
    helpText: "Not a bride? Please read the text above this form"
  },
  {
    id: 'email',
    label: 'Email Address',
    title: 'Email Address',
    subtitle: 'Your primary contact email',
    type: 'email',
    required: true,
    enabled: true,
    invisible: false,
    preselectedValue: '',
    mondayColumn: 'email',
    mondayColumnType: 'email',
    helpText: "Please provide one e-mail address only. Your info will automatically be sent to this address."
  },
  {
    id: 'weddingDate',
    label: 'Wedding Date',
    title: 'Wedding Date',
    subtitle: 'When is your special day?',
    type: 'date',
    required: true,
    enabled: true,
    invisible: false,
    preselectedValue: '',
    mondayColumn: 'wedding_date',
    mondayColumnType: 'date',
    helpText: "If there is more than one date, please insert the main event here and the other required dates under Description/Observations."
  },
  {
    id: 'beautyVenue',
    label: 'Beauty Venue',
    title: 'Beauty Venue',
    subtitle: 'Where will your beauty services take place?',
    type: 'text',
    required: true,
    enabled: true,
    invisible: false,
    preselectedValue: '',
    mondayColumn: 'beauty_venue',
    mondayColumnType: 'text',
    helpText: "Where will you be having your make-up/hair done? (Please don't write \"Wedding Venue\" or \"Home\", give us the name of a Hotel, Wedding Venue...)"
  },
  {
    id: 'beautyServices',
    label: 'Beauty Services',
    title: 'Beauty Services',
    subtitle: 'Select the services you need',
    type: 'checkbox',
    required: false,
    enabled: true,
    invisible: false,
    preselectedValue: '',
    mondayColumn: 'beauty_services',
    mondayColumnType: 'dropdown',
    options: ['Hair', 'Make-up'],
    helpText: "Which service(s) will you be needing for your wedding?"
  },
  {
    id: 'hairstylist',
    label: 'Who would you like your hairstylist to be?',
    title: 'Hairstylist Selection',
    subtitle: 'Choose your preferred hairstylist',
    type: 'select',
    required: false,
    enabled: true,
    invisible: false,
    preselectedValue: '',
    mondayColumn: 'connect_boards0',
    mondayColumnType: 'connect_boards',
    helpText: "Please select one of our hairstylists."
  },
  {
    id: 'makeupArtist',
    label: 'Who would you like your makeup artist to be?',
    title: 'Makeup Artist Selection',
    subtitle: 'Choose your preferred makeup artist',
    type: 'select',
    required: false,
    enabled: true,
    invisible: false,
    preselectedValue: '',
    mondayColumn: 'connect_boards',
    mondayColumnType: 'connect_boards',
    helpText: "Please select one of our makeup artists."
  },
  {
    id: 'country',
    label: 'Country',
    title: 'Country',
    subtitle: 'Your country of residence',
    type: 'select',
    required: true,
    enabled: true,
    invisible: false,
    preselectedValue: '',
    mondayColumn: 'country',
    mondayColumnType: 'country',
    helpText: "Please select your country of residence."
  },
  {
    id: 'description',
    label: 'Description/Observations',
    title: 'Additional Information',
    subtitle: 'Any special requests or details',
    type: 'textarea',
    required: false,
    enabled: true,
    invisible: false,
    preselectedValue: '',
    mondayColumn: 'description',
    mondayColumnType: 'text',
    placeholder: "Any additional information or special requests...",
    helpText: "Any specific description or observation you'd like us to know."
  }
]

const defaultMuaFormFields: FormField[] = [
  {
    id: 'brideName',
    label: "Bride's Name",
    title: "Bride's Name",
    subtitle: "First and last name",
    type: 'text',
    required: true,
    enabled: true,
    invisible: false,
    preselectedValue: '',
    mondayColumn: 'bride_name',
    mondayColumnType: 'text',
    helpText: "First and last name",
    editable: false
  },
  {
    id: 'email',
    label: 'Email Address',
    title: 'Email Address',
    subtitle: 'Please provide one e-mail address only. Your info will automatically be sent to this address.',
    type: 'email',
    required: true,
    enabled: true,
    invisible: false,
    preselectedValue: '',
    mondayColumn: 'email',
    mondayColumnType: 'email',
    helpText: "Please provide one e-mail address only. Your info will automatically be sent to this address.",
    editable: false
  },
  {
    id: 'weddingDate',
    label: 'Wedding Date',
    title: 'Wedding Date',
    subtitle: 'If there is more than one date, please insert the main event here and the other required dates under Description/Observations.',
    type: 'date',
    required: true,
    enabled: true,
    invisible: false,
    preselectedValue: '',
    mondayColumn: 'wedding_date',
    mondayColumnType: 'date',
    helpText: "If there is more than one date, please insert the main event here and the other required dates under Description/Observations.",
    editable: false
  },
  {
    id: 'beautyVenue',
    label: 'Beauty Venue',
    title: 'Beauty Venue',
    subtitle: 'Where will you be having your make-up/hair done? (Please don\'t write "Wedding Venue" or "Home", give us the name of a Hotel, Wedding Venue...)',
    type: 'text',
    required: true,
    enabled: true,
    invisible: false,
    preselectedValue: '',
    mondayColumn: 'beauty_venue',
    mondayColumnType: 'text',
    helpText: "Where will you be having your make-up/hair done? (Please don't write \"Wedding Venue\" or \"Home\", give us the name of a Hotel, Wedding Venue...)",
    editable: false
  },
  {
    id: 'description',
    label: 'Description/Observations',
    title: 'Description/Observations',
    subtitle: 'Any specific description or observation you\'d like us to know.',
    type: 'textarea',
    required: false,
    enabled: true,
    invisible: false,
    preselectedValue: '',
    mondayColumn: 'description',
    mondayColumnType: 'text',
    placeholder: "Any additional information or special requests...",
    helpText: "Any specific description or observation you'd like us to know.",
    editable: false
  },
  {
    id: 'hairstylistChoice',
    label: 'DoesSheWantHair?',
    title: 'This artist does make-up only. Did you like any hairstylist in specific?',
    subtitle: 'Select if you would like hairstyling services in addition to makeup',
    type: 'select',
    required: true,
    enabled: true,
    invisible: false,
    preselectedValue: '',
    mondayColumn: 'hairstylist_choice',
    mondayColumnType: 'dropdown',
    options: [
      'no, thank you',
      "I don't know which hairstylist to choose",
      'Agne Kanapeckaite',
      'Lília Costa',
      'Andreia de Matos',
      'Eric Ribeiro',
      'Oksana Grybinnyk',
      'Joana Carvalho',
      'Olga Hilário'
    ],
    helpText: "Select if you would like hairstyling services in addition to makeup",
    editable: true,
    editableFields: ['title', 'helpText']
  },
  {
    id: 'muaSelection',
    label: 'Form MUA?',
    title: 'Form MUA?',
    subtitle: 'Selected makeup artist',
    type: 'select',
    required: false,
    enabled: true,
    invisible: true,
    preselectedValue: '',
    mondayColumn: 'connect_boards',
    mondayColumnType: 'connect_boards',
    options: [
      'Lola Carvalho (founder artist)',
      'Teresa Pilkington (founder artist)',
      'Miguel Stapleton (founder artist)'
    ],
    helpText: "Select the makeup artist for this application",
    editable: false
  },
  {
    id: 'country',
    label: 'Country',
    title: 'Country',
    subtitle: 'Your country of residence',
    type: 'select',
    required: true,
    enabled: true,
    invisible: false,
    preselectedValue: '',
    mondayColumn: 'country',
    mondayColumnType: 'country',
    helpText: "Please select your country of residence",
    editable: false
  }
]

const defaultFormFields: FormField[] = defaultInquiryFormFields

interface FormConfig {
  title: string
  subtitle: string
  recordNamePrefix: string
  fields: FormField[]
}

interface SavedConfig {
  name: string
  config: FormConfig & {
    hairstylists: string[]
    makeupArtists: string[]
  }
  createdAt: string
  updatedAt: string
}

interface SaveDialogState {
  isOpen: boolean
  configName: string
  isDuplicate: boolean
  existingConfigName?: string
}

const defaultFormTypeConfigs: Record<FormType, FormConfig> = {
  inquiry: {
    title: formTypeConfigs.inquiry.title,
    subtitle: formTypeConfigs.inquiry.subtitle,
    recordNamePrefix: formTypeConfigs.inquiry.recordNamePrefix,
    fields: [...defaultInquiryFormFields]
  },
  mua: {
    title: formTypeConfigs.mua.title,
    subtitle: formTypeConfigs.mua.subtitle,
    recordNamePrefix: formTypeConfigs.mua.recordNamePrefix,
    fields: [...defaultMuaFormFields]
  }
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    brideName: '',
    email: '',
    weddingDate: '',
    beautyVenue: '',
    description: '',
    country: '',
    hairstylist: '',
    makeupArtist: '',
    hairstylistChoice: '',
    services: [],
    hStatus: '',
    hairstylistSelection: '',
    MStatus: '',
    Lolachoice: '',
    Teresachoice: '',
    Miguelchoice: '',
    muaSelection: '',
    Mdecision: '',
    Hdecision: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [triadeUrl, setTriadeUrl] = useState('')
  const [showEmbedCode, setShowEmbedCode] = useState(false)
  const [showArtistManagement, setShowArtistManagement] = useState(false)
  const [customFields, setCustomFields] = useState<Array<{
    id: string
    title: string
    subtitle?: string
    mondayField: string
    required: boolean
  }>>([])
  const [newField, setNewField] = useState({
    title: '',
    subtitle: '',
    mondayField: '',
    required: false
  })
  const [selectedEmbedConfig, setSelectedEmbedConfig] = useState('')
  const [currentFormType, setCurrentFormType] = useState<FormType>('inquiry')
  const [formConfigs, setFormConfigs] = useState<Record<FormType, FormConfig>>(defaultFormTypeConfigs)
  const [editableHairstylists, setEditableHairstylists] = useState([...hairstylists])
  const [editableMakeupArtists, setEditableMakeupArtists] = useState([...makeupArtists])
  const [newArtist, setNewArtist] = useState({
    name: '',
    boardId: '',
    artistId: '',
    type: 'hairstylist' as 'hairstylist' | 'makeup'
  })
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([])
  const [saveDialog, setSaveDialog] = useState<SaveDialogState>({
    isOpen: false,
    configName: '',
    isDuplicate: false
  })
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false)
  const [showFieldEditor, setShowFieldEditor] = useState(false)
  const [editingField, setEditingField] = useState<FormField | null>(null)
  const [selectedMondayColumn, setSelectedMondayColumn] = useState('')
  const [boardItems, setBoardItems] = useState<{ [boardId: string]: Array<{ id: string; name: string }> }>({})
  const [loadingBoardItems, setLoadingBoardItems] = useState<{ [boardId: string]: boolean }>({})
  const [selectedMUAArtist, setSelectedMUAArtist] = useState<MUAConfig | null>(null)

  const fetchBoardItems = async (boardId: string, columnId?: string) => {
    const cacheKey = columnId ? `${boardId}-${columnId}` : boardId
    if (boardItems[cacheKey] || loadingBoardItems[cacheKey]) return

    setLoadingBoardItems(prev => ({ ...prev, [cacheKey]: true }))
    
    try {
      const url = columnId 
        ? `/api/board-items?boardId=${boardId}&columnId=${columnId}`
        : `/api/board-items?boardId=${boardId}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (response.ok && data.items) {
        setBoardItems(prev => ({ ...prev, [cacheKey]: data.items }))
        console.log(`Fetched ${data.items.length} items for ${columnId || boardId}:`, data.items)
      } else {
        console.error('Failed to fetch board items:', data.error)
      }
    } catch (error) {
      console.error('Error fetching board items:', error)
    } finally {
      setLoadingBoardItems(prev => ({ ...prev, [cacheKey]: false }))
    }
  }

  // List of existing form fields that are already mapped
  const existingFormFields = [
    'bride_name',
    'email', 
    'wedding_date',
    'beauty_venue',
    'beauty_services',
    'hairstylist',
    'makeup_artist',
    'country',
    'description'
  ]

  // Get available Monday.com fields (excluding already used ones)
  const getAvailableMondayFields = () => {
    const allFields = [
      { value: 'bride_name', label: 'Bride Name' },
      { value: 'email', label: 'Email' },
      { value: 'wedding_date', label: 'Wedding Date' },
      { value: 'beauty_venue', label: 'Beauty Venue' },
      { value: 'beauty_services', label: 'Beauty Services' },
      { value: 'hairstylist', label: 'Hairstylist' },
      { value: 'makeup_artist', label: 'Makeup Artist' },
      { value: 'country', label: 'Country' },
      { value: 'description', label: 'Description/Observations' },
      { value: 'status', label: 'Status' },
      { value: 'creation_date', label: 'Creation Date' },
      { value: 'last_updated', label: 'Last Updated' }
    ]

    const usedFields = [...existingFormFields, ...customFields.map(field => field.mondayField)]
    return allFields.filter(field => !usedFields.includes(field.value))
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleServiceChange = (service: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      services: checked
        ? [...prev.services, service]
        : prev.services.filter(s => s !== service),
      // Reset hairstylist if Hair is unchecked
      hairstylist: checked || service !== 'Hair' ? prev.hairstylist : ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation for Inquiry form only
    if (currentFormType === 'inquiry') {
      if (!formData.services || formData.services.length === 0) {
        setSubmitError('Please select at least one beauty service')
        return
      }

      // Validate hairstylist selection if Hair is selected
      if (formData.services && formData.services.includes('Hair') && !formData.hairstylist) {
        setSubmitError('Please select a hairstylist when Hair service is chosen')
        return
      }

      if (formData.services && formData.services.includes('Make-up') && !formData.makeupArtist) {
        setSubmitError('Please select a makeup artist when Make-up service is chosen')
        return
      }
    }

    // Check for missing required fields, considering invisible fields with preselected values as answered
    const missingRequiredFields = formConfigs[currentFormType].fields.filter(field => {
      // Only check enabled, required fields
      if (!field.required || !field.enabled) return false
      
      // If field is invisible and has a preselected value, it's considered answered
      if (field.invisible && field.preselectedValue) return false
      
      // For visible fields, check if they have a value in formData
      const fieldValue = formData[field.id as keyof FormData]
      return !fieldValue || 
             (Array.isArray(fieldValue) && fieldValue.length === 0)
    })

    if (missingRequiredFields.length > 0) {
      setSubmitError(`Please fill in all required fields: ${missingRequiredFields.map(f => f.title || f.label).join(', ')}`)
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    setSubmitMessage('')

    try {
      // Prepare form data with conditional logic for MUA form
      let submissionData = { ...formData }
      
      if (currentFormType === 'mua') {
        // Handle hairstylist choice logic
        const hairstylistChoice = formData.hairstylistChoice
        
        if (hairstylistChoice === 'no, thank you') {
          // Set Services to "Make-up" only and HStatus to "not interested"
          submissionData.services = ['Make-up']
          submissionData.hStatus = 'not interested'
          submissionData.hairstylistSelection = ''
          submissionData.Hdecision = '(not interested)'
        } else if (hairstylistChoice === "I don't know which hairstylist to choose") {
          // Set Services to both "Make-up" and "Hair", HStatus to "undecided- inquire availabilities"
          submissionData.services = ['Make-up', 'Hair']
          submissionData.hStatus = 'undecided- inquire availabilities'
          submissionData.hairstylistSelection = ''
          submissionData.Hdecision = "I don't know which hairstylist to choose!"
        } else if (hairstylistChoice && hairstylistChoice !== '') {
          // Specific hairstylist selected - set Services to both, connect to hairstylist
          submissionData.services = ['Make-up', 'Hair']
          submissionData.hairstylistSelection = hairstylistChoice
          submissionData.hStatus = 'Travelling fee + inquire artist'
          submissionData.Hdecision = 'let me choose a specific hairstylist'
        }

        // Handle MUA selection and set appropriate choice column
        const muaSelection = formConfigs[currentFormType].fields.find(f => f.id === 'muaSelection')?.preselectedValue
        if (muaSelection === 'Lola Carvalho (founder artist)') {
          submissionData.Lolachoice = 'Yes, seems right to me!'
          submissionData.muaSelection = '1260830807' // Lola's ID
        } else if (muaSelection === 'Teresa Pilkington (founder artist)') {
          submissionData.Teresachoice = 'Yes, seems right to me!' // Fix: Capital Y
          submissionData.muaSelection = '1260830808' // Teresa's ID
        } else if (muaSelection === 'Miguel Stapleton (founder artist)') {
          submissionData.Miguelchoice = 'Yes, seems right to me!'
          submissionData.muaSelection = '1260830809' // Miguel's ID
        }

        // Set MStatus to "Direct choice"
        submissionData.MStatus = 'Direct choice'
        
        // Always set Mdecision for MUA forms
        submissionData.Mdecision = 'let me choose a specific make-up artist'
      }

      // Collect preselected values from invisible fields
      const preselectedValues = formConfigs[currentFormType].fields.reduce((acc, field) => {
        if (field.invisible && field.preselectedValue) {
          acc[field.id] = field.preselectedValue
        }
        return acc
      }, {} as Record<string, string>)

      const response = await fetch('/api/wedding-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submissionData,
          ...preselectedValues,
          recordNamePrefix: formConfigs[currentFormType].recordNamePrefix,
          formType: currentFormType
        }),
      })

      if (response.ok) {
        const successMessage = currentFormType === 'inquiry' 
          ? 'Thank you for your inquiry.\n\nWe\'ll get back to you ASAP!'
          : 'Thank you for your application.\n\nWe\'ll review your submission and get back to you soon!'
        setSubmitMessage(successMessage)
        if (response.ok) {
          const data = await response.json()
          if (data.triadeUrl) {
            setTriadeUrl(data.triadeUrl)
          }
          // Reset form
          setFormData({
            brideName: '',
            email: '',
            weddingDate: '',
            beautyVenue: '',
            description: '',
            country: '',
            hairstylist: '',
            makeupArtist: '',
            hairstylistChoice: '',
            services: [],
            hStatus: '',
            hairstylistSelection: '',
            MStatus: '',
            Lolachoice: '',
            Teresachoice: '',
            Miguelchoice: '',
            muaSelection: '',
            Mdecision: '',
            Hdecision: ''
          })
        }
      } else {
        setSubmitError('Failed to submit form')
      }
    } catch (error) {
      setSubmitError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfigChange = (field: keyof FormConfig, value: string) => {
    setFormConfigs(prev => ({
      ...prev,
      [currentFormType]: {
        ...prev[currentFormType],
        [field]: value
      }
    }))
  }

  const loadSavedConfigs = async () => {
    try {
      setIsLoadingConfigs(true)
      const response = await fetch('/api/form-configs')
      const responseClone = response.clone()
      try {
        const data = await response.json()
        if (response.ok) {
          setSavedConfigs(data.configs || [])
        }
      } catch (jsonError) {
        console.error('[Frontend] Failed to parse JSON response:', jsonError)
        const textResponse = await responseClone.text()
        console.error('[Frontend] Raw response text:', textResponse)
        throw new Error(`Server returned non-JSON response (${response.status}): ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error loading configs:', error)
    } finally {
      setIsLoadingConfigs(false)
    }
  }

  const handleOpenSaveDialog = () => {
    setSaveDialog({
      isOpen: true,
      configName: '',
      isDuplicate: false
    })
  }

  const handleSaveDialogNameChange = (name: string) => {
    const isDuplicate = savedConfigs.some(config => config.name === name)
    setSaveDialog(prev => ({
      ...prev,
      configName: name,
      isDuplicate,
      existingConfigName: isDuplicate ? name : undefined
    }))
  }

  const handleSaveConfig = async (overwrite = false) => {
    console.log('[Frontend] handleSaveConfig called with overwrite:', overwrite)
    console.log('[Frontend] saveDialog state:', saveDialog)
    
    if (!saveDialog.configName.trim()) {
      console.log('[Frontend] Empty config name, showing alert')
      alert('Please enter a configuration name')
      return
    }

    try {
      const configToSave = {
        ...formConfigs[currentFormType],
        hairstylists: editableHairstylists,
        makeupArtists: editableMakeupArtists
      }

      // Add MUA prefix for MUA form configurations
      const configName = currentFormType === 'mua' 
        ? `MUA ${saveDialog.configName.trim()}`
        : saveDialog.configName.trim()

      console.log('[Frontend] Attempting to save config:', {
        name: configName,
        overwrite,
        configToSave
      })

      console.log('[Frontend] Making fetch request to /api/form-configs')
      const response = await fetch('/api/form-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: configName,
          config: configToSave,
          overwrite
        }),
      })

      console.log('[Frontend] Fetch response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        contentType: response.headers.get('content-type')
      })

      let data
      const responseClone = response.clone()
      try {
        data = await response.json()
        console.log('[Frontend] Response data:', data)
      } catch (jsonError) {
        console.error('[Frontend] Failed to parse JSON response:', jsonError)
        const textResponse = await responseClone.text()
        console.error('[Frontend] Raw response text:', textResponse)
        throw new Error(`Server returned non-JSON response (${response.status}): ${response.statusText}`)
      }

      if (response.ok) {
        console.log('[Frontend] Save successful')
        alert('Configuration saved successfully!')
        setSaveDialog({ isOpen: false, configName: '', isDuplicate: false })
        loadSavedConfigs() // Refresh the list
      } else if (response.status === 409 && !overwrite) {
        // Configuration name already exists, show the duplicate warning
        console.log('[Frontend] Duplicate detected, showing overwrite option')
        // The dialog should already show the duplicate warning since isDuplicate is set
        // Just ensure the user sees the warning
      } else {
        console.error('[Frontend] Save failed:', data)
        alert(data.error || 'Failed to save configuration')
      }
    } catch (error) {
      console.error('[Frontend] Network error during save:', error)
      console.error('[Frontend] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error,
        error: error
      })
      alert('Network error. Please try again.')
    }
  }

  const handleLoadConfig = async (configName: string) => {
    try {
      const config = savedConfigs.find(c => c.name === configName)
      if (config) {
        console.log('[DEBUG] Loading config:', configName)
        console.log('[DEBUG] Config fields:', config.config.fields)
        console.log('[DEBUG] Default fields:', defaultFormFields)
        
        const fieldsToUse = config.config.fields || [...defaultFormFields]
        console.log('[DEBUG] Fields to use:', fieldsToUse)
        
        setFormConfigs(prev => ({
          ...prev,
          [currentFormType]: {
            title: config.config.title,
            subtitle: config.config.subtitle,
            recordNamePrefix: config.config.recordNamePrefix,
            fields: fieldsToUse
          }
        }))
        setEditableHairstylists(config.config.hairstylists || [...hairstylists])
        setEditableMakeupArtists(config.config.makeupArtists || [...makeupArtists])
        
        // Sync selectedMUAArtist state for MUA forms
        if (currentFormType === 'mua') {
          const muaField = fieldsToUse.find(f => f.id === 'muaSelection')
          console.log('[DEBUG] Loading MUA config - muaField:', muaField)
          console.log('[DEBUG] Available muaArtistOptions:', muaArtistOptions)
          
          if (muaField?.preselectedValue) {
            console.log('[DEBUG] Looking for artistId:', muaField.preselectedValue)
            const artistConfig = muaArtistOptions.find(artist => artist.artistId === muaField.preselectedValue)
            console.log('[DEBUG] Found artistConfig:', artistConfig)
            setSelectedMUAArtist(artistConfig || null)
          } else {
            console.log('[DEBUG] No preselectedValue found, setting to null')
            setSelectedMUAArtist(null)
          }
        }
        
        alert(`Configuration "${configName}" loaded successfully!`)
      }
    } catch (error) {
      console.error('[DEBUG] Error loading config:', error)
      alert('Failed to load configuration')
    }
  }

  const handleDeleteConfig = async (configName: string) => {
    if (!confirm(`Are you sure you want to delete the configuration "${configName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/form-configs?name=${encodeURIComponent(configName)}`, {
        method: 'DELETE'
      })

      const responseClone = response.clone()
      try {
        const data = await response.json()
        if (response.ok) {
          alert('Configuration deleted successfully!')
          loadSavedConfigs() // Refresh the list
        } else {
          alert(data.error || 'Failed to delete configuration')
        }
      } catch (jsonError) {
        console.error('[Frontend] Failed to parse JSON response:', jsonError)
        const textResponse = await responseClone.text()
        console.error('[Frontend] Raw response text:', textResponse)
        throw new Error(`Server returned non-JSON response (${response.status}): ${response.statusText}`)
      }
    } catch (error) {
      alert('Network error. Please try again.')
    }
  }

  // Load saved configs on component mount
  useEffect(() => {
    loadSavedConfigs()
  }, [])

  const handleAddArtist = () => {
    if (newArtist.type === 'hairstylist') {
      setEditableHairstylists([...editableHairstylists, newArtist.name])
    } else {
      setEditableMakeupArtists([...editableMakeupArtists, newArtist.name])
    }
    setNewArtist({
      name: '',
      boardId: '',
      artistId: '',
      type: 'hairstylist'
    })
  }

  const handleRemoveArtist = (artist: string, type: 'hairstylist' | 'makeup') => {
    if (type === 'hairstylist') {
      setEditableHairstylists(editableHairstylists.filter(a => a !== artist))
    } else {
      setEditableMakeupArtists(editableMakeupArtists.filter(a => a !== artist))
    }
  }

  const handleFieldToggle = (fieldId: string) => {
    setFormConfigs(prev => ({
      ...prev,
      [currentFormType]: {
        ...prev[currentFormType],
        fields: prev[currentFormType].fields.map(field =>
          field.id === fieldId ? { ...field, enabled: !field.enabled } : field
        )
      }
    }))
  }

  const handleFieldEdit = (field: FormField) => {
    console.log('[DEBUG] Editing field:', field)
    setEditingField(field)
    
    // Fetch board items if this is a connect_boards field
    if (field.mondayColumn === 'connect_boards0') { // HSs
      let targetBoardId = '1260998854' // Hairstylist board
      console.log('[DEBUG] HSs field - fetching from hairstylist board:', targetBoardId);
      fetchBoardItems(targetBoardId);
    } else if (field.mondayColumn === 'connect_boards') { // MUAs
      let targetBoardId = '1260830748' // Makeup artist board
      console.log('[DEBUG] MUAs field - fetching from makeup artist board:', targetBoardId);
      fetchBoardItems(targetBoardId);
    }
  }

  const handleFieldSave = () => {
    if (!editingField) return
    
    // Validate invisible fields have preselected values
    if (editingField.invisible && (!editingField.preselectedValue || editingField.preselectedValue.trim() === '')) {
      alert('Invisible fields must have a preselected value. Please enter a value or uncheck "Make Invisible".')
      return
    }
    
    if (editingField.id === 'muaSelection') {
      editingField.invisible = true;
    }
    
    setFormConfigs(prev => ({
      ...prev,
      [currentFormType]: {
        ...prev[currentFormType],
        fields: prev[currentFormType].fields.map(field =>
          field.id === editingField.id ? editingField : field
        )
      }
    }))
    setEditingField(null)
  }

  const handleFieldCancel = () => {
    setEditingField(null)
  }

  const addCustomField = () => {
    if (!selectedMondayColumn) {
      alert('Please select a Monday.com column first')
      return
    }

    const selectedColumn = mondayClientsColumns.find(col => col.id === selectedMondayColumn)
    if (!selectedColumn) {
      alert('Invalid column selection')
      return
    }

    // Determine field type based on Monday column type
    let fieldType: FormField['type'] = 'text'
    switch (selectedColumn.type) {
      case 'email':
        fieldType = 'email'
        break
      case 'dropdown':
        fieldType = 'select'
        break
      case 'connect_boards':
        fieldType = 'select'
        break
      default:
        fieldType = 'text'
    }

    const newField: FormField = {
      id: `custom_${Date.now()}`,
      label: selectedColumn.label,
      title: selectedColumn.id,
      subtitle: `This field maps to the ${selectedColumn.label} column in Monday.com Clients board`,
      type: fieldType,
      required: false,
      enabled: true,
      invisible: false,
      preselectedValue: '',
      mondayColumn: selectedColumn.id,
      mondayColumnType: selectedColumn.type,
      options: selectedColumn.options,
      helpText: `This field maps to the ${selectedColumn.label} column in Monday.com Clients board`
    }

    setFormConfigs(prev => ({
      ...prev,
      [currentFormType]: {
        ...prev[currentFormType],
        fields: [...prev[currentFormType].fields, newField]
      }
    }))
    setEditingField(newField)
    setSelectedMondayColumn('')
  }

  const removeField = (fieldId: string) => {
    setFormConfigs(prev => ({
      ...prev,
      [currentFormType]: {
        ...prev[currentFormType],
        fields: prev[currentFormType].fields.filter(field => field.id !== fieldId)
      }
    }))
  }

  const updateMUAFormFields = (artistConfig: MUAConfig | null) => {
    setFormConfigs(prev => ({
      ...prev,
      mua: {
        ...prev.mua,
        fields: prev.mua.fields.map(field => {
          if (field.id === 'muaSelection') {
            return {
              ...field,
              preselectedValue: artistConfig?.artistId || ''
            }
          }
          if (field.id === 'artistChoice') {
            return {
              ...field,
              mondayColumn: artistConfig?.choiceColumn || '',
              preselectedValue: artistConfig ? 'yes, seems right to me!' : ''
            }
          }
          return field
        })
      }
    }))
  }

  const handleMUAArtistSelection = (artistName: string) => {
    const artistConfig = muaArtistOptions.find(artist => artist.artistName === artistName)
    setSelectedMUAArtist(artistConfig || null)
    updateMUAFormFields(artistConfig || null)
  }

  return (
    <>
      <Head>
        <title>{formConfigs[currentFormType].title}</title>
        <meta name="description" content={formConfigs[currentFormType].subtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          display: 'flex',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            flex: 1,
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <img 
                src="/fflogo.jpg" 
                alt="Company Logo" 
                style={{
                  maxWidth: '200px',
                  height: 'auto',
                  marginBottom: '1.5rem'
                }}
              />
            </div>
            <h1 style={{ 
              textAlign: 'center', 
              marginBottom: '1rem',
              color: '#333'
            }}>
              {formConfigs[currentFormType].title}
            </h1>
            <p style={{
              textAlign: 'center',
              marginBottom: '2rem',
              color: '#666',
              fontSize: '16px',
              lineHeight: '1.4'
            }}>
              {formConfigs[currentFormType].subtitle}
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              {Object.keys(formTypeConfigs).map((formType) => (
                <button
                  key={formType}
                  onClick={() => setCurrentFormType(formType as FormType)}
                  style={{
                    padding: '1rem',
                    backgroundColor: currentFormType === formType ? '#007bff' : '#f8f9fa',
                    color: currentFormType === formType ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {formTypeConfigs[formType as FormType].label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {formConfigs[currentFormType].fields.filter(field => !field.invisible && field.enabled).map(field => {
                // Special handling for conditional fields (inquiry form only)
                if (currentFormType === 'inquiry') {
                  if (field.id === 'hairstylist' && (!formData.services || !formData.services.includes('Hair'))) {
                    return null
                  }
                  if (field.id === 'makeupArtist' && (!formData.services || !formData.services.includes('Make-up'))) {
                    return null
                  }
                }

                return (
                  <div key={field.id}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      {field.title || field.label} {field.required ? '*' : ''}
                    </label>
                    {field.helpText && (
                      <p style={{ 
                        marginBottom: '1rem', 
                        fontSize: '14px', 
                        color: '#666',
                        fontStyle: 'italic'
                      }}>
                        {field.helpText}
                      </p>
                    )}
                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={formData[field.id as keyof FormData] as string || ''}
                        onChange={(e) => handleInputChange(field.id as keyof FormData, e.target.value)}
                        required={field.required}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '16px'
                        }}
                      />
                    )}
                    {field.type === 'email' && (
                      <input
                        type="email"
                        value={formData[field.id as keyof FormData] as string || ''}
                        onChange={(e) => handleInputChange(field.id as keyof FormData, e.target.value)}
                        required={field.required}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '16px'
                        }}
                      />
                    )}
                    {field.type === 'date' && (
                      <input
                        type="date"
                        value={formData[field.id as keyof FormData] as string || ''}
                        onChange={(e) => handleInputChange(field.id as keyof FormData, e.target.value)}
                        required={field.required}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '16px'
                        }}
                      />
                    )}
                    {field.type === 'textarea' && (
                      <textarea
                        value={formData[field.id as keyof FormData] as string || ''}
                        onChange={(e) => handleInputChange(field.id as keyof FormData, e.target.value)}
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '16px',
                          resize: 'vertical'
                        }}
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    )}
                    {field.type === 'select' && (
                      <select
                        value={formData[field.id as keyof FormData] as string || ''}
                        onChange={(e) => handleInputChange(field.id as keyof FormData, e.target.value)}
                        required={field.required}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '16px',
                          backgroundColor: 'white'
                        }}
                      >
                        <option value="">Please select an option</option>
                        {field.options && field.options.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                        {!field.options && field.mondayColumnType === 'dropdown' && mondayClientsColumns.find(col => col.id === field.mondayColumn)?.options?.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                        {field.id === 'hairstylist' && editableHairstylists.map(stylist => (
                          <option key={stylist} value={stylist}>
                            {stylist}
                          </option>
                        ))}
                        {field.id === 'makeupArtist' && editableMakeupArtists.map(artist => (
                          <option key={artist} value={artist}>
                            {artist}
                          </option>
                        ))}
                        {field.id === 'country' && countries.map(country => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                        {field.mondayColumnType === 'connect_boards' && (
                          (field.mondayColumn === 'connect_boards0' && boardItems['1260998854']) || 
                          (field.mondayColumn === 'connect_boards' && boardItems['1260830748']) ||
                          (field.mondayColumn && boardItems[field.mondayColumn])
                        ) && (
                          (field.mondayColumn === 'connect_boards0' ? boardItems['1260998854'] : 
                           field.mondayColumn === 'connect_boards' ? boardItems['1260830748'] : 
                           field.mondayColumn ? boardItems[field.mondayColumn] : [])
                        ).map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {field.type === 'checkbox' && (
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {field.options && field.options.map(option => (
                          <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="checkbox"
                              checked={(formData[field.id as keyof FormData] as string[])?.includes(option) || false}
                              onChange={(e) => handleServiceChange(option, e.target.checked)}
                              style={{ transform: 'scale(1.2)' }}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '1rem',
                  backgroundColor: isSubmitting ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                {isSubmitting ? 'Submitting...' : formTypeConfigs[currentFormType].submitButtonText}
              </button>

              {submitError && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  borderRadius: '4px',
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  border: '1px solid #f5c6cb',
                  textAlign: 'center'
                }}>
                  {submitError}
                </div>
              )}

              {/* Embed Form Section - Tab Specific */}
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <button
                  onClick={() => setShowEmbedCode(!showEmbedCode)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {showEmbedCode ? 'Hide Embed Code' : `Embed ${formTypeConfigs[currentFormType].label}`}
                </button>

                {showEmbedCode && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#333' }}>Embeddable {formTypeConfigs[currentFormType].label} Code</h3>
                    
                    {/* Configuration Selection */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Select Configuration to Embed:
                      </label>
                      <select
                        value={selectedEmbedConfig}
                        onChange={(e) => setSelectedEmbedConfig(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '16px',
                          backgroundColor: 'white'
                        }}
                      >
                        <option value="">Default Configuration</option>
                        {savedConfigs
                          .filter(config => currentFormType === 'mua' ? config.name.startsWith('MUA ') : !config.name.startsWith('MUA '))
                          .map((config) => (
                          <option key={config.name} value={config.name}>
                            {config.name}
                          </option>
                        ))}
                      </select>
                      <p style={{ fontSize: '12px', color: '#666', marginTop: '0.25rem' }}>
                        Choose a saved configuration or use the default settings
                      </p>
                    </div>

                    <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
                      Copy and paste this code into your website to embed the {formTypeConfigs[currentFormType].label.toLowerCase()}:
                    </p>
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e9ecef',
                      borderRadius: '4px',
                      padding: '1rem',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      overflow: 'auto'
                    }}>
                      <code>{`<div align="center">
<iframe
width="900"
height="1600"
src="${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/embed${selectedEmbedConfig ? `?config=${encodeURIComponent(selectedEmbedConfig)}` : ''}${selectedEmbedConfig ? '&' : '?'}formType=${currentFormType}">
</iframe>
</div>`}</code>
                    </div>
                    <button
                      onClick={() => {
                        const embedCode = `<div align="center">
<iframe
width="900"
height="1600"
src="${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/embed${selectedEmbedConfig ? `?config=${encodeURIComponent(selectedEmbedConfig)}` : ''}${selectedEmbedConfig ? '&' : '?'}formType=${currentFormType}">
</iframe>
</div>`
                        navigator.clipboard.writeText(embedCode)
                        alert('Embed code copied to clipboard!')
                      }}
                      style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                )}
              </div>
            </form>

            {submitMessage && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                borderRadius: '4px',
                backgroundColor: '#dff0d8',
                color: '#3c763d',
                textAlign: 'center'
              }}>
                {submitMessage}
                {triadeUrl && (
                  <p style={{ marginTop: '1rem' }}>
                    Your Triade URL: <a href={triadeUrl} target="_blank" rel="noopener noreferrer">{triadeUrl}</a>
                  </p>
                )}
              </div>
            )}
          </div>

          <div style={{
            flex: 1,
            maxWidth: '300px',
            margin: '0 auto',
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '1rem', color: '#333' }}>Form Editor</h2>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Title
              </label>
              <input
                type="text"
                value={formConfigs[currentFormType].title}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Record Name Prefix
              </label>
              <input
                type="text"
                value={formConfigs[currentFormType].recordNamePrefix}
                onChange={(e) => handleConfigChange('recordNamePrefix', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* Save Dialog */}
            {saveDialog.isOpen && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  minWidth: '400px',
                  maxWidth: '500px'
                }}>
                  <h3 style={{ marginBottom: '1rem', color: '#333' }}>Save Configuration</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Configuration Name
                    </label>
                    <input
                      type="text"
                      value={saveDialog.configName}
                      onChange={(e) => handleSaveDialogNameChange(e.target.value)}
                      placeholder="Enter configuration name..."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '16px'
                      }}
                      autoFocus
                    />
                  </div>

                  {saveDialog.isDuplicate && (
                    <div style={{
                      marginBottom: '1rem',
                      padding: '1rem',
                      backgroundColor: '#fff3cd',
                      border: '1px solid #ffeaa7',
                      borderRadius: '4px',
                      color: '#856404'
                    }}>
                      <strong>Warning:</strong> A configuration with the name "{saveDialog.existingConfigName}" already exists.
                      <br />
                      Do you want to overwrite it?
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setSaveDialog({ isOpen: false, configName: '', isDuplicate: false })}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    {saveDialog.isDuplicate && (
                      <button
                        onClick={() => setSaveDialog(prev => ({ 
                          ...prev, 
                          configName: '', 
                          isDuplicate: false, 
                          existingConfigName: undefined 
                        }))}
                        style={{
                          padding: '0.75rem 1.5rem',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Change Name
                      </button>
                    )}
                    <button
                      onClick={() => handleSaveConfig(saveDialog.isDuplicate)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: saveDialog.isDuplicate ? '#dc3545' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      {saveDialog.isDuplicate ? 'Overwrite' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Saved Configurations */}
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>Saved Configurations</h3>
              {isLoadingConfigs ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>Loading configurations...</p>
              ) : savedConfigs.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No saved configurations</p>
              ) : (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {savedConfigs.map((config) => (
                    <div key={config.name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem',
                      marginBottom: '0.5rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{config.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Updated: {new Date(config.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          onClick={() => handleLoadConfig(config.name)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDeleteConfig(config.name)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => loadSavedConfigs()}
              style={{
                padding: '0.75rem',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                marginTop: '0.5rem',
                width: '100%'
              }}
            >
              Refresh Configurations
            </button>

            <h3 style={{ marginBottom: '1rem', color: '#333' }}>Field Editor</h3>
            <button
              onClick={() => setShowFieldEditor(true)}
              style={{
                padding: '1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Edit Fields
            </button>

            {showFieldEditor && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  width: '600px',
                  maxHeight: '70vh',
                  overflowY: 'auto'
                }}>
                  <h3 style={{ marginBottom: '1rem', color: '#333' }}>Field Editor</h3>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {formConfigs[currentFormType].fields
                      .filter(field => {
                        // For MUA form, only show the 1 editable field
                        if (currentFormType === 'mua') {
                          return field.id === 'hairstylistChoice'
                        }
                        // For inquiry form, show all fields
                        return true
                      })
                      .map(field => (
                      <div key={field.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        marginBottom: '0.5rem',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{field.label}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            Type: {field.type}
                          </div>
                          {field.invisible && (
                            <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                              Invisible
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button
                            onClick={() => handleFieldToggle(field.id)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: field.enabled ? '#28a745' : '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            {field.enabled ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleFieldEdit(field)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removeField(field.id)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Select Monday.com Column
                    </label>
                    <select
                      value={selectedMondayColumn}
                      onChange={(e) => setSelectedMondayColumn(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '16px',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="">Select a Monday.com column...</option>
                      {mondayClientsColumns.map(column => (
                        <option key={column.id} value={column.id}>
                          {column.label} ({column.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={addCustomField}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      marginBottom: '1rem'
                    }}
                  >
                    Add Selected Field
                  </button>
                  <button
                    onClick={() => setShowFieldEditor(false)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>

                  {/* MUA Artist Configuration - only show for MUA form */}
                  {currentFormType === 'mua' && (
                    <div style={{ 
                      marginTop: '2rem', 
                      padding: '1.5rem', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '8px',
                      border: '2px solid #007bff'
                    }}>
                      <h3 style={{ marginBottom: '1rem', color: '#007bff' }}>MUA Artist Configuration</h3>
                      <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
                        Select which makeup artist this form is configured for. This selection is invisible to form users but determines the Monday.com mappings.
                      </p>
                      
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                          Selected Makeup Artist
                        </label>
                        <select
                          value={(() => {
                            const muaField = formConfigs[currentFormType]?.fields?.find(f => f.id === 'muaSelection');
                            const artistId = muaField?.preselectedValue || '';
                            console.log('[DEBUG] Dropdown render - artistId:', artistId);
                            // Find artist name by artistId for display
                            const artist = muaArtistOptions.find(a => a.artistId === artistId);
                            console.log('[DEBUG] Dropdown render - found artist:', artist);
                            const displayValue = artist?.artistName || '';
                            console.log('[DEBUG] Dropdown render - displaying:', displayValue);
                            return displayValue;
                          })()}
                          onChange={(e) => {
                            const selectedArtistName = e.target.value
                            console.log('[DEBUG] Dropdown onChange - selected:', selectedArtistName);
                            // Use the existing handleMUAArtistSelection function which properly syncs all states
                            handleMUAArtistSelection(selectedArtistName)
                          }}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '16px',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="">Select a makeup artist...</option>
                          {muaArtistOptions.map(option => (
                            <option key={option.artistName} value={option.artistName}>{option.artistName}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div style={{ 
                        padding: '0.75rem', 
                        backgroundColor: '#d4edda', 
                        border: '1px solid #c3e6cb',
                        borderRadius: '4px',
                        fontSize: '14px',
                        color: '#155724'
                      }}>
                        <strong>Note:</strong> This field is invisible on the form but required for proper Monday.com integration. 
                        The selected artist determines which choice columns are populated when forms are submitted.
                      </div>
                    </div>
                  )}

                  {/* Form Configuration Section */}
                  <div style={{ 
                    marginTop: '2rem', 
                    padding: '1.5rem', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '2px solid #28a745'
                  }}>
                    <h3 style={{ marginBottom: '1rem', color: '#28a745' }}>Form Configuration</h3>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Form Title
                      </label>
                      <input
                        type="text"
                        value={formConfigs[currentFormType].title}
                        onChange={(e) => {
                          setFormConfigs(prev => ({
                            ...prev,
                            [currentFormType]: {
                              ...prev[currentFormType],
                              title: e.target.value
                            }
                          }))
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '16px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Form Subtitle
                      </label>
                      <textarea
                        value={formConfigs[currentFormType].subtitle}
                        onChange={(e) => {
                          setFormConfigs(prev => ({
                            ...prev,
                            [currentFormType]: {
                              ...prev[currentFormType],
                              subtitle: e.target.value
                            }
                          }))
                        }}
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '16px',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save/Load Configuration Section */}
        <div style={{
          maxWidth: '600px',
          margin: '2rem auto 0',
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => handleOpenSaveDialog()}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Save Configuration
            </button>
          </div>

          {/* Saved Configurations */}
          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>Saved Configurations</h3>
            {isLoadingConfigs ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>Loading configurations...</p>
            ) : savedConfigs.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No saved configurations</p>
            ) : (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {savedConfigs.map((config) => (
                  <div key={config.name} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem',
                    marginBottom: '0.5rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{config.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Updated: {new Date(config.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        onClick={() => handleLoadConfig(config.name)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDeleteConfig(config.name)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

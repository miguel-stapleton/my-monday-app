import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface FormData {
  brideName: string
  email: string
  weddingDate: string
  beautyVenue: string
  description: string
  beautyServices: string[]
  country: string
  hairstylist: string
  makeupArtist: string
  hairstylistChoice: string
  muaSelection: string
  HStatus: string
  MStatus: string
  Mdecision: string
  Hdecision: string
  Lolachoice: string
  Teresachoice: string
  Miguelchoice: string
}

interface FormConfig {
  title: string
  subtitle: string
  recordNamePrefix: string
  hairstylists: string[]
  makeupArtists: string[]
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

type FormType = 'inquiry' | 'mua'

const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria',
  'Bangladesh', 'Belgium', 'Brazil', 'Canada', 'Chile', 'China', 'Colombia',
  'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'Greece', 'India',
  'Indonesia', 'Ireland', 'Italy', 'Japan', 'Mexico', 'Netherlands',
  'New Zealand', 'Norway', 'Pakistan', 'Philippines', 'Poland', 'Portugal',
  'Russia', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland',
  'Thailand', 'Turkey', 'Ukraine', 'United Kingdom', 'United States', 'Vietnam'
]

const defaultHairstylists = [
  "I don't know which hairstylist to choose",
  "Agne Kanapeckaite",
  "Lília Costa", 
  "Andreia de Matos",
  "Eric Ribeiro",
  "Oksana Grybbinyk",
  "Joana Carvalho",
  "Olga Hilário"
]

const defaultMakeupArtists = [
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

const muaHairstylistOptions = [
  'no, thank you',
  "I don't know which hairstylist to choose",
  'Agne Kanapeckaite',
  'Lília Costa',
  'Andreia de Matos',
  'Eric Ribeiro',
  'Oksana Grybinnyk',
  'Joana Carvalho',
  'Olga Hilário'
]

export default function EmbedForm() {
  const router = useRouter()
  const { config: configName, formType } = router.query

  const [currentFormType, setCurrentFormType] = useState<FormType>('inquiry')
  const [formData, setFormData] = useState<FormData>({
    brideName: '',
    email: '',
    weddingDate: '',
    beautyVenue: '',
    description: '',
    beautyServices: [],
    country: '',
    hairstylist: '',
    makeupArtist: '',
    hairstylistChoice: '',
    muaSelection: '',
    HStatus: '',
    MStatus: '',
    Mdecision: '',
    Hdecision: '',
    Lolachoice: '',
    Teresachoice: '',
    Miguelchoice: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [formConfig, setFormConfig] = useState<FormConfig>({
    title: 'Wedding Beauty Services Form',
    subtitle: 'Submit your wedding beauty service requirements',
    recordNamePrefix: 'Wedding Beauty Service',
    hairstylists: defaultHairstylists,
    makeupArtists: defaultMakeupArtists
  })
  const [hairstylists, setHairstylists] = useState(defaultHairstylists)
  const [makeupArtists, setMakeupArtists] = useState(defaultMakeupArtists)
  const [isLoading, setIsLoading] = useState(true)

  // Set form type from URL parameter
  useEffect(() => {
    if (formType && (formType === 'inquiry' || formType === 'mua')) {
      setCurrentFormType(formType as FormType)
    }
  }, [formType])

  // Load configuration if specified in URL
  useEffect(() => {
    const loadConfig = async () => {
      // Set default config based on form type first
      if (currentFormType === 'mua') {
        setFormConfig({
          title: 'MUA Application Form',
          subtitle: 'Apply to work with our beauty team',
          recordNamePrefix: 'MUA Application',
          hairstylists: defaultHairstylists,
          makeupArtists: defaultMakeupArtists
        })
      }

      if (configName && typeof configName === 'string') {
        try {
          const response = await fetch('/api/form-configs')
          const data = await response.json()
          if (response.ok) {
            const config = data.configs?.find((c: SavedConfig) => c.name === configName)
            if (config) {
              setFormConfig({
                title: config.config.title,
                subtitle: config.config.subtitle,
                recordNamePrefix: config.config.recordNamePrefix,
                hairstylists: config.config.hairstylists || defaultHairstylists,
                makeupArtists: config.config.makeupArtists || defaultMakeupArtists
              })
              setHairstylists(config.config.hairstylists || defaultHairstylists)
              setMakeupArtists(config.config.makeupArtists || defaultMakeupArtists)
            }
          }
        } catch (error) {
          console.error('Error loading config:', error)
        }
      }
      setIsLoading(false)
    }

    loadConfig()
  }, [configName, currentFormType])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleServiceChange = (service: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      beautyServices: checked
        ? [...prev.beautyServices, service]
        : prev.beautyServices.filter(s => s !== service),
      // Reset hairstylist if Hair is unchecked
      hairstylist: checked || service !== 'Hair' ? prev.hairstylist : ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation based on form type
    if (currentFormType === 'inquiry') {
      if (formData.beautyServices.length === 0) {
        setSubmitError('Please select at least one beauty service')
        return
      }

      // Validate hairstylist selection if Hair is selected
      if (formData.beautyServices.includes('Hair') && !formData.hairstylist) {
        setSubmitError('Please select a hairstylist when Hair service is chosen')
        return
      }

      if (formData.beautyServices.includes('Make-up') && !formData.makeupArtist) {
        setSubmitError('Please select a makeup artist when Make-up service is chosen')
        return
      }
    } else if (currentFormType === 'mua') {
      // MUA form validation
      if (!formData.hairstylistChoice) {
        setSubmitError('Please select your hairstylist preference')
        return
      }
    }

    setIsSubmitting(true)
    setSubmitError('')
    setSubmitMessage('')

    console.log('[DEBUG Embedded] Form submission started')
    console.log('[DEBUG Embedded] currentFormType:', currentFormType)
    console.log('[DEBUG Embedded] formData:', formData)
    console.log('[DEBUG Embedded] formConfig:', formConfig)

    try {
      let submissionData = { ...formData }
      
      // Handle MUA form specific logic
      if (currentFormType === 'mua') {
        // Handle hairstylist choice logic
        const hairstylistChoice = formData.hairstylistChoice
        
        if (hairstylistChoice === 'no, thank you') {
          submissionData.beautyServices = ['Make-up']
          submissionData.HStatus = 'not interested'
        } else if (hairstylistChoice === "I don't know which hairstylist to choose") {
          submissionData.beautyServices = ['Make-up', 'Hair']
          submissionData.HStatus = 'undecided- inquire availabilities'
        } else {
          // Specific hairstylist chosen
          submissionData.beautyServices = ['Make-up', 'Hair']
          submissionData.HStatus = 'Travelling fee + inquire artist'
          if (hairstylistChoice) {
            submissionData.hairstylist = hairstylistChoice
          }
        }

        // Set MUA specific fields
        submissionData.Mdecision = 'let me choose a specific make-up artist'
        submissionData.MStatus = 'Direct choice'
        
        // Handle MUA selection from configuration (preselected artist)
        const muaSelection = makeupArtists?.[0] // Get the preselected MUA from loaded config
        
        console.log('[DEBUG Embedded] MUA Selection - makeupArtists:', makeupArtists)
        console.log('[DEBUG Embedded] MUA Selection - formConfig.makeupArtists:', formConfig.makeupArtists)
        console.log('[DEBUG Embedded] MUA Selection - muaSelection value:', muaSelection)
        
        if (muaSelection === 'Lola Carvalho (founder artist)') {
          submissionData.Lolachoice = 'Yes, seems right to me!'
          submissionData.muaSelection = '1260830806' // Lola's ID
          console.log('[DEBUG Embedded] Set Lola choice and ID')
        } else if (muaSelection === 'Teresa Pilkington (founder artist)') {
          submissionData.Teresachoice = 'Yes, seems right to me!'
          submissionData.muaSelection = '1260830819' // Teresa's ID
          console.log('[DEBUG Embedded] Set Teresa choice and ID')
        } else if (muaSelection === 'Miguel Stapleton (founder artist)') {
          submissionData.Miguelchoice = 'Yes, seems right to me!'
          submissionData.muaSelection = '1260830830' // Miguel's ID
          console.log('[DEBUG Embedded] Set Miguel choice and ID')
        } else {
          console.log('[DEBUG Embedded] No MUA match found for:', muaSelection)
        }
        
        console.log('[DEBUG Embedded] submissionData.muaSelection after logic:', submissionData.muaSelection)
        
        // Set makeupArtist based on muaSelection for API compatibility
        if (submissionData.muaSelection) {
          // Map artist ID back to artist name for API validation
          const artistIdToName: { [key: string]: string } = {
            '1260830830': 'Miguel Stapleton (founder artist)',
            '1260830806': 'Lola Carvalho (founder artist)',
            '1260830819': 'Teresa Pilkington (founder artist)',
            '1265637834': 'Inês Aguiar (founder artist)',
            '1260830858': 'Ana Neves (resident artist)',
            '1260830847': 'Ana Roma (resident artist)',
            '1909966794': 'Sara Jogo (resident artist)',
            '1265637910': 'Sofia Monteiro (fresh artist)',
            '1555231395': 'Rita Nunes (fresh artist)',
            '1909973857': 'Filipa Wahnon (fresh artist)'
          }
          submissionData.makeupArtist = artistIdToName[submissionData.muaSelection] || ''
        }
        
        // Set Hdecision based on hairstylist choice
        if (hairstylistChoice === 'no, thank you') {
          submissionData.Hdecision = '(not interested)'
        } else if (hairstylistChoice === "I don't know which hairstylist to choose") {
          submissionData.Hdecision = "I don't know which hairstylist to choose!"
        } else {
          submissionData.Hdecision = 'let me choose a specific hairstylist'
        }
      }

      console.log('[DEBUG Embedded] Final submission data:', {
        ...submissionData,
        recordNamePrefix: formConfig.recordNamePrefix,
        formType: currentFormType
      })

      const response = await fetch('/api/wedding-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submissionData,
          recordNamePrefix: formConfig.recordNamePrefix,
          formType: currentFormType
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const successMessage = currentFormType === 'inquiry' 
          ? 'Thank you for your inquiry.\n\nWe\'ll get back to you ASAP!'
          : 'Thank you for your application.\n\nWe\'ll review your submission and get back to you soon!'
        setSubmitMessage(successMessage)
        // Reset form
        setFormData({
          brideName: '',
          email: '',
          weddingDate: '',
          beautyVenue: '',
          description: '',
          beautyServices: [],
          country: '',
          hairstylist: '',
          makeupArtist: '',
          hairstylistChoice: '',
          muaSelection: '',
          HStatus: '',
          MStatus: '',
          Mdecision: '',
          Hdecision: '',
          Lolachoice: '',
          Teresachoice: '',
          Miguelchoice: ''
        })
      } else {
        setSubmitError(data.error || 'Failed to submit form')
      }
    } catch (error) {
      setSubmitError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        Loading form...
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{formConfig.title}</title>
        <meta name="description" content={formConfig.subtitle} />
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
            {formConfig.title}
          </h1>
          <p style={{
            textAlign: 'center',
            marginBottom: '2rem',
            color: '#666',
            fontSize: '16px',
            lineHeight: '1.4'
          }}>
            {formConfig.subtitle}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Bride's Name *
              </label>
              <input
                type="text"
                value={formData.brideName}
                onChange={(e) => handleInputChange('brideName', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
              <p style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginTop: '0.25rem', 
                marginBottom: '0' 
              }}>
                Not a bride? Please read the text above this form
              </p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
              <p style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginTop: '0.25rem', 
                marginBottom: '0' 
              }}>
                Please provide one e-mail address only. Your info will automatically be sent to this address.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Wedding Date *
              </label>
              <input
                type="date"
                value={formData.weddingDate}
                onChange={(e) => handleInputChange('weddingDate', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
              <p style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginTop: '0.25rem', 
                marginBottom: '0' 
              }}>
                If there is more than one date, please insert the main event here and the other required dates under Description/Observations.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Beauty Venue *
              </label>
              <input
                type="text"
                value={formData.beautyVenue}
                onChange={(e) => handleInputChange('beautyVenue', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
              <p style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginTop: '0.25rem', 
                marginBottom: '0' 
              }}>
                Where will you be having your make-up/hair done? (Please don't write "Wedding Venue" or "Home", give us the name of a Hotel, Wedding Venue...)
              </p>
            </div>

            {/* Inquiry Form Fields */}
            {currentFormType === 'inquiry' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Beauty Services *
                  </label>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {['Hair', 'Make-up'].map(service => (
                      <label key={service} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={formData.beautyServices.includes(service)}
                          onChange={(e) => handleServiceChange(service, e.target.checked)}
                          style={{ transform: 'scale(1.2)' }}
                        />
                        {service}
                      </label>
                    ))}
                  </div>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#666', 
                    marginTop: '0.25rem', 
                    marginBottom: '0' 
                  }}>
                    Which service(s) will you be needing for your wedding?
                  </p>
                </div>

                {/* Conditional Hairstylist Selection */}
                {formData.beautyServices.includes('Hair') && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Who would you like your hairstylist to be? *
                    </label>
                    <select
                      value={formData.hairstylist}
                      onChange={(e) => handleInputChange('hairstylist', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '16px',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="">Please select a hairstylist</option>
                      {hairstylists.map(stylist => (
                        <option key={stylist} value={stylist}>
                          {stylist}
                        </option>
                      ))}
                    </select>
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#666', 
                      marginTop: '0.25rem', 
                      marginBottom: '0' 
                    }}>
                      Please select one of our hairstylists.
                    </p>
                  </div>
                )}

                {/* Conditional Makeup Artist Selection */}
                {formData.beautyServices.includes('Make-up') && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Who would you like your makeup artist to be? *
                    </label>
                    <select
                      value={formData.makeupArtist}
                      onChange={(e) => handleInputChange('makeupArtist', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '16px',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="">Please select a makeup artist</option>
                      {makeupArtists.map(artist => (
                        <option key={artist} value={artist}>
                          {artist}
                        </option>
                      ))}
                    </select>
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#666', 
                      marginTop: '0.25rem', 
                      marginBottom: '0' 
                    }}>
                      Please select one of our makeup artists.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* MUA Form Fields */}
            {currentFormType === 'mua' && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  This artist does make-up only. Did you like any hairstylist in specific? *
                </label>
                <select
                  value={formData.hairstylistChoice}
                  onChange={(e) => handleInputChange('hairstylistChoice', e.target.value)}
                  required
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
                  {muaHairstylistOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginTop: '0.25rem', 
                  marginBottom: '0' 
                }}>
                  Select if you would like hairstyling services in addition to makeup
                </p>
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Country *
              </label>
              <select
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Select a country</option>
                {countries.map(country => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <p style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginTop: '0.25rem', 
                marginBottom: '0' 
              }}>
                Please select your country of residence.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Description/Observations
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
                placeholder="Any additional information or special requests..."
              />
              <p style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginTop: '0.25rem', 
                marginBottom: '0' 
              }}>
                Any specific description or observation you'd like us to know.
              </p>
            </div>

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
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {isSubmitting ? 'Submitting...' : (currentFormType === 'inquiry' ? 'Submit Beauty info' : 'Submit Application')}
            </button>
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
            </div>
          )}
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
        </div>
      </main>
    </>
  )
}

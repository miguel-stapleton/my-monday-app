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
}

interface FormConfig {
  title: string
  subtitle: string
  recordNamePrefix: string
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
  "Oksana Grybinnyk",
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

export default function FormOnly() {
  const router = useRouter()
  const { config: configName } = router.query

  const [formData, setFormData] = useState<FormData>({
    brideName: '',
    email: '',
    weddingDate: '',
    beautyVenue: '',
    description: '',
    beautyServices: [],
    country: '',
    hairstylist: '',
    makeupArtist: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [formConfig, setFormConfig] = useState<FormConfig>({
    title: 'Wedding Beauty Services Form',
    subtitle: 'Submit your wedding beauty service requirements',
    recordNamePrefix: 'Wedding Beauty Service'
  })
  const [hairstylists, setHairstylists] = useState(defaultHairstylists)
  const [makeupArtists, setMakeupArtists] = useState(defaultMakeupArtists)
  const [isLoading, setIsLoading] = useState(true)

  // Load configuration if specified in URL
  useEffect(() => {
    const loadConfig = async () => {
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
                recordNamePrefix: config.config.recordNamePrefix
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
  }, [configName])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleServiceChange = (service: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      beautyServices: checked
        ? [...prev.beautyServices, service]
        : prev.beautyServices.filter(s => s !== service),
      hairstylist: checked || service !== 'Hair' ? prev.hairstylist : ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.beautyServices.length === 0) {
      setSubmitError('Please select at least one beauty service')
      return
    }

    if (formData.beautyServices.includes('Hair') && !formData.hairstylist) {
      setSubmitError('Please select a hairstylist when Hair service is chosen')
      return
    }

    if (formData.beautyServices.includes('Make-up') && !formData.makeupArtist) {
      setSubmitError('Please select a makeup artist when Make-up service is chosen')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    setSubmitMessage('')

    try {
      const response = await fetch('/api/wedding-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recordNamePrefix: formConfig.recordNamePrefix
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitMessage('Thank you for your inquiry.\n\nWe\'ll get back to you ASAP!')
        setFormData({
          brideName: '',
          email: '',
          weddingDate: '',
          beautyVenue: '',
          description: '',
          beautyServices: [],
          country: '',
          hairstylist: '',
          makeupArtist: ''
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
        padding: '1rem',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{formConfig.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{
        padding: '1rem',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '100%',
        margin: '0 auto'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '14px' }}>
              Bride's Name *
            </label>
            <input
              type="text"
              value={formData.brideName}
              onChange={(e) => handleInputChange('brideName', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '3px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '14px' }}>
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '3px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '14px' }}>
              Wedding Date *
            </label>
            <input
              type="date"
              value={formData.weddingDate}
              onChange={(e) => handleInputChange('weddingDate', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '3px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '14px' }}>
              Beauty Venue *
            </label>
            <input
              type="text"
              value={formData.beautyVenue}
              onChange={(e) => handleInputChange('beautyVenue', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '3px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '14px' }}>
              Beauty Services *
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['Hair', 'Make-up'].map(service => (
                <label key={service} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={formData.beautyServices.includes(service)}
                    onChange={(e) => handleServiceChange(service, e.target.checked)}
                  />
                  {service}
                </label>
              ))}
            </div>
          </div>

          {formData.beautyServices.includes('Hair') && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '14px' }}>
                Hairstylist *
              </label>
              <select
                value={formData.hairstylist}
                onChange={(e) => handleInputChange('hairstylist', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Select a hairstylist</option>
                {hairstylists.map(stylist => (
                  <option key={stylist} value={stylist}>
                    {stylist}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.beautyServices.includes('Make-up') && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '14px' }}>
                Makeup Artist *
              </label>
              <select
                value={formData.makeupArtist}
                onChange={(e) => handleInputChange('makeupArtist', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Select a makeup artist</option>
                {makeupArtists.map(artist => (
                  <option key={artist} value={artist}>
                    {artist}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '14px' }}>
              Country *
            </label>
            <select
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '3px',
                fontSize: '14px',
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
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '14px' }}>
              Description/Observations
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '3px',
                fontSize: '14px',
                resize: 'vertical'
              }}
              placeholder="Any additional information..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '0.75rem',
              backgroundColor: isSubmitting ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>

        {submitMessage && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            borderRadius: '3px',
            backgroundColor: '#d4edda',
            color: '#155724',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {submitMessage}
          </div>
        )}
        {submitError && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            borderRadius: '3px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {submitError}
          </div>
        )}
      </div>
    </>
  )
}

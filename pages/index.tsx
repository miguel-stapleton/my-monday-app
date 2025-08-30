import Head from 'next/head'
import { useState } from 'react'

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

export default function Home() {
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
  const [triadeUrl, setTriadeUrl] = useState('')
  const [showEmbedCode, setShowEmbedCode] = useState(false)
  const [formConfig, setFormConfig] = useState<FormConfig>({
    title: 'Wedding Beauty Services Form',
    subtitle: 'Submit your wedding beauty service requirements',
    recordNamePrefix: 'Wedding Beauty Service'
  })
  const [editableHairstylists, setEditableHairstylists] = useState([...hairstylists])
  const [editableMakeupArtists, setEditableMakeupArtists] = useState([...makeupArtists])
  const [newArtist, setNewArtist] = useState({
    name: '',
    boardId: '',
    artistId: '',
    type: 'hairstylist' as 'hairstylist' | 'makeup'
  })

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

  const handleConfigChange = (field: keyof FormConfig, value: string) => {
    setFormConfig(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveConfig = () => {
    // Save form config to local storage or API
    localStorage.setItem('formConfig', JSON.stringify(formConfig))
  }

  const handleLoadConfig = () => {
    // Load form config from local storage or API
    const storedConfig = localStorage.getItem('formConfig')
    if (storedConfig) {
      setFormConfig(JSON.parse(storedConfig))
    }
  }

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
                    {editableHairstylists.map(stylist => (
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
                    {editableMakeupArtists.map(artist => (
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
                {isSubmitting ? 'Submitting...' : 'Submit Beauty info'}
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
                {triadeUrl && (
                  <p style={{ marginTop: '1rem' }}>
                    Your Triade URL: <a href={triadeUrl} target="_blank" rel="noopener noreferrer">{triadeUrl}</a>
                  </p>
                )}
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
                value={formConfig.title}
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
                Subtitle
              </label>
              <input
                type="text"
                value={formConfig.subtitle}
                onChange={(e) => handleConfigChange('subtitle', e.target.value)}
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
                value={formConfig.recordNamePrefix}
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
            <button
              onClick={handleSaveConfig}
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
              Save Config
            </button>
            <button
              onClick={handleLoadConfig}
              style={{
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
              Load Config
            </button>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>Artist Management</h3>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Add Artist
              </label>
              <input
                type="text"
                value={newArtist.name}
                onChange={(e) => setNewArtist(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
              <input
                type="text"
                value={newArtist.boardId}
                onChange={(e) => setNewArtist(prev => ({ ...prev, boardId: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
                placeholder="Board ID"
              />
              <input
                type="text"
                value={newArtist.artistId}
                onChange={(e) => setNewArtist(prev => ({ ...prev, artistId: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
                placeholder="Artist ID"
              />
              <select
                value={newArtist.type}
                onChange={(e) => setNewArtist(prev => ({ ...prev, type: e.target.value as 'hairstylist' | 'makeup' }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
              >
                <option value="hairstylist">Hairstylist</option>
                <option value="makeup">Makeup Artist</option>
              </select>
              <button
                onClick={handleAddArtist}
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
                Add Artist
              </button>
            </div>
            <h4 style={{ marginBottom: '1rem', color: '#333' }}>Hairstylists</h4>
            <ul>
              {editableHairstylists.map(artist => (
                <li key={artist}>
                  {artist}
                  <button
                    onClick={() => handleRemoveArtist(artist, 'hairstylist')}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <h4 style={{ marginBottom: '1rem', color: '#333' }}>Makeup Artists</h4>
            <ul>
              {editableMakeupArtists.map(artist => (
                <li key={artist}>
                  {artist}
                  <button
                    onClick={() => handleRemoveArtist(artist, 'makeup')}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Embed Form Section */}
        <div style={{
          maxWidth: '600px',
          margin: '2rem auto 0',
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
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
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
          >
            {showEmbedCode ? 'Hide Embed Code' : 'Embed Form'}
          </button>

          {showEmbedCode && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>Embeddable Form Code</h3>
              <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
                Copy and paste this code into your website to embed the wedding form:
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
src="${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}">
</iframe>
</div>`}</code>
              </div>
              <button
                onClick={() => {
                  const embedCode = `<div align="center">
<iframe
width="900"
height="1600"
src="${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}">
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
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Copy to Clipboard
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useState } from 'react'

interface TriadePageProps {
  clientName: string
  clientId: string
  token: string
  error?: string
  initialData?: {
    beautyVenue: string
    mTravelFee: number
    mAvailability: string
  }
}

interface FormData {
  beautyVenue: string
  mTravelFee: string
  mAvailability: string
}

export default function TriadePage({ clientName, clientId, token, error, initialData }: TriadePageProps) {
  const [formData, setFormData] = useState<FormData>({
    beautyVenue: initialData?.beautyVenue || '',
    mTravelFee: initialData?.mTravelFee?.toString() || '',
    mAvailability: initialData?.mAvailability || 'Available'
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitError, setSubmitError] = useState('')

  if (error) {
    return (
      <>
        <Head>
          <title>Access Denied - Tríade</title>
        </Head>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontFamily: 'Arial, sans-serif',
          padding: '1rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: '#ff6b6b' }}>Access Denied</h1>
            <p>Invalid or expired link.</p>
          </div>
        </div>
      </>
    )
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate M travel fee
    const travelFee = parseFloat(formData.mTravelFee)
    if (isNaN(travelFee) || travelFee < 0) {
      setSubmitError('M travel fee must be a non-negative number')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    setSubmitMessage('')

    try {
      const response = await fetch(`/api/clients/${clientId}/triade?t=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          beautyVenue: formData.beautyVenue,
          mTravelFee: travelFee,
          mAvailability: formData.mAvailability
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitMessage('Thanks! Your details were saved.')
      } else {
        setSubmitError(data.error || 'Failed to save details')
      }
    } catch (error) {
      setSubmitError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>Tríade Update - {clientName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ 
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f8f9fa',
        padding: '1rem'
      }}>
        <div style={{ 
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ 
            backgroundColor: '#007bff',
            color: 'white',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
              Welcome, {clientName}!
            </h1>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
              Please update your details below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
            {/* Beauty Venue */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: '#333'
              }}>
                Beauty Venue
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
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter beauty venue location"
              />
            </div>

            {/* M travel fee */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: '#333'
              }}>
                M travel fee
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.mTravelFee}
                onChange={(e) => handleInputChange('mTravelFee', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="0.00"
              />
            </div>

            {/* M availability */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: '#333'
              }}>
                M availability
              </label>
              <select
                value={formData.mAvailability}
                onChange={(e) => handleInputChange('mAvailability', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  backgroundColor: 'white'
                }}
              >
                <option value="Available">Available</option>
                <option value="Maybe">Maybe</option>
                <option value="Not available">Not available</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.875rem',
                backgroundColor: isSubmitting ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Details'}
            </button>

            {/* Success Message */}
            {submitMessage && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                borderRadius: '4px',
                backgroundColor: '#d4edda',
                color: '#155724',
                border: '1px solid #c3e6cb',
                textAlign: 'center'
              }}>
                {submitMessage}
              </div>
            )}

            {/* Error Message */}
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
          </form>

          {/* Footer */}
          <div style={{ 
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#6c757d'
          }}>
            Client ID: {clientId}
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { clientId, t } = context.query

  if (!clientId || !t) {
    return {
      props: {
        clientName: '',
        clientId: '',
        token: '',
        error: 'Missing parameters'
      }
    }
  }

  try {
    // Fetch client data from Monday.com to validate token and get client info
    const query = `
      query ($itemId: ID!) {
        items(ids: [$itemId]) {
          id
          name
          column_values {
            id
            title
            text
            value
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
        variables: { itemId: clientId },
      }),
    })

    const data = await response.json()

    if (data.errors || !data.data.items[0]) {
      return {
        props: {
          clientName: '',
          clientId: clientId as string,
          token: '',
          error: 'Client not found'
        }
      }
    }

    const item = data.data.items[0]
    
    // Extract client name from the item name or bride name column
    let clientName = item.name
    
    // Try to get bride's name from columns
    const brideNameColumn = item.column_values.find((col: any) => 
      col.title && col.title.toLowerCase().includes("bride")
    )
    
    if (brideNameColumn && brideNameColumn.text) {
      clientName = brideNameColumn.text
    }

    // Get current values for the form fields
    const beautyVenueColumn = item.column_values.find((col: any) => 
      col.title && col.title.toLowerCase().includes("venue")
    )
    const travelFeeColumn = item.column_values.find((col: any) => 
      col.title && col.title.toLowerCase().includes("travel") && col.title.toLowerCase().includes("fee")
    )
    const availabilityColumn = item.column_values.find((col: any) => 
      col.title && col.title.toLowerCase().includes("availability")
    )

    const initialData = {
      beautyVenue: beautyVenueColumn?.text || '',
      mTravelFee: travelFeeColumn?.text ? parseFloat(travelFeeColumn.text) || 0 : 0,
      mAvailability: availabilityColumn?.text || 'Available'
    }

    // Simple token validation - in production, store tokens in database
    if (typeof t !== 'string' || t.length < 30) {
      return {
        props: {
          clientName: '',
          clientId: clientId as string,
          token: '',
          error: 'Invalid token'
        }
      }
    }

    return {
      props: {
        clientName: clientName || 'Client',
        clientId: clientId as string,
        token: t as string,
        initialData
      }
    }
  } catch (error) {
    console.error('Error validating triade token:', error)
    return {
      props: {
        clientName: '',
        clientId: clientId as string,
        token: '',
        error: 'Server error'
      }
    }
  }
}

import { useState } from 'react'

export default function HomeTemplate() {
  return (
    // Outer container - forces full viewport
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      padding: '24px',
      backgroundColor: '#f3f4f6'
    }}>
      {/* Main content wrapper */}
      <div style={{ 
        height: '100%',
        width: '100%',
        display: 'flex',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        overflow: 'hidden'
      }}>
        
        {/* Left Panel */}
        <div style={{ 
          width: '450px',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #e5e7eb'
        }}>
          {/* Filters Section */}
          <div style={{
            padding: '32px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: 'white'
          }}>
            <h1 style={{ 
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '24px'
            }}>Hurricane Stats</h1>
            
            {/* Filters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ 
                padding: '24px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <h2 style={{ marginBottom: '16px', fontWeight: '600' }}>Filters</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px' }}>
                    [Year Range Slider]
                  </div>
                  <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px' }}>
                    [Intensity Range Slider]
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ 
                      flex: 1,
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      borderRadius: '8px'
                    }}>Apply Filters</button>
                    <button style={{ 
                      flex: 1,
                      padding: '8px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}>Reset</button>
                  </div>
                </div>
              </div>
              
              {/* City Selector */}
              <div style={{ 
                padding: '24px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <h2 style={{ marginBottom: '16px', fontWeight: '600' }}>Select City</h2>
                <select style={{ 
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}>
                  <option>Choose a city...</option>
                  <option>Miami</option>
                  <option>New Orleans</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f9fafb'
          }}>
            {/* Results Header */}
            <div style={{
              padding: '16px 32px',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontWeight: '600' }}>Hurricanes Near Miami</h2>
              <span style={{ 
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '14px'
              }}>15 results</span>
            </div>

            {/* Scrollable Results */}
            <div style={{ 
              flex: 1,
              overflowY: 'auto',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                  <div key={i} style={{
                    padding: '16px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#eff6ff',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>🌀</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <h3 style={{ fontWeight: '500' }}>Hurricane {i}</h3>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>2023</span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#4b5563' }}>
                        <div>Max Wind: 120 mph</div>
                        <div>Category: 3</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div style={{ flex: 1, backgroundColor: '#f9fafb' }}>
          <div style={{ 
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af'
          }}>
            [Interactive Map Component]
          </div>
        </div>

      </div>
    </div>
  )
} 
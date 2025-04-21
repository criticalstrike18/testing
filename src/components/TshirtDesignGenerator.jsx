import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with your API key
const API_KEY = "AIzaSyAfy8jM5voCn2q6HMSms4LIRyZ6_9DMgVI";
const genAI = new GoogleGenerativeAI(API_KEY);

export default function TshirtDesignGenerator({ artistName = '' }) {
  // State management
  const [designPrompt, setDesignPrompt] = useState('');
  const [designSvg, setDesignSvg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usedFlash, setUsedFlash] = useState(false);
  const [tshirtColor, setTshirtColor] = useState('#ffffff');
  const [previewMode, setPreviewMode] = useState('flat'); // 'flat' or 'model'
  const [designSize, setDesignSize] = useState(80); // design size percentage
  const [designPosition, setDesignPosition] = useState(0); // vertical position adjustment
  
  // Available t-shirt colors
  const tshirtColors = [
    '#ffffff', '#000000', '#e74c3c', '#3498db', 
    '#2ecc71', '#f39c12', '#9b59b6', '#34495e'
  ];

  // Flash fallback function with improved aesthetics
  const generateFlashDesign = (prompt) => {
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const secondaryColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Extract keywords from prompt
    const keywords = prompt.split(' ')
      .filter(word => word.length > 3)
      .slice(0, 3);
    
    // Create a more visually interesting fallback design
    const svg = `
      <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${randomColor}" stop-opacity="0.8" />
            <stop offset="100%" stop-color="${secondaryColor}" stop-opacity="0.8" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feFlood flood-color="rgba(0,0,0,0.3)" result="color"/>
            <feComposite in="color" in2="blur" operator="in" result="shadow"/>
            <feComposite in="shadow" in2="SourceGraphic" operator="over"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="transparent" />
        <circle cx="150" cy="120" r="80" fill="url(#bg-gradient)" />
        <rect x="80" y="160" width="140" height="70" fill="${secondaryColor}" rx="8" opacity="0.7" />
        <text x="150" y="60" text-anchor="middle" font-family="Arial" font-size="28" font-weight="bold" fill="#fff" filter="url(#shadow)">FLASH DESIGN</text>
        ${keywords.map((word, i) => 
          `<text x="150" y="${125 + i * 30}" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold" fill="white" filter="url(#shadow)">${word.toUpperCase()}</text>`
        ).join('')}
        <path d="M 70 230 Q 150 270 230 230" stroke="#fff" fill="none" stroke-width="3" stroke-linecap="round" />
      </svg>
    `;
    setUsedFlash(true);
    return svg;
  };

  // Enhanced design generation function to create more realistic graphics
  const generateDesign = async (prompt) => {
    try {
      // Use Gemini Pro model with more detailed prompting for better results
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      const result = await model.generateContent(
        `Create a complete, detailed SVG code for a professional t-shirt design with these specifications:

         CONCEPT: "${prompt}"
         
         TECHNICAL REQUIREMENTS:
         - Create a visually striking, commercial-quality design suitable for screen printing
         - Use gradients, textures and visual effects when appropriate
         - Include proper viewBox for responsive scaling
         - Optimize for printing on ${tshirtColor === '#ffffff' ? 'a white' : tshirtColor === '#000000' ? 'a black' : 'a colored'} t-shirt
         - Balance visual complexity with clean, printable elements
         - Use no more than 4-5 colors for printing feasibility
         - Include drop shadows, gradients or other effects to create depth
         - Ensure text is legible and appropriately sized
         - Use defs section for reusable elements, patterns or gradients

         STYLE GUIDELINES:
         - Make it trendy and contemporary
         - Professional, ready-to-print quality
         - Create a design that would be purchased commercially
         - Balance artistic appeal with printability

         Return ONLY the complete SVG code without any explanation, markdown formatting or additional text. Start with <svg and end with </svg>.`
      );
      
      // Extract the SVG from the response
      const svgText = result.response.text();
      
      // Check if we received valid SVG
      if (svgText.includes('<svg') && svgText.includes('</svg>')) {
        setUsedFlash(false);
        return svgText;
      } else {
        // If we got a response but it's not valid SVG, use enhanced flash
        return generateFlashDesign(prompt);
      }
    } catch (err) {
      console.error("API Error:", err);
      // Use the enhanced flash design generator
      return generateFlashDesign(prompt);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (designPrompt.length < 10) {
      setError("Please provide a more detailed description (at least 10 characters)");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const svg = await generateDesign(designPrompt);
      setDesignSvg(svg);
    } catch (err) {
      setError("Failed to generate design. Using fallback generator.");
      setDesignSvg(generateFlashDesign(designPrompt));
    } finally {
      setLoading(false);
    }
  };

  // Download SVG function
  const downloadSVG = () => {
    const blob = new Blob([designSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tshirt-design.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 3D t-shirt effect with perspective for model view
  const TshirtModelView = ({ color, children }) => (
    <div style={{
      position: 'relative',
      width: '280px',
      height: '340px',
      margin: '0 auto',
      perspective: '1000px'
    }}>
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        transform: 'rotateY(-10deg) rotateX(10deg)',
      }}>
        {/* T-shirt body */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: color,
          borderRadius: '10px 10px 0 0',
          boxShadow: '5px 5px 15px rgba(0,0,0,0.2)',
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 10%, 95% 90%, 80% 100%, 20% 100%, 5% 90%, 0% 10%)',
        }}>
          {/* Collar */}
          <div style={{
            position: 'absolute',
            top: '0%',
            left: '38%',
            width: '24%',
            height: '8%',
            background: color === '#ffffff' ? '#f8f8f8' : color === '#000000' ? '#222' : color,
            borderRadius: '0 0 40% 40%',
            border: `2px solid ${color === '#ffffff' ? '#eaeaea' : 'rgba(0,0,0,0.3)'}`,
            borderTop: 'none',
          }}></div>
          
          {/* Sleeve right */}
          <div style={{
            position: 'absolute',
            top: '10%',
            right: '0',
            width: '20%',
            height: '15%',
            background: color === '#ffffff' ? '#f8f8f8' : color === '#000000' ? '#222' : color,
            borderLeft: `2px solid ${color === '#ffffff' ? '#eaeaea' : 'rgba(0,0,0,0.3)'}`,
            transform: 'skewY(-30deg)',
          }}></div>
          
          {/* Sleeve left */}
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '0',
            width: '20%',
            height: '15%',
            background: color === '#ffffff' ? '#f8f8f8' : color === '#000000' ? '#222' : color,
            borderRight: `2px solid ${color === '#ffffff' ? '#eaeaea' : 'rgba(0,0,0,0.3)'}`,
            transform: 'skewY(30deg)',
          }}></div>
          
          {/* Design container */}
          <div style={{
            position: 'absolute',
            top: `${25 + designPosition}%`,
            left: `${(100 - designSize)/2}%`,
            width: `${designSize}%`,
            height: `${designSize * 0.75}%`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'perspective(500px) rotateX(5deg)',
          }}>
            {children}
          </div>
          
          {/* T-shirt texture overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'smallGrid\' width=\'8\' height=\'8\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 8 0 L 0 0 0 8\' fill=\'none\' stroke=\'rgba(128,128,128,0.05)\' stroke-width=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23smallGrid)\'/%3E%3C/svg%3E")',
            opacity: 0.6,
            pointerEvents: 'none',
          }}></div>
          
          {/* Highlights */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%)',
            pointerEvents: 'none',
          }}></div>
        </div>
      </div>
    </div>
  );

  // Flat t-shirt display
  const TshirtFlatView = ({ color, children }) => (
    <div style={{
      position: 'relative',
      width: '280px',
      height: '320px',
      margin: '0 auto',
    }}>
      {/* T-shirt shape */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: color,
        borderRadius: '10px 10px 0 0',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        clipPath: 'polygon(25% 0%, 75% 0%, 100% 20%, 100% 100%, 0% 100%, 0% 20%)',
      }}>
        {/* Collar */}
        <div style={{
          position: 'absolute',
          top: '0%',
          left: '40%',
          width: '20%',
          height: '5%',
          background: color === '#ffffff' ? '#f8f8f8' : color === '#000000' ? '#222' : color,
          borderRadius: '0 0 40% 40%',
          border: `1px solid ${color === '#ffffff' ? '#eaeaea' : 'rgba(0,0,0,0.3)'}`,
          borderTop: 'none',
        }}></div>
        
        {/* Design container */}
        <div style={{
          position: 'absolute',
          top: `${25 + designPosition}%`,
          left: `${(100 - designSize)/2}%`,
          width: `${designSize}%`,
          height: `${designSize * 0.75}%`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {children}
        </div>
        
        {/* T-shirt texture overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'smallGrid\' width=\'8\' height=\'8\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 8 0 L 0 0 0 8\' fill=\'none\' stroke=\'rgba(128,128,128,0.05)\' stroke-width=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23smallGrid)\'/%3E%3C/svg%3E")',
          opacity: 0.4,
          pointerEvents: 'none',
        }}></div>
        
        {/* Subtle highlights */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)',
          pointerEvents: 'none',
        }}></div>
      </div>
    </div>
  );

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '24px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '24px',
        textAlign: 'center',
        color: '#2d3748',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '12px'
      }}>
        T-shirt Design Generator
      </h1>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '24px',
      }}>
        {/* Left side - Form */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '20px',
          }}>
            <div>
              <label htmlFor="designPrompt" style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#4a5568',
              }}>
                Describe your T-shirt design idea
              </label>
              <textarea
                id="designPrompt"
                value={designPrompt}
                onChange={(e) => setDesignPrompt(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e0',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                  fontSize: '16px',
                  minHeight: '120px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
                placeholder="Example: A vibrant cosmic wolf howling at a galaxy moon, with colorful nebula background and stars"
              />
              {error && (
                <p style={{
                  color: '#e53e3e',
                  marginTop: '8px',
                  fontSize: '14px',
                }}>
                  {error}
                </p>
              )}
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#4a5568',
              }}>
                T-shirt Color
              </label>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}>
                {tshirtColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setTshirtColor(color)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: color,
                      border: tshirtColor === color ? '3px solid #3182ce' : '1px solid #cbd5e0',
                      cursor: 'pointer',
                      boxShadow: tshirtColor === color ? '0 0 0 2px rgba(49, 130, 206, 0.3)' : 'none',
                    }}
                    aria-label={`Select ${color} t-shirt color`}
                  />
                ))}
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '16px',
            }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: '1',
                  padding: '12px 16px',
                  backgroundColor: '#3182ce',
                  color: 'white',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px rgba(49, 130, 206, 0.2)',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      display: 'inline-block',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '3px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      animation: 'spin 1s linear infinite',
                    }}></span>
                    Generating...
                  </>
                ) : 'Generate Design'}
              </button>
              
              {designSvg && (
                <button
                  type="button"
                  onClick={downloadSVG}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#38a169',
                    color: 'white',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 6px rgba(56, 161, 105, 0.2)',
                    fontSize: '16px',
                  }}
                >
                  Download SVG
                </button>
              )}
            </div>
          </form>

          {usedFlash && designSvg && (
            <div style={{
              padding: '16px',
              backgroundColor: '#fffbeb',
              borderRadius: '8px',
              borderLeft: '4px solid #f6ad55',
              marginBottom: '16px',
            }}>
              <p style={{
                color: '#723b13',
                fontSize: '14px',
                margin: 0,
              }}>
                Using enhanced fallback design system since the API call didn't succeed. For better results, try a different prompt or try again later.
              </p>
            </div>
          )}
          
          {designSvg && (
            <div style={{
              marginTop: '24px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#2d3748',
                  margin: 0,
                }}>
                  Design Customization
                </h2>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                }}>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('flat')}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: previewMode === 'flat' ? '#3182ce' : '#e2e8f0',
                      color: previewMode === 'flat' ? 'white' : '#4a5568',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Flat View
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('model')}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: previewMode === 'model' ? '#3182ce' : '#e2e8f0',
                      color: previewMode === 'model' ? 'white' : '#4a5568',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    3D View
                  </button>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#4a5568',
                  }}>
                    Design Size: {designSize}%
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="90"
                    value={designSize}
                    onChange={(e) => setDesignSize(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#3182ce',
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#4a5568',
                  }}>
                    Design Position
                  </label>
                  <input
                    type="range"
                    min="-10"
                    max="20"
                    value={designPosition}
                    onChange={(e) => setDesignPosition(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#3182ce',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right side - Preview */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}>
          {designSvg ? (
            <>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '20px',
                textAlign: 'center',
              }}>
                Design Preview
              </h2>
              
              {previewMode === 'flat' ? (
                <TshirtFlatView color={tshirtColor}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                  }} 
                  dangerouslySetInnerHTML={{ __html: designSvg }} />
                </TshirtFlatView>
              ) : (
                <TshirtModelView color={tshirtColor}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                  }} 
                  dangerouslySetInnerHTML={{ __html: designSvg }} />
                </TshirtModelView>
              )}
            </>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                borderRadius: '50%',
                backgroundColor: '#edf2f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 16V8.00002C21 6.34317 19.6569 5.00002 18 5.00002H16.74C16.3813 3.98693 15.7495 3.08762 14.9116 2.40091C14.0736 1.7142 13.0571 1.26526 11.9782 1.10278C10.8993 0.94031 9.8019 1.0702 8.80686 1.47725C7.81183 1.8843 6.95053 2.55275 6.32 3.41002C5.6072 3.1513 4.8396 3.07729 4.08688 3.19313C3.33417 3.30897 2.62638 3.61049 2.04718 4.0695C1.46798 4.52851 1.03661 5.12893 0.807264 5.80907C0.577915 6.48922 0.558975 7.22141 0.752826 7.91252C0.946677 8.60363 1.34571 9.22596 1.90264 9.70927C2.45957 10.1926 3.15024 10.5185 3.89379 10.6488C4.63734 10.7791 5.40043 10.7081 6.10231 10.4438C6.80419 10.1794 7.41582 9.73192 7.86 9.15002" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 11L16 12L21 7" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 13H9" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 17H13" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#4a5568',
                marginBottom: '12px',
              }}>
                No Design Yet
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#718096',
                maxWidth: '300px',
                margin: '0 auto',
              }}>
                Enter your design idea and click "Generate Design" to create a custom t-shirt design.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Add a style for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .preview-container {
          animation: fadeIn 0.5s ease-out;
        }
      `}} />
      
      {/* Footer section with additional features */}
      <div style={{
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '1px solid #e2e8f0',
      }}>
        {/* Design quality enhancement options */}
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#2d3748',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 3V19C5 20.1046 5.89543 21 7 21H19C20.1046 21 21 20.1046 21 19V7.41421C21 6.88378 20.7893 6.37507 20.4142 6L18 3.58579C17.6249 3.21071 17.1162 3 16.5858 3H7C5.89543 3 5 3.89543 5 5" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 7H13" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 11H15" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 15H15" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Design Generation Settings
          </h3>
          
          <div style={{
            display: 'grid',
            gap: '16px',
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#4a5568',
              }}>
                Generation Quality
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  color: '#4a5568',
                }}
                defaultValue="standard"
              >
                <option value="draft">Draft - Faster generation</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium - Highest quality</option>
              </select>
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#4a5568',
              }}>
                Art Style
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  color: '#4a5568',
                }}
                defaultValue="balanced"
              >
                <option value="photorealistic">Photorealistic</option>
                <option value="balanced">Balanced</option>
                <option value="stylized">Stylized</option>
                <option value="abstract">Abstract</option>
              </select>
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#4a5568',
              }}>
                Design Complexity
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  color: '#4a5568',
                }}
                defaultValue="medium"
              >
                <option value="simple">Simple - 1-2 colors</option>
                <option value="medium">Medium - 3-4 colors</option>
                <option value="complex">Complex - 5+ colors</option>
              </select>
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#4a5568',
              }}>
                Design Placement
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  color: '#4a5568',
                }}
                defaultValue="center"
              >
                <option value="center">Center</option>
                <option value="full">Full Front</option>
                <option value="pocket">Pocket Print</option>
                <option value="back">Back Print</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    
    </div>
  );
}
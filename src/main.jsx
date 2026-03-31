import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import JobRadar from './JobRadar.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <JobRadar />
  </StrictMode>,
)

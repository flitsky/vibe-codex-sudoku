import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/global.css'
import App from './ui/App.jsx'
import { createGameService } from './application/services/gameService.js'
import { createMemoryPuzzleRepository } from './infrastructure/memoryPuzzleRepository.js'

const puzzleRepository = createMemoryPuzzleRepository()
const gameService = createGameService({ puzzleRepository })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App gameService={gameService} />
  </StrictMode>,
)

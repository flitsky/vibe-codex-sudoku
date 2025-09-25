import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/global.css'
import App from './ui/App.jsx'
import { createGameService } from './application/services/gameService.js'
import { createMemoryPuzzleRepository } from './infrastructure/memoryPuzzleRepository.js'
import { createGameStateStorage } from './infrastructure/storage/gameStateStorage.js'

const puzzleRepository = createMemoryPuzzleRepository()
const persistenceGateway = createGameStateStorage()
const gameService = createGameService({ puzzleRepository, persistenceGateway })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App gameService={gameService} />
  </StrictMode>,
)

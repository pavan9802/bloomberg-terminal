import { createRoot } from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import App from './App'
import './index.css'

const theme = createTheme({})

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <App />
    </MantineProvider>
  // </StrictMode>,
)

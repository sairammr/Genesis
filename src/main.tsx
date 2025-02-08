import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PrivyProvider } from "@privy-io/react-auth";

createRoot(document.getElementById('root')!).render(
  <PrivyProvider
    appId="cm6vvk4sw01a1108ezc8k4qsy"
    config={{
      appearance: {
        theme: "light",
        accentColor: "#676FFF",
        logo: "https://ethglobal.b-cdn.net/events/agents/square-logo/default.png",
      },
      embeddedWallets: {
        createOnLogin: "users-without-wallets",
      },
    }}
  >
  <StrictMode>
    <App />
  </StrictMode>
  </PrivyProvider>,
)

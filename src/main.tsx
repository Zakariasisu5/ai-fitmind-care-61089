
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"

window.addEventListener("unhandledrejection", (event) => {
  console.error("[GlobalHandler] Unhandled promise rejection:", event.reason);
});

window.addEventListener("error", (event) => {
  console.error("[GlobalHandler] Uncaught error:", event.error ?? event.message);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TooltipProvider>
      <App />
      <Toaster />
    </TooltipProvider>
  </React.StrictMode>
)

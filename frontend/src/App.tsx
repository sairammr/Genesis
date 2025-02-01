import {  BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import LandingPage from "./pages/landing";
import { PromptInput } from "./pages/promptInput";
import { LoadingScreen } from "./pages/loading";
import SceneViewer from "./pages/gameinit";
function App() {
  

  return (
   <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/prompt" element={<PromptInput/>} />
      <Route path="/loading" element={<LoadingScreen/>} />
      <Route path='/game' element={<SceneViewer/>} />
    </Routes>
    
    </Router>
  )
}

export default App

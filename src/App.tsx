import {  BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './App.css'
import LandingPage from "./pages/landing";
import { PromptInput } from "./pages/promptInput";
import { LoadingScreen } from "./pages/loading";
import SceneViewer from "./game/gameinit";
import {StoryIntro} from "./pages/story";
function App() {
  

  return (
   <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/prompt" element={<PromptInput/>} />
      <Route path="/loading" element={<LoadingScreen/>} />
      <Route path="/story" element={<StoryIntro />} />
      <Route path='/game' element={<SceneViewer/>} />
    </Routes>
    
    </Router>
  )
}

export default App

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import WebRecorder from "./components/WebRecorder";
import EhrOperator from "./components/EhrOperator";
import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WebRecorder />} />
        <Route path="/ehr" element={<EhrOperator />} />
      </Routes>
    </Router>
  );
}

export default App;

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import TabsPage from "./components/TabsPage";
import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TabsPage />} />
        {/* <Route path="/ehr" element={<EhrOperator />} /> */}
      </Routes>
    </Router>
  );
}

export default App;

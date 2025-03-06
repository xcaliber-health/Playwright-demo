import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TabsPage from "./components/TabsPage";
import "./index.css";

function App() {
  return (
    <Router>
      <ToastContainer />  {/* ✅ Ensure this is included */}
      <Routes>
        <Route path="/" element={<TabsPage />} />
        {/* <Route path="/ehr" element={<EhrOperator />} /> */}
      </Routes>
    </Router>
  );
}

export default App;

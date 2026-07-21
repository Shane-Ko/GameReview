import { Routes, Route } from "react-router-dom";
import SpotList from "./pages/SpotList";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SpotList />} />
    </Routes>
  );
}

export default App;
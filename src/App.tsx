import { Routes, Route } from "react-router-dom";
import GameList from "./pages/GameList";

function App() {
  return (
    <Routes>
      <Route path="/" element={<GameList />} />
    </Routes>
  );
}

export default App;
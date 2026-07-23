import { Routes, Route} from "react-router-dom";
import Header from "./components/Header";
import GameList from "./pages/GameList";
import GameNew from "./pages/GameNew";
import GameEdit from "./pages/GameEdit";
import BestGames from "./pages/BestGames";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import "./App.css";


function App() {
  return (
    <div>
      {/* 상단 메뉴 */}
      <Header />

      {/* 라우팅 */}
      <Routes>
        <Route path="/" element={<GameList />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/new" element={<GameNew />} />
        <Route path="/edit/:id" element={<GameEdit />} />
        <Route path="/best" element={<BestGames />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
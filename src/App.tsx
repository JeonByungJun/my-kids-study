import { Routes, Route } from 'react-router-dom';
import Stars from './components/Stars';
import HomePage from './pages/HomePage';
import MathPage from './pages/math/MathPage';
import CalcPage from './pages/math/calc/CalcPage';
import Semester21Page from './pages/math/semester21/Semester21Page';
import ArithmeticGame from './pages/math/calc/ArithmeticGame';
import ThreeDigitGame from './pages/math/semester21/ThreeDigitGame';
import ShapeGame from './pages/math/semester21/ShapeGame';
import GamesPage from './pages/games/GamesPage';
import HexaGame from './pages/games/HexaGame';

export default function App() {
  return (
    <>
      <Stars />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/games/hexa" element={<HexaGame />} />
        <Route path="/math" element={<MathPage />} />
        <Route path="/math/calc" element={<CalcPage />} />
        <Route path="/math/semester21" element={<Semester21Page />} />
        <Route path="/math/semester21/unit1" element={<ThreeDigitGame />} />
        <Route path="/math/semester21/unit2" element={<ShapeGame />} />
        <Route path="/math/addition" element={<ArithmeticGame mode="addition" />} />
        <Route path="/math/subtraction" element={<ArithmeticGame mode="subtraction" />} />
      </Routes>
    </>
  );
}

import { Routes, Route } from 'react-router-dom';
import Stars from './components/Stars';
import HomePage from './pages/HomePage';
import MathPage from './pages/MathPage';
import CalcPage from './pages/CalcPage';
import Semester21Page from './pages/Semester21Page';
import ArithmeticGame from './pages/ArithmeticGame';
import ThreeDigitGame from './pages/games/ThreeDigitGame';
import ShapeGame from './pages/games/ShapeGame';

export default function App() {
  return (
    <>
      <Stars />
      <Routes>
        <Route path="/" element={<HomePage />} />
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

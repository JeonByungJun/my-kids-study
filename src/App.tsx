import { Routes, Route } from 'react-router-dom';
import Stars from './components/Stars';
import HomePage from './pages/HomePage';
import MathPage from './pages/math/MathPage';
import CalcPage from './pages/math/calc/CalcPage';
import Semester21Page from './pages/math/semester21/Semester21Page';
import ArithmeticGame from './pages/math/calc/ArithmeticGame';
import AddSubMenuPage from './pages/math/calc/AddSubMenuPage';
import AddSubGame from './pages/math/calc/AddSubGame';
import MultiplicationIntroGame from './pages/math/calc/MultiplicationIntroGame';
import ThreeDigitGame from './pages/math/semester21/ThreeDigitGame';
import ShapeGame from './pages/math/semester21/ShapeGame';
import LengthGame from './pages/math/semester21/LengthGame';
import ClassifyGame from './pages/math/semester21/ClassifyGame';
import Semester22Page from './pages/math/semester22/Semester22Page';
import MultiplicationGame from './pages/math/semester22/MultiplicationGame';
import LengthCmMGame from './pages/math/semester22/LengthCmMGame';
import TimeGame from './pages/math/semester22/TimeGame';
import GraphGame from './pages/math/semester22/GraphGame';
import PatternGame from './pages/math/semester22/PatternGame';
import FractionGame from './pages/math/semester22/FractionGame';
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
        <Route path="/math/calc/addsub" element={<AddSubMenuPage />} />
        <Route path="/math/calc/addsub/:type" element={<AddSubGame />} />
        <Route path="/math/calc/multiplication" element={<MultiplicationIntroGame />} />
        <Route path="/math/semester21" element={<Semester21Page />} />
        <Route path="/math/semester21/unit1" element={<ThreeDigitGame />} />
        <Route path="/math/semester21/unit2" element={<ShapeGame />} />
        <Route path="/math/semester21/unit4" element={<LengthGame />} />
        <Route path="/math/semester21/unit5" element={<ClassifyGame />} />
        <Route path="/math/semester22" element={<Semester22Page />} />
        <Route path="/math/semester22/unit2" element={<MultiplicationGame />} />
        <Route path="/math/semester22/unit3" element={<LengthCmMGame />} />
        <Route path="/math/semester22/unit4" element={<TimeGame />} />
        <Route path="/math/semester22/unit5" element={<GraphGame />} />
        <Route path="/math/semester22/unit6" element={<PatternGame />} />
        <Route path="/math/semester22/unit7" element={<FractionGame />} />
        <Route path="/math/addition" element={<ArithmeticGame mode="addition" />} />
        <Route path="/math/subtraction" element={<ArithmeticGame mode="subtraction" />} />
      </Routes>
    </>
  );
}

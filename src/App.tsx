import { Routes, Route } from 'react-router-dom';
import Stars from './components/Stars';
import HomePage from './pages/HomePage';
import MathPage from './pages/MathPage';
import CalcPage from './pages/CalcPage';
import ArithmeticGame from './pages/ArithmeticGame';

export default function App() {
  return (
    <>
      <Stars />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/math" element={<MathPage />} />
        <Route path="/math/calc" element={<CalcPage />} />
        <Route path="/math/addition" element={<ArithmeticGame mode="addition" />} />
        <Route path="/math/subtraction" element={<ArithmeticGame mode="subtraction" />} />
      </Routes>
    </>
  );
}

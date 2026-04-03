import { useNavigate } from 'react-router-dom';
import MenuCard from '../../../components/MenuCard';

export default function CalcPage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/math')}>← 뒤로</button>
      <h2 className="section-title">➕ 연산</h2>
      <div className="menu-grid">
        <MenuCard icon="➕" label="받아올림 덧셈" theme="addition" to="/math/addition" />
        <MenuCard icon="➖" label="받아내림 뺄셈" theme="subtraction" to="/math/subtraction" />
        <MenuCard icon="📐" label="3단원 덧셈·뺄셈" theme="unit3" to="/math/calc/addsub" />
        <MenuCard icon="✖️" label="6단원 곱셈 입문" theme="multiplication" to="/math/calc/multiplication" />
      </div>
    </div>
  );
}

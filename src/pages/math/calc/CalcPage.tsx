import { useNavigate } from 'react-router-dom';
import MenuCard from '../../../components/MenuCard';

export default function CalcPage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/math')}>← 뒤로</button>
      <h2 className="section-title">➕ 연산</h2>
      <div className="menu-grid">
        <MenuCard icon="➕" label="덧셈" theme="addition" to="/math/addition" />
        <MenuCard icon="➖" label="뺄셈" theme="subtraction" to="/math/subtraction" />
      </div>
    </div>
  );
}

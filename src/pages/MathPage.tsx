import { useNavigate } from 'react-router-dom';
import MenuCard from '../components/MenuCard';

export default function MathPage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/')}>← 뒤로</button>
      <h2 className="section-title">🔢 수학</h2>
      <div className="menu-grid">
        <MenuCard icon="➕" label="연산" theme="calc" to="/math/calc" />
        <MenuCard icon="📖" label="2-1학기" theme="semester" to="/math/semester21" />
        <MenuCard icon="📐" label="도형" comingSoon />
        <MenuCard icon="📊" label="통계" comingSoon />
      </div>
    </div>
  );
}

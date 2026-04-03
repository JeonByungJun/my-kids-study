import { useNavigate } from 'react-router-dom';
import MenuCard from '../../../components/MenuCard';

export default function Semester21Page() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/math')}>← 뒤로</button>
      <h2 className="section-title">📖 2-1학기 수학</h2>
      <div className="menu-grid">
        <MenuCard icon="💯" label="세자리수"    theme="unit1" to="/math/semester21/unit1" />
        <MenuCard icon="📐" label="여러가지도형" theme="unit2" to="/math/semester21/unit2" />
        <MenuCard icon="➕" label="덧셈과뺄셈"  theme="unit3" to="/math/calc/addsub" />
        <MenuCard icon="📏" label="길이재기"    theme="unit4" to="/math/semester21/unit4" />
        <MenuCard icon="📊" label="분류하기"    theme="unit5" to="/math/semester21/unit5" />
        <MenuCard icon="✖️" label="곱셈"        theme="unit6" to="/math/calc/multiplication" />
      </div>
    </div>
  );
}

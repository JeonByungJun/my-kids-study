import { useNavigate } from 'react-router-dom';
import MenuCard from '../../../components/MenuCard';

export default function Semester22Page() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/math')}>← 뒤로</button>
      <h2 className="section-title">📗 2-2학기 수학</h2>
      <div className="menu-grid">
        <MenuCard icon="🔢" label="네자리수"   theme="unit1" comingSoon />
        <MenuCard icon="✖️" label="곱셈구구"   theme="unit2" to="/math/semester22/unit2" />
        <MenuCard icon="📏" label="길이재기"   theme="unit3" to="/math/semester22/unit3" />
        <MenuCard icon="⏰" label="시각과시간" theme="unit4" to="/math/semester22/unit4" />
        <MenuCard icon="📊" label="표와그래프" theme="unit5" to="/math/semester22/unit5" />
        <MenuCard icon="🔮" label="규칙찾기"   theme="unit6" to="/math/semester22/unit6" />
        <MenuCard icon="🍕" label="분수"       theme="unit7" to="/math/semester22/unit7" />
      </div>
    </div>
  );
}

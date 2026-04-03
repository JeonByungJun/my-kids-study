import { useNavigate } from 'react-router-dom';
import MenuCard from '../../../components/MenuCard';

export default function AddSubMenuPage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/math/calc')}>
        ← 뒤로
      </button>
      <h2 className="section-title">➕➖ 덧셈과 뺄셈</h2>
      <p className="addsub-subtitle">2학년 1학기 3단원</p>
      <div className="menu-grid">
        <MenuCard
          icon="🔢"
          label="두 자리 덧셈"
          theme="addsub-add"
          to="/math/calc/addsub/two-add"
        />
        <MenuCard
          icon="🔢"
          label="두 자리 뺄셈"
          theme="addsub-sub"
          to="/math/calc/addsub/two-sub"
        />
        <MenuCard
          icon="🔄"
          label="덧셈·뺄셈 관계"
          theme="addsub-rel"
          to="/math/calc/addsub/relation"
        />
        <MenuCard
          icon="❓"
          label="□ 채우기"
          theme="addsub-miss"
          to="/math/calc/addsub/missing"
        />
        <MenuCard
          icon="🔣"
          label="세 수의 계산"
          theme="addsub-three"
          to="/math/calc/addsub/three"
        />
        <MenuCard
          icon="⬆️"
          label="받아올림·내림"
          theme="addsub-carry"
          to="/math/calc/addsub/carry"
        />
        <MenuCard
          icon="📖"
          label="문장제"
          theme="addsub-story"
          to="/math/calc/addsub/story"
        />
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import MenuCard from '../components/MenuCard';

export default function GamesPage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/')}>← 뒤로</button>
      <h2 className="section-title">🎮 게임</h2>
      <div className="menu-grid">
        <MenuCard icon="💎" label="HEXA" theme="game1" to="/games/hexa" />
        <MenuCard icon="🃏" label="카드 짝맞추기" theme="game2" comingSoon />
        <MenuCard icon="🎯" label="두더지잡기" theme="game3" comingSoon />
        <MenuCard icon="🧩" label="퍼즐" theme="game4" comingSoon />
      </div>
    </div>
  );
}

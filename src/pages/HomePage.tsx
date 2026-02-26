import MenuCard from '../components/MenuCard';

export default function HomePage() {
  return (
    <div className="page">
      <h1 className="site-title">
        어린이 공부방
        <span>오늘도 열심히 해보자! ✨</span>
      </h1>
      <div className="menu-grid">
        <MenuCard icon="🔢" label="수학" theme="math" to="/math" />
        <MenuCard icon="🔬" label="과학" theme="science" comingSoon />
        <MenuCard icon="📖" label="영어" theme="english" comingSoon />
        <MenuCard icon="🎨" label="미술" theme="art" comingSoon />
      </div>
    </div>
  );
}

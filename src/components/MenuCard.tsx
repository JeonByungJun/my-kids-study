import { useNavigate } from 'react-router-dom';

interface MenuCardProps {
  icon: string;
  label: string;
  theme?: string;
  to?: string;
  comingSoon?: boolean;
}

export default function MenuCard({ icon, label, theme, to, comingSoon }: MenuCardProps) {
  const navigate = useNavigate();

  return (
    <button
      className={`menu-card ${theme ? `card-${theme}` : ''} ${comingSoon ? 'coming-soon' : ''}`}
      disabled={comingSoon}
      onClick={() => to && navigate(to)}
    >
      <div className="icon">{icon}</div>
      <div className="label">{label}</div>
    </button>
  );
}

import React from 'react';
import { getColorVariables } from '../utils/colors';

interface GroupBadgeProps {
  name: string;
  color: string;
}

export const GroupBadge: React.FC<GroupBadgeProps> = ({ name, color }) => {
  const { bg, text } = getColorVariables(color);

  return (
    <span 
      className="group-badge"
      style={{ 
        backgroundColor: bg,
        color: text,
      }}
    >
      {name}
    </span>
  );
}; 
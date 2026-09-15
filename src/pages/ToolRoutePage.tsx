import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ToolPage } from '../components/ToolPage';
import { getRelatedTools, getToolById } from '../data/tools';

interface ToolRoutePageProps {
  darkMode: boolean;
}

export const ToolRoutePage: React.FC<ToolRoutePageProps> = ({ darkMode }) => {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const tool = toolId ? getToolById(toolId) : undefined;

  if (!tool) {
    return <Navigate to="/" replace />;
  }

  return (
    <ToolPage
      key={tool.id}
      tool={tool}
      darkMode={darkMode}
      onBack={() => navigate('/', { state: { scrollTo: 'tools' } })}
      relatedTools={getRelatedTools(tool)}
    />
  );
};

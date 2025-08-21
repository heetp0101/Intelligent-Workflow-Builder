// src/components/Sidebar.jsx
import React from 'react';

const Sidebar = () => {
  const components = ['UserQuery', 'KnowledgeBase', 'LLMEngine', 'Output'];

  return (
    <aside style={{ padding: '1rem', width: '200px', background: '#f5f5f5' }}>
      <h3>Components</h3>
      {components.map((type) => (
        <div
          key={type}
          draggable
          onDragStart={(e) => e.dataTransfer.setData('application/reactflow', type)}
          style={{
            padding: '8px',
            margin: '8px 0',
            border: '1px solid #aaa',
            borderRadius: '8px',
            cursor: 'grab',
            background: '#fff',
          }}
        >
          {type}
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;

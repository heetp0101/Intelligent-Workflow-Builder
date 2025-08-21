// src/components/CustomNode.jsx
import React from 'react';
import { Handle, Position } from 'react-flow-renderer';
import Canvas from './Canvas';
const CustomNode = ({ data }) => {
  return (
    <div style={{
      padding: '10px',
      border: '2px solid #555',
      borderRadius: '10px',
      backgroundColor: '#fff',
      minWidth: '150px',
      textAlign: 'center'
    }}>
      <strong>{data.label}</strong>
      <div style={{ marginTop: '8px' }}>
        <button
          onClick={data.onConfigure}
          style={{ padding: '5px 10px', fontSize: '12px' }}
        >
          Configure
        </button>
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default CustomNode;

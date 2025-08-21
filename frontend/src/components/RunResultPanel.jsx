// src/components/RunResultPanel.jsx
import React, { useMemo, useState } from 'react';

const boxStyle = {
  position: 'absolute',
  right: 16,
  bottom: 16,
  width: 380,
  maxHeight: '50vh',
  overflow: 'auto',
  background: '#ffffff',
  border: '1px solid #ddd',
  borderRadius: 12,
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  padding: 16,
  zIndex: 20,
  fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 8
};

const pillStyle = {
  fontSize: 12,
  padding: '2px 8px',
  borderRadius: 999,
  background: '#e7f5ff',
  color: '#0b60a9'
};

const toggleStyle = {
  marginTop: 10,
  fontSize: 12,
  cursor: 'pointer',
  textDecoration: 'underline',
  color: '#555'
};

export default function RunResultPanel({ result }) {
  const [showDetails, setShowDetails] = useState(false);

  // Extract safe final text
  const finalText = useMemo(() => {
    if (!result?.output) return '';
    const vals = Object.values(result.output);
    return (vals[0] ?? '').toString();
  }, [result]);

  return (
    <div style={boxStyle}>
      <div style={headerStyle}>
        <h4 style={{ margin: 0 }}>Run Result</h4>
        <span style={pillStyle}>{result?.status || 'idle'}</span>
      </div>

      <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>
        {!result ? (
          // 🔹 Empty state
          <div
            style={{
              background: '#f7f7f7',
              border: '1px solid #eee',
              borderRadius: 8,
              padding: 10,
              fontStyle: 'italic',
              color: '#666'
            }}
          >
            No results yet. Run a workflow to see output here.
          </div>
        ) : (
          <>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Final Output</div>
            <div
              style={{
                background: '#f7f7f7',
                border: '1px solid #eee',
                borderRadius: 8,
                padding: 10,
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
              }}
            >
              {finalText || '(empty)'}
            </div>

            <div
              style={toggleStyle}
              onClick={() => setShowDetails((s) => !s)}
              role="button"
              aria-label="Toggle node details"
            >
              {showDetails ? 'Hide per-node details' : 'Show per-node details'}
            </div>

            {showDetails && (
              <div
                style={{
                  marginTop: 8,
                  background: '#fafafa',
                  border: '1px solid #eee',
                  borderRadius: 8,
                  padding: 10,
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: 12
                }}
              >
                {Object.entries(result.all_results || {}).map(([nodeId, text]) => (
                  <div key={nodeId} style={{ marginBottom: 8 }}>
                    <div style={{ color: '#777' }}>{nodeId}</div>
                    <div>{text?.toString() || '(empty)'}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

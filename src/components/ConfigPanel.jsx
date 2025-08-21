// src/components/ConfigPanel.jsx
import React, { useState } from 'react';

const ConfigPanel = ({ nodeData, updateNodeData }) => {
  const [inputText, setInputText] = useState('');

  if (!nodeData) return null;

  const cfg = nodeData.data?.config || {};
  // console.log("Rendering ConfigPanel for:", nodeData.data);
  console.log("cfg data : ",cfg)
  const handleChange = (e) => {

    const { name, value } = e.target;

    console.log("value : ",e.target.value)


    // updateNodeData({
    //   ...nodeData,
    //   config: {
    //     ...nodeData.data.config,
    //     [name]: value
    //   }
    // });

    updateNodeData({
      ...nodeData,
      data: {
        ...nodeData.data,
        config: {
          // ...nodeData.data.config,
          [name]: value,   // e.g. customPrompt: "your text"
        },
      },
    });

  };


  // get the value from User Query 
  function getfromUserQuery()
  {
      var userQueryval = document.getElementById('UserQuery').value
      console.log(" user query value is : ",userQueryval)

  }


  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // prevent form reload
      console.log("Saved Input:", inputText); // <- you can save it anywhere
      // Optionally clear it
      // setInputText('');
    }
  };

  return (
    <div style={{
      width: '300px',
      background: '#f0f0f0',
      padding: '16px',
      borderLeft: '1px solid #ccc'
    }}>
      <h3>Configure: {nodeData.data.label}</h3>

      {nodeData.data.label === 'LLMEngine' && (
        <>
          <label>Custom Prompt:</label>
          <textarea
            name="customPrompt"
            rows="4"
            value={nodeData.data.config?.customPrompt || ""}
            onChange={handleChange}
            // onBlur={(e) => {
            //   // also save on blur (when user clicks outside)
            //   handleChange(e);
            // }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleChange(e); // save on enter
              }
            }}
            
            style={{ width: '100%', marginTop: '8px' }}
          />
        </>
      )}

      {nodeData.data.label === 'KnowledgeBase' && (
          <>
          <label>Knowledge Text (paste here):</label>
          <textarea
            name="kbText"
            rows="8"
            value={nodeData.data.config?.kbText || ""}
            onChange={handleChange}
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Paste docs/snippets. We'll pick the most relevant sentences."
          />

          <label style={{ display: 'block', marginTop: 8 }}>Top K (1–10):</label>
          <input
            type="number"
            name="topK"
            min="1"
            max="10"
            value={nodeData.data.config?.topK ?? 3}
            onChange={handleChange}
            style={{ width: 80 }}
          />
        </>
      )}

      {nodeData.data.label === "UserQuery" && (
        <>
          <label>Placeholder:</label>
          <input
            type="text"
            name="placeholder"
            value={nodeData.data.config?.placeholder || ""}
            id='UserQuery'
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            style={{ width: '100%' }}
          />
        </>
      )}
    </div>
  );
};

export default ConfigPanel;

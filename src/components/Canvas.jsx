// src/components/Canvas.jsx
import React, { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  MiniMap,
  Controls,
  ReactFlowProvider,
  useNodesState,
  useEdgesState
} from 'react-flow-renderer';
import CustomNode from './CustomNode';
import ConfigPanel from './ConfigPanel';
import { saveWorkflow } from '../api/workflow';
import './Canvas.css';
import RunResultPanel from './RunResultPanel';


const nodeTypes = {
  custom: CustomNode
};

let id = 0;
const getId = () => `node_${id++}`;

const Canvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workflowStructure, setWorkflowStructure] = useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const [runResult, setRunResult] = useState(null);
  
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

//  OnDrop Checkpoint #1 ///////////////////////////////////////////////////////////////////////

  // const onDrop = useCallback(
  //   (event) => {
  //     event.preventDefault();
  //     const type = event.dataTransfer.getData('application/reactflow');
  //     const position = { x: event.clientX - 250, y: event.clientY };

  //     const nodeId = getId();

  //     const newNode = {
  //       id: nodeId,
  //       type: 'custom',
  //       position,
  //       data: {
  //         label: type,
  //         config: {},
  //         onConfigure: () => {
  //           const current = nodes.find((n) => n.id === nodeId);
  //           setSelectedNode(current);
  //         }
  //       }
  //     };

  //     setNodes((nds) => nds.concat(newNode));
  //   },
  //   [setNodes, nodes]
  // );




    //  OnDrop Checkpoint 2  /////////////////////////////////////////////////////////////////////

    // const onDrop = useCallback(
    //   (event) => {
    //     event.preventDefault();
    //     const type = event.dataTransfer.getData('application/reactflow');
    //     const position = { x: event.clientX - 250, y: event.clientY };
    //     const nodeId = getId();
    
    //     const newNode = {
    //       id: nodeId,
    //       type: 'custom',
    //       position,
    //       data: {
    //         label: type,
    //         config: {},
    //         onConfigure: () => {
    //           setSelectedNode((prev) => {
    //             console.log("Currently selected node : ",selectedNode);
    //             const current = nodes.find((n) => n.id === nodeId);
    //             console.log("current node is : ",current)
    //             return current;
    //           });
    //         }
    //       }
    //     };
    
    //     setNodes((nds) => nds.concat(newNode));
    //   },
    //   [setNodes, nodes]
    // );
    


    // onDrop Checkpoint 3 

    const onDrop = useCallback(
      (event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/reactflow');
        const position = { x: event.clientX - 250, y: event.clientY };
        const nodeId = getId();
    
        const newNode = {
          id: nodeId,
          type: 'custom',
          position,
          data: {
            label: type,
            config: {},
            onConfigure: () => {
              setSelectedNode(newNode); // 💡 directly use newNode (no need to find again)
            }
          }
        };
        
        console.log("current selected node is :",selectedNode)
        setNodes((nds) => [...nds, newNode]);
      },
      [setNodes]
    );


    const onDragOver = useCallback((event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }, []);

    // const updateNodeData = (updatedNode) => {
    //   setNodes((nds) =>
    //     nds.map((node) => (node.id === updatedNode.id ? updatedNode : node))
    //   );
    //   setSelectedNode(updatedNode);
    // };


    const updateNodeData = (updatedPartialNode) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === updatedPartialNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                config: {
                  ...node.data.config,
                  ...updatedPartialNode.data.config,
                },
              },
            };
          }
          return node;
        })
      );
    
      // Also update selectedNode with merged data
      setSelectedNode((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          config: {
            ...prev.data.config,
            ...updatedPartialNode.data.config,
          },
        },
      }));
    };
    






  // computeWorkflowStructure  checkpoint 1
  
  // const computeWorkflowStructure = () => {

  //   const structure = nodes.map((node) => ({
  //     id: node.id,
  //     type: node.data.label,
  //     config: node.data.config || {},
  //     connections: edges
  //       .filter((e) => e.source === node.id)
  //       .map((e) => e.target)
  //   }));
  //   setWorkflowStructure(structure);
  //   console.log('Workflow structure:', structure);
  // };


  // computerWorkflowStructure checkpoint 2

  // logic for save workflow when save workflow button is clicked it store the structure data of nodes and edges
  //  like which node is connected to which one. and then send the data to backend through FAST API
  const computeWorkflowStructure = async () => {

    // here the "nodes" is the raw data we require proper schema structure like JSON to send data thorugh FAST API else 
    /// else it will give error code 433 Unprocessed data kind of that
    const structure = nodes.map((node) => ({
      id: node.id,
      type: node.data.label,
      config: node.data.config || {},
      connections: edges
        .filter((e) => e.source === node.id)
        .map((e) => e.target)
    }));
  
    setWorkflowStructure(structure);
    console.log('Workflow structure:', structure);
  

    setIsSaving(true); // start loading

    try {
      // const result = await saveWorkflow(structure);

      // fetch("http://localhost:8000/api/save_workflow", {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json"
      //       },
      //       body: JSON.stringify({structure})
      //     })


      fetch("http://localhost:8000/api/save-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(structure),
      })
        .then(res => res.json())
        .then(result => console.log(result))
        .catch(error => console.error("Error sending workflow:", error));


      alert('Workflow saved successfully!');
      // console.log('Backend Response:', result);
    } catch (error) {
      alert('Failed to save workflow!');
      
    }finally {
      setIsSaving(false);
    }
  };


  //  logic for run workflow
      // here also like previously "nodes" and "edges" are raw data we need to parse into JSON structure
      // that is understand by FAST API else it will give error code of 422 Unprocessable content
  const runWorkflow = async () => {
    try {
      const formattedNodes = nodes.map((node) => ({
        id: node.id,
        type: node.data.label,
        config: node.data.config || {},
        connections: edges
          .filter((e) => e.source === node.id)
          .map((e) => e.target),
      }));
  
      const formattedEdges = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      }));
  
      const payload = {
        nodes: formattedNodes,
        edges: formattedEdges,
      };
  
      setIsRunning(true);


      // before sending data to backend we should valiate if input is empty or if there is no connection (edges) between nodes

      // validating for empty placeholder test case
      // const hasEmptyUserQuery = nodes.some(
      //   (node) => node.data.label === "UserQuery" && (!node.data.config?.placeholder || node.data.config.placeholder.trim() === "")
      // );

      // console.log("printing config for user query is : ",nodes)

      // if (hasEmptyUserQuery) {
      //   alert("Please fill in all User Query inputs before running workflow!");
      //   return; // stop execution
      // }
  


      for (const node of nodes) {
        if (node.data.label === "UserQuery" && (!node.data.config?.placeholder || !node.data.config.placeholder.trim() === "")) {
          alert("Error: User Query node must have a placeholder before running the workflow.");
          return; // stop execution
        }
        if (node.data.label === "LLMEngine" && (!node.data.config?.customPrompt || !node.data.config.customPrompt.trim() === "")) {
          alert("Error: LLM Engine node must have a custom prompt before running the workflow.");
          return; // stop execution
        }
        // Add more node-type validations here if needed
      }

      //validating for missing connection between nodes
      const hasUnconnectedNodes = nodes.some((node) => {
        const connected = edges.some(
          (edge) => edge.source === node.id || edge.target === node.id
        );
        return !connected && node.type !== "userQuery" && node.type !== "output";
      });
      
      if (hasUnconnectedNodes) {
        alert("Some nodes are not connected. Please connect all nodes properly!");
        return;
      }


      const response = await fetch("http://localhost:8000/api/run-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
  
      const result = await response.json();
      console.log("Workflow Run Result:", result);


      if (result.status === "error") {
        setRunResult({ error: result.message || "Unknown error occurred" });
      } else {
        alert("Workflow completed succesfully !")
        setRunResult(result);
      }

      // // 👉 show on screen
      // setRunResult(result);
  
      // optional: toast
      // alert(`Workflow is running: ${result.status}`);
    } catch (error) {
      console.error("Error running workflow:", error);
      alert("Error running workflow. Check console.");
      setRunResult({ error: error.message });
    } finally {
      setIsRunning(false);
    }
  };
      
  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <div style={{ flex: 1, height: '100vh' }} onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >


        <div style={{position: 'absolute', top: 10, left: 10, zIndex: 10 }}>  
          <button
              onClick={computeWorkflowStructure}
              className="action-button save-button"
              disabled={isSaving}
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                zIndex: 10,
                padding: '6px 12px',
                background: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px'
              }}
            >
              {isSaving ? 'Saving...' : 'Save Workflow'}
          </button>

          <button
            onClick={runWorkflow}
            className="action-button run-button"
            disabled={isRunning}
            style={{
              position: 'absolute',
              top: 60, // 20 (Save) + 40 (button height + spacing)
              left: 20,
              zIndex: 10,
              padding: '6px 12px',
              background: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '5px'
            }}
          >
             {isRunning ? 'Running...' : 'Run Workflow'}
          </button>
        </div>
          <MiniMap />

          <Controls />

          <Background />



       {runResult?.error ? (
        <div className="text-red-500 font-semibold">
          Error: {runResult.error}
        </div>
         )  : (
  
        // existing result rendering
        <RunResultPanel result={runResult} />
  
        )}
        </ReactFlow>
        
      </div>

      {selectedNode && (
           <ConfigPanel nodeData={selectedNode} updateNodeData={updateNodeData} />
      )}
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <Canvas />
  </ReactFlowProvider>
);

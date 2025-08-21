export const saveWorkflow = async (workflowData) => {
    try {
      const response = await fetch('http://localhost:8000/api/save_workflow', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workflowData),
      })
      .then((response) => response.json())
      .then((result) => console.log(result))
      .catch((error) => console.error("Error:", error));
  
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      console.log("data to be sent : ",workflowData)
  
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to save workflow:', error);
      throw error;
    }
  };
  
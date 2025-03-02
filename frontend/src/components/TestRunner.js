import React, { useState, useEffect } from 'react';

const TestRunner = ({ uuid }) => {
  const [code, setCode] = useState('');
  const [parameters, setParameters] = useState({});
  const [parameterValues, setParameterValues] = useState({});

  useEffect(() => {
    // Fetch code and parameters from backend
    fetch(`http://localhost:3000/file/${uuid}`)
      .then(res => res.json())
      .then(data => {
        setCode(data.script);
        setParameters(data.parameters || {});
      });
  }, [uuid]);

  const handleParameterChange = (key, value) => {
    setParameterValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleReplay = async () => {
    const response = await fetch('http://localhost:3000/replay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uuid,
        parameters: parameterValues
      })
    });
    
    if (response.ok) {
      // Show VNC viewer after successful replay initiation
      document.getElementById('vnc-viewer').src = 'http://localhost:8080/vnc.html';
    }
  };

  return (
    <div className="test-runner">
      <div className="parameters-section">
        <h3>Parameters</h3>
        {Object.entries(parameters).map(([key, value]) => (
          <div key={key}>
            <label>{key}:</label>
            <input
              type="text"
              value={parameterValues[key] || ''}
              onChange={(e) => handleParameterChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>
      
      <div className="code-section">
        <h3>Generated Code</h3>
        <pre>{code}</pre>
      </div>

      <button onClick={handleReplay}>Replay Test</button>

      <div className="vnc-viewer">
        <iframe
          id="vnc-viewer"
          title="VNC Viewer"
          width="100%"
          height="600px"
          style={{border: 'none'}}
        />
      </div>
    </div>
  );
};

export default TestRunner;

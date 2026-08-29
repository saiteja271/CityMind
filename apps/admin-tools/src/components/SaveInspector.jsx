import React, { useState, useEffect } from 'react';

/**
 * SaveInspector Component
 * Interactive city save file inspector, schema validator, live raw JSON editor,
 * and snapshot payload import/export management console.
 */
export default function SaveInspector({ activeCityId }) {
  const [cityData, setCityData] = useState(null);
  const [jsonText, setJsonText] = useState('');
  const [validationError, setValidationError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Fetch city save file data whenever activeCityId changes
  useEffect(() => {
    if (!activeCityId) return;

    const fetchCitySave = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/v1/cities/${activeCityId}?includeGrid=false`);
        const data = await response.json();
        if (data.success && data.city) {
          setCityData(data.city);
          setJsonText(JSON.stringify(data.city, null, 2));
          setValidationError(null);
        }
      } catch (err) {
        setValidationError(`Failed to load save file: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCitySave();
  }, [activeCityId]);

  const handleJsonChange = (e) => {
    const val = e.target.value;
    setJsonText(val);

    try {
      const parsed = JSON.parse(val);
      setValidationError(null);
    } catch (err) {
      setValidationError(`JSON Syntax Error: ${err.message}`);
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setValidationError(null);
    } catch (err) {
      setValidationError(`Cannot format invalid JSON: ${err.message}`);
    }
  };

  const handleSaveSnapshot = async () => {
    if (validationError) return;

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const parsed = JSON.parse(jsonText);
      const response = await fetch(`/api/v1/cities/${activeCityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          economy: parsed.economy,
          timeState: parsed.timeState,
          stats: parsed.stats,
          environment: parsed.environment,
          activePolicies: parsed.activePolicies
        })
      });

      const data = await response.json();
      if (data.success) {
        setStatusMessage('City snapshot successfully updated in database!');
      } else {
        setValidationError(`Save failed: ${data.error}`);
      }
    } catch (err) {
      setValidationError(`Network error during save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadSnapshot = () => {
    try {
      const blob = new Blob([jsonText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `citymind_save_${activeCityId || 'export'}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setValidationError(`Export failed: ${err.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>City Save Inspector & JSON Editor</h2>
          <span style={styles.subtitle}>
            Inspecting City ID: <code style={styles.codeId}>{activeCityId || 'None Selected'}</code>
          </span>
        </div>
        <div style={styles.toolbar}>
          <button onClick={handleFormatJson} style={styles.secondaryButton}>
            Format JSON
          </button>
          <button onClick={handleDownloadSnapshot} style={styles.secondaryButton}>
            Export Save File
          </button>
          <button
            onClick={handleSaveSnapshot}
            disabled={isSaving || !!validationError || !activeCityId}
            style={styles.primaryButton(!!validationError || !activeCityId)}
          >
            {isSaving ? 'Saving...' : 'Apply & Save Snapshot'}
          </button>
        </div>
      </div>

      {statusMessage && <div style={styles.successBox}>{statusMessage}</div>}
      {validationError && <div style={styles.errorBox}>{validationError}</div>}

      <div style={styles.editorWrapper}>
        {isLoading ? (
          <div style={styles.loadingState}>Loading city save document...</div>
        ) : (
          <textarea
            value={jsonText}
            onChange={handleJsonChange}
            placeholder="Select a city to inspect raw JSON payload..."
            style={styles.textarea}
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#111827',
    borderRadius: '12px',
    border: '1px solid #1f2937'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#f3f4f6'
  },
  subtitle: {
    fontSize: '13px',
    color: '#9ca3af'
  },
  codeId: {
    backgroundColor: '#1f2937',
    padding: '2px 6px',
    borderRadius: '4px',
    color: '#60a5fa'
  },
  toolbar: {
    display: 'flex',
    gap: '10px'
  },
  secondaryButton: {
    padding: '8px 16px',
    backgroundColor: '#374151',
    color: '#e5e7eb',
    border: '1px solid #4b5563',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '13px'
  },
  primaryButton: (disabled) => ({
    padding: '8px 16px',
    backgroundColor: disabled ? '#4b5563' : '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: '600',
    fontSize: '13px'
  }),
  successBox: {
    padding: '12px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid #10b981',
    color: '#34d399',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px'
  },
  errorBox: {
    padding: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid #ef4444',
    color: '#f87171',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
    fontFamily: 'monospace'
  },
  editorWrapper: {
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #374151'
  },
  textarea: {
    width: '100%',
    height: '450px',
    backgroundColor: '#0b0f19',
    color: '#38bdf8',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '13px',
    padding: '16px',
    border: 'none',
    outline: 'none',
    resize: 'vertical',
    lineHeight: '1.5'
  },
  loadingState: {
    height: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
    backgroundColor: '#0b0f19'
  }
};

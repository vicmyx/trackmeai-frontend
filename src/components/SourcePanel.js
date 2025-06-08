import React from 'react';
import './SourcePanel.css';

const SourcePanel = ({ sources, onClose }) => {
  const getManualDisplayName = (manualId) => {
    if (manualId === 'Radical_SR3_Owners_Manual') {
      return 'Radical SR3 Owner\'s Manual';
    }
    if (manualId === 'Radical_Handling_Guide') {
      return 'Radical Handling Guide';
    }
    return manualId;
  };

  const getConfidenceLevel = (score) => {
    if (score >= 0.8) return { level: 'high', label: 'High Confidence' };
    if (score >= 0.6) return { level: 'medium', label: 'Medium Confidence' };
    return { level: 'low', label: 'Low Confidence' };
  };

  const getSourceTypeInfo = (source) => {
    // Only show PDF documentation sources
    return {
      icon: '📖',
      title: 'Radical SR3 Documentation',
      description: 'Official Manual Content'
    };
  };

  const formatSourceContent = (source) => {
    // Handle both old format (chunk_text) and new format (content)
    return source.content || source.chunk_text || 'No content available';
  };

  const getSourceTitle = (source) => {
    return source.metadata?.section_title || source.section_title || 'Technical Documentation';
  };

  const getSourceSubtitle = (source) => {
    const manualId = source.metadata?.manual_id || source.manual_id;
    return manualId ? getManualDisplayName(manualId) : 'Radical Documentation';
  };

  const getConfidenceScore = (source) => {
    return source.confidence || source.similarity_score || 0;
  };

  return (
    <div className="source-panel-overlay" onClick={onClose}>
      <div className="source-panel" onClick={(e) => e.stopPropagation()}>
        <div className="source-panel-header">
          <h3>📖 Radical Documentation Sources</h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="source-panel-content">
          <p className="source-panel-description">
            This answer was found in the following sections of your Radical SR3 documentation:
          </p>
          
          <div className="sources-list">
            {sources.map((source, index) => {
              const confidenceScore = getConfidenceScore(source);
              const confidence = getConfidenceLevel(confidenceScore);
              const sourceTypeInfo = getSourceTypeInfo(source);
              
              return (
                <div key={index} className="source-item">
                  <div className="source-header">
                    <div className="source-info">
                      <div className="source-type-indicator">
                        <span className="source-icon">{sourceTypeInfo.icon}</span>
                        <span className="source-type-label">{sourceTypeInfo.title}</span>
                      </div>
                      <h4 className="source-title">
                        {getSourceTitle(source)}
                      </h4>
                      <p className="source-manual">
                        {getSourceSubtitle(source)}
                      </p>
                      {source.metadata?.page_start && (
                        <p className="page-reference">
                          Page {source.metadata.page_start}
                        </p>
                      )}
                    </div>
                    <div className={`confidence-badge ${confidence.level}`}>
                      {confidence.label}
                      <span className="confidence-score">
                        ({Math.round(confidenceScore * 100)}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="source-content">
                    <p className="source-text">
                      {formatSourceContent(source)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="source-panel-footer">
          <p className="disclaimer">
            ⚠️ Always verify critical information with your Radical technical support team
          </p>
        </div>
      </div>
    </div>
  );
};

export default SourcePanel;
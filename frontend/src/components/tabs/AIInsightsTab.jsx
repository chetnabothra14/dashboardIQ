import { useTheme } from '../../context/ThemeContext.js';
import { Section, AICard } from '../ui/SharedUI.jsx';
import { fmtINR } from '../../utils/formatters.js';

const AI_FEATURES = [
  { icon:'🔮', title:'Predictive Forecasting',  badge:'ML',        desc:"Uses Prophet/scikit-learn to predict next quarter's ₹ sales from your data. Adjust inventory before peaks." },
  { icon:'💬', title:'NL Query Interface',       badge:'LLM',       desc:'Ask in plain English. Claude translates queries into filters and chart generation — no SQL or coding needed.' },
  { icon:'🚨', title:'Anomaly Detection',        badge:'Real-time', desc:'AI monitors your data and flags unusual revenue drops or spikes before end-of-month reviews.' },
  { icon:'😊', title:'Sentiment Analysis',       badge:'NLP',       desc:'Upload PDF reviews or call transcripts. AI scores sentiment and overlays on your ₹ revenue chart.' },
  { icon:'🎯', title:'Smart Recommendations',    badge:'Actionable',desc:'AI flags which products to push, which regions need attention, and which customers show churn risk.' },
  { icon:'📄', title:'Auto Report Generation',   badge:'Automation',desc:'One click generates a full executive summary with ₹ metrics, trend narratives, and action items.' },
];

const CHIPS = [
  'Best performing month?',
  'Highest margin product?',
  'Summarise regional performance',
  "What's driving the profit trend?",
];

export default function AIInsightsTab({ data, isUploaded, query, setQuery, aiResponse, aiLoading, onAsk }) {
  const C = useTheme();
  return (
    <div className="two-col-grid">
      <Section
        title="Ask Your Data"
        subtitle={isUploaded ? 'Querying your uploaded data via Claude AI' : 'Querying sample data via Claude AI'}
        span={2}
      >
        <div className="ai-query-row">
          <input
            className="ai-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onAsk()}
            placeholder='e.g. "Which product had the highest revenue?" or "Summarise monthly trends"'
            style={{ background:C.bg, borderColor:C.border, color:C.text }}
          />
          <button
            className="btn-primary"
            disabled={aiLoading}
            onClick={onAsk}
            style={{ background: aiLoading ? C.faint : C.accent, cursor: aiLoading ? 'not-allowed' : 'pointer' }}
          >
            {aiLoading ? 'Thinking…' : 'Ask AI'}
          </button>
        </div>

        {aiResponse && (
          <div className="ai-response" style={{ background:C.accentBg, borderColor:C.accentBdr, color:C.sub }}>
            <span className="ai-response-label" style={{ color:C.accent }}>AI: </span>
            {aiResponse}
          </div>
        )}

        <div className="ai-chips">
          {CHIPS.map(q => (
            <button key={q} className="ai-chip" style={{ borderColor:C.border, color:C.muted }} onClick={() => setQuery(q)}>
              {q}
            </button>
          ))}
        </div>
      </Section>

      {AI_FEATURES.map(card => <AICard key={card.title} {...card} />)}
    </div>
  );
}

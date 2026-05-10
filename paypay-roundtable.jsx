// PayPay × Nous Alpha — The Roundtable page
// Immersive dark-navy hero with PayPay header chrome
// 12 AI agents, live discussion, per-agent stance grid, voting timeline, verdict + portfolio impact
//
// Data hydration: on screen mount, useNousData() fetches /api/roundtable
// or /api/committee from the backend (default http://localhost:3001 — set
// window.NOUS_BACKEND_URL to override). On success the module-level data
// arrays are mutated in place so existing component references stay valid,
// then a forceUpdate triggers a single re-render of the screen tree. On
// fetch failure the in-file constants below are kept as fallback so the
// screens always render.

const { useState, useEffect, useRef, useContext, createContext } = React;

// ─── i18n for the Roundtable screen (parallel to COMMITTEE_I18N) ────────
const RTP_I18N = {
  ja: {
    appTitle: 'ポイント運用',
    tabs: [
      { id: 'status', lbl: '運用状況', ico: '☷' },
      { id: 'history', lbl: '運用履歴', ico: '◉' },
      { id: 'browse', lbl: '運用する', ico: '⊕' },
      { id: 'roundtable', lbl: 'Roundtable', ico: '◎', nous: true },
      { id: 'other', lbl: 'その他', ico: '⋯' },
      { id: 'cta', lbl: '追加投資', ico: '+', cta: true },
    ],
    liveLbl: 'LIVE',
    liveElapsed: '議論中 · 12分経過',
    discussionTitle: '直近の議論',
    discussionAll: '全件',
    stanceTitle: '11人の本日のスタンス',
    resolutionTitle: '本日の決議',
    resolutionTime: '2026年4月 · 月次定例',
    rebalance: '推定リバランス額',
    nextRebalance: '5/1 自動リバランス予定 ›',
    disclaimer: '※ Nous Alpha のAIエージェントは過去データと公開情報を学習したシミュレーションです。発言・決議・予想は投資助言ではありません。',
    miniHistory: '過去30日のスタンス推移',
    miniRecent: '直近の発言',
    miniEmpty: '本日の発言はまだありません',
    askCtaLbl: 'この円卓に質問する',
    askCtaHint: '11人のAI専門家が議論',
    askTitle: '円卓に質問する',
    askSub: '11人のAIエージェントが議論を組み立てます',
    askPlaceholder: '11人の専門家に投げかけたい質問を入力（例：金利が下がり始めたら主軸を変えるべき？）',
    askSubmit: '議論を始める',
    askSubmitting: '議論中…',
    askChips: ['景気後退時の防御','AI 集中リスク','インフレ再燃','米国国債のヘッジ価値','高配当 vs 配当グロース','円安局面の対応'],
    askFootNote: '※ AIエージェントの応答はシミュレーションであり、投資助言ではありません。',
    motionBanner: '本日の議論テーマ',
    loading: '11人のAIエージェントが議論を組み立てています…',
    speakingNow: '発言中',
  },
  en: {
    appTitle: 'Point Investing',
    tabs: [
      { id: 'status', lbl: 'Status', ico: '☷' },
      { id: 'history', lbl: 'History', ico: '◉' },
      { id: 'browse', lbl: 'Invest', ico: '⊕' },
      { id: 'roundtable', lbl: 'Roundtable', ico: '◎', nous: true },
      { id: 'other', lbl: 'More', ico: '⋯' },
      { id: 'cta', lbl: 'Add', ico: '+', cta: true },
    ],
    liveLbl: 'LIVE',
    liveElapsed: 'Discussing · 12 min',
    discussionTitle: 'Recent discussion',
    discussionAll: 'All',
    stanceTitle: "Today's stances · 11 agents",
    resolutionTitle: "Today's decision",
    resolutionTime: 'April 2026 · monthly review',
    rebalance: 'Estimated rebalance',
    nextRebalance: 'Auto-rebalance May 1 ›',
    disclaimer: 'Note: Nous Alpha agents are simulations trained on historical and public data. Statements, votes, and projections are not investment advice.',
    miniHistory: 'Last 30 days of stance',
    miniRecent: 'Recent statements',
    miniEmpty: 'No statements yet today',
    askCtaLbl: 'Ask the table',
    askCtaHint: '11 AI experts deliberate',
    askTitle: 'Ask the table',
    askSub: '11 AI agents will assemble the discussion',
    askPlaceholder: 'What do you want the 11 experts to debate? (e.g., should the core sleeve change once rates start falling?)',
    askSubmit: 'Start discussion',
    askSubmitting: 'Discussing…',
    askChips: ['Recession defense','AI concentration risk','Inflation re-acceleration','Treasury duration as hedge','High-dividend vs dividend growth','Yen weakness'],
    askFootNote: 'Note: agent responses are simulations and not investment advice.',
    motionBanner: "Today's motion",
    loading: '11 AI agents are assembling the discussion…',
    speakingNow: 'Speaking',
  },
};

const RTPLangContext = createContext('ja');
const useRTPLang = () => useContext(RTPLangContext);
const useRTPCopy = () => RTP_I18N[useContext(RTPLangContext)] || RTP_I18N.ja;

// ─── Backend hookup ─────────────────────────────────────────────────────
const NOUS_BACKEND_URL = (typeof window !== 'undefined' && window.NOUS_BACKEND_URL) || 'http://localhost:3001';

function useNousData(endpoint, lang, motion) {
  const [, force] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastMotion, setLastMotion] = useState(null);
  useEffect(() => {
    const ctrl = new AbortController();
    const params = new URLSearchParams({ course: 'PP-INC', lang: lang || 'ja' });
    if (motion) params.set('motion', motion);
    const url = `${NOUS_BACKEND_URL}/api/${endpoint}?${params.toString()}`;
    // When the user submits a new motion, clear the previous responses
    // before the fetch so the new round doesn't render mixed with old text.
    // (Initial mount: motion is null; we keep the seed-data fallbacks.)
    if (motion) {
      DISCUSSION.length = 0;
      DISCUSSION_EN.length = 0;
      AGENT_STANCE.fill('abs');
      AGENT_CONFIDENCE.fill(0);
      AGENT_PICK.fill(null);
      PICK_STATE.tally = {};
      PICK_STATE.isComparison = false;
      AGENT_SPARK.splice(0, AGENT_SPARK.length, ..._deriveAgentSpark(AGENT_STANCE));
      if (typeof COMMITTEE_EVENTS !== 'undefined') COMMITTEE_EVENTS.length = 0;
      if (typeof COMMITTEE_EVENTS_EN !== 'undefined') COMMITTEE_EVENTS_EN.length = 0;
      // Force an immediate re-render so the placeholder shows before fetch resolves.
      force(x => x + 1);
    }
    setIsLoading(true);
    fetch(url, { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        if (Array.isArray(data.discussion) && data.discussion.length) {
          const target = (lang === 'en') ? DISCUSSION_EN : DISCUSSION;
          target.splice(0, target.length, ...data.discussion);
        }
        if (Array.isArray(data.stances) && data.stances.length === AGENT_STANCE.length) {
          AGENT_STANCE.splice(0, AGENT_STANCE.length, ...data.stances);
        }
        if (Array.isArray(data.confidences) && data.confidences.length === AGENT_CONFIDENCE.length) {
          AGENT_CONFIDENCE.splice(0, AGENT_CONFIDENCE.length, ...data.confidences);
        }
        AGENT_SPARK.splice(0, AGENT_SPARK.length, ..._deriveAgentSpark(AGENT_STANCE));
        // Hydrate per-agent picks (comparison motions only).
        if (Array.isArray(data.picks) && data.picks.length === AGENT_PICK.length) {
          AGENT_PICK.splice(0, AGENT_PICK.length, ...data.picks);
        } else {
          AGENT_PICK.fill(null);
        }
        PICK_STATE.tally = (data.pickTally && typeof data.pickTally === 'object') ? data.pickTally : {};
        PICK_STATE.isComparison = !!data.isComparison;
        if (Array.isArray(data.events) && data.events.length) {
          const target = (lang === 'en') ? COMMITTEE_EVENTS_EN : COMMITTEE_EVENTS;
          target.splice(0, target.length, ...data.events);
        }
        if (Array.isArray(data.voteReasons) && data.voteReasons.length === 11) {
          const bag = COMMITTEE_I18N && COMMITTEE_I18N[lang || 'ja'];
          if (bag && Array.isArray(bag.voteReasons)) {
            bag.voteReasons.splice(0, bag.voteReasons.length, ...data.voteReasons);
          }
        }
        setLastMotion(motion || null);
        force(x => x + 1);
      })
      .catch(() => { /* keep fallback constants */ })
      .finally(() => setIsLoading(false));
    return () => ctrl.abort();
  }, [endpoint, lang, motion]);
  return { isLoading, lastMotion };
}

// ─── Discussion script (rotates through agents) ─────────────────────────
const DISCUSSION = [
  { speaker: 0,  // Leo Aschenbrenner
    text: 'AI 計算スケーリングの本流は依然として強い。電力・チップ供給のボトルネックを通る銘柄に集中したい。テック比率は妥当。',
    stance: 'bull', topic: 'AI・計算インフラ', t: '12:42' },
  { speaker: 3,  // Ray Dalio
    text: '実質金利のピークは超えた。インカム＋債券スリーブは引き続き持続可能。リスクパリティ的には魅力的。',
    stance: 'bull', topic: 'マクロ・全天候', t: '12:39' },
  { speaker: 1,  // Jim Simons
    text: '直近30日の出来高プロファイルとボラ・サーフェスを見ると、INC スリーブのリバランスは現状維持で良い。シグナルは弱い買い。',
    stance: 'bull', topic: 'クオンツ・ファクター', t: '12:35' },
  { speaker: 6,  // Michael Burry
    text: '高配当大型株のバリュエーションは過熱気味。私は反対票を投じる。GLD の比率を上げて備えるべき。',
    stance: 'bear', topic: 'コントラリアン', t: '12:31' },
  { speaker: 5,  // Howard Marks
    text: 'クレジットスプレッドは歴史的にタイト。ここで強気に振り切るのは慎重に。配当グロースの新規買付は控えめに。',
    stance: 'bull', topic: 'クレジット', t: '12:28' },
  { speaker: 9,  // Jamie Dimon
    text: 'ノンバンク信用市場の拡大とプライベートクレジットの不透明性を警戒している。ストレス時に備えて現金枠は厚めに保ちたい。',
    stance: 'bear', topic: '銀行・与信', t: '12:24' },
  { speaker: 7,  // Paul Tudor Jones
    text: 'VIX は底値圏。テールリスクが安く買える。INC スリーブのプットスプレッドを薄く張りたい。',
    stance: 'bull', topic: 'リスク・ヘッジ', t: '12:21' },
  { speaker: 10, // Seth Klarman (renumbered from 11 after Bloomberg removal)
    text: '高配当スリーブにバリューの偏りを足したい。配当グロースの中でも PE が低い銘柄に傾けたい。条件付き賛成。',
    stance: 'bull', topic: 'ディープ・バリュー', t: '12:17' },
  { speaker: 2,  // Ken Griffin
    text: 'マルチ戦略の観点では、INC スリーブの増額はリスク調整後リターンが見合う。実行コスト 8.2bps も許容範囲。',
    stance: 'bull', topic: 'マルチ戦略', t: '12:14' },
];

const STANCE_LABEL = { bull: '強気', bear: '弱気', abs: '棄権' };
const STANCE_LABEL_EN = { bull: 'Bullish', bear: 'Bearish', abs: 'Hold' };
const stanceLabel = (lang, s) => (lang === 'en' ? STANCE_LABEL_EN[s] : STANCE_LABEL[s]);
const STANCE_COLOR = { bull: '#4ee2a3', bear: '#ff7a8a', abs: '#9aa6b8' };
const STANCE_ARROW = { bull: '↑', bear: '↓', abs: '–' };

// Per-agent today's stance — 11 personas after Bloomberg removed.
// Index 9 (Dimon) bear, index 8 (Munger) abstain. Tally: 7 bull / 2 abs / 2 bear.
const AGENT_STANCE = [
  'bull','bull','bull','bull','abs','bull','bear','bull','abs','bear','bull'
];
// Per-agent confidence 0..1 — 11 entries
const AGENT_CONFIDENCE = [0.82, 0.91, 0.74, 0.88, 0.0, 0.79, 0.71, 0.77, 0.0, 0.65, 0.84];
// Per-agent pick — only populated for comparison motions ("NVDA vs INTC").
// null for binary yes/no proposals. Mutated by useNousData on response.
const AGENT_PICK = new Array(11).fill(null);
// Aggregated pick tally + isComparison flag — mutated by useNousData.
// We wrap in an object so other components see updates after a force-render.
const PICK_STATE = { tally: {}, isComparison: false };
// Bio blurbs for the mini-profile (JP + EN parallel arrays)
const AGENT_BIO = [
  'AI 計算スケーリングの第一原理から、計算量・電力・チップ供給などのボトルネックを評価し、その時点で希少性が価格に反映されている領域に集中する。',
  'ボラティリティ・出来高・モメンタムから統計的アービトラージのシグナルを抽出。',
  'マルチ戦略の観点から、長短ファンダ・イベント駆動・クオンツ・クレジット間の資本配分を最適化する。',
  'マクロ環境（金利、インフレ、成長）から全天候型ポートフォリオの軸を提示。',
  'チャートパターンと相対力指数から短期のリスク・オン/オフ判断。',
  '社債・国債のクレジットスプレッドと格付け遷移確率からリスクを評価。',
  'コンセンサスと逆向きの仮説を立て、テールリスクとバブル兆候を警告する。',
  'プットスプレッド・リスクリバーサル等のヘッジ戦略でドローダウンを抑制。',
  'インバージョン（逆思考）と18の普遍的失敗モードを使って、強気フレームが見落とした破滅リスクと隠れた前提を炙り出す。',
  '銀行 CEO の視点で、ノンバンク信用・プライベートクレジット・地政学リスクを評価。',
  '簿価・キャッシュフロー・経営者インセンティブに基づくディープバリュー分析。',
];
const AGENT_BIO_EN = [
  'Reasons from compute scaling — evaluates bottlenecks in compute, power, and chips, and concentrates where scarcity is most priced.',
  'Extracts statistical-arbitrage signals from volatility, volume, and momentum.',
  'Multi-strategy lens: allocates capital across long/short fundamental, event-driven, quant, and credit sleeves on risk-adjusted return.',
  'Anchors the all-weather portfolio with rates / inflation / growth macro framing.',
  'Reads chart patterns and relative strength for short-horizon risk-on / risk-off calls.',
  'Assesses risk via corporate / government credit spreads and rating-transition probabilities.',
  'Builds contrarian hypotheses; flags tail risks and bubble signatures.',
  'Suppresses drawdowns via put spreads, risk reversals, and other hedge structures.',
  'Inverts: surfaces ruin risks, hidden assumptions, and one-way doors that the bullish framing skips.',
  'Bank-CEO lens on non-bank credit, private-credit opacity, and geopolitical risk.',
  'Deep-value analysis from book value, cash flow, and management incentives.',
];

// Stance history sparkline (last 30 days, -1..1)
const _sparkData = (seed) => {
  const out = [];
  let v = 0.3 + (seed % 7) * 0.05;
  for (let i = 0; i < 30; i++) {
    v += (Math.sin(i * (0.3 + seed * 0.02)) * 0.12) + ((seed * 13 + i * 7) % 23 - 11) * 0.02;
    v = Math.max(-1, Math.min(1, v));
    out.push(v);
  }
  return out;
};
// ─── Decision synthesis ──────────────────────────────────────────────────
// Reduce 12 agent stances + confidences into a single committee decision:
// vote tally, verdict label, suggested per-sleeve deltas, ¥ rebalance, and
// projected annual uplift. Used by RoundtableHero, ResolutionCard, and the
// hero hub-verdict so the panel reflects what the agents actually said.
const BASELINE_PCT = { INC: 38, DIV: 30, BND: 20, GLD: 12 };

// Per-sleeve detail content rendered in the bottom sheet when the user taps
// a sleeve card. Bilingual JP/EN.
const SLEEVE_DETAIL = {
  ja: {
    INC: {
      code: 'PP-INC', fullName: 'Nous インカム+',
      tagline: '高配当 + カバードコール戦略',
      desc: '米国の高配当・低ボラ大型株を中心に、Mag-7 などにカバードコールを売建てて追加収益を生み出す合成スリーブ。インカムを毎月積み上げ、ボラ局面では下方緩衝にもなる。',
      yield: '7.2%', vol: '9.4%', maxDD: '−4.7%', sharpe: '0.82',
      holdings: [
        { t: 'XOM',  n: 'Exxon Mobil',     w: 6.8 },
        { t: 'JNJ',  n: 'Johnson & Johnson', w: 6.2 },
        { t: 'CVX',  n: 'Chevron',          w: 5.4 },
        { t: 'KO',   n: 'Coca-Cola',        w: 4.9 },
        { t: 'PG',   n: 'Procter & Gamble', w: 4.5 },
        { t: '...',  n: 'カバードコール書建 + 他47銘柄', w: 72.2 },
      ],
    },
    DIV: {
      code: 'PP-DIV', fullName: 'Nous 配当グロース',
      tagline: '配当成長 + 連続増配企業',
      desc: '20年以上連続して配当を増やし続ける米国の高品質企業 (Dividend Aristocrats) と、配当成長率が高いセクターリーダーで構成。インカムと長期キャピタルゲインの両取り。',
      yield: '5.8%', vol: '11.2%', maxDD: '−12.4%', sharpe: '0.74',
      holdings: [
        { t: 'AAPL', n: 'Apple',            w: 7.1 },
        { t: 'MSFT', n: 'Microsoft',        w: 6.4 },
        { t: 'V',    n: 'Visa',             w: 5.2 },
        { t: 'MA',   n: 'Mastercard',       w: 4.8 },
        { t: 'COST', n: 'Costco',           w: 4.3 },
        { t: '...',  n: '他40銘柄',          w: 72.2 },
      ],
    },
    BND: {
      code: 'PP-BND', fullName: 'Nous 短期債券',
      tagline: '短中期国債 + 投資適格社債',
      desc: 'デュレーション 3〜5 年の米国債と投資適格社債 (IG) を中心に、TIPS でインフレヘッジを少量加える防御スリーブ。株式の下方局面で緩衝の役割。',
      yield: '3.4%', vol: '4.2%', maxDD: '−2.8%', sharpe: '0.61',
      holdings: [
        { t: '3-7Y Treasury', n: '中期米国債',          w: 42.0 },
        { t: 'IG Corp',       n: '投資適格社債',        w: 28.0 },
        { t: 'TIPS',          n: 'インフレ連動債',      w: 15.0 },
        { t: 'Agency MBS',    n: 'モーゲージ債',        w: 10.0 },
        { t: 'Cash',          n: '現金 (T-bills)',      w: 5.0 },
      ],
    },
    GLD: {
      code: 'PP-GLD', fullName: 'Nous ゴールド+',
      tagline: '金 + 鉱山株 + テールヘッジ',
      desc: 'GLD と金鉱株 (NEM, GOLD) で実物的な保険を持ち、SPX プットスプレッドで小さなテールヘッジを乗せる。レジームシフト時の保険として設計。',
      yield: '4.5%', vol: '13.8%', maxDD: '−7.2%', sharpe: '0.52',
      holdings: [
        { t: 'GLD',  n: '金 ETF',                       w: 55.0 },
        { t: 'GDX',  n: '金鉱株 ETF',                   w: 22.0 },
        { t: 'SPX puts', n: 'プットスプレッド',         w: 8.0 },
        { t: 'TLT',  n: '長期米国債 (テール用)',        w: 10.0 },
        { t: 'Cash', n: '現金',                          w: 5.0 },
      ],
    },
  },
  en: {
    INC: {
      code: 'PP-INC', fullName: 'Nous Income+',
      tagline: 'High dividend + covered-call overlay',
      desc: 'US high-dividend, low-vol large caps with a covered-call overlay on Mag-7 names. Generates monthly income and provides downside cushion in vol regimes.',
      yield: '7.2%', vol: '9.4%', maxDD: '−4.7%', sharpe: '0.82',
      holdings: [
        { t: 'XOM',  n: 'Exxon Mobil',         w: 6.8 },
        { t: 'JNJ',  n: 'Johnson & Johnson',   w: 6.2 },
        { t: 'CVX',  n: 'Chevron',             w: 5.4 },
        { t: 'KO',   n: 'Coca-Cola',           w: 4.9 },
        { t: 'PG',   n: 'Procter & Gamble',    w: 4.5 },
        { t: '...',  n: 'Covered calls + 47 more names', w: 72.2 },
      ],
    },
    DIV: {
      code: 'PP-DIV', fullName: 'Nous Dividend Growth',
      tagline: 'Dividend aristocrats + growth tilt',
      desc: 'High-quality US companies that have raised their dividend for 20+ years, plus sector leaders with strong dividend growth. Captures income and long-term capital gains.',
      yield: '5.8%', vol: '11.2%', maxDD: '−12.4%', sharpe: '0.74',
      holdings: [
        { t: 'AAPL', n: 'Apple',          w: 7.1 },
        { t: 'MSFT', n: 'Microsoft',      w: 6.4 },
        { t: 'V',    n: 'Visa',           w: 5.2 },
        { t: 'MA',   n: 'Mastercard',     w: 4.8 },
        { t: 'COST', n: 'Costco',         w: 4.3 },
        { t: '...',  n: '40 more names',  w: 72.2 },
      ],
    },
    BND: {
      code: 'PP-BND', fullName: 'Nous Short-Bond',
      tagline: 'Short / intermediate Treasuries + IG corp',
      desc: '3–5 year US Treasuries and investment-grade corporate credit, with a small TIPS sleeve for inflation. Defensive ballast that cushions equity drawdowns.',
      yield: '3.4%', vol: '4.2%', maxDD: '−2.8%', sharpe: '0.61',
      holdings: [
        { t: '3-7Y Treasury', n: 'Intermediate Treasuries', w: 42.0 },
        { t: 'IG Corp',       n: 'Investment-grade corp',   w: 28.0 },
        { t: 'TIPS',          n: 'Inflation-linked',        w: 15.0 },
        { t: 'Agency MBS',    n: 'Mortgage-backed',         w: 10.0 },
        { t: 'Cash',          n: 'T-bills',                 w: 5.0 },
      ],
    },
    GLD: {
      code: 'PP-GLD', fullName: 'Nous Gold+',
      tagline: 'Gold + miners + tail hedge',
      desc: 'GLD and gold miners as real-asset insurance, plus a small SPX put-spread tail hedge. Designed as protection through regime shifts.',
      yield: '4.5%', vol: '13.8%', maxDD: '−7.2%', sharpe: '0.52',
      holdings: [
        { t: 'GLD',     n: 'Gold ETF',               w: 55.0 },
        { t: 'GDX',     n: 'Gold miners ETF',        w: 22.0 },
        { t: 'SPX puts', n: 'Put-spread tail hedge', w: 8.0 },
        { t: 'TLT',     n: 'Long Treasuries',        w: 10.0 },
        { t: 'Cash',    n: 'Cash',                    w: 5.0 },
      ],
    },
  },
};
const PORTFOLIO_BAL = 847200;

function computeDecision(stances, confidences, lang) {
  const counts = { bull: 0, bear: 0, abs: 0 };
  for (const s of stances || []) {
    if (s === 'bull') counts.bull++;
    else if (s === 'bear') counts.bear++;
    else counts.abs++;
  }
  const total = counts.bull + counts.bear + counts.abs;
  const voted = counts.bull + counts.bear;
  const tilt = counts.bull - counts.bear;

  // Comparison motion (e.g. "NVDA vs INTC") — picks override the bull/bear axis.
  if (PICK_STATE.isComparison) {
    const sorted = Object.entries(PICK_STATE.tally).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) {
      return {
        counts, tilt: 0,
        verdict: lang === 'en' ? 'Awaiting decision' : '結論待ち',
        verdictTone: 'flat',
        sleeves: { INC: 0, DIV: 0, BND: 0, GLD: 0 },
        rebalanceJpy: 0, projectedUplift: 0,
        hasDecision: false, isComparison: true,
        topPick: null, runnerUp: null,
      };
    }
    const [topName, topVotes] = sorted[0];
    const runnerUp = sorted[1] || null;
    const margin = topVotes - (runnerUp ? runnerUp[1] : 0);
    let verdict;
    if (margin >= 5) {
      verdict = lang === 'en' ? `${topName} (decisive)` : `${topName} (圧倒的)`;
    } else if (margin >= 2) {
      verdict = lang === 'en' ? `${topName} preferred` : `${topName} を推す`;
    } else {
      verdict = lang === 'en' ? `${topName} (split)` : `${topName} (拮抗)`;
    }
    return {
      counts, tilt: 0,
      verdict,
      verdictTone: 'pick',
      sleeves: null, // suppress sleeve cards for comparison motions
      rebalanceJpy: 0,
      projectedUplift: 0,
      hasDecision: true,
      isComparison: true,
      topPick: { name: topName, votes: topVotes },
      runnerUp: runnerUp ? { name: runnerUp[0], votes: runnerUp[1] } : null,
      pickTally: PICK_STATE.tally,
    };
  }
  // Weighted tilt (confidence-weighted) for verdict shading
  let weighted = 0;
  if (confidences) {
    for (let i = 0; i < (stances || []).length; i++) {
      const c = confidences[i] || 0;
      if (stances[i] === 'bull') weighted += c;
      else if (stances[i] === 'bear') weighted -= c;
    }
  }
  // Empty / pre-vote state
  if (voted === 0 || total === 0) {
    return {
      counts,
      tilt: 0,
      verdict: lang === 'en' ? 'Awaiting decision' : '結論待ち',
      verdictTone: 'flat',
      sleeves: { INC: 0, DIV: 0, BND: 0, GLD: 0 },
      rebalanceJpy: 0,
      projectedUplift: 0,
      hasDecision: false,
    };
  }
  // Verdict label by tilt strength
  let verdict, verdictTone, sleeves;
  if (tilt >= 8)       { verdict = lang === 'en' ? 'Core · Strong Buy' : '主軸 · 強い買い'; verdictTone = 'bull';    sleeves = { INC: +3, DIV:  0, BND: -2, GLD: -1 }; }
  else if (tilt >= 4)  { verdict = lang === 'en' ? 'Core · Buy'        : '主軸 · 買い';     verdictTone = 'bull';    sleeves = { INC: +2, DIV:  0, BND: -1, GLD: -1 }; }
  else if (tilt >= 1)  { verdict = lang === 'en' ? 'Mild · Buy'        : '小幅 · 買い';     verdictTone = 'bull';    sleeves = { INC: +1, DIV:  0, BND: -1, GLD:  0 }; }
  else if (tilt === 0) { verdict = lang === 'en' ? 'Neutral'           : '中立';            verdictTone = 'flat';    sleeves = { INC:  0, DIV:  0, BND:  0, GLD:  0 }; }
  else if (tilt >= -3) { verdict = lang === 'en' ? 'Cautious'          : '慎重';            verdictTone = 'bear';    sleeves = { INC: -1, DIV:  0, BND: +1, GLD:  0 }; }
  else if (tilt >= -7) { verdict = lang === 'en' ? 'Defensive · Trim'  : '防御 · 軽量化';   verdictTone = 'bear';    sleeves = { INC: -1, DIV: -1, BND: +1, GLD: +1 }; }
  else                 { verdict = lang === 'en' ? 'Defensive · Sell'  : '防御 · 売り';     verdictTone = 'bear';    sleeves = { INC: -2, DIV: -1, BND: +1, GLD: +2 }; }

  // Rebalance ¥ amount = sum of positive sleeve deltas (in pp) × balance / 100
  const positiveDelta = Object.values(sleeves).filter(v => v > 0).reduce((a, b) => a + b, 0);
  const rebalanceJpy = Math.round(positiveDelta / 100 * PORTFOLIO_BAL);

  // Projected uplift scales with absolute tilt + average confidence
  const avgConf = voted > 0 ? Math.abs(weighted) / voted : 0;
  const upliftMagnitude = Math.min(0.30, Math.abs(tilt) * 0.04 + avgConf * 0.06);
  const projectedUplift = Math.round((verdictTone === 'flat' ? 0 : upliftMagnitude) * 100) / 100;

  return {
    counts,
    tilt,
    verdict,
    verdictTone,
    sleeves,
    rebalanceJpy,
    projectedUplift,
    hasDecision: true,
  };
}

function _deriveAgentSpark(stances) {
  return stances.map((s, i) => {
    const data = _sparkData(i);
    // Bias by current stance so it ends in the right zone
    if (s === 'bear') return data.map((v, k) => k > 22 ? -Math.abs(v) * 0.8 : v);
    if (s === 'abs')  return data.map((v, k) => k > 22 ? v * 0.15 : v);
    return data.map((v, k) => k > 22 ? Math.abs(v) * 0.85 : v);
  });
}
const AGENT_SPARK = _deriveAgentSpark(AGENT_STANCE);

// ─── Helpers ────────────────────────────────────────────────────────────
function useTypewriter(text, speed = 22) {
  const [out, setOut] = useState('');
  useEffect(() => {
    setOut('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return out;
}

// Rotates idx through 0..length-1 once, then stops. Manual setIdx() also
// stops rotation immediately so a tap on an avatar pins that speaker.
// Resets only on an empty→populated transition (initial mount, or after
// a motion-submission clears + repopulates) so live data hydration that
// keeps the array populated doesn't override a user's pinned avatar.
function useAutoRotate(length, intervalMs = 4200) {
  const [idx, setIdxRaw] = useState(0);
  const [stopped, setStopped] = useState(false);
  const advancedRef = useRef(0);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    if (length > 0 && prevLengthRef.current === 0) {
      // Empty → populated: fresh cycle.
      setIdxRaw(0);
      setStopped(false);
      advancedRef.current = 0;
    }
    prevLengthRef.current = length;
  }, [length]);

  // Auto-advance until we've shown each item once.
  useEffect(() => {
    if (!length || stopped) return;
    const id = setInterval(() => {
      setIdxRaw(i => {
        if (advancedRef.current >= length - 1) {
          setStopped(true);
          return i;
        }
        advancedRef.current += 1;
        return (i + 1) % length;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [length, intervalMs, stopped]);

  // Manual selection stops the cycle.
  const setIdx = (next) => {
    setStopped(true);
    setIdxRaw(next);
  };

  return [idx, setIdx, stopped];
}

// ─── 3D Roundtable hero ─────────────────────────────────────────────────
function RoundtableHero({ activeIdx, onPickSpeaker, rotationStopped }) {
  const lang = useRTPLang();
  const copy = useRTPCopy();
  const list = (lang === 'en') ? DISCUSSION_EN : DISCUSSION;
  const active = list.length ? (list[activeIdx % list.length] || list[0]) : null;
  const speakerId = active ? active.speaker : -1;
  const decision = computeDecision(AGENT_STANCE, AGENT_CONFIDENCE, lang);

  // Click an avatar → set the active speaker to that persona's discussion entry.
  const pickByPersonaId = (personaId) => {
    const idx = list.findIndex(d => d.speaker === personaId);
    if (idx >= 0 && onPickSpeaker) onPickSpeaker(idx);
  };
  return (
    <div className="rtp-hero">
      {/* LIVE chip */}
      <div className="rtp-live">
        <span className="dot"></span>
        <span className="lbl">{copy.liveLbl}</span>
        <span className="sep">·</span>
        <span className="elapsed">
          {!active
            ? (lang === 'en' ? 'Awaiting deliberation…' : '審議準備中…')
            : rotationStopped
              ? (lang === 'en' ? 'Tap any avatar' : 'アバターをタップ')
              : copy.liveElapsed}
        </span>
      </div>

      {/* 3D table — bigger than course-detail version */}
      <div className="rtp-stage">
        <div className="rtp-floor"></div>
        <div className="rtp-table">
          <div className="rim"></div>
          <div className="surface">
            <div className="grain"></div>
            <div className="pulse-a"></div>
            <div className="pulse-b"></div>
          </div>
        </div>
        <div className="rtp-hub">
          <div className="hub-conc">VERDICT</div>
          <div className="hub-line"></div>
          <div className={`hub-verdict ${decision.verdictTone}`}>{decision.verdict}</div>
          <div className="hub-tally">
            <span style={{color: STANCE_COLOR.bull}}>{decision.counts.bull} ↑</span>
            <span style={{color: STANCE_COLOR.abs}}>{decision.counts.abs} –</span>
            <span style={{color: STANCE_COLOR.bear}}>{decision.counts.bear} ↓</span>
          </div>
        </div>

        {/* Seats */}
        {Personas.map((p, i) => {
          const angle = (i / Personas.length) * Math.PI * 2 + Math.PI / 2;
          const edgeRx = 200, edgeRy = 88;
          const cx = Math.cos(angle) * edgeRx;
          const cy = Math.sin(angle) * edgeRy;
          const stance = AGENT_STANCE[i];
          const speaking = i === speakerId;
          const depthT = (cy + edgeRy) / (2 * edgeRy);
          // Back-row +15%: 0.7 → 0.805. Front stays at 1.2.
          const depthScale = 0.805 + depthT * 0.395;
          // Avatar z must be above the table (z-index 100) so back-row
          // avatars aren't covered by the flat table ellipse. We still
          // bias by cy so front-row (cy>0) stacks above back-row (cy<0)
          // when avatars overlap each other.
          const z = Math.round(300 + cy * 2);
          return (
            <div key={i}
              role="button"
              tabIndex={0}
              onClick={() => pickByPersonaId(i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') pickByPersonaId(i); }}
              className={"rtp-seat " + stance + (speaking ? ' speaking' : '')}
              style={{
                left: `calc(50% + ${cx}px)`,
                top: `calc(56% + ${cy}px)`,
                transform: `translate(-50%, -100%) scale(${depthScale.toFixed(3)})`,
                zIndex: z,
              }}>
              <div className="seat-shadow"></div>
              <div className="seat-av" dangerouslySetInnerHTML={{__html: p.svg.replace('viewBox="0 0 72 72"', 'viewBox="0 0 72 72" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"')}}></div>
              <div className={`seat-badge ${stance}`}>{STANCE_ARROW[stance]}</div>
              {speaking && (
                <>
                  <div className="seat-speak-name">{p.name}</div>
                  <div className="seat-speak-wave">
                    <span></span><span></span><span></span><span></span><span></span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Active speaker quote panel ─────────────────────────────────────────
function ActiveQuote({ activeIdx }) {
  const lang = useRTPLang();
  const list = (lang === 'en') ? DISCUSSION_EN : DISCUSSION;
  if (!list.length) {
    return (
      <div className="rtp-quote">
        <div className="rtp-quote-empty">
          <div className="dots"><span/><span/><span/></div>
          <div className="lbl">
            {lang === 'en'
              ? 'Agents are deliberating on your motion…'
              : 'エージェントが質問について議論中…'}
          </div>
        </div>
      </div>
    );
  }
  const active = list[activeIdx % list.length] || list[0];
  const speaker = Personas[active.speaker];
  const typed = useTypewriter(active.text, 24);
  return (
    <div className="rtp-quote">
      <div className="rtp-quote-head">
        <div className="who">
          <div className="av" dangerouslySetInnerHTML={{__html: speaker.svg}}></div>
          <div>
            <div className="nm">{speaker.name}</div>
            <div className="rl">{speaker.role} · {active.topic}</div>
          </div>
        </div>
        {active.pick
          ? <div className="stance-pill pick" title={lang === 'en' ? 'Picks' : '推し'}>→ {active.pick}</div>
          : <div className={`stance-pill ${active.stance}`}>
              {STANCE_ARROW[active.stance]} {stanceLabel(lang, active.stance)}
            </div>}
      </div>
      <div className="rtp-quote-body">
        「{typed}<span className="caret">|</span>」
      </div>
    </div>
  );
}

// ─── Discussion feed ────────────────────────────────────────────────────
function DiscussionFeed({ activeIdx }) {
  const lang = useRTPLang();
  const copy = useRTPCopy();
  const list = (lang === 'en') ? DISCUSSION_EN : DISCUSSION;
  if (!list.length) {
    return (
      <div className="rtp-feed">
        <div className="rtp-section-hd">
          <div className="lbl">{copy.discussionTitle}</div>
          <div className="more">—</div>
        </div>
        <div className="rtp-feed-empty">
          {lang === 'en'
            ? 'No statements yet. Agents are working on the new motion.'
            : 'まだ発言はありません。新しい議題について協議中です。'}
        </div>
      </div>
    );
  }
  // Show last 5 entries other than the active one
  const items = [];
  for (let n = 1; n <= 5; n++) {
    const i = (activeIdx - n + list.length) % list.length;
    items.push({ ...list[i], idx: i });
  }
  return (
    <div className="rtp-feed">
      <div className="rtp-section-hd">
        <div className="lbl">{copy.discussionTitle}</div>
        <div className="more">{copy.discussionAll} ›</div>
      </div>
      {items.map((it, k) => {
        const s = Personas[it.speaker];
        return (
          <div key={k} className="rtp-feed-item">
            <div className="av" dangerouslySetInnerHTML={{__html: s.svg}}></div>
            <div className="body">
              <div className="meta">
                <span className="nm">{s.name}</span>
                <span className="dot">·</span>
                <span className="topic">{it.topic}</span>
                {it.pick
                  ? <span className="stance-pill mini pick">→ {it.pick}</span>
                  : <span className={`stance-pill mini ${it.stance}`}>{STANCE_ARROW[it.stance]}</span>}
                <span className="t">{it.t}</span>
              </div>
              <div className="txt">{it.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Per-agent stance grid (12 cards) ───────────────────────────────────
function StanceGrid({ onPick }) {
  const lang = useRTPLang();
  const copy = useRTPCopy();
  return (
    <div className="rtp-grid-section">
      <div className="rtp-section-hd">
        <div className="lbl">{copy.stanceTitle}</div>
        <div className="more">{lang === 'en' ? 'Tap for detail ›' : 'タップで詳細 ›'}</div>
      </div>
      <div className="rtp-grid">
        {Personas.map((p, i) => {
          const stance = AGENT_STANCE[i];
          const conf = AGENT_CONFIDENCE[i];
          const pick = AGENT_PICK[i];
          // For comparison motions: show "→ pick" instead of bull/bear/abs.
          // Card class still uses the stance for color tone (bull = confident
          // pick / abs = no pick) so the green/grey vibe still scans.
          const cardClass = pick ? 'pick' : stance;
          return (
            <div key={i} className={`rtp-grid-card ${cardClass}`} onClick={() => onPick(i)}>
              <div className="av" dangerouslySetInnerHTML={{__html: p.svg}}></div>
              <div className="nm">{p.name}</div>
              <div className="rl">{p.role}</div>
              <div className="stance-row">
                {pick
                  ? <span className="stance-pill mini pick">→ {pick}</span>
                  : <span className={`stance-pill mini ${stance}`}>{STANCE_ARROW[stance]} {stanceLabel(lang, stance)}</span>}
                {!pick && stance !== 'abs' && (
                  <span className="conf">{lang === 'en' ? 'Conf.' : '確信度'} {Math.round(conf * 100)}%</span>
                )}
                {pick && stance === 'bull' && (
                  <span className="conf">{lang === 'en' ? 'Conf.' : '確信度'} {Math.round(conf * 100)}%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Today's resolution + portfolio impact ──────────────────────────────
function _formatDelta(d) {
  if (d > 0) return { sign: 'up', label: `+${d}%` };
  if (d < 0) return { sign: 'down', label: `${d}%` };
  return { sign: 'flat', label: '±0%' };
}
function _formatJpy(n) {
  return '¥' + n.toLocaleString('en-US');
}
function ResolutionCard({ onSleeveTap }) {
  const lang = useRTPLang();
  const copy = useRTPCopy();
  const decision = computeDecision(AGENT_STANCE, AGENT_CONFIDENCE, lang);
  const sleeveOrder = ['INC', 'DIV', 'BND', 'GLD'];
  const sleeveLabels = { INC: 'PP-INC', DIV: 'PP-DIV', BND: 'PP-BND', GLD: 'PP-GLD' };
  return (
    <div className="rtp-resolution">
      <div className="rtp-section-hd">
        <div className="lbl">{copy.resolutionTitle}</div>
        <div className="time">{copy.resolutionTime}</div>
      </div>
      <div className="rtp-res-card">
        <div className="hd">
          <div>
            <div className="conc">VERDICT</div>
            <div className={`vd ${decision.verdictTone}`}>{decision.verdict}</div>
          </div>
          <div className="tally-mini">
            <span style={{color: STANCE_COLOR.bull}}>{decision.counts.bull} ↑</span>
            <span style={{color: STANCE_COLOR.abs}}>{decision.counts.abs} –</span>
            <span style={{color: STANCE_COLOR.bear}}>{decision.counts.bear} ↓</span>
          </div>
        </div>
        {decision.isComparison ? (
          <div className="rtp-pick-board">
            {Object.entries(decision.pickTally || {})
              .sort((a, b) => b[1] - a[1])
              .map(([name, votes]) => {
                const total = Object.values(decision.pickTally || {}).reduce((a, b) => a + b, 0);
                const pctW = total ? (votes / total) * 100 : 0;
                const isTop = decision.topPick && name === decision.topPick.name;
                return (
                  <div key={name} className={`rtp-pick-row ${isTop ? 'top' : ''}`}>
                    <div className="nm">{name}</div>
                    <div className="bar">
                      <div className="b" style={{ width: `${pctW}%` }}></div>
                    </div>
                    <div className="cnt">{votes}</div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="action-grid">
            {sleeveOrder.map((k) => {
              const delta = decision.sleeves[k];
              const fmt = _formatDelta(delta);
              const before = BASELINE_PCT[k];
              const after = before + delta;
              return (
                <button
                  key={k}
                  type="button"
                  className="act"
                  onClick={() => onSleeveTap && onSleeveTap(k)}
                  aria-label={`${sleeveLabels[k]} ${lang === 'en' ? 'details' : '詳細'}`}>
                  <div className="lbl">{sleeveLabels[k]}</div>
                  <div className={`op ${fmt.sign}`}>{fmt.label}</div>
                  <div className="exp">{before}% → <b>{after}%</b></div>
                  <div className="info-dot" aria-hidden="true">i</div>
                </button>
              );
            })}
          </div>
        )}
        {decision.isComparison ? (
          <div className="rtp-impact">
            <div className="impact-head">
              <span className="dot"></span>
              <b>{lang === 'en' ? 'Committee outcome' : '委員会の結論'}</b>
            </div>
            <div className="impact-row">
              <div className="k">{lang === 'en' ? 'Top pick' : '最多得票'}</div>
              <div className="v" style={{color: STANCE_COLOR.bull}}>
                {decision.topPick ? `${decision.topPick.name} (${decision.topPick.votes})` : '—'}
              </div>
            </div>
            {decision.runnerUp && (
              <div className="impact-row">
                <div className="k">{lang === 'en' ? 'Runner-up' : '次点'}</div>
                <div className="v">{decision.runnerUp.name} ({decision.runnerUp.votes})</div>
              </div>
            )}
            <div className="impact-row">
              <div className="k">{lang === 'en' ? 'Abstain' : '棄権'}</div>
              <div className="v">{decision.counts.abs}</div>
            </div>
          </div>
        ) : (
        <div className="rtp-impact">
          <div className="impact-head">
            <span className="dot"></span>
            <b>{lang === 'en' ? 'Impact on your portfolio' : 'あなたのポートフォリオへの影響'}</b>
          </div>
          <div className="impact-row">
            <div className="k">{lang === 'en' ? 'Balance' : '運用残高'}</div>
            <div className="v">¥847,200</div>
          </div>
          <div className="impact-row">
            <div className="k">{copy.rebalance}</div>
            <div className="v">
              {decision.rebalanceJpy === 0
                ? (lang === 'en' ? 'No rebalance' : 'リバランスなし')
                : (lang === 'en'
                    ? `${_formatJpy(decision.rebalanceJpy)} / −${decision.rebalanceJpy.toLocaleString('en-US')} rotation`
                    : `${_formatJpy(decision.rebalanceJpy)} / −${decision.rebalanceJpy.toLocaleString('en-US')} の入替`)}
            </div>
          </div>
          <div className="impact-row">
            <div className="k">{lang === 'en' ? 'Execution cost' : '執行コスト'}</div>
            <div className="v">
              {(() => {
                if (decision.rebalanceJpy === 0) return lang === 'en' ? '—' : '—';
                // 0.082% of total balance (proportional to rebalance size)
                const sizePct = decision.rebalanceJpy / PORTFOLIO_BAL; // e.g. 0.02 for 2pp
                const cost = Math.round(-PORTFOLIO_BAL * 0.00082 * (sizePct / 0.02));
                const pct = (Math.abs(cost) / PORTFOLIO_BAL * 100).toFixed(3);
                return `¥${cost.toLocaleString('en-US')} (${lang === 'en' ? `approx. ${pct}%` : `約 ${pct}%`})`;
              })()}
            </div>
          </div>
          <div className="impact-row">
            <div className="k">{lang === 'en' ? 'Projected annual uplift' : '予想年率向上'}</div>
            <div className="v" style={{color: decision.projectedUplift > 0 ? STANCE_COLOR.bull : STANCE_COLOR.abs}}>
              {decision.projectedUplift === 0
                ? (lang === 'en' ? '—' : '—')
                : `+${decision.projectedUplift.toFixed(2)}% (${lang === 'en' ? 'simulation' : 'シミュレーション'})`}
            </div>
          </div>
        </div>
        )}
        {!decision.isComparison && (
          <div className="rtp-res-cta">
            <div className="primary">{copy.nextRebalance}</div>
            <div className="secondary">{lang === 'en' ? 'Approve manually' : '手動で承認'}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mini-profile overlay ───────────────────────────────────────────────
function MiniProfile({ idx, onClose }) {
  const lang = useRTPLang();
  const copy = useRTPCopy();
  if (idx == null) return null;
  const p = Personas[idx];
  const stance = AGENT_STANCE[idx];
  const bio = (lang === 'en' ? AGENT_BIO_EN : AGENT_BIO)[idx];
  const spark = AGENT_SPARK[idx];
  const list = (lang === 'en') ? DISCUSSION_EN : DISCUSSION;
  const w = 280, h = 60;
  const stepX = w / (spark.length - 1);
  const yAt = v => h / 2 - v * (h / 2 - 6);
  const path = spark.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${yAt(v)}`).join(' ');
  return (
    <div className="rtp-overlay" onClick={onClose}>
      <div className="rtp-profile" onClick={e => e.stopPropagation()}>
        <div className="close" onClick={onClose}>×</div>
        <div className="hd">
          <div className="av" dangerouslySetInnerHTML={{__html: p.svg}}></div>
          <div>
            <div className="nm">{p.name}</div>
            <div className="rl">{p.role}</div>
          </div>
          <div className={`stance-pill ${stance}`} style={{marginLeft: 'auto'}}>
            {STANCE_ARROW[stance]} {stanceLabel(lang, stance)}
          </div>
        </div>
        <div className="bio">{bio}</div>
        <div className="sub-hd">{copy.miniHistory}</div>
        <svg width={w} height={h} className="spark">
          <line x1="0" x2={w} y1={h/2} y2={h/2} stroke="rgba(150,180,230,0.18)" strokeDasharray="2 3"/>
          <path d={path} stroke={STANCE_COLOR[stance]} strokeWidth="1.6" fill="none" strokeLinejoin="round"/>
          <circle cx={(spark.length-1)*stepX} cy={yAt(spark[spark.length-1])} r="3" fill={STANCE_COLOR[stance]}/>
        </svg>
        <div className="spark-axis">
          <span>{lang === 'en' ? 'Bull' : '強気'}</span>
          <span>{lang === 'en' ? 'Neutral' : '中立'}</span>
          <span>{lang === 'en' ? 'Bear' : '弱気'}</span>
        </div>
        <div className="sub-hd">{copy.miniRecent}</div>
        <div className="profile-quotes">
          {list.filter(d => d.speaker === idx).slice(0, 2).map((d, k) => (
            <div key={k} className="pq">
              <div className="t">{d.t}</div>
              <div className="x">{lang === 'en' ? `“${d.text}”` : `「${d.text}」`}</div>
            </div>
          ))}
          {list.filter(d => d.speaker === idx).length === 0 && (
            <div className="pq empty">{copy.miniEmpty}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main screen ────────────────────────────────────────────────────────
// ─── Ask the table — user question UX ───────────────────────────────────
function AskCTA({ onClick }) {
  const copy = useRTPCopy();
  return (
    <button type="button" className="rtp-ask-cta" onClick={onClick}>
      <span className="ico">＋</span>
      <span className="lbl">{copy.askCtaLbl}</span>
      <span className="hint">{copy.askCtaHint}</span>
    </button>
  );
}

function AskSheet({ open, onClose, onSubmit, submitting }) {
  const lang = useRTPLang();
  const copy = useRTPCopy();
  const [text, setText] = useState('');
  const ref = useRef(null);
  useEffect(() => {
    if (open) {
      setText('');
      setTimeout(() => ref.current && ref.current.focus(), 220);
    }
  }, [open]);
  const submit = () => {
    const v = text.trim();
    if (!v || submitting) return;
    onSubmit(v);
  };
  return (
    <div className={`rtp-ask-sheet ${open ? 'open' : ''}`}
         onClick={(e) => { if (e.target.classList.contains('rtp-ask-sheet')) onClose(); }}>
      <div className="rtp-ask-card" role="dialog" aria-label={copy.askTitle}>
        <div className="rtp-ask-grab" />
        <div className="rtp-ask-hd">
          <div>
            <div className="rtp-ask-title">{copy.askTitle}</div>
            <div className="rtp-ask-sub">{copy.askSub}</div>
          </div>
          <button type="button" className="rtp-ask-close" onClick={onClose}
                  aria-label={lang === 'en' ? 'Close' : '閉じる'}>×</button>
        </div>

        <div className="rtp-ask-chips">
          {copy.askChips.map(t => (
            <button key={t} type="button" className="rtp-ask-chip" onClick={() => setText(t)}>{t}</button>
          ))}
        </div>

        <textarea
          ref={ref}
          className="rtp-ask-text"
          placeholder={copy.askPlaceholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={240}
          rows={3}
        />
        <div className="rtp-ask-foot">
          <span className="rtp-ask-count">{text.length}/240</span>
          <button type="button"
                  className="rtp-ask-submit"
                  disabled={!text.trim() || submitting}
                  onClick={submit}>
            {submitting ? copy.askSubmitting : copy.askSubmit}
          </button>
        </div>
        <div className="rtp-ask-foot-note">{copy.askFootNote}</div>
      </div>
    </div>
  );
}

// Sleeve detail bottom sheet — opens when the user taps a PP-INC/DIV/BND/GLD card
function SleeveDetailSheet({ openKey, onClose }) {
  const lang = useRTPLang();
  const open = !!openKey;
  const sleeve = openKey ? (SLEEVE_DETAIL[lang] || SLEEVE_DETAIL.ja)[openKey] : null;
  const before = openKey ? BASELINE_PCT[openKey] : 0;
  const decision = computeDecision(AGENT_STANCE, AGENT_CONFIDENCE, lang);
  const delta = openKey && decision.sleeves ? decision.sleeves[openKey] : 0;
  const after = before + delta;
  const fmtDelta = _formatDelta(delta);
  return (
    <div className={`rtp-sleeve-sheet ${open ? 'open' : ''}`}
         onClick={(e) => { if (e.target.classList.contains('rtp-sleeve-sheet')) onClose(); }}>
      <div className="rtp-sleeve-card" role="dialog" aria-label={sleeve ? sleeve.code : ''}>
        <div className="rtp-sleeve-grab" />
        {sleeve && (
          <>
            <div className="rtp-sleeve-hd">
              <div>
                <div className="rtp-sleeve-code">{sleeve.code}</div>
                <div className="rtp-sleeve-fullname">{sleeve.fullName}</div>
                <div className="rtp-sleeve-tagline">{sleeve.tagline}</div>
              </div>
              <button type="button" className="rtp-sleeve-close" onClick={onClose}
                      aria-label={lang === 'en' ? 'Close' : '閉じる'}>×</button>
            </div>

            <div className="rtp-sleeve-stats">
              <div className="stat"><div className="k">{lang === 'en' ? 'Target yield' : '目標年利'}</div><div className="v bull">{sleeve.yield}</div></div>
              <div className="stat"><div className="k">{lang === 'en' ? 'Vol (1y)' : 'ボラ (1年)'}</div><div className="v">{sleeve.vol}</div></div>
              <div className="stat"><div className="k">{lang === 'en' ? 'Max DD' : '最大DD'}</div><div className="v bear">{sleeve.maxDD}</div></div>
              <div className="stat"><div className="k">Sharpe</div><div className="v">{sleeve.sharpe}</div></div>
            </div>

            <div className="rtp-sleeve-allocation">
              <div className="row">
                <div className="k">{lang === 'en' ? 'Current allocation' : '現在の配分'}</div>
                <div className="v">{before}%</div>
              </div>
              <div className="row">
                <div className="k">{lang === 'en' ? 'Today’s recommended change' : '本日の推奨変更'}</div>
                <div className={`v ${fmtDelta.sign}`}>
                  {fmtDelta.label} → <b>{after}%</b>
                </div>
              </div>
            </div>

            <div className="rtp-sleeve-section-h">{lang === 'en' ? 'Description' : '概要'}</div>
            <div className="rtp-sleeve-desc">{sleeve.desc}</div>

            <div className="rtp-sleeve-section-h">{lang === 'en' ? 'Top holdings' : '主な構成銘柄'}</div>
            <div className="rtp-sleeve-holdings">
              {sleeve.holdings.map((h, i) => (
                <div key={i} className="hold">
                  <div className="hold-l">
                    <span className="t">{h.t}</span>
                    <span className="n">{h.n}</span>
                  </div>
                  <div className="hold-r">
                    <div className="bar"><div className="b" style={{width: `${Math.min(100, h.w)}%`}}/></div>
                    <span className="w">{h.w}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="rtp-sleeve-foot-note">
              {lang === 'en'
                ? 'Composition is illustrative for the prototype; not an actual managed portfolio.'
                : '構成は試作版のサンプル表示で、実際の運用ポートフォリオではありません。'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// JP/EN language toggle pill — mirrors cab-lang from the Committee variant
function LangToggle({ lang, onChange }) {
  return (
    <div className="rtp-lang" role="group" aria-label="Language">
      <button type="button"
              className={lang === 'ja' ? 'active' : ''}
              onClick={() => onChange('ja')}>JP</button>
      <button type="button"
              className={lang === 'en' ? 'active' : ''}
              onClick={() => onChange('en')}>EN</button>
    </div>
  );
}

// PPSkyHead replacement that uses the i18n bag.
function RoundtableSkyHead() {
  const copy = useRTPCopy();
  return (
    <div className="pp-skyhead">
      <div className="titlebar">
        <span className="back">‹</span>
        <span className="title">{copy.appTitle}</span>
        <span className="right">
          <span className="ico">?</span>
          <span className="x">×</span>
        </span>
      </div>
      <div className="tabs">
        {copy.tabs.map(t => (
          <div key={t.id} className={`tab ${t.cta ? 'cta' : ''} ${t.nous ? 'nous' : ''} ${t.id === 'roundtable' ? 'active' : ''}`}>
            <span className="ico-sq">{t.ico}</span>
            <span className="lbl">{t.lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PPRoundtableScreen() {
  const [lang, setLang] = useState('ja');
  const [motion, setMotion] = useState(null);
  const [askOpen, setAskOpen] = useState(false);
  const [sleeveKey, setSleeveKey] = useState(null);
  const { isLoading, lastMotion } = useNousData('roundtable', lang, motion);
  const list = (lang === 'en') ? DISCUSSION_EN : DISCUSSION;
  // Speaker rotation cadence — long enough to read the quote comfortably.
  // Was 4200ms; bumped to 8500ms after user feedback. Auto-rotation stops
  // after each persona has been shown once; user can tap any avatar to
  // re-show that persona's quote at any time.
  const [activeIdx, setActiveIdx, rotationStopped] = useAutoRotate(list.length, 8500);
  const [profileIdx, setProfileIdx] = useState(null);
  const copy = RTP_I18N[lang] || RTP_I18N.ja;

  const submitMotion = (q) => {
    setMotion(q);
    setAskOpen(false);
  };

  return (
    <RTPLangContext.Provider value={lang}>
      <div className={`pp-app rtp-app rtp-${lang}`}>
        <RoundtableSkyHead />

        {/* Lang toggle floats above the hero, top-right */}
        <LangToggle lang={lang} onChange={setLang} />

        {/* Hero — full-bleed dark navy */}
        <RoundtableHero
          activeIdx={activeIdx}
          onPickSpeaker={setActiveIdx}
          rotationStopped={rotationStopped}
        />
        <ActiveQuote activeIdx={activeIdx} />

        {/* Body — back to white card surface */}
        <div className="rtp-body-light">
          {lastMotion && (
            <div className="rtp-motion-banner">
              <div className="lbl">{copy.motionBanner}</div>
              <div className="txt">{lang === 'en' ? `“${lastMotion}”` : `「${lastMotion}」`}</div>
            </div>
          )}
          {isLoading && (
            <div className="rtp-loading">
              <div className="dots"><span/><span/><span/></div>
              <div className="lbl">{copy.loading}</div>
            </div>
          )}
          <DiscussionFeed activeIdx={activeIdx} />
          <StanceGrid onPick={setProfileIdx} />
          <ResolutionCard onSleeveTap={setSleeveKey} />

          <div className="rtp-disclaim">{copy.disclaimer}</div>
        </div>

        <AskCTA onClick={() => setAskOpen(true)} />
        <AskSheet
          open={askOpen}
          onClose={() => setAskOpen(false)}
          onSubmit={submitMotion}
          submitting={isLoading}
        />

        <SleeveDetailSheet
          openKey={sleeveKey}
          onClose={() => setSleeveKey(null)}
        />

        <MiniProfile idx={profileIdx} onClose={() => setProfileIdx(null)} />
      </div>
    </RTPLangContext.Provider>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// B VARIANT — Investment Committee Live
// A more process-led alternative: agenda, debate, vote, and decision.
// ═════════════════════════════════════════════════════════════════════════
const COMMITTEE_PHASES = [
  { id: 'agenda', label: '議題', meta: '要点' },
  { id: 'debate', label: '討議', meta: 'LIVE' },
  { id: 'vote', label: '投票', meta: '12票' },
  { id: 'decision', label: '決議', meta: '可決' },
];

const COMMITTEE_I18N = {
  ja: {
    appTitle: 'ポイント運用',
    tabs: [
      { id: 'status', lbl: '運用状況', ico: '☷' },
      { id: 'history', lbl: '運用履歴', ico: '◉' },
      { id: 'browse', lbl: '運用する', ico: '⊕' },
      { id: 'roundtable', lbl: 'Roundtable', ico: '◎', nous: true },
      { id: 'other', lbl: 'その他', ico: '⋯' },
      { id: 'cta', lbl: '追加投資', ico: '+', cta: true },
    ],
    phases: COMMITTEE_PHASES,
    monthReview: '4月 月次審議',
    motionEyebrow: '本日の議案',
    motionTitle: 'PP-INC を +2% に増やすべきか',
    motionBody: '収益性、下振れリスク、執行コストを11人の専門家エージェントが順番に検証。',
    speakerTags: ['根拠: 市場データ', '影響: +0.18% 年率', '論点: 下振れ保護'],
    speakingNow: '発言中',
    agendaTitle: '審議アジェンダ',
    agendaMeta: '4項目',
    agendaItems: [
      'インカム収益は目標年利 7.2% に届くか',
      '株式バリュエーション過熱の反対意見をどう扱うか',
      'PP-BND と PP-GLD の保険コストを許容できるか',
      '5/1 の自動リバランスに回してよいか',
    ],
    debateTitle: '討議ログ',
    debateMeta: '発言順',
    voteCounts: { bull: '7 強気', abs: '2 棄権', bear: '2 弱気' },
    voteReasons: [
      'AI 計算ボトルネックに賭ける',
      '統計シグナルは弱い買い',
      'マルチ戦略で増額に賛成',
      '金利ピークアウトを評価',
      '短期シグナル不足で棄権',
      '債券スリーブ条件付き賛成',
      'バリュエーション過熱を警戒',
      'ヘッジ厚めなら賛成',
      '強気の前提を反転して再点検',
      'ノンバンク信用リスクを警戒',
      'バリュー偏重で条件付き賛成',
    ],
    hold: '保留',
    decisionTitle: '可決 · 主軸買い増し',
    impact: {
      rebalance: '推定リバランス額',
      cost: '執行コスト',
      uplift: '予想年率向上',
      rebalanceValue: '¥16,940 入替',
    },
    next: '5/1 自動リバランス予定',
    disclaimer: '※ B案は、ユーザーが「誰が何を根拠に主張し、どう投票したか」を時系列で追える透明性重視の比較案です。',
  },
  en: {
    appTitle: 'Point Investing',
    tabs: [
      { id: 'status', lbl: 'Status', ico: '☷' },
      { id: 'history', lbl: 'History', ico: '◉' },
      { id: 'browse', lbl: 'Invest', ico: '⊕' },
      { id: 'roundtable', lbl: 'Committee', ico: '◎', nous: true },
      { id: 'other', lbl: 'More', ico: '⋯' },
      { id: 'cta', lbl: 'Add', ico: '+', cta: true },
    ],
    phases: [
      { id: 'agenda', label: 'Agenda', meta: 'Brief' },
      { id: 'debate', label: 'Debate', meta: 'LIVE' },
      { id: 'vote', label: 'Vote', meta: '12 votes' },
      { id: 'decision', label: 'Decision', meta: 'Passed' },
    ],
    monthReview: 'April monthly review',
    motionEyebrow: "Today's motion",
    motionTitle: 'Should PP-INC be increased by +2%?',
    motionBody: 'Twelve expert agents examine income potential, downside risk, and execution cost in sequence.',
    speakerTags: ['Evidence: market data', 'Impact: +0.18% annualized', 'Issue: downside protection'],
    speakingNow: 'Speaking',
    agendaTitle: 'Review Agenda',
    agendaMeta: '4 items',
    agendaItems: [
      'Can the income sleeve reach the 7.2% target yield?',
      'How should the committee handle valuation-risk objections?',
      'Are the PP-BND and PP-GLD protection costs acceptable?',
      'Should the decision move into the May 1 auto-rebalance?',
    ],
    debateTitle: 'Debate Log',
    debateMeta: 'Speaker order',
    voteCounts: { bull: '7 Bullish', abs: '2 Abstain', bear: '2 Bearish' },
    voteReasons: [
      'Bets on the AI compute bottleneck',
      'Quant signal is a weak buy',
      'Multi-strategy yes on increase',
      'Rates appear past peak',
      'Abstains on weak short-term signals',
      'Conditional yes on bond sleeve',
      'Warns on valuation heat',
      'Yes if hedges stay thicker',
      'Inverts the bull case to test it',
      'Cautious on non-bank credit risk',
      'Conditional yes on value tilt',
    ],
    hold: 'Hold',
    decisionTitle: 'Passed · Core sleeve increase',
    impact: {
      rebalance: 'Estimated rebalance',
      cost: 'Execution cost',
      uplift: 'Projected annual uplift',
      rebalanceValue: '¥16,940 rotation',
    },
    next: 'Auto-rebalance scheduled for May 1',
    disclaimer: 'Variant B is a transparency-first comparison: users can follow who argued what, why, and how each expert voted.',
  },
};

const DISCUSSION_EN = [
  { speaker: 0, text: "AI compute-scaling is still the dominant thesis. Concentrate on names that capture the power and chip-supply bottlenecks. Tech weighting is reasonable.", stance: 'bull', topic: 'AI / Compute', t: '12:42' },
  { speaker: 3, text: 'The real-rate peak is behind us. The Income plus bond sleeve remains sustainable and looks attractive from a risk-parity lens.', stance: 'bull', topic: 'Macro / All-weather', t: '12:39' },
  { speaker: 1, text: 'The 30-day volume profile and volatility surface say the INC sleeve can stay as is. The signal is a weak buy.', stance: 'bull', topic: 'Quant / Factors', t: '12:35' },
  { speaker: 6, text: 'High-dividend large caps look overheated. I vote no. Raise the GLD sleeve if we want more defense.', stance: 'bear', topic: 'Contrarian', t: '12:31' },
  { speaker: 5, text: 'Credit spreads are historically tight. I would avoid leaning too bullish and keep new dividend-growth buys modest.', stance: 'bull', topic: 'Credit', t: '12:28' },
  { speaker: 9, text: "I'm watching non-bank credit expansion and private-credit opacity. We should keep a fatter cash buffer for stress scenarios.", stance: 'bear', topic: 'Banking / Credit', t: '12:24' },
  { speaker: 7, text: 'VIX is near the floor. Tail risk is cheap. I would add a light put-spread hedge to the INC sleeve.', stance: 'bull', topic: 'Risk / Hedging', t: '12:21' },
  { speaker: 10, text: 'Conditional yes. Add more value bias to the high-dividend sleeve and tilt toward lower-PE names within dividend growth.', stance: 'bull', topic: 'Deep Value', t: '12:17' },
  { speaker: 2, text: 'From a multi-strategy lens, the INC increase has acceptable risk-adjusted return. 8.2bps friction is within tolerance.', stance: 'bull', topic: 'Multi-strategy', t: '12:14' },
];

const COMMITTEE_EVENTS = [
  { kind: 'motion', speaker: 3, time: '12:39', title: '提案', text: 'PP-INC を +2%。金利ピークアウト後のインカム再評価を取りに行く。', stance: 'bull', evidence: ['実質金利', 'VIX安定'] },
  { kind: 'challenge', speaker: 6, time: '12:31', title: '反対意見', text: '大型株は過熱気味。上げるなら GLD の保険も同時に増やしたい。', stance: 'bear', evidence: ['PER上昇', '集中リスク'] },
  { kind: 'evidence', speaker: 1, time: '12:35', title: 'データ提示', text: '出来高プロファイルとボラ・サーフェスは現状維持の弱い買いシグナル。CPI は予想を下回りフロー継続。', stance: 'bull', evidence: ['CPI +2.4%', '8.2bps'] },
  { kind: 'counter', speaker: 5, time: '12:28', title: '条件付き賛成', text: 'クレジットはタイト。PP-BND を -1% するなら月次で再評価する条件を付ける。', stance: 'bull', evidence: ['スプレッド', '再評価条件'] },
  { kind: 'lock', speaker: 2, time: '12:14', title: '投票ロック', text: '執行摩擦は 8.2bps。スリッページ見込みは基準内。可決後の実行は可能。', stance: 'bull', evidence: ['流動性', '執行可能'] },
];

const COMMITTEE_EVENTS_EN = [
  { kind: 'motion', speaker: 3, time: '12:39', title: 'Proposal', text: 'Increase PP-INC by +2%. Capture income re-rating after the rate peak.', stance: 'bull', evidence: ['Real yield', 'Stable VIX'] },
  { kind: 'challenge', speaker: 6, time: '12:31', title: 'Objection', text: 'Large caps look overheated. If we raise exposure, add GLD protection too.', stance: 'bear', evidence: ['Higher PER', 'Concentration risk'] },
  { kind: 'evidence', speaker: 1, time: '12:35', title: 'Data check', text: 'Volume profile and vol surface point to a weak buy. CPI came in below forecast and flows continue.', stance: 'bull', evidence: ['CPI +2.4%', '8.2bps'] },
  { kind: 'counter', speaker: 5, time: '12:28', title: 'Conditional yes', text: 'Credit is tight. If PP-BND goes down 1%, add a monthly review condition.', stance: 'bull', evidence: ['Spreads', 'Review condition'] },
  { kind: 'lock', speaker: 2, time: '12:14', title: 'Vote lock', text: 'Execution friction is 8.2 bps. Slippage is within limits, so the decision can be executed.', stance: 'bull', evidence: ['Liquidity', 'Executable'] },
];

function CommitteeSkyHead({ lang }) {
  const copy = COMMITTEE_I18N[lang];
  return (
    <div className="pp-skyhead">
      <div className="titlebar">
        <span className="back">‹</span>
        <span className="title">{copy.appTitle}</span>
        <span className="right">
          <span className="ico">?</span>
          <span className="x">×</span>
        </span>
      </div>
      <div className="tabs">
        {copy.tabs.map(t => (
          <div key={t.id} className={`tab ${t.cta ? 'cta' : ''} ${t.nous ? 'nous' : ''} ${t.id === 'roundtable' ? 'active' : ''}`}>
            <span className="ico-sq">{t.ico}</span>
            <span className="lbl">{t.lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommitteeVoteBoard({ compact = false, lang = 'ja' }) {
  const copy = COMMITTEE_I18N[lang] || COMMITTEE_I18N.ja;
  const rows = Personas.map((p, i) => ({
    p,
    i,
    stance: AGENT_STANCE[i],
    confidence: AGENT_CONFIDENCE[i],
    reason: copy.voteReasons[i],
  }));

  return (
    <div className={`cab-vote-board ${compact ? 'compact' : ''}`}>
      <div className="cab-vote-meter">
        <div className="cab-vote-bar">
          <span className="bull" style={{width: '66.7%'}}></span>
          <span className="abs" style={{width: '16.7%'}}></span>
          <span className="bear" style={{width: '16.6%'}}></span>
        </div>
        <div className="cab-vote-counts">
          <b className="bull">{copy.voteCounts.bull}</b>
          <b className="abs">{copy.voteCounts.abs}</b>
          <b className="bear">{copy.voteCounts.bear}</b>
        </div>
      </div>
      <div className="cab-vote-list">
        {rows.slice(0, compact ? 6 : 12).map(({ p, i, stance, confidence, reason }) => (
          <div key={i} className={`cab-voter ${stance}`}>
            <div className="av" dangerouslySetInnerHTML={{__html: p.svg}}></div>
            <div className="mid">
              <div className="nm">{p.name}</div>
              <div className="why">{reason}</div>
            </div>
            <div className={`vote ${stance}`}>
              <span>{STANCE_ARROW[stance]}</span>
              <small>{stance === 'abs' ? copy.hold : Math.round(confidence * 100) + '%'}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PPCommitteeScreen() {
  const [activeIdx, setActiveIdx] = useAutoRotate(DISCUSSION.length, 5600);
  const [phase, setPhase] = useState('debate');
  const [lang, setLang] = useState('ja');
  useNousData('committee', lang);
  const copy = COMMITTEE_I18N[lang] || COMMITTEE_I18N.ja;
  const discussion = lang === 'en' ? DISCUSSION_EN : DISCUSSION;
  const events = lang === 'en' ? COMMITTEE_EVENTS_EN : COMMITTEE_EVENTS;
  const active = discussion[activeIdx];
  const speaker = Personas[active.speaker];
  const queue = [0, 1, 2, 3].map(n => {
    const idx = (activeIdx + n) % discussion.length;
    return { idx, item: discussion[idx], person: Personas[discussion[idx].speaker] };
  });

  return (
    <div className={`pp-app cab-app ${lang}`}>
      <CommitteeSkyHead lang={lang} />

      <div className="cab-hero">
        <div className="cab-kicker">
          <span className="live-dot"></span>
          INVESTMENT COMMITTEE LIVE
          <b>{copy.monthReview}</b>
          <div className="cab-lang" aria-label="Language">
            <button type="button" className={lang === 'ja' ? 'active' : ''} onClick={() => setLang('ja')}>JP</button>
            <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
          </div>
        </div>
        <div className="cab-motion">
          <div className="eyebrow">{copy.motionEyebrow}</div>
          <h2>{copy.motionTitle}</h2>
          <p>{copy.motionBody}</p>
        </div>
        <div className="cab-phases">
          {copy.phases.map(item => (
            <button
              key={item.id}
              className={phase === item.id ? 'active' : ''}
              onClick={() => setPhase(item.id)}
              type="button">
              <span>{item.label}</span>
              <small>{item.meta}</small>
            </button>
          ))}
        </div>

        <div className="cab-speaker">
          <div className="cab-speaker-head">
            <div className="who">
              <div className="av" dangerouslySetInnerHTML={{__html: speaker.svg}}></div>
              <div>
                <div className="nm">{speaker.name}</div>
                <div className="rl">{speaker.role} · {active.topic}</div>
              </div>
            </div>
            <div className={`stance-pill ${active.stance}`}>
              {STANCE_ARROW[active.stance]} {STANCE_LABEL[active.stance]}
            </div>
          </div>
          <div className="cab-quote">「{active.text}」</div>
          <div className="cab-wave" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <div className="cab-tags">
            {copy.speakerTags.map(tag => <span key={tag}>{tag}</span>)}
          </div>
        </div>

        <div className="cab-queue">
          {queue.map(({ idx, person, item }, n) => (
            <button key={idx} type="button" className={n === 0 ? 'active' : ''} onClick={() => setActiveIdx(idx)}>
              <span className="av" dangerouslySetInnerHTML={{__html: person.svg}}></span>
              <span className="txt">{n === 0 ? copy.speakingNow : item.t}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="cab-body">
        {phase === 'agenda' && (
          <div className="cab-card">
            <div className="cab-card-hd">
              <b>{copy.agendaTitle}</b>
              <span>{copy.agendaMeta}</span>
            </div>
            <div className="cab-agenda">
              {copy.agendaItems.map((item, i) => (
                <div key={item}><b>{String(i + 1).padStart(2, '0')}</b><span>{item}</span></div>
              ))}
            </div>
          </div>
        )}

        {phase === 'debate' && (
          <>
            <div className="cab-card">
              <div className="cab-card-hd">
                <b>{copy.debateTitle}</b>
                <span>{copy.debateMeta}</span>
              </div>
              <div className="cab-events">
                {events.map((ev, i) => {
                  const p = Personas[ev.speaker];
                  return (
                    <div key={i} className={`cab-event ${ev.kind}`}>
                      <div className="time">{ev.time}</div>
                      <div className="av" dangerouslySetInnerHTML={{__html: p.svg}}></div>
                      <div className="body">
                        <div className="top">
                          <b>{ev.title}</b>
                          <span className={`stance-pill mini ${ev.stance}`}>{STANCE_ARROW[ev.stance]}</span>
                        </div>
                        <p>{ev.text}</p>
                        <div className="chips">{ev.evidence.map(x => <span key={x}>{x}</span>)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <CommitteeVoteBoard compact lang={lang} />
          </>
        )}

        {phase === 'vote' && <CommitteeVoteBoard lang={lang} />}

        {phase === 'decision' && (
          <div className="cab-decision">
            <div className="cab-decision-top">
              <div>
                <div className="eyebrow">DECISION</div>
                <h3>{copy.decisionTitle}</h3>
              </div>
              <div className="passed">8/12</div>
            </div>
            <div className="cab-allocation">
              <div><span>PP-INC</span><b className="up">+2%</b><small>38% → 40%</small></div>
              <div><span>PP-DIV</span><b>±0%</b><small>30% → 30%</small></div>
              <div><span>PP-BND</span><b className="down">−1%</b><small>20% → 19%</small></div>
              <div><span>PP-GLD</span><b className="down">−1%</b><small>12% → 11%</small></div>
            </div>
            <div className="cab-impact">
              <div><span>{copy.impact.rebalance}</span><b>{copy.impact.rebalanceValue}</b></div>
              <div><span>{copy.impact.cost}</span><b>¥-694</b></div>
              <div><span>{copy.impact.uplift}</span><b className="up">+0.18%</b></div>
            </div>
            <div className="cab-next">{copy.next}</div>
          </div>
        )}

        <div className="cab-disclaim">
          {copy.disclaimer}
        </div>
      </div>
    </div>
  );
}

function injectCommitteeStyles() {
  if (document.getElementById('committee-ab-styles')) return;
  const style = document.createElement('style');
  style.id = 'committee-ab-styles';
  style.textContent = `
    .ab-lab-note {
      max-width: 980px; margin: -18px auto 34px; padding: 14px 16px;
      border: 1px solid rgba(43,185,255,0.22); border-radius: 8px;
      background: rgba(43,185,255,0.06); color: rgba(255,255,255,0.7);
      font: 12px/1.65 'Noto Sans JP', system-ui, sans-serif;
    }
    .ab-lab-note b { color: #fff; }
    .stage.variant-b .stage-cap b { color: #4ee2a3; }
    .stage.variant-b .stage-note { max-width: 390px; }
    .cab-app { background: #eef1f5; color: #172033; }
    .cab-app button { font: inherit; }
    .cab-app.en .pp-skyhead .tab.cta::before { content: 'NISA'; }
    .cab-hero {
      background:
        radial-gradient(480px 260px at 12% 0%, rgba(43,185,255,0.32), transparent 62%),
        linear-gradient(180deg, #07192f 0%, #0c2442 55%, #102a4c 100%);
      color: #fff; padding: 12px 14px 16px;
    }
    .cab-kicker {
      display: flex; align-items: center; gap: 7px; color: rgba(255,255,255,0.62);
      font: 9px/1.2 'JetBrains Mono', monospace; letter-spacing: 0.12em; text-transform: uppercase;
    }
    .cab-kicker b { margin-left: auto; color: rgba(255,255,255,0.78); font-weight: 500; letter-spacing: 0.04em; }
    .cab-lang {
      display: inline-flex; align-items: center; gap: 2px; padding: 2px;
      border-radius: 999px; background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12); letter-spacing: 0;
    }
    .cab-lang button {
      border: 0; border-radius: 999px; padding: 3px 6px; min-width: 26px;
      color: rgba(255,255,255,0.58); background: transparent;
      font: 700 8px/1 'Inter', sans-serif;
    }
    .cab-lang button.active { color: #0a2240; background: #69cfff; }
    .cab-kicker .live-dot {
      width: 7px; height: 7px; border-radius: 50%; background: #4ee2a3;
      box-shadow: 0 0 0 4px rgba(78,226,163,0.12), 0 0 12px rgba(78,226,163,0.8);
    }
    .cab-motion { margin-top: 14px; }
    .cab-motion .eyebrow, .cab-decision .eyebrow {
      color: #69cfff; font: 9px/1.2 'JetBrains Mono', monospace; letter-spacing: 0.14em;
    }
    .cab-motion h2 { margin: 5px 0 5px; font-size: 20px; line-height: 1.25; letter-spacing: 0; }
    .cab-motion p { margin: 0; color: rgba(255,255,255,0.68); font-size: 11px; line-height: 1.55; }
    .cab-phases { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 13px; }
    .cab-phases button {
      height: 46px; border: 1px solid rgba(255,255,255,0.12); border-radius: 8px;
      color: rgba(255,255,255,0.68); background: rgba(255,255,255,0.06);
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
    }
    .cab-phases button.active {
      background: rgba(43,185,255,0.18); color: #fff; border-color: rgba(105,207,255,0.5);
      box-shadow: inset 0 -2px 0 #69cfff;
    }
    .cab-phases span { font-size: 11px; font-weight: 700; }
    .cab-phases small { font: 8px/1 'JetBrains Mono', monospace; color: rgba(255,255,255,0.55); }
    .cab-speaker {
      margin-top: 12px; border-radius: 12px; padding: 12px; overflow: hidden; position: relative;
      background: rgba(255,255,255,0.09); border: 1px solid rgba(255,255,255,0.14);
      box-shadow: 0 18px 40px rgba(0,0,0,0.18);
    }
    .cab-speaker::after {
      content: ''; position: absolute; inset: auto -20px -45px auto; width: 120px; height: 120px;
      border-radius: 50%; background: rgba(43,185,255,0.12); filter: blur(20px);
    }
    .cab-speaker-head, .cab-speaker-head .who { display: flex; align-items: center; justify-content: space-between; gap: 9px; }
    .cab-speaker .av, .cab-event .av, .cab-voter .av, .cab-queue .av {
      width: 36px; height: 36px; border-radius: 50%; overflow: hidden; flex: 0 0 auto;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.18);
    }
    .cab-speaker .nm { font-size: 13px; font-weight: 800; }
    .cab-speaker .rl { font: 9px/1.2 'JetBrains Mono', monospace; color: rgba(255,255,255,0.52); text-transform: uppercase; }
    .cab-quote { margin-top: 11px; font-size: 13px; line-height: 1.65; font-weight: 600; position: relative; z-index: 1; }
    .cab-wave { display: flex; align-items: end; gap: 3px; height: 20px; margin-top: 8px; }
    .cab-wave span {
      width: 4px; border-radius: 4px; background: #69cfff; opacity: 0.85;
      animation: cabWave 1.2s infinite ease-in-out;
    }
    .cab-wave span:nth-child(1) { height: 8px; animation-delay: 0s; }
    .cab-wave span:nth-child(2) { height: 15px; animation-delay: .1s; }
    .cab-wave span:nth-child(3) { height: 10px; animation-delay: .2s; }
    .cab-wave span:nth-child(4) { height: 18px; animation-delay: .3s; }
    .cab-wave span:nth-child(5) { height: 12px; animation-delay: .4s; }
    @keyframes cabWave { 0%,100% { transform: scaleY(.55); opacity: .45; } 50% { transform: scaleY(1); opacity: 1; } }
    .cab-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 9px; position: relative; z-index: 1; }
    .cab-tags span {
      padding: 4px 7px; border-radius: 999px; background: rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.72); font-size: 9.5px;
    }
    .cab-queue { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 10px; }
    .cab-queue button {
      border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.62); min-width: 0; padding: 7px 3px 5px; display: grid; justify-items: center; gap: 4px;
    }
    .cab-queue button.active { color: #fff; border-color: rgba(78,226,163,0.45); background: rgba(78,226,163,0.12); }
    .cab-queue .av { width: 30px; height: 30px; }
    .cab-queue .txt { font: 8px/1.1 'JetBrains Mono', monospace; }
    .cab-body { padding: 12px 12px 30px; display: grid; gap: 10px; }
    .cab-card, .cab-vote-board, .cab-decision {
      background: #fff; border-radius: 12px; padding: 12px; box-shadow: 0 1px 0 rgba(0,0,0,0.04);
    }
    .cab-card-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .cab-card-hd b { font-size: 14px; }
    .cab-card-hd span { font: 10px/1 'JetBrains Mono', monospace; color: #789; }
    .cab-agenda { display: grid; gap: 8px; }
    .cab-agenda div { display: grid; grid-template-columns: 30px 1fr; gap: 8px; align-items: start; font-size: 12px; line-height: 1.45; }
    .cab-agenda b { color: #1e9ee0; font-family: 'JetBrains Mono', monospace; }
    .cab-events { display: grid; gap: 10px; }
    .cab-event { display: grid; grid-template-columns: 34px 36px 1fr; gap: 8px; align-items: start; position: relative; }
    .cab-event:not(:last-child)::after { content: ''; position: absolute; left: 16px; top: 34px; bottom: -10px; width: 1px; background: #dce3eb; }
    .cab-event .time { font: 9px/36px 'JetBrains Mono', monospace; color: #789; position: relative; z-index: 1; }
    .cab-event .body { background: #f6f8fb; border-radius: 10px; padding: 9px 10px; }
    .cab-event.challenge .body { background: #fff5f6; }
    .cab-event.evidence .body { background: #f0fbff; }
    .cab-event .top { display: flex; justify-content: space-between; align-items: center; gap: 6px; }
    .cab-event .top b { font-size: 12px; }
    .cab-event p { margin: 4px 0 7px; color: #3c4654; font-size: 11.2px; line-height: 1.5; }
    .cab-event .chips { display: flex; flex-wrap: wrap; gap: 5px; }
    .cab-event .chips span { padding: 3px 6px; border-radius: 999px; background: #fff; border: 1px solid #dde5ee; font-size: 9px; color: #526173; }
    .cab-vote-meter { margin-bottom: 10px; }
    .cab-vote-bar { height: 8px; border-radius: 999px; overflow: hidden; display: flex; background: #e9edf2; }
    .cab-vote-bar span.bull { background: #4ee2a3; }
    .cab-vote-bar span.abs { background: #9aa6b8; }
    .cab-vote-bar span.bear { background: #ff7a8a; }
    .cab-vote-counts { display: flex; justify-content: space-between; margin-top: 6px; font: 10px/1 'JetBrains Mono', monospace; }
    .cab-vote-counts .bull, .cab-voter .vote.bull { color: #139c65; }
    .cab-vote-counts .abs, .cab-voter .vote.abs { color: #748092; }
    .cab-vote-counts .bear, .cab-voter .vote.bear { color: #dc4f61; }
    .cab-vote-list { display: grid; gap: 7px; }
    .cab-voter {
      display: grid; grid-template-columns: 34px 1fr 42px; align-items: center; gap: 8px;
      padding: 8px; border-radius: 10px; background: #f7f9fb; border: 1px solid #eef1f4;
    }
    .cab-voter .av { width: 34px; height: 34px; }
    .cab-voter .nm { font-size: 11.5px; font-weight: 700; color: #132238; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cab-voter .why { font-size: 9.8px; line-height: 1.25; color: #667386; margin-top: 2px; }
    .cab-voter .vote { text-align: right; font-family: 'JetBrains Mono', monospace; }
    .cab-voter .vote span { display: block; font-size: 16px; line-height: 1; }
    .cab-voter .vote small { display: block; font-size: 9px; margin-top: 2px; }
    .cab-decision { background: linear-gradient(180deg, #fff 0%, #f7fbff 100%); }
    .cab-decision-top { display: flex; justify-content: space-between; align-items: start; }
    .cab-decision h3 { margin: 4px 0 0; font-size: 20px; color: #0a2240; }
    .cab-decision .passed {
      width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      background: #0a2240; color: #fff; font: 700 15px/1 'Inter', sans-serif;
      box-shadow: 0 0 0 6px rgba(43,185,255,0.12);
    }
    .cab-allocation { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 14px; }
    .cab-allocation div { border-radius: 10px; padding: 10px; background: #fff; border: 1px solid #e5ebf2; }
    .cab-allocation span, .cab-impact span { display: block; color: #6b7687; font-size: 10px; }
    .cab-allocation b { display: block; margin-top: 4px; font: 800 18px/1 'Inter', sans-serif; color: #172033; }
    .cab-allocation small { display: block; margin-top: 4px; color: #7b8798; font-size: 9.5px; }
    .cab-allocation .up, .cab-impact .up { color: #16a34a; }
    .cab-allocation .down { color: #dc4f61; }
    .cab-impact { margin-top: 12px; border-top: 1px solid #e2e8f0; padding-top: 10px; display: grid; gap: 8px; }
    .cab-impact div { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
    .cab-impact b { font-size: 12px; color: #132238; }
    .cab-next {
      margin-top: 12px; border-radius: 999px; background: #1e9ee0; color: #fff;
      text-align: center; padding: 12px; font-size: 13px; font-weight: 700;
    }
    .cab-disclaim { color: #7a8493; font-size: 9.5px; line-height: 1.5; padding: 0 3px; }
  `;
  document.head.appendChild(style);
}

function mountCommitteeABStage() {
  injectCommitteeStyles();
  if (document.querySelector('[data-ab-variant="committee-live"]')) return;
  const rail = document.querySelector('.rail');
  if (!rail) return;

  const intro = document.querySelector('.intro');
  if (intro && !document.querySelector('.ab-lab-note')) {
    const note = document.createElement('div');
    note.className = 'ab-lab-note';
    note.innerHTML = '<b>A/B test addition:</b> A keeps the current Roundtable dashboard. B reframes the same agents as a live investment committee so users can follow agenda, debate, vote, and final decision.';
    intro.insertAdjacentElement('afterend', note);
  }

  const stage = document.createElement('div');
  stage.className = 'stage variant-b';
  stage.setAttribute('data-ab-variant', 'committee-live');
  stage.innerHTML = `
    <div class="stage-cap"><b>案 B / Variant B</b> · INVESTMENT COMMITTEE LIVE</div>
    <div class="stage-title">会話と投票プロセスを追える、専門家委員会型 UI · JP/EN selectable</div>
    <div class="cab-host"></div>
    <div class="stage-note"><b>テスト仮説:</b> ユーザーは結論だけでなく、反対意見・根拠・投票ロックの流れを見るほどAI運用を信頼しやすい。Use JP/EN inside the phone to compare language comprehension.</div>
  `;
  rail.appendChild(stage);
  const host = stage.querySelector('.cab-host');
  const root = ReactDOM.createRoot(host);
  root.render(<IOSDevice width={390} height={844}><PPCommitteeScreen /></IOSDevice>);
}

// Auto-mount the Committee variant only if the deck rail exists AND
// it has not been opted out (set window.NOUS_HIDE_COMMITTEE = true to skip).
function _maybeMountCommittee() {
  if (typeof window !== 'undefined' && window.NOUS_HIDE_COMMITTEE) return;
  if (!document.querySelector('.rail')) return;
  mountCommitteeABStage();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _maybeMountCommittee);
} else {
  _maybeMountCommittee();
}

window.PPCommitteeScreen = PPCommitteeScreen;
window.PPRoundtableScreen = PPRoundtableScreen;

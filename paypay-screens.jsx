// PayPay × Nous Alpha — 3 mock screens
// ─────────────────────────────────────────────────────────────────────────

const { useState } = React;

// ─── shared bits ─────────────────────────────────────────────────────────
function PPSkyHead({ title, tabActive }) {
  const tabs = [
    { id: 'status',  lbl: '運用状況', ico: '☷' },
    { id: 'history', lbl: '運用履歴', ico: '◉' },
    { id: 'browse',  lbl: '運用する', ico: '⊕' },
    { id: 'roundtable', lbl: 'Roundtable', ico: '◎', nous: true },
    { id: 'other',   lbl: 'その他',   ico: '⋯' },
    { id: 'cta',     lbl: '追加投資', ico: '+', cta: true },
  ];
  return (
    <div className="pp-skyhead">
      <div className="titlebar">
        <span className="back">‹</span>
        <span className="title">{title}</span>
        <span className="right">
          <span className="ico">?</span>
          <span className="x">×</span>
        </span>
      </div>
      <div className="tabs">
        {tabs.map(t => (
          <div key={t.id} className={`tab ${t.cta ? 'cta' : ''} ${t.nous ? 'nous' : ''} ${tabActive === t.id ? 'active' : ''}`}>
            <span className="ico-sq">{t.ico}</span>
            <span className="lbl">{t.lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Course list with Nous group inserted above existing groups
// ═════════════════════════════════════════════════════════════════════════
function PPListScreen() {
  return (
    <div className="pp-app">
      <PPSkyHead title="コース一覧" tabActive="browse" />

      {/* New Nous Alpha section — inserted above existing groups */}
      <div className="pp-band navy">
        <div className="lbl">
          <span className="nous-lock">
            <span className="nous-mark"></span>
            AIが運用するインテリジェント・コース
          </span>
          <span className="pill">NEW</span>
        </div>
        <span className="sub">12人のAI専門家が議論</span>
      </div>

      <div className="pp-course">
        <div className="ico ico-nous"><b>INC</b><span className="grade">+</span></div>
        <div className="body">
          <div className="desc">毎月配当を狙う · カバードコール</div>
          <div className="name">Nous インカム+</div>
          <span className="nous-pill"><span className="dot"></span>AI · 自動リバランス</span>
        </div>
        <div className="pts">
          <div className="v">7.2<small>%</small></div>
          <div className="delta">目標年利</div>
        </div>
        <span className="chev">›</span>
      </div>

      <div className="pp-course">
        <div className="ico ico-nous"><b>DIV</b><span className="grade">★</span></div>
        <div className="body">
          <div className="desc">高配当大型株 + AIリバランス</div>
          <div className="name">Nous 配当グロース</div>
          <span className="nous-pill"><span className="dot"></span>AI · 自動リバランス</span>
        </div>
        <div className="pts">
          <div className="v">5.8<small>%</small></div>
          <div className="delta">目標年利</div>
        </div>
        <span className="chev">›</span>
      </div>

      <div className="pp-course">
        <div className="ico ico-nous"><b>BND</b><span className="grade">▲</span></div>
        <div className="body">
          <div className="desc">短期高格付け債 + 金利ヘッジ</div>
          <div className="name">Nous 安定債券</div>
          <span className="nous-pill"><span className="dot"></span>AI · 自動リバランス</span>
        </div>
        <div className="pts">
          <div className="v">3.4<small>%</small></div>
          <div className="delta">目標年利</div>
        </div>
        <span className="chev">›</span>
      </div>

      <div className="pp-course">
        <div className="ico ico-nous"><b>GLD</b><span className="grade">◆</span></div>
        <div className="body">
          <div className="desc">金 + 一部株式の合成型</div>
          <div className="name">Nous ゴールド+</div>
          <span className="nous-pill"><span className="dot"></span>AI · 自動リバランス</span>
        </div>
        <div className="pts">
          <div className="v">4.5<small>%</small></div>
          <div className="delta">目標年利</div>
        </div>
        <span className="chev">›</span>
      </div>

      {/* Existing groups — unchanged */}
      <div style={{height: 8, background: '#f0f1f4'}}></div>

      <div className="pp-band orange">値上がりするほどプラスに</div>
      <div className="pp-course">
        <div className="ico ico-btc">₿</div>
        <div className="body">
          <div className="desc">ビットコインの値動きに連動</div>
          <div className="name">ビットコイン (BTC) コース</div>
        </div>
        <div className="pts"><div className="v">+8.1<small>%</small></div><div className="delta pos">1ヶ月</div></div>
        <span className="chev">›</span>
      </div>
      <div className="pp-course">
        <div className="ico ico-eth">ξ</div>
        <div className="body">
          <div className="desc">イーサリアムの値動きに連動</div>
          <div className="name">イーサリアム (ETH) コース</div>
        </div>
        <div className="pts"><div className="v">+4.2<small>%</small></div><div className="delta pos">1ヶ月</div></div>
        <span className="chev">›</span>
      </div>

      <div className="pp-band orange-deep">値下がりするほどプラスに</div>
      <div className="pp-course">
        <div className="ico ico-bear-btc">₿</div>
        <div className="body">
          <div className="desc">ビットコインの値動きと逆連動</div>
          <div className="name">ビットコイン (BTC) ベアコース</div>
        </div>
        <div className="pts"><div className="v">−5.8<small>%</small></div><div className="delta">1ヶ月</div></div>
        <span className="chev">›</span>
      </div>

      <div className="pp-band blue">標準・分散投資</div>
      <div className="pp-course">
        <div className="ico ico-tech">T</div>
        <div className="body">
          <div className="desc">米国大手テック株に分散</div>
          <div className="name">テクノロジーコース</div>
        </div>
        <div className="pts"><div className="v">+2.9<small>%</small></div><div className="delta pos">1ヶ月</div></div>
        <span className="chev">›</span>
      </div>
      <div className="pp-course">
        <div className="ico ico-std">S</div>
        <div className="body">
          <div className="desc">S&P 500 に連動</div>
          <div className="name">スタンダードコース</div>
        </div>
        <div className="pts"><div className="v">+1.6<small>%</small></div><div className="delta pos">1ヶ月</div></div>
        <span className="chev">›</span>
      </div>

      <div className="pp-disclaim">
        ※ 表示の数値はサンプルです。Nous Alpha インテリジェント・コースは 12人のAI専門家エージェントによる合議制で月次リバランスされます。実際の運用成績は各コース詳細をご確認ください。
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Course detail (PP-INC) with Nous body
// ═════════════════════════════════════════════════════════════════════════
function PPDetailScreen() {
  // Chart data — pp-INC (navy blue) vs benchmark (gray) — 12 month
  const months = ['25/4','5','6','7','8','9','10','11','12','26/1','2','3'];
  const navyData  = [100, 101.2, 102.1, 103.4, 104.0, 104.8, 105.4, 106.7, 107.9, 108.8, 110.2, 111.5];
  const grayData  = [100, 100.4, 100.8, 101.2, 101.0, 101.4, 101.7, 102.0, 102.3, 102.5, 102.9, 103.2];
  const W = 320, H = 130;
  const minV = 99, maxV = 113;
  const xAt = i => 8 + (i / (months.length - 1)) * (W - 16);
  const yAt = v => 10 + ((maxV - v) / (maxV - minV)) * (H - 24);
  const navyPath = navyData.map((v,i) => `${i ? 'L' : 'M'} ${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(' ');
  const grayPath = grayData.map((v,i) => `${i ? 'L' : 'M'} ${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(' ');
  const fillPath = navyPath + ` L ${xAt(months.length-1).toFixed(1)},${(H-12).toFixed(1)} L ${xAt(0).toFixed(1)},${(H-12).toFixed(1)} Z`;

  return (
    <div className="pp-app">
      {/* ── White detail header ── */}
      <div className="pp-detail-head">
        <div className="titlebar">
          <span className="back">‹</span>
          <span className="title">コース詳細</span>
          <span className="right">
            <span className="ico">?</span>
            <span className="x">×</span>
          </span>
        </div>
      </div>

      {/* ── Course hero ── */}
      <div className="pp-course-hero">
        <div className="top">
          <div className="ico-nous"><b>INC</b><span className="grade">+</span></div>
          <div className="nameblock">
            <div className="desc">毎月配当を狙う · カバードコール</div>
            <div className="name">Nous インカム+</div>
          </div>
          <div className="rules">目標年利<br/><b style={{color: '#1a1a1a', fontSize: 13, fontFamily: 'Inter'}}>7.2%</b></div>
        </div>
        <div className="nous-strip">
          <span className="mark"></span>
          <span><b>12人のAI専門家エージェント</b>が日次で議論し、毎月第1営業日にリバランス</span>
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="pp-chart-card">
        <div className="legend">
          <span className="l1"><span className="swatch"></span>Nous インカム+</span>
          <span className="l2"><span className="swatch"></span>S&P 500</span>
        </div>
        <svg className="chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="ppfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a2240" stopOpacity="0.18"/>
              <stop offset="100%" stopColor="#0a2240" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {/* gridlines */}
          {[0.25, 0.5, 0.75].map(p => (
            <line key={p} x1="0" x2={W} y1={10 + p * (H-24)} y2={10 + p * (H-24)} stroke="#eef0f3" strokeWidth="1"/>
          ))}
          <path d={fillPath} fill="url(#ppfill)"/>
          <path d={grayPath} stroke="#b8b8b8" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
          <path d={navyPath} stroke="#0a2240" strokeWidth="2.2" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
          <circle cx={xAt(months.length-1)} cy={yAt(navyData[navyData.length-1])} r="3.5" fill="#0a2240"/>
          <circle cx={xAt(months.length-1)} cy={yAt(navyData[navyData.length-1])} r="6" fill="#0a2240" opacity="0.18"/>
        </svg>
        <div className="x-axis">
          {months.filter((_, i) => i % 2 === 0).map(m => <span key={m}>{m}</span>)}
        </div>
        <div className="periods">
          <div className="p">1ヶ月</div>
          <div className="p">3ヶ月</div>
          <div className="p">6ヶ月</div>
          <div className="p active">1年</div>
          <div className="p">全期間</div>
        </div>
      </div>

      {/* ── Simulation chip ── */}
      <div className="pp-sim-card">
        <div className="pp-sim">
          <div className="glyph">¥</div>
          <div className="txt">
            <b>150,000pt</b> をこのコースで1年運用していたら <span className="gain">+19,470pt (+12.98%)</span>
          </div>
          <span className="chev">›</span>
        </div>
      </div>

      {/* ── Balance row ── */}
      <div className="pp-bal">
        <div className="left">
          <div className="pp-mark">P</div>
          <div>
            <div className="lbl">運用可能資産</div>
            <div className="name">PayPayポイント</div>
          </div>
        </div>
        <div className="right">
          <div className="lbl"><b style={{color: '#1a1a1a', fontSize: 14, fontFamily: 'Inter'}}>0pt</b></div>
          <div className="link">追加する ›</div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="pp-cta-row">
        <div className="pp-cta">このコースで運用する</div>
      </div>

      {/* ── The Roundtable: today's stance — dark glass panel ── */}
      <div className="pp-rt-card">
        <div className="hd">
          <h3><span className="pulse"></span>The Roundtable</h3>
          <span className="more">議論を見る ›</span>
        </div>
        <div className="pp-rt-sub">12人のAI専門家エージェントが本日の市場について議論しています</div>

        <div className="pp-tally">
          <div className="cell bull"><div className="v">8</div><div className="l">強気</div></div>
          <div className="cell"><div className="v">2</div><div className="l">棄権</div></div>
          <div className="cell bear"><div className="v">2</div><div className="l">弱気</div></div>
          <div className="pp-tally-bar">
            <div className="seg-bull" style={{width: '67%'}}></div>
            <div className="seg-abs"  style={{width: '17%'}}></div>
            <div className="seg-bear" style={{width: '16%'}}></div>
          </div>
        </div>

        {/* 3D perspective roundtable — you're looking down at the table at an angle */}
        <div className="pp-rt3d-stage">
          <div className="pp-rt3d-scene">
            {/* Floor grid for depth */}
            <div className="pp-rt3d-floor"></div>
            {/* The table disc, tilted */}
            <div className="pp-rt3d-table">
              <div className="rim"></div>
              <div className="surface">
                <div className="grain"></div>
                <div className="pulse-a"></div>
                <div className="pulse-b"></div>
              </div>
            </div>
            {/* Verdict hub — sibling, not tilted, floats over the table center */}
            <div className="pp-rt3d-hub">
              <div className="hub-conc">VERDICT</div>
              <div className="hub-line"></div>
              <div className="hub-verdict">主軸 · 買い</div>
            </div>
            {/* Seats: base sits on the tilted table edge */}
            {Personas.map((p, i) => {
              // angle: 0 = right, π/2 = front (closest to viewer)
              const angle = (i / 12) * Math.PI * 2 + Math.PI / 2;
              // Table is 320×320 rotated rotateX(64°) → on-screen ellipse
              // horizontal radius 160, vertical radius 160·cos(64°) ≈ 70
              const tableCx = 0;          // relative to stage center (50%)
              const tableCyOffset = 0;    // table center already at top:56%
              const edgeRx = 162;         // outer edge of seats — slightly outside the rim
              const edgeRy = 72;
              const cx = tableCx + Math.cos(angle) * edgeRx;
              const cy = tableCyOffset + Math.sin(angle) * edgeRy;
              const bears = [6, 11];
              const absent = [4, 8];
              const stance = bears.includes(i) ? 'bear' : absent.includes(i) ? 'abs' : 'bull';
              const speaking = i === 3;
              // depth: cy positive = front (close), negative = back (far)
              // normalize to [0..1]; 1 = front
              const depthT = (cy + edgeRy) / (2 * edgeRy);
              const depthScale = 0.7 + depthT * 0.45; // 0.70 (back) → 1.15 (front)
              // z-index: front seats above table; back seats below table rim
              const z = Math.round(100 + cy * 2);
              return (
                <div key={i}
                  className={"pp-rt3d-seat " + stance + (speaking ? ' speaking' : '')}
                  style={{
                    left: `calc(50% + ${cx}px)`,
                    top: `calc(56% + ${cy}px)`,
                    transform: `translate(-50%, -100%) scale(${depthScale.toFixed(3)})`,
                    zIndex: z,
                  }}>
                  {/* shadow on the table beneath the feet */}
                  <div className="seat-shadow"></div>
                  <div className="seat-stand"></div>
                  <div className="seat-av" dangerouslySetInnerHTML={{__html: p.svg.replace('viewBox="0 0 72 72"', 'viewBox="0 0 72 72" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"')}}></div>
                  <div className={`seat-badge ${stance}`}>{stance === 'bull' ? '↑' : stance === 'bear' ? '↓' : '–'}</div>
                  {speaking && <div className="seat-speak">Dalio</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="pp-quotes">
          <div className="pp-quote">
            <div className="av" dangerouslySetInnerHTML={{__html: Personas[3].svg}}></div>
            <div className="body">
              <div className="who">
                <span>Ray Dalio</span>
                <span className="role">Macro</span>
                <span className="stance bull">↑ Bull</span>
              </div>
              <div className="q">VIXは安定。レバレッジなしでカバードコールはこの環境で5%目標に届く最短ルート。</div>
            </div>
          </div>
          <div className="pp-quote">
            <div className="av" dangerouslySetInnerHTML={{__html: Personas[5].svg}}></div>
            <div className="body">
              <div className="who">
                <span>Howard Marks</span>
                <span className="role">Credit</span>
                <span className="stance bull">↑ Bull</span>
              </div>
              <div className="q">投資適格社債のスプレッドは健全。安定債券スリーブで下振れを抑える設計に賛成。</div>
            </div>
          </div>
          <div className="pp-quote">
            <div className="av" dangerouslySetInnerHTML={{__html: Personas[6].svg}}></div>
            <div className="body">
              <div className="who">
                <span>Michael Burry</span>
                <span className="role">Contrarian</span>
                <span className="stance bear">↓ Bear</span>
              </div>
              <div className="q">大型株のバリュエーションが過熱気味。ゴールド比率をもう少し上げるべき。</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sleeve breakdown ── */}
      <div className="pp-sleeves-card">
        <h3>現在のスリーブ構成</h3>
        <div className="sub">合成利回り <b>5.1%</b> · 自動リバランス済み <b>2026/03/03</b></div>

        <div className="pp-stack">
          <div className="seg" style={{width: '40%', background: '#0a2240'}}></div>
          <div className="seg" style={{width: '30%', background: '#1e6db5'}}></div>
          <div className="seg" style={{width: '20%', background: '#5b8eff'}}></div>
          <div className="seg" style={{width: '10%', background: '#d2c190'}}></div>
        </div>

        <div className="pp-sleeve-row">
          <div className="dot" style={{background: '#0a2240'}}></div>
          <div className="tk">PP-INC</div>
          <div className="nm">カバードコール (主軸)</div>
          <div className="wt">40%</div>
        </div>
        <div className="pp-sleeve-row">
          <div className="dot" style={{background: '#1e6db5'}}></div>
          <div className="tk">PP-DIV</div>
          <div className="nm">高配当大型株</div>
          <div className="wt">30%</div>
        </div>
        <div className="pp-sleeve-row">
          <div className="dot" style={{background: '#5b8eff'}}></div>
          <div className="tk">PP-BND</div>
          <div className="nm">短期投資適格債</div>
          <div className="wt">20%</div>
        </div>
        <div className="pp-sleeve-row">
          <div className="dot" style={{background: '#d2c190'}}></div>
          <div className="tk">PP-GLD</div>
          <div className="nm">金 + ヘッジ</div>
          <div className="wt">10%</div>
        </div>
      </div>

      {/* ── Auto rebalance toggle ── */}
      <div className="pp-rebal">
        <div className="left">
          <div className="ico">↻</div>
          <div>
            <div className="lbl">自動リバランス</div>
            <div className="sub">毎月第1営業日に再構築 · 次回 2026/04/01</div>
          </div>
        </div>
        <div className="toggle"></div>
      </div>

      <div className="pp-disclaim">
        ※ 本コースは PayPayポイントを使った擬似運用です。元本は保証されません。Nous Alpha のAIエージェントによる合議結果に基づき、月次でスリーブ比率を再調整します。コースの目標利回りは将来の運用成果を約束するものではありません。
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Risk gauge + course summary (Nous-tinted)
// ═════════════════════════════════════════════════════════════════════════
function PPRiskScreen() {
  // Risk gauge — semicircle, levels 1..5
  // Nous Income+ sits at level 3 (center, "ふつう")
  const gaugeLevel = 3;
  const totalLevels = 5;
  const angle = -180 + ((gaugeLevel - 1) / (totalLevels - 1)) * 180; // -180 (left) → 0 (right)

  // Build arc path generator
  const cx = 130, cy = 130, rOuter = 105, rInner = 75;
  const arcPath = (a0, a1) => {
    const rad0 = a0 * Math.PI / 180;
    const rad1 = a1 * Math.PI / 180;
    const x0o = cx + rOuter * Math.cos(rad0);
    const y0o = cy + rOuter * Math.sin(rad0);
    const x1o = cx + rOuter * Math.cos(rad1);
    const y1o = cy + rOuter * Math.sin(rad1);
    const x0i = cx + rInner * Math.cos(rad0);
    const y0i = cy + rInner * Math.sin(rad0);
    const x1i = cx + rInner * Math.cos(rad1);
    const y1i = cy + rInner * Math.sin(rad1);
    const large = (a1 - a0) > 180 ? 1 : 0;
    return `M ${x0o} ${y0o} A ${rOuter} ${rOuter} 0 ${large} 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${rInner} ${rInner} 0 ${large} 0 ${x0i} ${y0i} Z`;
  };

  // 5 segments — Nous palette: deep navy → mid → accent blue → warm → red-orange
  const segs = [
    { a0: -180, a1: -144, color: '#0a2240', lbl: '低い' },
    { a0: -144, a1: -108, color: '#133a6e', lbl: '低め' },
    { a0: -108, a1: -72,  color: '#2bb9ff', lbl: 'ふつう' },
    { a0: -72,  a1: -36,  color: '#7aa9d8', lbl: '高め' },
    { a0: -36,  a1: 0,    color: '#cccccc', lbl: '高い' },
  ];

  // needle at level 3 — point to center of segment 3 (-90°)
  const needleAngle = -90;
  const needleRad = needleAngle * Math.PI / 180;
  const nLen = rOuter - 6;
  const nx = cx + nLen * Math.cos(needleRad);
  const ny = cy + nLen * Math.sin(needleRad);

  return (
    <div className="pp-app">
      <div className="pp-detail-head">
        <div className="titlebar">
          <span className="back">‹</span>
          <span className="title">コース詳細</span>
          <span className="right">
            <span className="ico">?</span>
            <span className="x">×</span>
          </span>
        </div>
      </div>

      {/* hero */}
      <div className="pp-course-hero">
        <div className="top">
          <div className="ico-nous"><b>INC</b><span className="grade">+</span></div>
          <div className="nameblock">
            <div className="desc">毎月配当を狙う · カバードコール</div>
            <div className="name">Nous インカム+</div>
          </div>
          <div className="rules">目標年利<br/><b style={{color: '#1a1a1a', fontSize: 13, fontFamily: 'Inter'}}>7.2%</b></div>
        </div>
      </div>

      {/* Risk gauge — Nous-tinted */}
      <div className="pp-gauge-card">
        <h3>リスク&リターン チェック<span className="badge">NOUS</span></h3>

        <div className="pp-gauge">
          <svg viewBox="0 0 260 145" preserveAspectRatio="xMidYMid meet">
            {/* segments */}
            {segs.map((s, i) => (
              <path key={i} d={arcPath(s.a0, s.a1)} fill={s.color} opacity={i === gaugeLevel - 1 ? 1 : 0.55}/>
            ))}
            {/* tick labels at segment midpoints */}
            {segs.map((s, i) => {
              const mid = (s.a0 + s.a1) / 2;
              const r = rOuter + 16;
              const tx = cx + r * Math.cos(mid * Math.PI / 180);
              const ty = cy + r * Math.sin(mid * Math.PI / 180);
              return (
                <text key={'t' + i} x={tx} y={ty} fontSize="10" fill="#555" textAnchor="middle" dominantBaseline="middle"
                      fontFamily="Hiragino Sans, Noto Sans JP, sans-serif" fontWeight={i === gaugeLevel - 1 ? 700 : 400}>
                  {s.lbl}
                </text>
              );
            })}
            {/* center disc */}
            <circle cx={cx} cy={cy} r="14" fill="#fff" stroke="#0a2240" strokeWidth="2"/>
            {/* needle */}
            <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#0a2240" strokeWidth="3" strokeLinecap="round"/>
            <circle cx={cx} cy={cy} r="5" fill="#0a2240"/>
          </svg>
          <div className="pill">
            <div className="nm">Nous インカム+</div>
            <div className="ck">RISK · LV3</div>
          </div>
        </div>
      </div>

      {/* course summary */}
      <div className="pp-sleeves-card">
        <h3>コース概要</h3>
        <div className="sub" style={{marginBottom: 12}}>
          投資適格大型株のカバードコール戦略を主軸に、安定債券と金で下振れを抑制する合成型コース。
          月次で <b>12人のAI専門家エージェント</b> による合議でスリーブ比率を再調整します。
        </div>

        <div style={{display: 'grid', gap: 8, marginBottom: 14}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--pp-divider)'}}>
            <span style={{color: '#555'}}>運用方針</span>
            <span style={{fontWeight: 600}}>カバードコール (主軸) + 多資産分散</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--pp-divider)'}}>
            <span style={{color: '#555'}}>目標年利</span>
            <span style={{fontWeight: 700, color: '#0a2240', fontFamily: 'Inter'}}>7.2%</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--pp-divider)'}}>
            <span style={{color: '#555'}}>想定ボラティリティ</span>
            <span style={{fontWeight: 600, fontFamily: 'Inter'}}>9.4%</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--pp-divider)'}}>
            <span style={{color: '#555'}}>最大ドローダウン (1年)</span>
            <span style={{fontWeight: 600, fontFamily: 'Inter'}}>−4.7%</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--pp-divider)'}}>
            <span style={{color: '#555'}}>リバランス頻度</span>
            <span style={{fontWeight: 600}}>毎月第1営業日</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0'}}>
            <span style={{color: '#555'}}>運用エンジン</span>
            <span style={{fontWeight: 600, color: '#0a2240', display: 'flex', alignItems: 'center', gap: 6}}>
              <span style={{width: 10, height: 10, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #6dd5ff, #1e9ee0 60%)', boxShadow: '0 0 4px rgba(46,179,255,0.5)'}}></span>
              Nous Alpha · 12 agents
            </span>
          </div>
        </div>
      </div>

      {/* Comparison vs existing */}
      <div className="pp-sleeves-card">
        <h3>既存コースとの比較</h3>
        <div className="sub" style={{marginBottom: 10}}>同じリスクレベル「ふつう」でも、運用方針が異なります。</div>

        <div style={{background: '#f7f8fa', borderRadius: 8, padding: 10, marginBottom: 8, display: 'flex', gap: 10, alignItems: 'center'}}>
          <div style={{width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #0a2240 0%, #133a6e 60%, #1e6db5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#fff', fontFamily: 'JetBrains Mono', fontSize: 8}}>
            <b style={{color: '#2bb9ff', fontSize: 9, fontWeight: 700, lineHeight: 1}}>INC</b>
          </div>
          <div style={{flex: 1, fontSize: 12}}>
            <div style={{fontWeight: 600, color: '#0a2240'}}>Nous インカム+</div>
            <div style={{color: '#555', fontSize: 10.5}}>4スリーブの合成 · AI月次リバランス</div>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontWeight: 700, color: '#16a34a', fontFamily: 'Inter'}}>+12.98%</div>
            <div style={{fontSize: 9.5, color: '#888'}}>年率 · バックテスト</div>
          </div>
        </div>

        <div style={{background: '#f7f8fa', borderRadius: 8, padding: 10, display: 'flex', gap: 10, alignItems: 'center'}}>
          <div style={{width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #f6c050, #e09b2a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700}}>S</div>
          <div style={{flex: 1, fontSize: 12}}>
            <div style={{fontWeight: 600, color: '#1a1a1a'}}>スタンダードコース</div>
            <div style={{color: '#555', fontSize: 10.5}}>S&P 500 単一指数連動</div>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontWeight: 700, color: '#16a34a', fontFamily: 'Inter'}}>+8.4%</div>
            <div style={{fontSize: 9.5, color: '#888'}}>年率 · バックテスト</div>
          </div>
        </div>
      </div>

      <div className="pp-disclaim">
        ※ リスクレベルは過去のボラティリティと最大ドローダウンに基づくサンプル算定です。AIエージェントによる議論結果は日次で更新され、月次のリバランスに反映されます。実際の運用成果は将来の市況により変動します。
      </div>
    </div>
  );
}

// ─── export ─────────────────────────────────────────────────────────────
Object.assign(window, { PPListScreen, PPDetailScreen, PPRiskScreen, PPSkyHead });

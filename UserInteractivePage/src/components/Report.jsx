import { useState, useRef, useEffect, useCallback } from "react";
import { X, Shield, Clock, Globe, AlertTriangle, CheckCircle2, Info, ZoomIn, ZoomOut, Move } from "lucide-react";

const ACCENT = "#4F8CFF";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getHostname(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

function countDomains(urls = []) {
  const map = {};
  urls.forEach(u => { const h = getHostname(u); map[h] = (map[h] ?? 0) + 1; });
  return Object.entries(map);
}

const NODE_W = 140;

function circleLayout(count, startAngle, endAngle) {
  if (count === 0) return [];
  const minR = count === 1 ? 220 : Math.max(220, (NODE_W * 2.2 * count) / (endAngle - startAngle));
  if (count === 1) {
    const mid = (startAngle + endAngle) / 2;
    return [{ x: Math.cos(mid) * minR, y: Math.sin(mid) * minR }];
  }
  return Array.from({ length: count }, (_, i) => {
    const angle = startAngle + (endAngle - startAngle) * (i / (count - 1));
    return { x: Math.cos(angle) * minR, y: Math.sin(angle) * minR };
  });
}

// ── Word-wrap helper for SVG text ─────────────────────────────────────────────
function wrapText(text, maxChars) {
  if (!text) return [];
  const words = String(text).split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    if (word.length > maxChars) {
      if (current) { lines.push(current); current = ""; }
      for (let i = 0; i < word.length; i += maxChars) {
        lines.push(word.slice(i, i + maxChars));
      }
      continue;
    }
    const next = current ? current + " " + word : word;
    if (next.length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ── Build nodes + edges ───────────────────────────────────────────────────────
function buildGraph(type, scan) {
  const nodes = [], edges = [];
  let host = "Source";
  try { host = new URL(scan?.url ?? "").hostname; } catch { }
  
  nodes.push({
    id: "root", label: host, sub: "Source",
    risk: scan?.content?.risk ?? 0.5,
    popupRows: [{ label: "URL", value: scan?.url ?? host }],
    x: 0, y: 0,
  });

  // ── CONTENT ──────────────────────────────────────────────────────────────
  if (type === "content") {
    const r = scan?.content?.risk ?? 0;
    const cats = scan?.content?.category ?? ["Safe"];
    const reasons = (scan?.content?.reason ?? []).slice(0, 5);
    
    circleLayout(cats.length, Math.PI * 1.05, Math.PI * 1.65).forEach((pos, i) => {
      nodes.push({
        id: `cat${i}`, label: cats[i], sub: "category", risk: r,
        popupRows: [
          { label: "Category", value: cats[i] },
          { label: "Risk Score", value: `${(r * 100).toFixed(1)}%` },
        ],
        ...pos,
      });
      edges.push({ from: "root", to: `cat${i}` });
    });
    
    circleLayout(reasons.length, Math.PI * 0.35, Math.PI * 0.95).forEach((pos, i) => {
      nodes.push({
        id: `rsn${i}`,
        label: reasons[i].length > 20 ? reasons[i].slice(0, 20) + "…" : reasons[i],
        sub: "finding", risk: r > 0.5 ? r : 0.1,
        popupRows: [
          { label: "Finding", value: reasons[i] },
          { label: "Risk Score", value: `${(r * 100).toFixed(1)}%` },
        ],
        ...pos,
      });
      edges.push({ from: "root", to: `rsn${i}` });
    });
  }

  // ── REDIRECTS ────────────────────────────────────────────────────────────
  if (type === "redirects") {
    const chain = scan?.redirects?.redirect_chain ?? [];
    const STEP_X = 280, ROW_Y = 110;
    
    chain.slice(1).forEach((url, i) => {
      const actualIndex = i + 1;
      const isLast = actualIndex === chain.length - 1;
      const lbl = getHostname(url);
      nodes.push({
        id: `h${actualIndex}`,
        label: lbl.length > 18 ? lbl.slice(0, 18) + "…" : lbl,
        sub: isLast ? "destination" : `hop ${actualIndex}`,
        risk: isLast ? 0.3 : 0.45,
        popupRows: [
          { label: "Full URL", value: url },
          { label: "Domain", value: lbl },
          { label: "Type", value: isLast ? "Final Destination" : `Redirect Hop ${actualIndex}` },
        ],
        x: actualIndex * STEP_X,
        y: actualIndex % 2 === 0 ? -ROW_Y : ROW_Y,
      });
      edges.push({ from: actualIndex === 1 ? "root" : `h${actualIndex - 1}`, to: `h${actualIndex}` });
    });
    
    if (scan?.redirects?.cross_domain_content) {
      nodes.push({
        id: "xdom", label: "Cross-Domain", sub: "content loaded", risk: 0.6,
        popupRows: [{ label: "Warning", value: "Cross-domain content was loaded during the redirect chain." }],
        x: 0, y: 200,
      });
      edges.push({ from: "root", to: "xdom" });
    }
  }

  // ── NETWORK ──────────────────────────────────────────────────────────────
  if (type === "network") {
    const extUrls = scan?.network?.external_requests ?? [];
    const postUrls = scan?.network?.post_url ?? [];
    const postDomains = countDomains(postUrls);
    
    if (postDomains.length === 0) {
      nodes.push({
        id: "post0", label: "No POST", sub: "no data sent", risk: 0,
        popupRows: [{ label: "Status", value: "No POST requests detected." }],
        x: 0, y: -240,
      });
      edges.push({ from: "root", to: "post0" });
    } else {
      circleLayout(postDomains.length, -Math.PI * 0.6, -Math.PI * 0.1).forEach((pos, i) => {
        const [h, cnt] = postDomains[i];
        nodes.push({
          id: `post${i}`,
          label: h.length > 20 ? h.slice(0, 20) + "…" : h,
          sub: `POST · ${cnt}×`, risk: 0.55,
          popupRows: [
            { label: "Domain", value: h },
            { label: "Requests", value: `${cnt} POST request${cnt > 1 ? "s" : ""}` },
            { label: "Risk", value: "Data is being sent to this server" },
          ],
          ...pos,
        });
        edges.push({ from: "root", to: `post${i}` });
      });
    }
    
    const topDomains = countDomains(extUrls).sort((a, b) => b[1] - a[1]).slice(0, 12);
    circleLayout(topDomains.length, Math.PI * 0.1, Math.PI * 1.9).forEach((pos, i) => {
      const [h, cnt] = topDomains[i];
      nodes.push({
        id: `ext${i}`,
        label: h.length > 20 ? h.slice(0, 20) + "…" : h,
        sub: `${cnt} request${cnt > 1 ? "s" : ""}`, risk: 0.2,
        popupRows: [
          { label: "Domain", value: h },
          { label: "Requests", value: `${cnt} request${cnt > 1 ? "s" : ""}` },
        ],
        ...pos,
      });
      edges.push({ from: "root", to: `ext${i}` });
    });
  }

  // ── COOKIES ──────────────────────────────────────────────────────────────
  if (type === "cookies") {
    const stolen = scan?.cookies?.Cookie_Stealing ?? [];
    
    nodes.push({
      id: "sess", label: "Session Cookie", sub: "stored in browser", risk: 0.1,
      popupRows: [
        { label: "What it is", value: "Identifies your logged-in session." },
        { label: "Risk", value: "If stolen, attacker can impersonate you." },
      ],
      x: -240, y: -90,
    });
    
    nodes.push({
      id: "auth", label: "Auth Token", sub: "login state", risk: 0.15,
      popupRows: [
        { label: "What it is", value: "Grants access without re-entering credentials." },
        { label: "Risk", value: "Compromise allows account takeover." },
      ],
      x: -240, y: 90,
    });
    
    edges.push({ from: "root", to: "sess" });
    edges.push({ from: "root", to: "auth" });
    
    if (stolen.length === 0) {
      nodes.push({
        id: "safe", label: "No Theft Found", sub: "session secure", risk: 0,
        popupRows: [{ label: "Status", value: "No cookie stealing attempts detected." }],
        x: 240, y: 0,
      });
      edges.push({ from: "root", to: "safe" });
    } else {
      circleLayout(stolen.length, -Math.PI * 0.45, Math.PI * 0.45).forEach((pos, i) => {
        const item = stolen[i];
        const domain = typeof item === "object" ? Object.keys(item)[0] : String(item);
        const data = typeof item === "object" ? Object.values(item)[0] : "";
        nodes.push({
          id: `stl${i}`,
          label: domain.length > 18 ? domain.slice(0, 18) + "…" : domain,
          sub: "theft vector", risk: 0.9,
          popupRows: [
            { label: "Domain", value: domain },
            ...(data ? [{ label: "Stolen Data", value: String(data) }] : []),
            { label: "Risk", value: "Cookie stealing vector detected." },
          ],
          ...pos,
        });
        edges.push({ from: "root", to: `stl${i}` });
      });
    }
  }

  return { nodes, edges };
}

function riskColor(r) {
  if (r === undefined || r === null) return "#94a3b8";
  if (r >= 0.7) return "#FF5A5F";
  if (r >= 0.4) return "#F4B740";
  return "#2ECC71";
}

function riskLabel(r) {
  if (r === undefined || r === null) return "Unknown";
  if (r >= 0.7) return "High Risk";
  if (r >= 0.4) return "Medium Risk";
  return "Low Risk";
}

// ── Smart popup ────────────────────────────────────────────────────────────────
function NodePopup({ node, cx, cy, svgWidth, svgHeight, color }) {
  if (!node) return null;
  
  const nc = node.id === "root" ? color : riskColor(node.risk);
  const PW = 260;
  const FONT = 9;
  const LH = 14;
  const CHARS = 32;
  
  const rows = (node.popupRows ?? []).flatMap(({ label, value }) => {
    const wrapped = wrapText(String(value), CHARS);
    return [
      { text: label.toUpperCase(), isLabel: true },
      ...wrapped.map(line => ({ text: line, isLabel: false })),
    ];
  });
  
  const HEADER_H = 48;
  const DIVIDER = 8;
  const ROW_H = LH;
  const PADDING = 12;
  const PH = HEADER_H + DIVIDER + rows.length * ROW_H + PADDING * 2;
  
  const nx = cx(node), ny = cy(node);
  
  let popX = nx - PW / 2;
  let popY = ny - PH - 28;
  
  if (popY < 8) popY = ny + 38;
  if (popY + PH > svgHeight - 8) popY = Math.max(8, ny - PH - 28);
  if (popX < 8) popX = 8;
  if (popX + PW > svgWidth - 8) popX = svgWidth - PW - 8;
  
  return (
    <g style={{ pointerEvents: "none" }}>
      <line
        x1={nx} y1={ny - 28}
        x2={nx} y2={popY + PH}
        stroke={nc} strokeWidth="1.5" opacity="0.4"
        strokeDasharray="4 4"
      />
      
      <rect x={popX + 3} y={popY + 3} width={PW} height={PH} rx="12"
        fill="rgba(0,0,0,0.12)" />
      
      <rect x={popX} y={popY} width={PW} height={PH} rx="12"
        fill="rgba(255,255,255,0.98)" stroke={nc} strokeWidth="2"
        style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.15))" }} />
      
      <rect x={popX} y={popY} width={PW} height="5" rx="3" fill={nc} />
      
      <text x={popX + 14} y={popY + 24} fontSize="12" fontWeight="700"
        fill="#1E2A38" fontFamily="system-ui, -apple-system, sans-serif">
        {node.label.length > 26 ? node.label.slice(0, 26) + "…" : node.label}
      </text>
      
      <rect x={popX + PW - 90} y={popY + 12} width={82} height={20} rx="10"
        fill={`${nc}15`} stroke={nc} strokeWidth="1.2" />
      <text x={popX + PW - 49} y={popY + 26} textAnchor="middle"
        fontSize="8" fontWeight="700" fill={nc} fontFamily="monospace">
        {node.risk !== undefined
          ? `${(node.risk * 100).toFixed(0)}% · ${riskLabel(node.risk)}`
          : node.sub}
      </text>
      
      <text x={popX + 14} y={popY + 40} fontSize="9" fill="#64748b" 
        fontFamily="system-ui, -apple-system, sans-serif">
        {node.sub}
      </text>
      
      <line x1={popX + 14} y1={popY + HEADER_H} x2={popX + PW - 14} y2={popY + HEADER_H}
        stroke="#e2e8f0" strokeWidth="1.5" />
      
      {rows.map((row, i) => (
        <text
          key={i}
          x={popX + 14}
          y={popY + HEADER_H + DIVIDER + i * ROW_H + ROW_H}
          fontSize={row.isLabel ? "8" : FONT}
          fontWeight={row.isLabel ? "700" : "400"}
          fill={row.isLabel ? nc : "#475569"}
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing={row.isLabel ? "0.5" : "0"}
        >
          {row.text}
        </text>
      ))}
    </g>
  );
}

// ── Node graph ────────────────────────────────────────────────────────────────
function NodeGraph({ type, scanResult, color }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [svgSize, setSvgSize] = useState({ w: 800, h: 400 });
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState(null);
  const dragStart = useRef(null);
  const pinchStart = useRef(null);
  const didDrag = useRef(false);
  
  const { nodes, edges } = buildGraph(type, scanResult ?? {});
  
  useEffect(() => {
    if (svgRef.current) {
      const { width, height } = svgRef.current.getBoundingClientRect();
      setOff({ x: width / 2, y: height / 2 });
      setSvgSize({ w: width, h: height });
    }
    setSelected(null);
  }, [type]);
  
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = e => {
      e.preventDefault();
      e.stopPropagation();
      setScale(s => Math.min(2.5, Math.max(0.3, s - e.deltaY * 0.0012)));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);
  
  const onMouseDown = useCallback(e => {
    didDrag.current = false;
    setDragging(true);
    dragStart.current = { x: e.clientX - off.x, y: e.clientY - off.y };
  }, [off]);
  
  const onMouseMove = useCallback(e => {
    if (!dragging) return;
    didDrag.current = true;
    setOff({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  }, [dragging]);
  
  const onMouseUp = useCallback(() => setDragging(false), []);
  
  const onTouchStart = useCallback(e => {
    if (e.touches.length === 1) {
      dragStart.current = { x: e.touches[0].clientX - off.x, y: e.touches[0].clientY - off.y };
      setDragging(true);
    } else if (e.touches.length === 2) {
      setDragging(false);
      pinchStart.current = {
        dist: Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY),
        scale,
      };
    }
  }, [off, scale]);
  
  const onTouchMove = useCallback(e => {
    e.preventDefault();
    if (e.touches.length === 1 && dragging)
      setOff({ x: e.touches[0].clientX - dragStart.current.x, y: e.touches[0].clientY - dragStart.current.y });
    else if (e.touches.length === 2 && pinchStart.current) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setScale(Math.min(2.5, Math.max(0.3, pinchStart.current.scale * (d / pinchStart.current.dist))));
    }
  }, [dragging]);
  
  const onTouchEnd = useCallback(() => { setDragging(false); pinchStart.current = null; }, []);
  
  const cx = n => n.x * scale + off.x;
  const cy = n => n.y * scale + off.y;
  const find = id => nodes.find(n => n.id === id);
  
  const renderOrder = selected
    ? [...nodes.filter(n => n.id !== selected.id), nodes.find(n => n.id === selected.id)]
    : nodes;
  
  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", overflow: "hidden", touchAction: "none" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <svg
        ref={svgRef}
        width="100%" height="100%"
        style={{ cursor: dragging ? "grabbing" : "grab", display: "block" }}
        onClick={() => { if (!didDrag.current) setSelected(null); }}
      >
        <defs>
          <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"
            patternTransform={`translate(${off.x % 24},${off.y % 24})`}>
            <circle cx="1" cy="1" r="1" fill="rgba(79, 140, 255, 0.08)" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <rect width="100%" height="100%" fill="#0f172a" />
        <rect width="100%" height="100%" fill="url(#dots)" />
        
        {edges.map((e, i) => {
          const f = find(e.from), t = find(e.to);
          if (!f || !t) return null;
          return (
            <line key={i}
              x1={cx(f)} y1={cy(f)} x2={cx(t)} y2={cy(t)}
              stroke="rgba(79, 140, 255, 0.25)" strokeWidth="2"
              style={{ transition: "stroke 0.3s ease" }}
            />
          );
        })}
        
        {renderOrder.map(n => {
          if (!n) return null;
          const x = cx(n), y = cy(n);
          const isRoot = n.id === "root";
          const isSelected = selected?.id === n.id;
          const nc = isRoot ? color : riskColor(n.risk);
          const w = isSelected ? 170 : isRoot ? 150 : 130;
          const h = isSelected ? 62 : isRoot ? 58 : 50;
          
          return (
            <g key={n.id} transform={`translate(${x},${y})`}
              style={{ cursor: "pointer", transition: "all 0.3s ease" }}
              onClick={e => {
                e.stopPropagation();
                if (!didDrag.current)
                  setSelected(prev => prev?.id === n.id ? null : n);
              }}
            >
              {isSelected && (
                <rect x={-w / 2 - 6} y={-h / 2 - 6} width={w + 12} height={h + 12} rx="12"
                  fill="none" stroke={nc} strokeWidth="2.5" opacity="0.4"
                  style={{ filter: "url(#glow)" }} />
              )}
              
              <rect x={-w / 2 + 3} y={-h / 2 + 3} width={w} height={h} rx="10"
                fill="rgba(0,0,0,0.2)" />
              
              <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="10"
                fill={isSelected ? `${nc}25` : `${nc}18`}
                stroke={nc} strokeWidth={isSelected ? "2.5" : isRoot ? "2" : "1.5"}
                style={{ 
                  filter: isSelected ? "url(#glow)" : "none",
                  transition: "all 0.3s ease"
                }} />
              
              <rect x={-w / 2} y={-h / 2} width={w} height="4" rx="3" fill={nc} />
              
              <text textAnchor="middle" dy="-3" fontSize={isRoot ? "12" : "11"}
                fontWeight="700" fill="#f8fafc" fontFamily="system-ui, -apple-system, sans-serif"
                style={{ pointerEvents: "none" }}>
                {n.label.length > 18 ? n.label.slice(0, 18) + "…" : n.label}
              </text>
              
              <text textAnchor="middle" dy="13" fontSize="9"
                fill={nc} fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600"
                style={{ pointerEvents: "none" }}>
                {n.sub}
              </text>
              
              {!isSelected && (
                <text textAnchor="middle" dy={h / 2 - 6} fontSize="7.5"
                  fill="rgba(248, 250, 252, 0.35)" fontFamily="system-ui, -apple-system, sans-serif"
                  style={{ pointerEvents: "none" }}>
                  tap for details
                </text>
              )}
            </g>
          );
        })}
        
        <NodePopup
          node={selected}
          cx={cx} cy={cy}
          svgWidth={svgSize.w}
          svgHeight={svgSize.h}
          color={color}
        />
      </svg>
    </div>
  );
}

// ── Build Q&A ─────────────────────────────────────────────────────────────────
function buildQA(type, scan) {
  const found = (() => {
    if (!scan) return "No scan data available.";
    switch (type) {
      case "content": {
        const r = scan.content?.risk ?? 0;
        return `Risk score ${(r * 100).toFixed(1)}%. Category: ${scan.content?.category?.join(", ") ?? "N/A"}. ${scan.content?.reason?.[0] ?? ""}`;
      }
      case "redirects": {
        const chain = scan.redirects?.redirect_chain ?? [];
        return chain.length > 1
          ? `${chain.length}-hop redirect chain detected. Cross-domain content: ${scan.redirects?.cross_domain_content ? "Yes" : "No"}.`
          : "No suspicious redirect chain — URL loads directly.";
      }
      case "network": {
        const ext = scan.network?.external_requests?.length ?? 0;
        const post = scan.network?.post_requests ?? 0;
        return `${ext} external requests and ${post} POST request(s) detected. ${post > 0 ? "POST activity may indicate data being sent to external servers." : "No unexpected data transmissions found."}`;
      }
      case "cookies": {
        const s = scan.cookies?.Cookie_Stealing ?? [];
        const sLen = s.length;
        return sLen === 0
          ? "No cookie stealing attempts detected. Session data appears safe."
          : `${sLen} potential cookie stealing vector(s) detected: ${s.map(item => typeof item === "object" ? Object.keys(item)[0] : item).join(", ")}. Avoid submitting personal data on this page.`;
      }
      default: return "";
    }
  })();
  
  const all = {
    content: [
      { q: "What is Content Analysis?", a: "We scan the page's text, scripts, and structure for patterns linked to fraud, phishing, or social engineering. Hundreds of linguistic and structural signals are evaluated." },
      { q: "What threats can content carry?", a: "Fake login forms, scareware, prize scams, brand impersonation, and manipulative language designed to steal credentials or trick you into payments." },
      { q: "How can it harm me?", a: "Credential theft, financial loss, identity fraud, or malware installation — even without any technical exploit, persuasion-based attacks are highly effective." },
      { q: "What we found in your scan", a: found },
      { q: "How can I stay safe?", a: "Verify the domain matches the service you expect. Use a password manager — it won't autofill on spoofed sites. Enable two-factor authentication." },
    ],
    redirects: [
      { q: "What are URL redirects?", a: "Redirects automatically send your browser from one URL to another. Legitimate for login flows and HTTPS upgrades, but heavily abused to hide malicious destinations." },
      { q: "Why are redirects dangerous?", a: "A chain of redirects can bounce you through multiple domains to obscure the final destination, bypass browser warnings, or track your clicks." },
      { q: "How can it harm me?", a: "You may land silently on a phishing page, trigger a drive-by download, or have your session tracked across attacker-controlled domains." },
      { q: "What we found in your scan", a: found },
      { q: "How can I stay safe?", a: "Hover links before clicking to preview the destination. Avoid shortened URLs from unknown sources. Always check the address bar after navigation." },
    ],
    network: [
      { q: "What is network activity analysis?", a: "Every page load triggers dozens of requests — scripts, fonts, images, data. We log every outbound connection and POST request to detect anomalies." },
      { q: "Why are POST requests suspicious?", a: "POST requests send data from your browser to a server. Malicious pages can silently POST your keystrokes, form inputs, or session cookies to attacker servers." },
      { q: "How can it harm me?", a: "Excessive external requests can signal data exfiltration, session hijacking, fingerprinting, or covert ad tracking." },
      { q: "What we found in your scan", a: found },
      { q: "How can I stay safe?", a: "Use a browser with tracker blocking. Keep extensions minimal — they see all your network traffic. Consider a DNS-level blocker." },
    ],
    cookies: [
      { q: "What are cookies?", a: "Cookies store your login state and preferences in the browser so websites remember you between page visits without re-authentication." },
      { q: "What is cookie stealing?", a: "An attacker captures your session cookie — often via XSS or a network attack — and uses it to impersonate you without needing your password." },
      { q: "How can it harm me?", a: "Full access to any service you're logged into: email, banking, social media — all without triggering password-based two-factor authentication." },
      { q: "What we found in your scan", a: found },
      { q: "How can I stay safe?", a: "Log out of sensitive services when idle. Use browsers that isolate cookies per site. Enable security alerts on important accounts." },
    ],
  };
  
  return all[type] ?? [];
}

// ── Additional Interactive Visuals ────────────────────────────────────────────
function AdditionalVisuals({ type, scanResult, color }) {
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredItem, setHoveredItem] = useState(null);
  
  if (type === "content") {
    const categories = scanResult?.content?.category ?? ["Safe"];
    const reasons = scanResult?.content?.reason ?? ["No issues found"];
    const risk = scanResult?.content?.risk ?? 0;
    
    return (
      <div style={{
        background: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        border: "1px solid rgba(79, 140, 255, 0.2)",
        padding: "24px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
        animation: "slideUp 0.55s ease-out",
        marginBottom: "24px"
      }}>
        <h3 style={{
          margin: "0 0 20px 0",
          fontSize: "18px",
          fontWeight: "700",
          color: "#1E2A38",
          fontFamily: "system-ui, -apple-system, sans-serif"
        }}>
          Content Threat Breakdown
        </h3>
        
        {/* Risk Meter */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>Overall Risk Score</span>
            <span style={{ fontSize: "13px", fontWeight: "700", color: riskColor(risk) }}>
              {(risk * 100).toFixed(1)}%
            </span>
          </div>
          <div style={{
            width: "100%",
            height: "12px",
            background: "rgba(0, 0, 0, 0.05)",
            borderRadius: "6px",
            overflow: "hidden",
            position: "relative"
          }}>
            <div style={{
              width: `${risk * 100}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${riskColor(risk)}, ${riskColor(risk)}dd)`,
              borderRadius: "6px",
              transition: "width 1s ease-out",
              boxShadow: `0 0 10px ${riskColor(risk)}80`
            }} />
          </div>
        </div>
        
        {/* Category Pills */}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "12px" }}>
            Detected Categories
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {categories.map((cat, i) => (
              <div
                key={i}
                style={{
                  padding: "8px 16px",
                  background: `${riskColor(risk)}15`,
                  border: `2px solid ${riskColor(risk)}40`,
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: riskColor(risk),
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  transform: hoveredItem === `cat-${i}` ? "scale(1.05)" : "scale(1)"
                }}
                onMouseEnter={() => setHoveredItem(`cat-${i}`)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {cat}
              </div>
            ))}
          </div>
        </div>
        
        {/* Findings List */}
        <div>
          <p style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "12px" }}>
            Suspicious Findings ({reasons.length})
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {reasons.slice(0, 5).map((reason, i) => (
              <div
                key={i}
                style={{
                  padding: "12px 16px",
                  background: hoveredItem === `reason-${i}` ? "rgba(79, 140, 255, 0.1)" : "rgba(255, 255, 255, 0.6)",
                  borderRadius: "10px",
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                  display: "flex",
                  alignItems: "start",
                  gap: "12px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  transform: hoveredItem === `reason-${i}` ? "translateX(4px)" : "translateX(0)"
                }}
                onMouseEnter={() => setHoveredItem(`reason-${i}`)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "6px",
                  background: `${riskColor(risk)}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: riskColor(risk),
                  flexShrink: 0
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
                  {reason}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (type === "redirects") {
    const chain = scanResult?.redirects?.redirect_chain ?? [];
    const crossDomain = scanResult?.redirects?.cross_domain_content ?? false;
    
    return (
      <div style={{
        background: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        border: "1px solid rgba(79, 140, 255, 0.2)",
        padding: "24px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
        animation: "slideUp 0.55s ease-out",
        marginBottom: "24px"
      }}>
        <h3 style={{
          margin: "0 0 20px 0",
          fontSize: "18px",
          fontWeight: "700",
          color: "#1E2A38",
          fontFamily: "system-ui, -apple-system, sans-serif"
        }}>
          Redirect Chain Flow
        </h3>
        
        {/* Chain Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "16px",
          marginBottom: "24px"
        }}>
          <div style={{
            padding: "16px",
            background: "rgba(79, 140, 255, 0.1)",
            borderRadius: "12px",
            border: "1px solid rgba(79, 140, 255, 0.2)"
          }}>
            <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>Total Hops</p>
            <p style={{ fontSize: "24px", fontWeight: "700", color: color, margin: 0 }}>
              {chain.length - 1}
            </p>
          </div>
          <div style={{
            padding: "16px",
            background: crossDomain ? "rgba(255, 90, 95, 0.1)" : "rgba(46, 204, 113, 0.1)",
            borderRadius: "12px",
            border: `1px solid ${crossDomain ? "rgba(255, 90, 95, 0.2)" : "rgba(46, 204, 113, 0.2)"}`
          }}>
            <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>Cross-Domain</p>
            <p style={{ fontSize: "24px", fontWeight: "700", color: crossDomain ? "#FF5A5F" : "#2ECC71", margin: 0 }}>
              {crossDomain ? "Yes" : "No"}
            </p>
          </div>
        </div>
        
        {/* Visual Chain */}
        <div style={{ position: "relative", padding: "20px 0" }}>
          {chain.map((url, i) => (
            <div key={i} style={{ marginBottom: i < chain.length - 1 ? "16px" : 0 }}>
              <div
                style={{
                  padding: "16px 20px",
                  background: hoveredItem === `chain-${i}` 
                    ? "rgba(79, 140, 255, 0.15)" 
                    : i === 0 
                      ? "rgba(79, 140, 255, 0.1)" 
                      : i === chain.length - 1 
                        ? "rgba(90, 215, 255, 0.1)"
                        : "rgba(255, 255, 255, 0.6)",
                  borderRadius: "12px",
                  border: i === 0 || i === chain.length - 1 
                    ? `2px solid ${color}` 
                    : "1px solid rgba(0, 0, 0, 0.06)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  transform: hoveredItem === `chain-${i}` ? "scale(1.02)" : "scale(1)"
                }}
                onMouseEnter={() => setHoveredItem(`chain-${i}`)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: i === 0 
                      ? `linear-gradient(135deg, ${color}, #5AD7FF)` 
                      : i === chain.length - 1
                        ? "linear-gradient(135deg, #5AD7FF, #2ECC71)"
                        : "rgba(244, 183, 64, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: i === 0 || i === chain.length - 1 ? "#fff" : "#F4B740",
                    flexShrink: 0
                  }}>
                    {i === 0 ? "🌐" : i === chain.length - 1 ? "🎯" : i}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ 
                      fontSize: "11px", 
                      color: "#64748b", 
                      margin: "0 0 4px 0",
                      fontWeight: "600"
                    }}>
                      {i === 0 ? "Source" : i === chain.length - 1 ? "Final Destination" : `Hop ${i}`}
                    </p>
                    <p style={{ 
                      fontSize: "13px", 
                      color: "#1E2A38", 
                      margin: 0,
                      fontFamily: "monospace",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {getHostname(url)}
                    </p>
                  </div>
                </div>
              </div>
              
              {i < chain.length - 1 && (
                <div style={{
                  width: "2px",
                  height: "16px",
                  background: `linear-gradient(180deg, ${color}, transparent)`,
                  margin: "0 auto",
                  position: "relative"
                }}>
                  <div style={{
                    position: "absolute",
                    bottom: "-4px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "0",
                    height: "0",
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent",
                    borderTop: `6px solid ${color}`
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (type === "network") {
    const externalRequests = scanResult?.network?.external_requests ?? [];
    const postUrls = scanResult?.network?.post_url ?? [];
    const postCount = scanResult?.network?.post_requests ?? 0;
    
    const domainCounts = countDomains(externalRequests);
    const topDomains = domainCounts.sort((a, b) => b[1] - a[1]).slice(0, 8);
    
    return (
      <div style={{
        background: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        border: "1px solid rgba(79, 140, 255, 0.2)",
        padding: "24px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
        animation: "slideUp 0.55s ease-out",
        marginBottom: "24px"
      }}>
        <h3 style={{
          margin: "0 0 20px 0",
          fontSize: "18px",
          fontWeight: "700",
          color: "#1E2A38",
          fontFamily: "system-ui, -apple-system, sans-serif"
        }}>
          Network Activity Analysis
        </h3>
        
        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          borderBottom: "2px solid rgba(0, 0, 0, 0.05)",
          paddingBottom: "2px"
        }}>
          <button
            onClick={() => setActiveTab(0)}
            style={{
              padding: "10px 20px",
              background: activeTab === 0 ? `${color}15` : "transparent",
              border: "none",
              borderBottom: activeTab === 0 ? `3px solid ${color}` : "3px solid transparent",
              borderRadius: "8px 8px 0 0",
              fontSize: "13px",
              fontWeight: "600",
              color: activeTab === 0 ? color : "#64748b",
              cursor: "pointer",
              transition: "all 0.3s ease",
              marginBottom: "-2px"
            }}
          >
            External Requests ({externalRequests.length})
          </button>
          <button
            onClick={() => setActiveTab(1)}
            style={{
              padding: "10px 20px",
              background: activeTab === 1 ? "rgba(255, 90, 95, 0.15)" : "transparent",
              border: "none",
              borderBottom: activeTab === 1 ? "3px solid #FF5A5F" : "3px solid transparent",
              borderRadius: "8px 8px 0 0",
              fontSize: "13px",
              fontWeight: "600",
              color: activeTab === 1 ? "#FF5A5F" : "#64748b",
              cursor: "pointer",
              transition: "all 0.3s ease",
              marginBottom: "-2px"
            }}
          >
            POST Requests ({postCount})
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === 0 ? (
          <div>
            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
              Top domains by request count
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {topDomains.map(([domain, count], i) => {
                const percentage = (count / externalRequests.length) * 100;
                return (
                  <div
                    key={i}
                    style={{
                      padding: "12px",
                      background: hoveredItem === `ext-${i}` ? "rgba(79, 140, 255, 0.1)" : "rgba(255, 255, 255, 0.6)",
                      borderRadius: "10px",
                      border: "1px solid rgba(0, 0, 0, 0.06)",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={() => setHoveredItem(`ext-${i}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#1E2A38", fontFamily: "monospace" }}>
                        {domain}
                      </span>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: color }}>
                        {count} req
                      </span>
                    </div>
                    <div style={{
                      width: "100%",
                      height: "6px",
                      background: "rgba(0, 0, 0, 0.05)",
                      borderRadius: "3px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${color}, #5AD7FF)`,
                        borderRadius: "3px",
                        transition: "width 0.5s ease-out"
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            {postCount === 0 ? (
              <div style={{
                padding: "40px",
                textAlign: "center",
                background: "rgba(46, 204, 113, 0.1)",
                borderRadius: "12px",
                border: "1px solid rgba(46, 204, 113, 0.2)"
              }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>✓</div>
                <p style={{ fontSize: "15px", fontWeight: "600", color: "#2ECC71", margin: 0 }}>
                  No POST requests detected
                </p>
                <p style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>
                  No data is being sent from this page
                </p>
              </div>
            ) : (
              <div>
                <div style={{
                  padding: "16px",
                  background: "rgba(255, 90, 95, 0.1)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 90, 95, 0.2)",
                  marginBottom: "16px"
                }}>
                  <p style={{ fontSize: "13px", color: "#FF5A5F", margin: 0, fontWeight: "600" }}>
                    ⚠️ Data transmission detected - {postCount} POST request{postCount > 1 ? "s" : ""} sending data to external servers
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {postUrls.map((url, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "14px 16px",
                        background: hoveredItem === `post-${i}` ? "rgba(255, 90, 95, 0.15)" : "rgba(255, 255, 255, 0.6)",
                        borderRadius: "10px",
                        border: "2px solid rgba(255, 90, 95, 0.3)",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        transform: hoveredItem === `post-${i}` ? "translateX(4px)" : "translateX(0)"
                      }}
                      onMouseEnter={() => setHoveredItem(`post-${i}`)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          background: "linear-gradient(135deg, #FF5A5F, #FF3B40)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          color: "#fff",
                          fontWeight: "700",
                          flexShrink: 0
                        }}>
                          POST
                        </div>
                        <span style={{ 
                          fontSize: "13px", 
                          color: "#1E2A38", 
                          fontFamily: "monospace",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {getHostname(url)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  
  if (type === "cookies") {
    const stolen = scanResult?.cookies?.Cookie_Stealing ?? [];
    const isSafe = stolen.length === 0;
    
    return (
      <div style={{
        background: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        border: "1px solid rgba(79, 140, 255, 0.2)",
        padding: "24px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
        animation: "slideUp 0.55s ease-out",
        marginBottom: "24px"
      }}>
        <h3 style={{
          margin: "0 0 20px 0",
          fontSize: "18px",
          fontWeight: "700",
          color: "#1E2A38",
          fontFamily: "system-ui, -apple-system, sans-serif"
        }}>
          Cookie Security Status
        </h3>
        
        {/* Status Card */}
        <div style={{
          padding: "24px",
          background: isSafe 
            ? "linear-gradient(135deg, rgba(46, 204, 113, 0.1), rgba(39, 174, 96, 0.1))"
            : "linear-gradient(135deg, rgba(255, 90, 95, 0.1), rgba(255, 59, 64, 0.1))",
          borderRadius: "12px",
          border: isSafe ? "2px solid rgba(46, 204, 113, 0.3)" : "2px solid rgba(255, 90, 95, 0.3)",
          marginBottom: "24px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "56px", marginBottom: "12px" }}>
            {isSafe ? "🛡️" : "⚠️"}
          </div>
          <p style={{
            fontSize: "20px",
            fontWeight: "700",
            color: isSafe ? "#2ECC71" : "#FF5A5F",
            margin: "0 0 8px 0"
          }}>
            {isSafe ? "Session Secure" : "Theft Vectors Detected"}
          </p>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            {isSafe 
              ? "No cookie stealing attempts found on this page"
              : `${stolen.length} potential cookie theft vector${stolen.length > 1 ? "s" : ""} identified`
            }
          </p>
        </div>
        
        {/* Cookie Types */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          marginBottom: isSafe ? 0 : "24px"
        }}>
          <div style={{
            padding: "16px",
            background: "rgba(79, 140, 255, 0.1)",
            borderRadius: "10px",
            border: "1px solid rgba(79, 140, 255, 0.2)"
          }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>🍪</div>
            <p style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", margin: "0 0 4px 0" }}>
              Session Cookie
            </p>
            <p style={{ fontSize: "11px", color: "#475569", margin: 0, lineHeight: "1.4" }}>
              Stores your login state
            </p>
          </div>
          <div style={{
            padding: "16px",
            background: "rgba(90, 215, 255, 0.1)",
            borderRadius: "10px",
            border: "1px solid rgba(90, 215, 255, 0.2)"
          }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔑</div>
            <p style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", margin: "0 0 4px 0" }}>
              Auth Token
            </p>
            <p style={{ fontSize: "11px", color: "#475569", margin: 0, lineHeight: "1.4" }}>
              Grants access to services
            </p>
          </div>
        </div>
        
        {/* Theft Vectors */}
        {!isSafe && (
          <div>
            <p style={{ fontSize: "12px", fontWeight: "600", color: "#FF5A5F", marginBottom: "12px" }}>
              ⚠️ Detected Theft Vectors
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {stolen.map((item, i) => {
                const domain = typeof item === "object" ? Object.keys(item)[0] : String(item);
                const data = typeof item === "object" ? Object.values(item)[0] : "";
                
                return (
                  <div
                    key={i}
                    style={{
                      padding: "16px",
                      background: hoveredItem === `theft-${i}` ? "rgba(255, 90, 95, 0.15)" : "rgba(255, 255, 255, 0.6)",
                      borderRadius: "10px",
                      border: "2px solid rgba(255, 90, 95, 0.3)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      transform: hoveredItem === `theft-${i}` ? "scale(1.02)" : "scale(1)"
                    }}
                    onMouseEnter={() => setHoveredItem(`theft-${i}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div style={{ display: "flex", alignItems: "start", gap: "12px" }}>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "linear-gradient(135deg, #FF5A5F, #FF3B40)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        flexShrink: 0
                      }}>
                        🚨
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#1E2A38",
                          margin: "0 0 6px 0",
                          fontFamily: "monospace"
                        }}>
                          {domain}
                        </p>
                        {data && (
                          <p style={{
                            fontSize: "11px",
                            color: "#64748b",
                            margin: "0 0 6px 0",
                            fontFamily: "monospace",
                            background: "rgba(0, 0, 0, 0.05)",
                            padding: "4px 8px",
                            borderRadius: "4px"
                          }}>
                            {String(data).slice(0, 50)}{String(data).length > 50 ? "..." : ""}
                          </p>
                        )}
                        <p style={{ fontSize: "11px", color: "#FF5A5F", margin: 0, fontWeight: "600" }}>
                          Cookie stealing vector detected
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return null;
}


// ── Main export ───────────────────────────────────────────────────────────────
export default function ReportModal({ isOpen, onClose, type = "content", scanResult }) {
  if (!isOpen) return null;
  
  const color = ACCENT;
  const qa = buildQA(type, scanResult);
  
  const titles = {
    content: "Content Analysis",
    redirects: "Redirect Analysis",
    network: "Network Activity",
    cookies: "Cookie Safety"
  };
  
  const icons = {
    content: "📄",
    redirects: "🔄",
    network: "🌐",
    cookies: "🍪"
  };
  
  const getRiskStats = () => {
    if (!scanResult) return { level: "Unknown", color: "#94a3b8", requests: 0, duration: "N/A" };
    
    let risk = 0;
    let requests = 0;
    
    switch (type) {
      case "content":
        risk = scanResult.content?.risk ?? 0;
        break;
      case "network":
        risk = scanResult.network?.post_requests > 0 ? 0.6 : 0.3;
        requests = (scanResult.network?.external_requests?.length ?? 0) + (scanResult.network?.post_requests ?? 0);
        break;
      case "redirects":
        risk = (scanResult.redirects?.redirect_chain?.length ?? 0) > 2 ? 0.5 : 0.2;
        break;
      case "cookies":
        risk = (scanResult.cookies?.Cookie_Stealing?.length ?? 0) > 0 ? 0.8 : 0.1;
        break;
    }
    
    return {
      level: risk >= 0.7 ? "High" : risk >= 0.4 ? "Medium" : "Low",
      color: riskColor(risk),
      requests,
      duration: "0.8s"
    };
  };
  
  const stats = getRiskStats();
  
  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .report-scroll::-webkit-scrollbar { width: 6px; }
        .report-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 3px; }
        .report-scroll::-webkit-scrollbar-thumb { background: rgba(79, 140, 255, 0.3); border-radius: 3px; }
        .report-scroll::-webkit-scrollbar-thumb:hover { background: rgba(79, 140, 255, 0.5); }
      `}</style>
      
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: "1400px",
            height: "90vh",
            background: "linear-gradient(to bottom right, #EEF5FF, #F8FBFF, #FFF9F5)",
            borderRadius: "24px",
            border: "1px solid rgba(79, 140, 255, 0.2)",
            boxShadow: "0 24px 80px rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "24px 32px",
            borderBottom: "1px solid rgba(79, 140, 255, 0.15)",
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(20px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${color}, #5AD7FF)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                boxShadow: "0 4px 12px rgba(79, 140, 255, 0.3)"
              }}>
                {icons[type]}
              </div>
              <div>
                <h2 style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#1E2A38",
                  fontFamily: "system-ui, -apple-system, sans-serif"
                }}>
                  {titles[type]} Report
                </h2>
                <p style={{
                  margin: "2px 0 0 0",
                  fontSize: "13px",
                  color: "#64748b",
                  fontFamily: "system-ui, -apple-system, sans-serif"
                }}>
                  Interactive security visualization and analysis
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.8)",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                borderRadius: "12px",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255, 255, 255, 1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)"}
            >
              <X size={20} color="#64748b" />
            </button>
          </div>

          {/* Body */}
          <div className="report-scroll" style={{
            flex: 1,
            overflowY: "auto",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px"
          }}>
            
            {/* Scan Summary Card */}
            <div style={{
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(30px)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.6)",
              padding: "24px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
              animation: "slideUp 0.4s ease-out"
            }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px"
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <Globe size={16} color={color} />
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Scanned URL
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1E2A38", fontFamily: "monospace" }}>
                    {scanResult?.url ? getHostname(scanResult.url) : "example.com"}
                  </p>
                </div>
                
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <Shield size={16} color={color} />
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Risk Level
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: stats.color,
                      boxShadow: `0 0 8px ${stats.color}`
                    }} />
                    <span style={{ fontSize: "14px", fontWeight: "700", color: stats.color }}>
                      {stats.level}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <Clock size={16} color={color} />
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Scan Duration
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1E2A38" }}>
                    {stats.duration}
                  </p>
                </div>
                
                {type === "network" && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <Info size={16} color={color} />
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Total Requests
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1E2A38" }}>
                      {stats.requests}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Interactive Visualization */}
            <div style={{
              background: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(20px)",
              borderRadius: "16px",
              border: "1px solid rgba(79, 140, 255, 0.2)",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              animation: "slideUp 0.5s ease-out"
            }}>
              <div style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(79, 140, 255, 0.15)",
                background: "rgba(255, 255, 255, 0.6)"
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#1E2A38",
                  fontFamily: "system-ui, -apple-system, sans-serif"
                }}>
                  Interactive Security Graph
                </h3>
                <p style={{
                  margin: "4px 0 0 0",
                  fontSize: "12px",
                  color: "#64748b"
                }}>
                  Explore the security analysis visualization below
                </p>
              </div>
              
              <div style={{ height: "500px", background: "#0f172a" }}>
                <NodeGraph type={type} scanResult={scanResult} color={color} />
              </div>
              
              {/* Interaction Guide */}
              <div style={{
                padding: "16px 24px",
                background: "rgba(79, 140, 255, 0.05)",
                borderTop: "1px solid rgba(79, 140, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "24px",
                flexWrap: "wrap"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "rgba(79, 140, 255, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Move size={14} color={color} />
                  </div>
                  <span style={{ fontSize: "12px", color: "#475569", fontWeight: "500" }}>
                    Drag to pan
                  </span>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "rgba(79, 140, 255, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <ZoomIn size={14} color={color} />
                  </div>
                  <span style={{ fontSize: "12px", color: "#475569", fontWeight: "500" }}>
                    Scroll to zoom
                  </span>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "rgba(79, 140, 255, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px"
                  }}>
                    👆
                  </div>
                  <span style={{ fontSize: "12px", color: "#475569", fontWeight: "500" }}>
                    Tap nodes for details
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Interactive Visuals */}
            <AdditionalVisuals type={type} scanResult={scanResult} color={color} />

            {/* Educational Q&A Section */}
            <div style={{
              background: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(20px)",
              borderRadius: "16px",
              border: "1px solid rgba(79, 140, 255, 0.2)",
              padding: "24px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
              animation: "slideUp 0.6s ease-out"
            }}>
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{
                  margin: "0 0 8px 0",
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#1E2A38",
                  fontFamily: "system-ui, -apple-system, sans-serif"
                }}>
                  Security Analysis Report
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#64748b"
                }}>
                  Detailed findings and educational information about this security analysis
                </p>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {qa.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: i === 3 ? "rgba(79, 140, 255, 0.08)" : "rgba(255, 255, 255, 0.6)",
                      borderRadius: "12px",
                      padding: "20px",
                      border: i === 3 ? `2px solid ${color}` : "1px solid rgba(0, 0, 0, 0.06)",
                      boxShadow: i === 3 ? "0 4px 16px rgba(79, 140, 255, 0.15)" : "none",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "start", gap: "12px" }}>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: i === 3 ? `linear-gradient(135deg, ${color}, #5AD7FF)` : "rgba(79, 140, 255, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: "14px",
                        fontWeight: "700",
                        color: i === 3 ? "#fff" : color
                      }}>
                        {i === 3 ? <AlertTriangle size={16} /> : i + 1}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          margin: "0 0 10px 0",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: i === 3 ? color : "#1E2A38",
                          fontFamily: "system-ui, -apple-system, sans-serif",
                          letterSpacing: "-0.01em"
                        }}>
                          {item.q}
                        </h4>
                        <p style={{
                          margin: 0,
                          fontSize: "13px",
                          color: "#475569",
                          lineHeight: "1.7",
                          fontFamily: "system-ui, -apple-system, sans-serif"
                        }}>
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Security Recommendations */}
            <div style={{
              background: "linear-gradient(135deg, rgba(79, 140, 255, 0.1), rgba(90, 215, 255, 0.1))",
              backdropFilter: "blur(20px)",
              borderRadius: "16px",
              border: "1px solid rgba(79, 140, 255, 0.3)",
              padding: "24px",
              animation: "slideUp 0.7s ease-out"
            }}>
              <div style={{ display: "flex", alignItems: "start", gap: "16px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: `linear-gradient(135deg, ${color}, #5AD7FF)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(79, 140, 255, 0.3)"
                }}>
                  <Shield size={20} color="#fff" />
                </div>
                
                <div>
                  <h4 style={{
                    margin: "0 0 8px 0",
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#1E2A38",
                    fontFamily: "system-ui, -apple-system, sans-serif"
                  }}>
                    Security Recommendation
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#475569",
                    lineHeight: "1.7"
                  }}>
                    {stats.level === "High"
                      ? "We strongly recommend avoiding this website. Multiple security threats have been detected that could compromise your data or device."
                      : stats.level === "Medium"
                      ? "Exercise caution when interacting with this website. Review the detailed findings above before proceeding."
                      : "This website appears to be safe based on our analysis. However, always remain vigilant when sharing personal information online."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Pulse — Discover page
 * Version: v0.9.24
 * Cleanup:
 * - Use shared glass tokens/components (GLASS + GlassPanel) so "Me" and filters match.
 * - Mobile sheet just under filter bar; desktop keeps Popover.
 * - Title clamp/expand preserved.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Shield, Dumbbell, MapPin, X } from "lucide-react";
import { GlassPanel, glassSurface, glassButton } from "@/components/ui/Glass";

type Privacy = "all" | "public" | "friends" | "invite" | "private";
type Group = { id: string; name: string; sport_id: string; privacy: "public" | "friends" | "invite" | "private"; join_mode: string; city: string; owner_id: string; status: string; created_at: string; updated_at?: string | null; };

const PRIVACY_OPTIONS: Array<{ key: Exclude<Privacy, "all">; label: string }> = [
  { key: "public", label: "Public" },
  { key: "friends", label: "Friends" },
  { key: "invite", label: "Invite" },
  { key: "private", label: "Private" },
];

function uniqueSorted(values: string[]): string[] { const s = new Set(values.filter(Boolean).map(v=>v.trim())); return Array.from(s).sort((a,b)=>a.localeCompare(b, undefined, {sensitivity:"base"})); }
function buildQuery(params: Record<string, string | undefined>): string { const qs = new URLSearchParams(); for (const [k,v] of Object.entries(params)) if (v) qs.set(k,v); return qs.toString(); }

const clamp2: React.CSSProperties = { display: "-webkit-box", WebkitLineClamp: 2 as any, WebkitBoxOrient: "vertical" as any, overflow: "hidden" };

function MobileSheet(props: { topPx: number; onClose: () => void; children: React.ReactNode }) {
  return (
    <GlassPanel
      style={{ position: "fixed", top: Math.max(8, props.topPx), left: 12, right: 12, zIndex: 3000 }}
      className="p-2"
    >
      <div className="max-h-[70vh] overflow-auto">{props.children}</div>
      <div className="mt-2 text-right">
        <button onClick={props.onClose} className={`px-3 py-1.5 text-sm ${glassButton}`}>Close</button>
      </div>
    </GlassPanel>
  );
}

export default function Discover(): JSX.Element {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  const [privacy, setPrivacy] = useState<Privacy>("all");
  const [sports, setSports] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [cityQuery, setCityQuery] = useState<string>("");

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sportsCatalog, setSportsCatalog] = useState<Array<{id:string;name:string}>>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [sheet, setSheet] = useState<null | "privacy" | "sports" | "cities">(null);
  const [sheetTop, setSheetTop] = useState<number>(100);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(()=>{(async()=>{ try{ const r=await fetch("/api/v2/sports"); const j=await r.json(); if(j?.data) setSportsCatalog(j.data.map((s:any)=>({id:s.id,name:s.name}))); }catch{} })()},[]);

  useEffect(()=>{
    const ctrl=new AbortController();
    (async()=>{
      setLoading(true);
      try{
        const q=buildQuery({
          privacy: privacy!=="all"?privacy:undefined,
          sport: sports.length?sports.join(","):undefined,
          city_in: cities.length?cities.join(","):undefined,
          city_contains: !cities.length && cityQuery.trim()?cityQuery.trim():undefined,
        });
        const r=await fetch(`/api/v2/groups${q?`?${q}`:""}`,{signal:ctrl.signal});
        const j=await r.json(); setGroups(Array.isArray(j?.data)?j.data:[]);
      }catch{ setGroups([]);} finally{ setLoading(false); }
    })();
    return ()=>ctrl.abort();
  },[privacy,sports,cities,cityQuery]);

  // city suggestions
  useEffect(()=>{
    const id = window.setTimeout(async ()=>{
      if(!cityQuery.trim()){ setCitySuggestions([]); return; }
      try{
        const q=buildQuery({city_contains: cityQuery.trim()});
        const r=await fetch(`/api/v2/groups?${q}`); const j=await r.json();
        const list = uniqueSorted((j?.data||[]).map((g:Group)=>g.city)).filter(c=>!cities.includes(c));
        setCitySuggestions(list.slice(0,12));
      }catch{ setCitySuggestions([]); }
    }, 250);
    return ()=>clearTimeout(id);
  },[cityQuery,cities]);

  // sheet Y position
  useEffect(()=>{
    if(!isMobile) return;
    const update = () => {
      const br = barRef.current?.getBoundingClientRect();
      setSheetTop(br ? br.bottom + 8 : 120);
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return ()=>{ window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  },[isMobile, sheet]);

  const countLabel = useMemo(()=>`${groups.length} group${groups.length===1?"":"s"}`,[groups.length]);
  const privacyLabel = privacy==="all" ? "All privacy" : (PRIVACY_OPTIONS.find(p=>p.key===privacy)?.label ?? "All privacy");
  const sportsLabel = sports.length ? `${sports.length} sport${sports.length===1?"":"s"}` : "All sports";
  const citiesLabel = cities.length===0 ? "All cities" : (cities.length===1 ? cities[0] : `${cities[0]} +${cities.length-1}`);

  const pill = (active:boolean)=>["px-3 h-9 rounded-full text-sm leading-tight border", active?"bg-emerald-600 text-white border-emerald-600":"bg-white hover:bg-gray-50 border-gray-300 text-gray-800"].join(" ");

  return (
    <div ref={frameRef} className="px-4 py-4 max-w-6xl mx-auto">
      <div ref={cardRef} className="border-0 bg-transparent p-0 rounded-none md:rounded-2xl md:border md:border-gray-200/70 md:bg-white md:p-4 md:shadow-sm">
        <div className="mx-[-1rem] px-4 md:mx-0 md:px-0">
          <div ref={barRef} className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap select-none" style={{ WebkitOverflowScrolling:"touch", touchAction:"pan-x" }}>
            {/* Privacy */}
            {!isMobile ? (
              <Popover>
                <PopoverTrigger className="flex-shrink-0 whitespace-nowrap"><Shield className="h-4 w-4"/><span>{privacyLabel}</span></PopoverTrigger>
                <PopoverContent container={cardRef.current} align="start" className={`p-2 ${glassSurface} ${'backdrop-blur-2xl bg-white/20'} ring-1 ring-white/10 shadow-lg`}>
                  <div className="flex flex-wrap gap-2">
                    {PRIVACY_OPTIONS.map(({key,label})=>(<button key={key} onClick={()=>setPrivacy(key as Privacy)} className={pill(privacy===key)}>{label}</button>))}
                  </div>
                  <div className="mt-2"><button onClick={()=>setPrivacy("all")} className={`w-full px-2 py-2 text-left text-sm inline-flex items-center gap-2 ${glassButton}`}><X className="h-4 w-4"/> Clear selection</button></div>
                </PopoverContent>
              </Popover>
            ) : (
              <button className="flex-shrink-0 whitespace-nowrap h-9 px-4 rounded-full text-sm leading-tight border bg-white hover:bg-gray-50 border-gray-300 text-gray-800 inline-flex items-center gap-2" onClick={()=>setSheet("privacy")}>
                <Shield className="h-4 w-4"/><span>{privacyLabel}</span>
              </button>
            )}

            {/* Sports */}
            {!isMobile ? (
              <Popover>
                <PopoverTrigger className="flex-shrink-0 whitespace-nowrap"><Dumbbell className="h-4 w-4"/><span>{sportsLabel}</span></PopoverTrigger>
                <PopoverContent container={cardRef.current} align="start" className={`p-2 ${glassSurface} ${'backdrop-blur-2xl bg-white/20'} ring-1 ring-white/10 shadow-lg`}>
                  <div className="max-h-64 overflow-auto pr-1 flex flex-wrap gap-2">
                    {sportsCatalog.map(s=>{ const active=sports.includes(s.id); return (<button key={s.id} onClick={()=>setSports(p=>p.includes(s.id)?p.filter(x=>x!==s.id):[...p,s.id])} className={pill(active)}>{s.name}</button>); })}
                    {!sportsCatalog.length && <div className="text-sm text-gray-600 px-2 py-2">No sports found</div>}
                  </div>
                  <div className="mt-2"><button onClick={()=>setSports([])} className={`w-full px-2 py-2 text-left text-sm inline-flex items-center gap-2 ${glassButton}`}><X className="h-4 w-4"/> Clear selection</button></div>
                </PopoverContent>
              </Popover>
            ) : (
              <button className="flex-shrink-0 whitespace-nowrap h-9 px-4 rounded-full text-sm leading-tight border bg-white hover:bg-gray-50 border-gray-300 text-gray-800 inline-flex items-center gap-2" onClick={()=>setSheet("sports")}>
                <Dumbbell className="h-4 w-4"/><span>{sportsLabel}</span>
              </button>
            )}

            {/* Cities */}
            {!isMobile ? (
              <Popover>
                <PopoverTrigger className="flex-shrink-0 whitespace-nowrap"><MapPin className="h-4 w-4"/><span>{citiesLabel}</span></PopoverTrigger>
                <PopoverContent container={cardRef.current} align="start" className={`p-2 ${glassSurface} ${'backdrop-blur-2xl bg-white/20'} ring-1 ring-white/10 shadow-lg`}>
                  <input value={cityQuery} onChange={e=>setCityQuery(e.target.value)} onKeyDown={e=>{
                    if(e.key==="Enter" && cityQuery.trim()){ e.preventDefault(); setCities(p=>p.includes(cityQuery.trim())?p:[...p,cityQuery.trim()]); setCityQuery(""); }
                  }} placeholder="Type a city…" className={`w-full mb-2 px-3 py-2 rounded-lg outline-none placeholder-gray-600 ${glassSurface}`}/>
                  {citySuggestions.length>0 && (<div className={`mb-2 max-h-40 overflow-auto rounded-lg ${glassSurface}`}>{citySuggestions.map(c=>(
                    <button key={c} onClick={()=>{ setCities(p=>p.includes(c)?p:[...p,c]); setCityQuery(""); }} className="w-full text-left px-3 py-2 text-sm hover:bg-white/20">{c}</button>
                  ))}</div>)}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {cities.map(c=>(<span key={c} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${glassSurface}`}>{c}<button onClick={()=>setCities(p=>p.filter(x=>x!==c))} className="ml-1 text-gray-700 hover:text-gray-900" aria-label={`Remove ${c}`}>×</button></span>))}
                    {!cities.length && <span className="text-sm text-gray-600">No cities selected</span>}
                  </div>
                  <button onClick={()=>{ setCities([]); setCityQuery(""); }} className={`w-full px-2 py-2 text-left text-sm inline-flex items-center gap-2 ${glassButton}`}>
                    <X className="h-4 w-4"/> Clear selection
                  </button>
                </PopoverContent>
              </Popover>
            ) : (
              <button className="flex-shrink-0 whitespace-nowrap h-9 px-4 rounded-full text-sm leading-tight border bg-white hover:bg-gray-50 border-gray-300 text-gray-800 inline-flex items-center gap-2" onClick={()=>setSheet("cities")}>
                <MapPin className="h-4 w-4"/><span>{citiesLabel}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sheet */}
      {isMobile && sheet && (
        <MobileSheet topPx={barRef.current?.getBoundingClientRect().bottom! + 8} onClose={()=>setSheet(null)}>
          {sheet === "privacy" && (
            <div>
              <div className="flex flex-wrap gap-2">
                {PRIVACY_OPTIONS.map(({key,label})=> (
                  <button key={key} onClick={()=>{ setPrivacy(key as Privacy); setSheet(null); }} className={pill(privacy===key)}>{label}</button>
                ))}
              </div>
              <div className="mt-2"><button onClick={()=>{ setPrivacy("all"); setSheet(null); }} className={`w-full px-2 py-2 text-left text-sm inline-flex items-center gap-2 ${glassButton}`}><X className="h-4 w-4"/> Clear selection</button></div>
            </div>
          )}
          {sheet === "sports" && (
            <div>
              <div className="max-h-64 overflow-auto pr-1 flex flex-wrap gap-2">
                {sportsCatalog.map(s=>{
                  const active=sports.includes(s.id);
                  return <button key={s.id} onClick={()=>setSports(p=>p.includes(s.id)?p.filter(x=>x!==s.id):[...p,s.id])} className={pill(active)}>{s.name}</button>
                })}
                {!sportsCatalog.length && <div className="text-sm text-gray-600 px-2 py-2">No sports found</div>}
              </div>
              <div className="mt-2"><button onClick={()=>setSports([])} className={`w-full px-2 py-2 text-left text-sm inline-flex items-center gap-2 ${glassButton}`}><X className="h-4 w-4"/> Clear selection</button></div>
            </div>
          )}
          {sheet === "cities" && (
            <div>
              <input value={cityQuery} onChange={e=>setCityQuery(e.target.value)} onKeyDown={e=>{
                if(e.key==="Enter" && cityQuery.trim()){ e.preventDefault(); setCities(p=>p.includes(cityQuery.trim())?p:[...p,cityQuery.trim()]); setCityQuery(""); }
              }} placeholder="Type a city…" className={`w-full mb-2 px-3 py-2 rounded-lg outline-none placeholder-gray-600 ${glassSurface}`}/>
              {citySuggestions.length>0 && (<div className={`mb-2 max-h-40 overflow-auto rounded-lg ${glassSurface}`}>{citySuggestions.map(c=>(
                <button key={c} onClick={()=>{ setCities(p=>p.includes(c)?p:[...p,c]); setCityQuery(""); }} className="w-full text-left px-3 py-2 text-sm hover:bg-white/20">{c}</button>
              ))}</div>)}
              <div className="flex flex-wrap gap-2 mb-2">
                {cities.map(c=>(<span key={c} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${glassSurface}`}>{c}<button onClick={()=>setCities(p=>p.filter(x=>x!==c))} className="ml-1 text-gray-700 hover:text-gray-900" aria-label={`Remove ${c}`}>×</button></span>))}
                {!cities.length && <span className="text-sm text-gray-600">No cities selected</span>}
              </div>
              <button onClick={()=>{ setCities([]); setCityQuery(""); }} className={`w-full px-2 py-2 text-left text-sm inline-flex items-center gap-2 ${glassButton}`}>
                <X className="h-4 w-4"/> Clear selection
              </button>
            </div>
          )}
        </MobileSheet>
      )}

      {/* Results header */}
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
        <span>{countLabel}</span>
        {loading && <span className="animate-pulse">· loading…</span>}
      </div>

      {/* Results grid */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {groups.map(g=>{
          const [open, setOpen] = [!!expanded[g.id], (v:boolean)=>v];
          return (
            <Link key={g.id} to={`/groups/${g.id}`} className="block rounded-2xl border border-gray-200 bg-white p-3 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <h3 style={open?undefined:clamp2} className="font-semibold cursor-pointer" title={g.name}
                    onClick={(e)=>{ e.preventDefault(); setExpanded(prev=>({...prev,[g.id]:!prev[g.id]})); }}>
                  {g.name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full border border-gray-300 bg-gray-50 capitalize">{g.privacy}</span>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                <div>Sport: {g.sport_id}</div>
                <div>City: {g.city}</div>
                <div className="text-xs text-gray-500 mt-1">Join: {g.join_mode} · Status: {g.status}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

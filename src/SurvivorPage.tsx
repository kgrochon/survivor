import { useEffect, useMemo, useState } from "react";
import SeasonsView from "./views/SeasonsView";
import ConnectionsView from "./views/ConnectionsView";
import JourneysView from "./views/JourneysView";
import TwistsView from "./views/TwistsView";
import { castData } from "./data/cast";
import { twists } from "./data/twists";
import { eliminated } from "./data/connections";
import logoUrl from "./img/survivor-50-logo.png";
import castPhotoUrl from "./img/cast-photo.jpg";
import DashboardView from "./views/DashboardView";

interface Section {
  id: string;
  label: string;
}

const SECTIONS: Section[] = [
  { id: "twists", label: "Twists" },
  { id: "cast", label: "Cast" },
  { id: "connections", label: "Connections" },
  { id: "journeys", label: "Journeys" },
];

function useActiveSection(): string {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (n): n is HTMLElement => n !== null,
    );
    if (nodes.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top of the viewport that's intersecting.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
    );
    nodes.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, []);

  return active;
}

export default function SurvivorPage() {
  const activeSection = useActiveSection();

  const stats = useMemo(() => {
    const eliminatedIds = new Set(eliminated.map((e) => e.id));
    const winner = castData.find((p) => !eliminatedIds.has(p.id));
    return {
      castaways: castData.length,
      twists: twists.length,
      winner: winner ? winner.name.split(" ")[0] : "—",
      prize: "$2M",
    };
  }, []);

  return (
    <div className="s50-app">
      <DashboardView />
{/* 
      <main id="top">
        <section className="s50-hero">
          <div className="s50-hero-inner">
            <div className="s50-hero-content">
              <div className="s50-hero-eyebrow">Day 13 of 26</div>
              <h1 className="s50-hero-title">
                <img
                  src={logoUrl}
                  alt="Survivor 50 — In the Hands of the Fans"
                  className="s50-hero-logo"
                />
              </h1>

              <div className="s50-hero-meta">
                <div className="s50-hero-stat">
                  <span className="s50-hero-stat-num">{stats.castaways}</span>
                  <span className="s50-hero-stat-label">Castaways</span>
                </div>
                <div className="s50-hero-stat">
                  <span className="s50-hero-stat-num">{stats.twists}</span>
                  <span className="s50-hero-stat-label">Audience twists</span>
                </div>
                <div className="s50-hero-stat">
                  <span className="s50-hero-stat-num">{stats.prize}</span>
                  <span className="s50-hero-stat-label">Prize pool</span>
                </div>
                <div className="s50-hero-stat">
                  <span className="s50-hero-stat-num">{stats.winner}</span>
                  <span className="s50-hero-stat-label">Sole Survivor</span>
                </div>
              </div>
            </div>

            <figure className="s50-hero-photo">
              <img
                src={castPhotoUrl}
                alt="The 25 returning castaways of Survivor 50 on a Fijian beach"
                className="s50-hero-photo-img"
                loading="eager"
                decoding="async"
              />
            </figure>
          </div>
        </section>

        <section className="s50-section" id="twists">
          <TwistsView />
        </section>

        <section className="s50-section" id="cast">
          <div className="s50-section-head">
            <div>
              <div className="s50-section-eyebrow">Returning players</div>
              <h2 className="s50-section-title">The Cast</h2>
            </div>
            <p className="s50-section-lede">
              Twenty-five returnees spanning every era of the show, grouped by
              the season they first lit a torch. Click a player to trace
              their full Survivor lineage.
            </p>
          </div>
          <SeasonsView />
        </section>

        <section className="s50-section" id="connections">
          <div className="s50-section-head">
            <div>
              <div className="s50-section-eyebrow">Shared history</div>
              <h2 className="s50-section-title">Connections</h2>
            </div>
            <p className="s50-section-lede">
              Who has already played with whom. The bigger the network, the
              older the friendships — and the older the grudges.
            </p>
          </div>
          <ConnectionsView />
        </section>

        <section className="s50-section" id="journeys">
          <div className="s50-section-head">
            <div>
              <div className="s50-section-eyebrow">Season retrospective</div>
              <h2 className="s50-section-title">How it Ended</h2>
            </div>
            <p className="s50-section-lede">
              Boots and medevacs in the order they happened, capped by the
              sole survivor. Card color is the tribe a player was on when
              they left the game.
            </p>
          </div>
          <JourneysView />
        </section>

        <footer className="s50-footer">
          <div className="s50-footer-inner">
            <span>Survivor 50 · In the Hands of the Fans</span>
            <span className="s50-footer-dot" aria-hidden>
              ·
            </span>
            <span>An unofficial fan dashboard</span>
          </div>
        </footer>
      </main> */}
    </div> 
  );
}

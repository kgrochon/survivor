import { useState } from "react";
import SeasonsView from "./views/SeasonsView";
import ConnectionsView from "./views/ConnectionsView";
import JourneysView from "./views/JourneysView";

type ChartView = "seasons" | "connections" | "evolution";

export default function SurvivorPage() {
  const [activeChart, setActiveChart] = useState<ChartView>("seasons");
  const [spoilersEnabled, setSpoilersEnabled] = useState(false);

  return (
    <div className="survivor-app">
      <div className="survivor-header">
        <h1 className="survivor-title">SURVIVOR</h1>
        <div className="survivor-subtitle">
          Season 50 · In the Hands of the Fans
        </div>
      </div>

      <div className="survivor-nav-row">
        <div className="survivor-spoiler-wrap">
          <span className="survivor-spoiler-label" id="survivor-spoilers-label">
            Show elimination spoilers
          </span>
          <button
            type="button"
            className={`survivor-spoiler-switch ${spoilersEnabled ? "is-on" : ""}`}
            role="switch"
            aria-checked={spoilersEnabled}
            aria-labelledby="survivor-spoilers-label"
            onClick={() => {
              setSpoilersEnabled((v) => {
                const next = !v;
                if (!next) {
                  setActiveChart((c) => (c === "evolution" ? "seasons" : c));
                }
                return next;
              });
            }}
          >
            <span className="survivor-spoiler-thumb" aria-hidden />
          </button>
        </div>

        <div className="survivor-nav">
          <button
            type="button"
            className={`survivor-nav-button ${activeChart === "seasons" ? "active" : ""}`}
            onClick={() => setActiveChart("seasons")}
          >
            Season View
          </button>
          <button
            type="button"
            className={`survivor-nav-button ${activeChart === "connections" ? "active" : ""}`}
            onClick={() => setActiveChart("connections")}
          >
            Connections
          </button>
          <button
            type="button"
            className={`survivor-nav-button ${activeChart === "evolution" ? "active" : ""}`}
            disabled={!spoilersEnabled}
            title={
              !spoilersEnabled
                ? "Enable spoilers to view elimination order"
                : undefined
            }
            onClick={() => setActiveChart("evolution")}
          >
            Individual Journeys
          </button>
        </div>
      </div>

      <div className="survivor-content">
        {activeChart === "seasons" && (
          <SeasonsView showSpoilers={spoilersEnabled} />
        )}
        {activeChart === "connections" && (
          <ConnectionsView showSpoilers={spoilersEnabled} />
        )}
        {activeChart === "evolution" && spoilersEnabled && <JourneysView />}
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { castData } from "../data/cast";
import {
  productionMembers,
  twists,
  type ProductionMember,
  type Twist,
} from "../data/twists";
import { findEliminationRecord } from "../data/connections";
import { handleImageError } from "../lib/imageFallback";
import "./styles/twists.css";

interface CastAvatar {
  id: string;
  name: string;
  photo: string;
  kind: "player" | "production";
  eliminatedHere?: boolean;
}

function buildLookup() {
  const players = new Map<string, { name: string; photo: string }>();
  castData.forEach((p) => players.set(p.id, { name: p.name, photo: p.photo }));
  const production = new Map<string, ProductionMember>();
  productionMembers.forEach((m) => production.set(m.id, m));
  return { players, production };
}

function resolveAvatars(
  ids: string[],
  episode: number,
  lookup: ReturnType<typeof buildLookup>,
): CastAvatar[] {
  return ids
    .map<CastAvatar | null>((id) => {
      const player = lookup.players.get(id);
      if (player) {
        const elim = findEliminationRecord(id);
        return {
          id,
          name: player.name,
          photo: player.photo,
          kind: "player",
          eliminatedHere: elim?.episode === episode,
        };
      }
      const prod = lookup.production.get(id);
      if (prod) {
        return {
          id,
          name: prod.name,
          photo: prod.photo,
          kind: "production",
        };
      }
      if (import.meta.env.DEV) {
        console.warn(`twists: unknown involved-cast id "${id}"`);
      }
      return null;
    })
    .filter((x): x is CastAvatar => x !== null);
}

interface TwistCardProps {
  twist: Twist;
  lookup: ReturnType<typeof buildLookup>;
}

function TwistCard({ twist, lookup }: TwistCardProps) {
  const avatars = resolveAvatars(twist.involvedCast, twist.episode, lookup);

  return (
    <article className="twist-card" tabIndex={0}>
      {/* Compact face: SVG as focal point */}
      <div className="twist-card-face">
        <span className="twist-card-ep" aria-hidden>
          EP {twist.episode.toString().padStart(2, "0")}
        </span>
        <div className="twist-card-art">
          <div className="twist-card-art-glow" aria-hidden />
          <img
            src={twist.svgImage}
            alt=""
            className="twist-card-art-img"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="twist-card-caption">
          <span className="twist-card-caption-ep">
            Episode {twist.episode}
          </span>
          <span className="twist-card-caption-title">{twist.title}</span>
        </div>
      </div>

      {/* Hover face: full detail overlay */}
      <div className="twist-card-detail" aria-hidden="true">
        <div className="twist-card-detail-meta">
          <span className="twist-card-detail-ep">
            EP {twist.episode.toString().padStart(2, "0")}
          </span>
          <span className="twist-card-detail-tag">Twist</span>
        </div>
        <h3 className="twist-card-detail-title">{twist.title}</h3>
        <p className="twist-card-detail-mechanic">{twist.mechanic}</p>
        {avatars.length > 0 && (
          <div className="twist-card-detail-cast">
            {avatars.map((avatar) => (
              <div
                key={avatar.id}
                className={`twist-avatar twist-avatar--${avatar.kind} ${
                  avatar.eliminatedHere ? "is-eliminated-here" : ""
                }`}
                title={avatar.name}
              >
                <div className="twist-avatar-photo">
                  {avatar.photo ? (
                    <img
                      src={avatar.photo}
                      alt={avatar.name}
                      loading="lazy"
                      decoding="async"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="twist-avatar-fallback" aria-hidden>
                      {avatar.name
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((p) => p[0])
                        .join("")}
                    </div>
                  )}
                </div>
                {avatar.kind === "production" && (
                  <div className="twist-avatar-badge" aria-hidden>
                    GUEST
                  </div>
                )}
                {avatar.eliminatedHere && (
                  <div
                    className="twist-avatar-badge twist-avatar-badge--out"
                    aria-hidden
                  >
                    OUT
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default function TwistsView() {
  const lookup = useMemo(buildLookup, []);
  const ordered = useMemo(
    () => [...twists].sort((a, b) => a.episode - b.episode),
    [],
  );

  return (
    <div className="twists-grid">
      {ordered.map((twist) => (
        <TwistCard key={twist.id} twist={twist} lookup={lookup} />
      ))}
    </div>
  );
}

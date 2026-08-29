// ============================================================
// BlockMind — Play Page (wraps GameScreen with mode from URL)
// ============================================================

import { useSearchParams, useNavigate } from "react-router";
import { GameScreen } from "@/components/game/GameScreen";
import type { GameMode } from "@/game/types";

export default function PlayPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const modeParam = searchParams.get("mode") || "endless";
  const mode: GameMode =
    modeParam === "daily" || modeParam === "zen" ? modeParam : "endless";

  return <GameScreen mode={mode} onBack={() => navigate("/dashboard")} />;
}

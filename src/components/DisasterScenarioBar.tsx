import React from 'react';
import type { DisasterCategory, DisasterScenario } from '../types';
import { DISASTER_SCENARIOS } from '../services/disasterData';
import {
  Droplets,
  Wind,
  Activity,
  Flame,
  Snowflake,
  WifiOff,
  AlertTriangle,
  MoveRight,
} from 'lucide-react';

interface DisasterScenarioBarProps {
  currentScenario: DisasterScenario;
  onSelectScenario: (scenario: DisasterScenario) => void;
  isCellTowerDown: boolean;
  onToggleCellBlackout: () => void;
  onTriggerMovementSimulation: () => void;
}

export const DisasterScenarioBar: React.FC<DisasterScenarioBarProps> = ({
  currentScenario,
  onSelectScenario,
  isCellTowerDown,
  onToggleCellBlackout,
  onTriggerMovementSimulation,
}) => {
  const getIcon = (id: DisasterCategory) => {
    switch (id) {
      case 'FLASH_FLOOD':
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'CYCLONE_HURRICANE':
        return <Wind className="w-4 h-4 text-sky-400" />;
      case 'EARTHQUAKE':
        return <Activity className="w-4 h-4 text-amber-400" />;
      case 'WILDFIRE':
        return <Flame className="w-4 h-4 text-rose-400" />;
      case 'WINTER_BLIZZARD':
        return <Snowflake className="w-4 h-4 text-indigo-300" />;
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Disaster Scenario Simulation Engine
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Cellular Blackout Simulation Button */}
          <button
            onClick={onToggleCellBlackout}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-semibold border transition-all ${
              isCellTowerDown
                ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title="Toggle simulated regional cellular tower blackout"
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span>Cellular Status: {isCellTowerDown ? 'TOTAL BLACKOUT' : 'Online'}</span>
          </button>

          {/* Trigger Safe-Zone Entrance Simulation */}
          <button
            onClick={onTriggerMovementSimulation}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/80 text-emerald-300 text-xs font-semibold shadow transition-colors"
            title="Simulate Sarah advancing into the Summit Hill Safe Zone to trigger Geofence Auto-Alert"
          >
            <MoveRight className="w-3.5 h-3.5" />
            <span>Simulate Safe-Zone Geofence Alert</span>
          </button>
        </div>
      </div>

      {/* Scenario Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
        {DISASTER_SCENARIOS.map((scenario) => {
          const isActive = currentScenario.id === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                isActive
                  ? 'bg-slate-800 border-sky-500 shadow-md ring-1 ring-sky-500/40 text-slate-100'
                  : 'bg-slate-950/50 hover:bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="shrink-0">{getIcon(scenario.id)}</div>
              <div className="min-w-0">
                <span className="block text-xs font-bold truncate">{scenario.title.split('&')[0]}</span>
                <span className="block text-[10px] text-slate-500 truncate">
                  {scenario.id === 'CYCLONE_HURRICANE' ? 'Wind / Grid' : scenario.id === 'EARTHQUAKE' ? 'Cables / Collapse' : scenario.id === 'FLASH_FLOOD' ? 'Rising Water' : scenario.id === 'WILDFIRE' ? 'PSPS Shutoff' : 'Ice / Isolation'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Current Scenario Problem & ResQ-Mesh Tactic Briefing */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
            The Infrastructure Problem:
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed">{currentScenario.problem}</p>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
            How ResQ-Mesh Solves It:
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed">{currentScenario.solutionTactic}</p>
        </div>
      </div>
    </div>
  );
};

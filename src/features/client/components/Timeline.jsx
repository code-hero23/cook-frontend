import React from "react";

const Timeline = ({ tasks, compact }) => {
  const isMobile = window.innerWidth < 768;
  const useCompact = compact || isMobile;

  const formatDateTime = (d) =>
    new Date(d).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const getStatusIcon = (status) => {
    if (status === "completed") {
      return (
        <div className="tick-wrapper">
          <svg
            className="tick-svg"
            width="38"
            height="38"
            viewBox="0 0 50 50"
            fill="none"
          >
            <path
              className="tick-path"
              d="M14 26 L22 34 L36 16"
              stroke="#16a34a"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );
    }

    return (
      <div className="warn-wrapper">
        <svg
          className="warn-svg"
          width="38"
          height="38"
          viewBox="0 0 50 50"
          fill="none"
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="rgba(234,88,12,0.12)"
            className="warn-circle"
          />
          <line
            x1="25"
            y1="13"
            x2="25"
            y2="30"
            stroke="#ea580c"
            strokeWidth="5"
            strokeLinecap="round"
            className="warn-line"
          />
          <circle cx="25" cy="37" r="3" fill="#ea580c" className="warn-dot" />
        </svg>
      </div>
    );
  };


  const stages = [
    "Freezing Mail",
    "Approval of finalized designs",
    "Production",
    "Installation",
  ];

  const renderTask = (task, i) => {
    const start = new Date();
    start.setDate(start.getDate() + i);
    start.setHours(10, 0);

    return (
      <div
        key={task.id}
        className="flex items-center gap-3 mb-4 last:mb-0 animate-slide-up"
        style={{ animationDelay: `${i * 0.1}s` }}
      >
        <div className="flex-shrink-0">
          {getStatusIcon(task.status)}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{task.name}</p>
          <p className="text-[10px] text-gray-500">{formatDateTime(start)}</p>
        </div>
      </div>
    );
  };

  // ---------------- MOBILE VIEW ----------------
  if (useCompact) {
    return (
      <div className="w-full">
        <h2 className="text-base font-semibold mb-4 text-indigo-700">Project Timeline</h2>
        <div className="space-y-6">
          {stages.map((stageName) => {
            const stageTasks = tasks.filter((t) => t.stage === stageName);
            if (stageTasks.length === 0) return null;

            return (
              <div key={stageName} className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    {stageName}
                  </h3>
                </div>
                <div className="ml-3 pl-4 border-l-2 border-indigo-100 space-y-3">
                  {stageTasks.map((task, idx) => renderTask(task, idx))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ---------------- DESKTOP VIEW ----------------
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border">
      <h2 className="text-xl font-bold mb-8 text-indigo-800">Project Timeline</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stages.map((stageName, stageIdx) => {
          const stageTasks = tasks.filter((t) => t.stage === stageName);
          if (stageTasks.length === 0) return null;

          const isCompleted = stageTasks.every(t => t.status === "completed");

          return (
            <div key={stageName} className="flex flex-col">
              {/* STAGE HEADER */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isCompleted ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700"
                  }`}>
                  {stageIdx + 1}
                </div>
                <h3 className="font-bold text-gray-800 text-sm leading-tight">
                  {stageName}
                </h3>
              </div>

              {/* STAGE TASKS */}
              <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200">
                {stageTasks.map((task, idx) => renderTask(task, idx))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Animations */}
      <style>
        {`
        /* wrapper space to avoid text collisions */
.icon-wrap { display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; }

/* --- CHECKMARK (completed) --- */

/* draw the check path */
.check-path {
  stroke-dasharray: 40;     /* length of path approx */
  stroke-dashoffset: 40;    /* start hidden */
  transform-origin: center;
  filter: drop-shadow(0 6px 8px rgba(22,163,74,0.12));
  animation: checkDraw 0.55s cubic-bezier(.2,.9,.3,1) forwards, checkGlow 2.2s ease-in-out infinite;
}

/* subtle ring scale-in */
.check-ring {
  transform-origin: center;
  transform: scale(0.85);
  opacity: 0;
  animation: ringIn 0.45s ease-out forwards;
}

/* glow breathing */
@keyframes checkGlow {
  0%   { filter: drop-shadow(0 4px 6px rgba(22,163,74,0.08)); }
  50%  { filter: drop-shadow(0 10px 18px rgba(22,163,74,0.18)); }
  100% { filter: drop-shadow(0 4px 6px rgba(22,163,74,0.08)); }
}
  /* ---------- TICK MARK (100% Works) ---------- */
.tick-wrapper {
  width: 40px;
  height: 40px;
}

.tick-svg {
  display: block;
}

.tick-path {
  stroke-dasharray: 40; /* EXACT LENGTH */
  stroke-dashoffset: 40;
  animation: tickDraw 0.6s ease-out forwards,
             tickGlow 2s ease-in-out infinite;
}

@keyframes tickDraw {
  from { stroke-dashoffset: 40; }
  to   { stroke-dashoffset: 0; }
}

@keyframes tickGlow {
  0%   { filter: drop-shadow(0 0 3px rgba(22,163,74,0.2)); }
  50%  { filter: drop-shadow(0 0 10px rgba(22,163,74,0.6)); }
  100% { filter: drop-shadow(0 0 3px rgba(22,163,74,0.2)); }
}


/* ---------- WARNING ICON ---------- */
.warn-wrapper { width: 40px; height: 40px; }

.warn-circle {
  animation: warnPulse 1.8s infinite ease-in-out;
}

.warn-line {
  animation: warnBounce 1.4s infinite ease-in-out;
}

.warn-dot {
  animation: warnPulse 1.8s infinite ease-in-out;
}

@keyframes warnPulse {
  0%   { transform: scale(1); opacity: 0.9; }
  50%  { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 0.9; }
}

@keyframes warnBounce {
  0%   { transform: translateY(0); }
  50%  { transform: translateY(-3px); }
  100% { transform: translateY(0); }
}
.tick-svg {
  animation: tickRotate 0.55s ease-out both;
}

@keyframes tickRotate {
  0%   { transform: rotate(-180deg) scale(0.4); opacity: 0; }
  80%  { transform: rotate(20deg) scale(1.2); opacity: 1; }
  100% { transform: rotate(0deg) scale(1); }
}
/* Ripple burst behind the tick */
.tick-wrapper::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 6px;
  height: 6px;
  background: rgba(22,163,74,0.4);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  animation: tickRipple 0.6s ease-out forwards 0.1s;
}

@keyframes tickRipple {
  0%   { transform: translate(-50%, -50%) scale(0);    opacity: 0.9; }
  70%  { transform: translate(-50%, -50%) scale(7);    opacity: 0.4; }
  100% { transform: translate(-50%, -50%) scale(8.5);  opacity: 0; }
}


/* Tick bounce after drawing */
.tick-svg {
  animation: tickPop 0.25s ease-out 0.58s both;
}

@keyframes tickPop {
  0%   { transform: scale(1); }
  60%  { transform: scale(1.25); }
  100% { transform: scale(1); }
}


@keyframes checkDraw {
  to { stroke-dashoffset: 0; }
}
@keyframes ringIn {
  to { transform: scale(1); opacity: 1; }
}

/* --- WARNING (!) --- */

.warn-svg { transform-origin: center; display:block; }
.warn-ring {
  transform-origin: center;
  animation: warnRingPulse 1.8s ease-in-out infinite;
}
.warn-excl {
  transform-origin: center;
  animation: warnBounce 1.2s ease-out infinite;
}
.warn-dot {
  transform-origin: center;
  animation: warnDotPulse 1.8s ease-in-out infinite;
}

/* pulse the warning ring (soft halo) */
@keyframes warnRingPulse {
  0%   { opacity: 0.9; transform: scale(1); filter: blur(0px); }
  50%  { opacity: 1;   transform: scale(1.07); filter: blur(0.6px); }
  100% { opacity: 0.9; transform: scale(1); filter: blur(0px); }
}

/* small up-down/pulse on the '!' */
@keyframes warnBounce {
  0%   { transform: translateY(0); }
  50%  { transform: translateY(-2px); }
  100% { transform: translateY(0); }
}

/* dot pulse */
@keyframes warnDotPulse {
  0% { transform: scale(1); opacity: 0.95; }
  50% { transform: scale(1.35); opacity: 1; }
  100% { transform: scale(1); opacity: 0.95; }
}

        /* Bigger, clearer, neon green tick with bounce + glow */
.big-check {
  font-size: 28px;
  font-weight: 900;
  color: #16a34a;
  text-shadow: 0 0 6px rgba(34,197,94,0.7), 0 0 12px rgba(34,197,94,0.4);
  display: inline-block;
  animation: checkBounce 0.5s ease-out, checkGlow 2.2s ease-in-out infinite;
}

@keyframes checkBounce {
  0%   { transform: scale(0.1); opacity: 0; }
  60%  { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(1); }
}

@keyframes checkGlow {
  0%, 100% { text-shadow: 0 0 6px rgba(34,197,94,0.6), 0 0 12px rgba(34,197,94,0.4); }
  50%      { text-shadow: 0 0 10px rgba(34,197,94,0.9), 0 0 18px rgba(34,197,94,0.6); }
}


/* Bigger, bold, orange warning icon with shake + pulse */
.big-warning {
  font-size: 28px;
  font-weight: 900;
  color: #ea580c;
  text-shadow: 0 0 6px rgba(234,88,12,0.6), 0 0 12px rgba(234,88,12,0.4);
  display: inline-block;
  animation: warnPulse 1.6s infinite ease-in-out, warnShake 0.4s ease-in-out;
}

@keyframes warnPulse {
  0%   { transform: scale(1);   opacity: 0.85; }
  50%  { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(1);   opacity: 0.85; }
}

@keyframes warnShake {
  0% { transform: translateX(0) rotate(0); }
  25% { transform: translateX(-2px) rotate(-3deg); }
  50% { transform: translateX(2px) rotate(3deg); }
  75% { transform: translateX(-1px) rotate(-2deg); }
  100% { transform: translateX(0) rotate(0); }
}

        /* Smooth fade animation */
        .animate-fade {
          animation: fadeIn 0.6s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Slide up SaaS style */
        .animate-slide-up {
          opacity: 0;
          animation: slideUp 0.5s cubic-bezier(0.25, 1, 0.3, 1) forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Animated green tick */
        .animate-tick {
          display: inline-block;
          animation: tickPop 0.4s ease-out forwards;
        }
        @keyframes tickPop {
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); }
        }

        /* Warning ! ping animation */
        .animate-ping-warning {
          animation: warningPulse 1.8s infinite ease-in-out;
        }
        @keyframes warningPulse {
          0%   { transform: scale(1);   opacity: 0.9; }
          50%  { transform: scale(1.25); opacity: 1; }
          100% { transform: scale(1);   opacity: 0.9; }
        }
        `}
      </style>
    </div>
  );
};

export default Timeline;

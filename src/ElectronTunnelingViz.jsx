
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const ElectronTunnelingViz = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState('semiconductor');
  const [barrierWidth, setBarrierWidth] = useState(50);
  const [energy, setEnergy] = useState(60);
  const [particles, setParticles] = useState([]);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;
  const BARRIER_X = 300;
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const barrierHeight = mode === 'superconductor' ? 80 : 120;
    const tunnelingProb = calculateTunnelingProbability(energy, barrierHeight, barrierWidth);
    
    const drawScene = () => {
      // Clear canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Draw energy levels
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      for (let i = 0; i < 5; i++) {
        const y = 100 + i * 60;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      
      // Draw potential barrier
      const gradientBarrier = ctx.createLinearGradient(BARRIER_X, 0, BARRIER_X + barrierWidth, 0);
      if (mode === 'superconductor') {
        gradientBarrier.addColorStop(0, 'rgba(139, 92, 246, 0.6)');
        gradientBarrier.addColorStop(0.5, 'rgba(139, 92, 246, 0.8)');
        gradientBarrier.addColorStop(1, 'rgba(139, 92, 246, 0.6)');
      } else {
        gradientBarrier.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
        gradientBarrier.addColorStop(0.5, 'rgba(239, 68, 68, 0.8)');
        gradientBarrier.addColorStop(1, 'rgba(239, 68, 68, 0.6)');
      }
      
      ctx.fillStyle = gradientBarrier;
      ctx.fillRect(BARRIER_X, CANVAS_HEIGHT/2 - barrierHeight, barrierWidth, barrierHeight * 2);
      
      // Draw barrier outline
      ctx.strokeStyle = mode === 'superconductor' ? '#8b5cf6' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(BARRIER_X, CANVAS_HEIGHT/2 - barrierHeight, barrierWidth, barrierHeight * 2);
      
      // Draw wave function representation
      drawWaveFunction(ctx, barrierHeight, tunnelingProb);
      
      // Draw particles
      particles.forEach(particle => {
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, 8);
        gradient.addColorStop(0, particle.tunneled ? '#10b981' : '#3b82f6');
        gradient.addColorStop(1, particle.tunneled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        ctx.strokeStyle = particle.tunneled ? '#10b981' : '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 10, 0, Math.PI * 2);
        ctx.stroke();
      });
      
      // Draw labels
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '14px sans-serif';
      ctx.fillText('Incident Electrons', 50, 30);
      ctx.fillText('Potential Barrier', BARRIER_X + barrierWidth/2 - 50, 30);
      ctx.fillText('Transmitted', CANVAS_WIDTH - 120, 30);
      
      // Draw probability
      ctx.fillStyle = '#fbbf24';
      ctx.font = '16px sans-serif';
      ctx.fillText(`Tunneling Probability: ${(tunnelingProb * 100).toFixed(1)}%`, 20, CANVAS_HEIGHT - 20);
    };
    
    const drawWaveFunction = (ctx, barrierHeight, prob) => {
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      // Before barrier - incident wave
      for (let x = 0; x < BARRIER_X; x++) {
        const y = CANVAS_HEIGHT/2 + 30 * Math.sin((x - particles.length * 2) * 0.05);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      // Inside barrier - exponentially decaying
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      for (let x = BARRIER_X; x < BARRIER_X + barrierWidth; x++) {
        const decay = Math.exp(-3 * (x - BARRIER_X) / barrierWidth);
        const y = CANVAS_HEIGHT/2 + 30 * decay * Math.sin((x - particles.length * 2) * 0.05);
        if (x === BARRIER_X) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      // After barrier - transmitted wave
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2 * Math.sqrt(prob);
      ctx.beginPath();
      for (let x = BARRIER_X + barrierWidth; x < CANVAS_WIDTH; x++) {
        const y = CANVAS_HEIGHT/2 + 30 * Math.sqrt(prob) * Math.sin((x - particles.length * 2) * 0.05);
        if (x === BARRIER_X + barrierWidth) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    
    const updateParticles = () => {
      const barrierHeight = mode === 'superconductor' ? 80 : 120;
      const tunnelingProb = calculateTunnelingProbability(energy, barrierHeight, barrierWidth);
      
      setParticles(prev => {
        let updated = prev.map(p => {
          if (p.x < BARRIER_X) {
            return { ...p, x: p.x + 2 };
          } else if (p.x < BARRIER_X + barrierWidth && !p.decided) {
            const willTunnel = Math.random() < tunnelingProb;
            return { ...p, x: p.x + 1, decided: true, tunneled: willTunnel };
          } else if (p.x < BARRIER_X + barrierWidth) {
            if (p.tunneled) {
              return { ...p, x: p.x + 1 };
            } else {
              return { ...p, x: p.x - 3, reflected: true };
            }
          } else if (p.tunneled) {
            return { ...p, x: p.x + 2 };
          } else {
            return p;
          }
        }).filter(p => p.x > -50 && p.x < CANVAS_WIDTH);
        
        if (Math.random() < 0.03 && updated.length < 20) {
          updated.push({
            x: 20,
            y: CANVAS_HEIGHT/2 + (Math.random() - 0.5) * 60,
            decided: false,
            tunneled: false,
            reflected: false
          });
        }
        
        return updated;
      });
    };
    
    if (isPlaying) {
      animationRef.current = setInterval(() => {
        updateParticles();
        drawScene();
      }, 50);
    } else {
      drawScene();
    }
    
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, mode, barrierWidth, energy, particles]);
  
  const calculateTunnelingProbability = (E, V0, width) => {
    const k = 0.1 * Math.sqrt(Math.max(0, V0 - E));
    return Math.exp(-2 * k * width / 10);
  };
  
  const handleReset = () => {
    setIsPlaying(false);
    setParticles([]);
  };

  return (
    <div className="w-full h-full bg-slate-900 p-6 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Quantum Tunneling Visualization
        </h1>
        <p className="text-slate-400 text-center mb-6">
          Electron tunneling through potential barriers in {mode === 'superconductor' ? 'superconductors' : 'semiconductors'}
        </p>
        
        <div className="bg-slate-800 rounded-lg p-4 mb-4">
          <canvas 
            ref={canvasRef} 
            width={CANVAS_WIDTH} 
            height={CANVAS_HEIGHT}
            className="w-full border-2 border-slate-700 rounded"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">Material Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('semiconductor')}
                className={`flex-1 py-2 px-4 rounded transition ${
                  mode === 'semiconductor' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Semiconductor
              </button>
              <button
                onClick={() => setMode('superconductor')}
                className={`flex-1 py-2 px-4 rounded transition ${
                  mode === 'superconductor' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Superconductor
              </button>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">
              Barrier Width: {barrierWidth}nm
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={barrierWidth}
              onChange={(e) => setBarrierWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">
              Electron Energy: {energy}%
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4 flex gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition flex items-center justify-center gap-2"
            >
              {isPlaying ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Play</>}
            </button>
            <button
              onClick={handleReset}
              className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded transition flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} /> Reset
            </button>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="font-semibold mb-2">How It Works:</h3>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• <span className="text-blue-400">Blue particles</span> are incident electrons approaching the barrier</li>
            <li>• <span className="text-green-400">Green particles</span> successfully tunneled through the barrier</li>
            <li>• The wave function shows quantum probability: decaying inside the barrier, transmitted after</li>
            <li>• Superconductors have lower barriers, enabling higher tunneling probabilities</li>
            <li>• Tunneling probability decreases exponentially with barrier width and height</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ElectronTunnelingViz;

import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { Volume2, VolumeX, Zap, RefreshCw } from 'lucide-react';

export default function App() {
  const [isRinging, setIsRinging] = useState(true);
  const [speed, setSpeed] = useState(600);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  
  const audio1 = useRef<HTMLAudioElement | null>(null);
  const audio2 = useRef<HTMLAudioElement | null>(null);
  const toggle = useRef(false);

  useEffect(() => {
    const audioUrl = 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3';
    audio1.current = new Audio(audioUrl);
    audio2.current = new Audio(audioUrl);
    audio1.current.load();
    audio2.current.load();

    const unlockAudio = () => {
      setAudioUnlocked(true);
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  const triggerBeat = useCallback(() => {
    if (!audio1.current || !audio2.current) return;
    
    const audio = toggle.current ? audio1.current : audio2.current;
    toggle.current = !toggle.current;
    
    audio.currentTime = 0;
    // Aumenta a velocidade do áudio conforme o sino fica mais rápido
    audio.playbackRate = Math.min(4, 600 / speed); 
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Silenciosamente ignora o erro de autoplay
      });
    }
    
    // Quantidade fixa de confetes para não pesar o site
    const particleCount = 40;
    
    confetti({
      particleCount,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
      colors: ['#FFD700', '#FFA500', '#FF4500', '#FFFFFF', '#00FF00', '#0000FF'],
      zIndex: 100
    });
    confetti({
      particleCount,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
      colors: ['#FFD700', '#FFA500', '#FF4500', '#FFFFFF', '#00FF00', '#0000FF'],
      zIndex: 100
    });
  }, [speed]);

  useEffect(() => {
    if (!isRinging) return;
    
    triggerBeat();
    const interval = setInterval(triggerBeat, speed);
    
    return () => clearInterval(interval);
  }, [isRinging, speed, triggerBeat]);

  const handleBellClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita propagar para o window click se não for necessário, mas queremos que desbloqueie o áudio.
    if (!isRinging) setIsRinging(true);
    setSpeed(prev => Math.max(150, prev - 80));
    setAudioUnlocked(true); // Garante que a UI atualize
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center overflow-hidden relative selection:bg-amber-500/30">
      {/* Aviso de Autoplay */}
      {!audioUnlocked && (
        <div className="absolute top-8 z-50 bg-amber-500 text-neutral-950 px-6 py-3 rounded-full font-bold shadow-lg animate-bounce flex items-center gap-2">
          <VolumeX className="w-5 h-5" />
          Clique em qualquer lugar para ativar o som!
        </div>
      )}

      {/* Ambient Glow */}
      <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${isRinging ? 'opacity-100' : 'opacity-0'}`}>
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] transition-all duration-300"
          style={{
            width: `${Math.max(500, 1000 - speed)}px`,
            height: `${Math.max(500, 1000 - speed)}px`,
            backgroundColor: `rgba(245, 158, 11, ${Math.min(0.5, 300 / speed)})`
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-12">
        <div className="text-center space-y-4 px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
            O Sino da <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Alegria</span>
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl max-w-md mx-auto">
            Ele já está tocando! <strong className="text-amber-400">Bata no sino</strong> para deixá-lo mais rápido!
          </p>
        </div>

        <motion.button
          onClick={handleBellClick}
          className="relative group outline-none cursor-pointer"
          animate={isRinging ? {
            rotate: [-30, 30],
          } : {
            rotate: 0,
          }}
          transition={isRinging ? {
            duration: speed / 1000,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          } : {
            duration: 0.5,
            ease: "easeOut"
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{ originY: 0.1 }}
        >
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            <img 
              src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bell/3D/bell_3d.png" 
              alt="Sino Realista"
              className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(251,191,36,0.3)] transition-all"
              style={{
                filter: `drop-shadow(0 ${Math.max(20, 600/speed * 10)}px ${Math.max(50, 600/speed * 20)}px rgba(251,191,36,${Math.min(0.8, 300/speed)}))`
              }}
              referrerPolicy="no-referrer"
              draggable={false}
            />
          </div>
          
          {/* Indicador de velocidade */}
          {speed < 600 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -right-4 -top-4 bg-red-500 text-white font-black text-xl w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-neutral-950"
            >
              <Zap className="w-6 h-6" />
            </motion.div>
          )}
        </motion.button>

        <div className="flex gap-4">
          <button
            onClick={() => setIsRinging(!isRinging)}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 transition-all"
          >
            {isRinging ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            {isRinging ? 'Pausar' : 'Retomar'}
          </button>
          
          {speed < 600 && (
            <button
              onClick={() => setSpeed(600)}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              <RefreshCw className="w-5 h-5" />
              Velocidade Normal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

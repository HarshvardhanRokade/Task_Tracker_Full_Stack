import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { storeApi } from '../api/gameApi';
import useGameStore from '../store/useGameStore';
import { SkeletonBox } from '../components/ui/Skeleton';
import useGameSounds from '../hooks/useGameSounds';

const STORE_ITEMS = [
  { id: 'STREAK_FREEZE', title: 'Streak Shield', description: 'Auto-activates if you miss a day. Protects your hard-earned streak. No expiry.', icon: '🛡️', type: 'PROTECTION', dynamicPrice: true },
  { id: 'XP_BOOST', title: 'XP Boost', description: 'Your next Pomodoro or High/Medium Quest grants 1.5x XP.', icon: '⚡', type: 'BOOSTS', basePrice: 75 },
  { 
    id: 'THEME', 
    themeName: 'default', 
    title: 'Default Theme', 
    description: 'The original deep space dark theme. Always free.', 
    icon: '🌑', 
    type: 'COSMETICS', 
    basePrice: 0 
  },
  { id: 'THEME', themeName: 'cosmic', title: 'Cosmic Theme', description: 'Deep space purples, neon pinks, and void-like backgrounds.', icon: '🌌', type: 'COSMETICS', basePrice: 200 },
  { id: 'THEME', themeName: 'ember', title: 'Ember Theme', description: 'Warm volcanic oranges, deep crimson, and charcoal.', icon: '🔥', type: 'COSMETICS', basePrice: 200 }
];

const TABS = ['PROTECTION', 'BOOSTS', 'COSMETICS'];

const StorePage = () => {
  const { gemBalance, updateGemBalance, setXpBoostActive, setCurrentTheme } = useGameStore();
  const { playPurchase } = useGameSounds();
  
  const [inventory, setInventory] = useState(null);
  const [activeTab, setActiveTab] = useState('PROTECTION');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [confirmItem, setConfirmItem] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const [response] = await Promise.all([
        storeApi.getInventory(),
        new Promise(resolve => setTimeout(resolve, 400))
      ]);
      setInventory(response.data);
    } catch (error) {
      console.error("Failed to load inventory", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const handlePurchase = async () => {
    if (!confirmItem || !inventory) return;
    setIsProcessing(true);
    setErrorMessage(null);

    const expectedCost = confirmItem.dynamicPrice ? inventory.streakFreezeCost : confirmItem.basePrice;

    try {
      const payload = { itemId: confirmItem.id, expectedCost, themeName: confirmItem.themeName };
      const response = await storeApi.purchaseItem(payload);
      
      playPurchase();

      updateGemBalance(response.data.newGemBalance);
      if (response.data.boostActivated) setXpBoostActive(true);
      if (response.data.themeUnlocked) setCurrentTheme(confirmItem.themeName);

      await fetchInventory();
      setConfirmItem(null);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Purchase failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEquip = async (themeName) => {
    setIsProcessing(true);
    try {
      await storeApi.equipTheme(themeName);
      setCurrentTheme(themeName);
      await fetchInventory();
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const visibleItems = STORE_ITEMS.filter(item => item.type === activeTab);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div 
          key="skeleton"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          className="max-w-4xl mx-auto py-8"
        >
          <div className="flex justify-between items-end mb-8 bg-[var(--surface-raised)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-lg">
            <div>
              {/* ✨ STANDARDIZED: Adjusted height to match new text-3xl font size */}
              <SkeletonBox width="14rem" height="2.25rem" className="mb-2 rounded-lg" />
              <SkeletonBox width="18rem" height="1.2rem" className="rounded-md" />
            </div>
            <div className="flex flex-col items-end">
              <SkeletonBox width="7rem" height="1rem" className="mb-2 rounded-md" />
              <SkeletonBox width="10rem" height="2.5rem" className="rounded-lg" />
            </div>
          </div>

          <div className="flex gap-4 mb-6 border-b border-[var(--border-subtle)] pb-2">
            {[1, 2, 3].map((i) => (
              <SkeletonBox key={i} width="7rem" height="2rem" className="rounded-lg" />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)]">
                <div className="flex justify-between items-start mb-4">
                  <SkeletonBox width="3rem" height="3rem" className="rounded-xl" />
                  <SkeletonBox width="4rem" height="1.5rem" className="rounded-md" />
                </div>
                <SkeletonBox width="60%" height="1.75rem" className="mb-3 rounded-md" />
                <div className="mb-6 h-10 flex flex-col gap-2">
                  <SkeletonBox width="90%" height="0.875rem" className="rounded-md" />
                  <SkeletonBox width="70%" height="0.875rem" className="rounded-md" />
                </div>
                <SkeletonBox width="100%" height="2.5rem" className="rounded-xl mt-2" />
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="content"
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
          className="max-w-4xl mx-auto py-8"
        >
          <div className="flex justify-between items-end mb-8 bg-[var(--surface-raised)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-lg">
            <div>
              {/* ✨ STANDARDIZED: text-3xl font-black */}
              <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">The Tavern</h1>
              <p className="text-[var(--text-secondary)]">Spend your hard-earned gems wisely.</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-[var(--text-secondary)] font-bold mb-1">YOUR BALANCE</div>
              <div className="text-4xl font-black text-[var(--xp-blue)] flex items-center gap-2">💎 {gemBalance}</div>
            </div>
          </div>

          <div className="flex gap-4 mb-6 border-b border-[var(--border-subtle)] pb-2">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-bold text-sm transition-colors relative ${activeTab === tab ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-white'}`}
              >
                {tab}
                {activeTab === tab && <motion.div layoutId="storeTab" className="absolute bottom-[-8px] left-0 right-0 h-1 bg-[var(--xp-blue)] rounded-t-md" />}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {visibleItems.map(item => {
                const cost = item.dynamicPrice ? inventory.streakFreezeCost : item.basePrice;
                const canAfford = gemBalance >= cost;
                const isCosmetic = item.type === 'COSMETICS';
                const isOwned = isCosmetic && inventory?.ownedThemes?.includes(item.themeName);
                const isEquipped = isCosmetic && inventory?.currentTheme === item.themeName;
                const isBoostActive = item.id === 'XP_BOOST' && inventory?.xpBoostActive;
                const isFreezeMaxed = item.id === 'STREAK_FREEZE' && inventory?.streakFreezesOwned >= 5;

                let displayTitle = item.title;
                if (item.id === 'STREAK_FREEZE') {
                  if (cost === 100) displayTitle = 'Streak Aegis';
                  if (cost === 200) displayTitle = 'Streak Relic';
                }

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    key={item.id + (item.themeName || '')} 
                    className={`p-5 rounded-2xl border transition-all ${isBoostActive ? 'border-[var(--flow-green)] shadow-[0_0_15px_rgba(46,204,113,0.2)]' : 'border-[var(--border-subtle)]'} bg-[var(--surface-base)] relative overflow-hidden`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-4xl">{item.icon}</div>
                      {!isOwned && !isBoostActive && !isFreezeMaxed && (
                        <div className={`font-black text-lg ${canAfford ? 'text-[var(--xp-blue)]' : 'text-red-400 opacity-70'}`}>{cost} 💎</div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-1">{displayTitle}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-6 h-10">{item.description}</p>
                    
                    {item.id === 'STREAK_FREEZE' && (
                      <div className="text-xs font-bold text-[var(--text-secondary)] mb-3 bg-[var(--surface-raised)] inline-block px-2 py-1 rounded-md">
                        Owned: {inventory.streakFreezesOwned} / 5
                      </div>
                    )}

                    {isEquipped ? (
                      <button disabled className="w-full py-2.5 rounded-xl font-bold bg-white/10 text-white cursor-not-allowed">EQUIPPED</button>
                    ) : isOwned ? (
                      <button onClick={() => handleEquip(item.themeName)} disabled={isProcessing} className="w-full py-2.5 rounded-xl font-bold border border-[var(--xp-blue)] text-[var(--xp-blue)] hover:bg-[var(--xp-blue)] hover:text-white transition-colors">Equip Theme</button>
                    ) : isBoostActive ? (
                      <button disabled className="w-full py-2.5 rounded-xl font-bold bg-[var(--flow-green)] text-black animate-pulse">ACTIVE</button>
                    ) : isFreezeMaxed ? (
                      <button disabled className="w-full py-2.5 rounded-xl font-bold bg-white/10 text-[var(--text-secondary)] cursor-not-allowed">MAX OWNED</button>
                    ) : canAfford ? (
                      <button onClick={() => setConfirmItem(item)} className="w-full py-2.5 rounded-xl font-bold bg-[var(--surface-raised)] text-white border border-[var(--border-subtle)] hover:border-[var(--xp-blue)] hover:text-[var(--xp-blue)] transition-colors">Purchase</button>
                    ) : (
                      <button disabled className="w-full py-2.5 rounded-xl font-bold bg-red-900/20 text-red-400 cursor-not-allowed border border-red-900/50">Need {cost - gemBalance} more</button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {confirmItem && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-[var(--surface-base)] border border-[var(--border-subtle)] p-6 rounded-2xl max-w-sm w-full shadow-2xl"
                >
                  <h2 className="text-2xl font-bold text-white mb-2">Confirm Purchase</h2>
                  <p className="text-[var(--text-secondary)] mb-6">
                    Buy <strong>{confirmItem.title}</strong> for <strong className="text-[var(--xp-blue)]">{confirmItem.dynamicPrice ? inventory.streakFreezeCost : confirmItem.basePrice} gems</strong>?
                  </p>
                  
                  {errorMessage && <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 text-red-200 rounded-lg text-sm">{errorMessage}</div>}

                  <div className="flex gap-3">
                    <button onClick={() => { setConfirmItem(null); setErrorMessage(null); }} disabled={isProcessing} className="flex-1 py-2 rounded-xl font-bold text-[var(--text-secondary)] bg-[var(--surface-raised)] hover:text-white transition-colors">Cancel</button>
                    <button onClick={handlePurchase} disabled={isProcessing} className="flex-1 py-2 rounded-xl font-bold text-black bg-[var(--flow-green)] hover:scale-105 active:scale-95 transition-transform">{isProcessing ? '⌛' : 'Confirm'}</button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StorePage;
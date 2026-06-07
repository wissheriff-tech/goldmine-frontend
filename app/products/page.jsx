'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';
import api from '@/utils/api';
import Layout from '@/components/common/Layout';
import { Award, Gem, Crown, Sparkles, Zap, Star, Trophy, Flame, X, Wallet, Lock } from 'lucide-react';

const vipNumFromLevel = (level) => {
  if (!level || level === 'none') return -1;
  const m = level.match(/\d+/);
  return m ? parseInt(m[0]) : -1;
};

const vipNumFromName = (name) => {
  const m = (name || '').match(/\d+/);
  return m ? parseInt(m[0]) : 0;
};

const getVIPInfo = (productName) => {
  const name = productName.toLowerCase();
  if (name.includes('vip1')) return { icon: Award,    gradient: 'from-amber-500 to-amber-700',   border: 'border-amber-500/40',   glow: 'shadow-amber-500/20',  label: 'Bronze'   };
  if (name.includes('vip2')) return { icon: Star,     gradient: 'from-slate-300 to-slate-500',   border: 'border-slate-400/40',   glow: 'shadow-slate-400/20',  label: 'Silver'   };
  if (name.includes('vip3')) return { icon: Trophy,   gradient: 'from-yellow-400 to-yellow-600', border: 'border-yellow-400/40',  glow: 'shadow-yellow-400/20', label: 'Gold'     };
  if (name.includes('vip4')) return { icon: Sparkles, gradient: 'from-orange-400 to-amber-600',  border: 'border-orange-400/40',  glow: 'shadow-orange-400/20', label: 'Elite'    };
  if (name.includes('vip5')) return { icon: Gem,      gradient: 'from-cyan-300 to-cyan-600',     border: 'border-cyan-400/40',    glow: 'shadow-cyan-400/20',   label: 'Platinum' };
  if (name.includes('vip6')) return { icon: Gem,      gradient: 'from-blue-400 to-indigo-600',   border: 'border-blue-400/40',    glow: 'shadow-blue-400/20',   label: 'Diamond'  };
  if (name.includes('vip7')) return { icon: Crown,    gradient: 'from-purple-400 to-pink-600',   border: 'border-purple-400/40',  glow: 'shadow-purple-400/20', label: 'Royal'    };
  if (name.includes('vip8')) return { icon: Flame,    gradient: 'from-red-400 to-orange-600',    border: 'border-red-400/40',     glow: 'shadow-red-400/20',    label: 'Phoenix'  };
  return { icon: Zap, gradient: 'from-blue-500 to-purple-600', border: 'border-blue-400/40', glow: 'shadow-blue-400/20', label: 'VIP' };
};

function ConfirmModal({ product, userBalance, onConfirm, onCancel, purchasing }) {
  const vip = getVIPInfo(product.name);
  const Icon = vip.icon;
  const canAfford = userBalance >= product.price_NSL;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className={`bg-gradient-to-br ${vip.gradient} p-3 rounded-xl`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">{vip.label} Plan</p>
            <h2 className="text-xl font-bold text-white">{product.name}</h2>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 space-y-3 mb-5">
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Price</span>
            <span className="text-white font-bold">{product.price_NSL.toLocaleString()} NSL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Daily Income</span>
            <span className="text-green-400 font-bold">{product.daily_income_NSL} NSL / day</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Validity</span>
            <span className="text-white font-semibold">{product.validity_days} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Total Return</span>
            <span className="text-blue-400 font-bold">{(product.daily_income_NSL * product.validity_days).toLocaleString()} NSL</span>
          </div>
          <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
            <span className="text-gray-400 text-sm flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" /> Your Balance
            </span>
            <span className={`font-bold ${canAfford ? 'text-white' : 'text-red-400'}`}>
              {userBalance.toLocaleString()} NSL
            </span>
          </div>
        </div>

        {!canAfford && (
          <p className="text-red-400 text-sm text-center mb-4 bg-red-400/10 rounded-lg py-2 px-3">
            Insufficient balance. Need {(product.price_NSL - userBalance).toLocaleString()} more NSL.
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canAfford || purchasing}
            className={`flex-1 py-3 rounded-xl font-bold text-white transition-all bg-gradient-to-r ${vip.gradient} disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90`}
          >
            {purchasing ? 'Buying...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, userBalance, onBuyClick, purchasing, locked, unlocksAtVIP }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const vip = getVIPInfo(product.name);
  const Icon = vip.icon;
  const canAfford = userBalance >= product.price_NSL;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const rotateX = (((e.clientY - rect.top) / rect.height) - 0.5) * -12;
    const rotateY = (((e.clientX - rect.left) / rect.width) - 0.5) * 12;
    setTilt({ x: rotateX, y: rotateY });
  };

  if (locked) {
    return (
      <div className="relative bg-gray-900/60 border border-gray-700/40 rounded-2xl p-5 overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-[1px] bg-gray-950/50 rounded-2xl z-10 flex flex-col items-center justify-center gap-3">
          <div className={`bg-gradient-to-br ${vip.gradient} p-3 rounded-full opacity-70`}>
            <Lock className="w-7 h-7 text-white" />
          </div>
          <p className="text-white font-bold text-lg">{product.name}</p>
          <p className="text-gray-300 text-sm text-center px-4">Reach <span className="text-white font-semibold">{unlocksAtVIP}</span> to unlock this plan</p>
        </div>
        <div className="opacity-20 pointer-events-none select-none">
          <div className="flex items-center gap-3 mb-4">
            <div className={`bg-gradient-to-br ${vip.gradient} p-3 rounded-xl`}><Icon className="w-7 h-7 text-white" /></div>
            <div><p className="text-xs text-gray-200 uppercase tracking-widest font-bold">{vip.label}</p><h3 className="text-xl font-bold text-white">{product.name}</h3></div>
          </div>
          <div className="space-y-2 border-t border-gray-600 pt-4">
            <div className="flex justify-between"><span className="text-gray-300 text-sm">Price</span><span className="text-white font-bold">{product.price_NSL.toLocaleString()} NSL</span></div>
            <div className="flex justify-between"><span className="text-gray-300 text-sm">Daily Income</span><span className="text-green-400 font-bold">{product.daily_income_NSL} NSL</span></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: 'transform 0.1s ease-out' }}
      className={`relative group bg-gray-900 border ${vip.border} rounded-2xl p-5 overflow-hidden
        hover:shadow-2xl ${vip.glow} transition-all duration-300
        ${!canAfford ? 'opacity-70' : ''}`}
    >
      {/* Gradient glow background */}
      <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${vip.gradient} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity duration-500`} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`bg-gradient-to-br ${vip.gradient} p-3 rounded-xl shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="text-xs text-gray-200 uppercase tracking-widest font-bold">{vip.label}</p>
          <h3 className="text-xl font-bold text-white">{product.name}</h3>
        </div>
        {!canAfford && (
          <span className="ml-auto text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5 font-medium">
            Low balance
          </span>
        )}
      </div>

      <p className="text-gray-300 text-sm mb-4 leading-relaxed">{product.description}</p>

      {/* Stats */}
      <div className="space-y-2.5 mb-5 border-t border-gray-600 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm font-medium">Price</span>
          <span className="text-white font-bold text-base">{product.price_NSL.toLocaleString()} NSL</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm font-medium">Daily Income</span>
          <span className="text-green-400 font-bold text-base">{product.daily_income_NSL} NSL</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm font-medium">Validity</span>
          <span className="text-white font-semibold">{product.validity_days} days</span>
        </div>
        <div className="flex justify-between items-center bg-gray-800 rounded-lg px-3 py-2">
          <span className="text-white text-sm font-semibold">Total Return</span>
          <span className="text-blue-400 font-bold">{(product.daily_income_NSL * product.validity_days).toLocaleString()} NSL</span>
        </div>
      </div>

      <button
        onClick={() => onBuyClick(product)}
        disabled={purchasing === product.id}
        className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-300 shadow-lg
          bg-gradient-to-r ${vip.gradient}
          ${canAfford ? 'hover:opacity-90 hover:shadow-xl group-hover:scale-105' : 'opacity-50 cursor-not-allowed'}
          disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {purchasing === product.id ? 'Purchasing...' : canAfford ? 'Buy Now' : 'Insufficient Balance'}
      </button>
    </div>
  );
}

export default function Products() {
  const { user, isInitializing } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [confirmProduct, setConfirmProduct] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (isInitializing) return;
    if (!user) { router.push('/login'); return; }
    fetchProducts();
  }, [user?.id, isInitializing, router]);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!confirmProduct) return;
    setPurchasing(confirmProduct.id);
    try {
      const { data } = await api.post('/products/buy', { product_id: confirmProduct.id });
      toast.success(data.message);
      setConfirmProduct(null);
      router.push('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
        </div>
      </Layout>
    );
  }

  const userBalance = user?.balance_NSL ?? 0;
  const userVipNum = vipNumFromLevel(user?.vip_level);

  return (
    <Layout>
      {confirmProduct && (
        <ConfirmModal
          product={confirmProduct}
          userBalance={userBalance}
          onConfirm={handleConfirmPurchase}
          onCancel={() => setConfirmProduct(null)}
          purchasing={purchasing === confirmProduct.id}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            VIP Plans
          </h1>
          <p className="text-gray-400 text-sm">Choose a plan and start earning daily NSL income</p>
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-300">
            <Wallet className="w-4 h-4 text-purple-400" />
            <span>Your balance: <span className="text-white font-bold">{userBalance.toLocaleString()} NSL</span></span>
          </div>
          {user?.vip_level && user.vip_level !== 'none' && (
            <p className="text-purple-400 text-sm mt-1 font-semibold">Current level: {user.vip_level}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const productVipNum = vipNumFromName(product.name);
            const isLocked = productVipNum > userVipNum + 2;
            const unlocksAtVIP = isLocked ? `VIP${productVipNum - 2}` : null;
            return (
              <ProductCard
                key={product.id}
                product={product}
                userBalance={userBalance}
                onBuyClick={setConfirmProduct}
                purchasing={purchasing}
                locked={isLocked}
                unlocksAtVIP={unlocksAtVIP}
              />
            );
          })}
        </div>

        {products.some((p) => vipNumFromName(p.name) > userVipNum + 2) && (
          <p className="text-center text-gray-500 text-sm mt-8">
            🔒 Higher plans unlock as you progress through VIP levels
          </p>
        )}
      </div>
    </Layout>
  );
}

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/store/auth';
import api from '@/utils/api';
import Layout from '@/components/common/Layout';
import { Award, Gem, Crown, Sparkles, Zap, Star, Trophy, Flame } from 'lucide-react';

// Helper function to get VIP icon and styling
const getVIPIcon = (productName) => {
  const name = productName.toLowerCase();

  if (name.includes('vip1')) {
    return { icon: Award, gradient: 'from-amber-700 to-amber-900', bg: 'bg-amber-50', label: 'Bronze' };
  } else if (name.includes('vip2')) {
    return { icon: Star, gradient: 'from-gray-400 to-gray-600', bg: 'bg-gray-50', label: 'Silver' };
  } else if (name.includes('vip3')) {
    return { icon: Trophy, gradient: 'from-yellow-400 to-yellow-600', bg: 'bg-yellow-50', label: 'Gold' };
  } else if (name.includes('vip4')) {
    return { icon: Sparkles, gradient: 'from-amber-500 to-yellow-600', bg: 'bg-amber-50', label: 'Elite' };
  } else if (name.includes('vip5')) {
    return { icon: Gem, gradient: 'from-slate-400 to-slate-600', bg: 'bg-slate-50', label: 'Platinum' };
  } else if (name.includes('vip6')) {
    return { icon: Gem, gradient: 'from-cyan-400 to-blue-600', bg: 'bg-cyan-50', label: 'Diamond' };
  } else if (name.includes('vip7')) {
    return { icon: Crown, gradient: 'from-purple-500 to-pink-600', bg: 'bg-purple-50', label: 'Royal' };
  } else if (name.includes('vip8')) {
    return { icon: Flame, gradient: 'from-orange-500 to-red-600', bg: 'bg-orange-50', label: 'Phoenix' };
  }
  // Default
  return { icon: Zap, gradient: 'from-blue-500 to-purple-600', bg: 'bg-blue-50', label: 'VIP' };
};

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchProducts();
  }, [user, router]);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (product_id) => {
    setPurchasing(product_id);
    try {
      const { data } = await api.post('/products/buy', { product_id });
      toast.success(data.message);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  // Product Card Component with Tilt Effect
  const ProductCard = ({ product }) => {
    const cardRef = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
      if (!cardRef.current) return;
      const card = cardRef.current;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      setTilt({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
    };

    const vipInfo = getVIPIcon(product.name);
    const Icon = vipInfo.icon;

    return (
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative group perspective-1000"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <div className="card hover:shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden">
          {/* VIP Badge Icon */}
          <div className={`absolute top-4 left-4 w-16 h-16 ${vipInfo.bg} rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10 group-hover:scale-110 transition-transform duration-300`}>
            <div className={`bg-gradient-to-br ${vipInfo.gradient} p-3 rounded-full`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Decorative Background Gradient */}
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${vipInfo.gradient} opacity-10 rounded-bl-full transform group-hover:scale-150 transition-transform duration-700`}></div>

          <div className="pt-16">
            <h3 className="text-2xl font-bold mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
              {product.name}
            </h3>
            <p className="text-gray-600 mb-4 text-sm">{product.description}</p>

            <div className="space-y-2 mb-4 border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Price (NSL):</span>
                <span className="font-bold text-lg">{product.price_NSL}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Daily Income:</span>
                <span className="font-bold text-green-600 text-lg">{product.daily_income_NSL} NSL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Validity:</span>
                <span className="font-bold">{product.validity_days} days</span>
              </div>
            </div>

            <button
              onClick={() => handlePurchase(product._id)}
              disabled={purchasing === product._id}
              className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-300 transform group-hover:scale-105 shadow-lg bg-gradient-to-r ${vipInfo.gradient} hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {purchasing === product._id ? 'Purchasing...' : 'Buy Now'}
            </button>
          </div>

          {/* Animated Border on Hover */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-gradient rounded-lg pointer-events-none"></div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto px-4 py-12">
        {/* Centered Animated Heading */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 animate-pulse">
            Buy Product
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/store/auth';
import api from '@/utils/api';
import Layout from '@/components/common/Layout';
import { Copy, Share2, MessageCircle, Facebook as FacebookIcon, Twitter, Linkedin, X } from 'lucide-react';

export default function Referrals() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchReferrals();
  }, [user, router]);

  const fetchReferrals = async () => {
    try {
      const { data } = await api.get('/user/referrals');
      setReferrals(data.referrals);
      setStats(data.stats);
    } catch (error) {
      toast.error('Failed to load referrals');
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user.referral_code);
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/signup?ref=${user.referral_code}`;
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    const referralLink = `${window.location.origin}/signup?ref=${user.referral_code}`;
    const message = `Join SalonMoney and start earning! Use my referral code: ${user.referral_code}\n\nSign up here: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareToFacebook = () => {
    const referralLink = `${window.location.origin}/signup?ref=${user.referral_code}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const shareToTwitter = () => {
    const referralLink = `${window.location.origin}/signup?ref=${user.referral_code}`;
    const message = `Join SalonMoney and start earning! Use my referral code: ${user.referral_code}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const shareToLinkedIn = () => {
    const referralLink = `${window.location.origin}/signup?ref=${user.referral_code}`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, '_blank');
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

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Referrals</h1>

        {/* Referral Code Section */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Your Referral Code</h2>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Share this code with friends</p>
                <p className="text-3xl font-mono font-bold text-primary">{user.referral_code}</p>
              </div>
              <button
                onClick={copyReferralCode}
                className={`px-6 py-3 rounded-lg font-semibold transition flex items-center space-x-2 ${
                  copied ? 'bg-green-600 text-white' : 'bg-primary text-white hover:bg-indigo-700'
                }`}
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={copyReferralLink}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2 ${
                    linkCopied ? 'bg-green-600 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  <span>{linkCopied ? 'Link Copied!' : 'Copy Referral Link'}</span>
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card">
            <p className="text-gray-600 text-sm mb-1">Total Referrals</p>
            <p className="text-3xl font-bold">{stats?.total_referrals || 0}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm mb-1">Pending Bonuses</p>
            <p className="text-3xl font-bold text-yellow-600">{stats?.pending_bonuses || 0}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm mb-1">Total Earned</p>
            <p className="text-3xl font-bold text-green-600">{stats?.total_earned_NSL || 0} NSL</p>
          </div>
        </div>

        {/* Referrals List */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Referred Users</h2>
          
          {referrals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You haven't referred anyone yet</p>
              <p className="text-sm text-gray-500">Share your referral code to start earning bonuses!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bonus NSL</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {referrals.map((referral) => (
                    <tr key={referral._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{referral.referred_id?.phone}</td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(referral.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">{referral.bonus_NSL} NSL</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          referral.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {referral.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="card mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="text-3xl">ℹ️</div>
            <p className="text-lg font-bold text-blue-900 leading-relaxed">
              You earn <span className="text-purple-600">35%</span> of your referral's first purchase as a bonus. Share your code on WhatsApp, social media, or with friends to grow your network!
            </p>
          </div>
        </div>
        </div>
      </div>

      {/* Share Modal - Redesigned */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl transform transition-all duration-500 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Redesigned */}
            <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 rounded-t-3xl overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                    <Share2 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-2xl">Share & Earn</h3>
                    <p className="text-white/80 text-sm">Invite friends, earn rewards</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-white hover:bg-white/20 p-2.5 rounded-xl transition-all duration-300 hover:rotate-90"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content - Redesigned */}
            <div className="p-8">
              <p className="text-gray-600 mb-8 text-center text-lg font-medium">
                Choose your favorite platform to share
              </p>

              <div className="grid grid-cols-2 gap-5">
                {/* WhatsApp */}
                <button
                  onClick={shareToWhatsApp}
                  className="group relative bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 shadow-lg hover:shadow-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative w-16 h-16 bg-white/30 rounded-full flex items-center justify-center group-hover:bg-white/40 transition-all duration-300 group-hover:rotate-12">
                    <MessageCircle className="w-9 h-9 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="relative text-white font-bold text-base">WhatsApp</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={shareToFacebook}
                  className="group relative bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 shadow-lg hover:shadow-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative w-16 h-16 bg-white/30 rounded-full flex items-center justify-center group-hover:bg-white/40 transition-all duration-300 group-hover:rotate-12">
                    <FacebookIcon className="w-9 h-9 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="relative text-white font-bold text-base">Facebook</span>
                </button>

                {/* Twitter */}
                <button
                  onClick={shareToTwitter}
                  className="group relative bg-gradient-to-br from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 shadow-lg hover:shadow-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative w-16 h-16 bg-white/30 rounded-full flex items-center justify-center group-hover:bg-white/40 transition-all duration-300 group-hover:rotate-12">
                    <Twitter className="w-9 h-9 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="relative text-white font-bold text-base">Twitter</span>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={shareToLinkedIn}
                  className="group relative bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 shadow-lg hover:shadow-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative w-16 h-16 bg-white/30 rounded-full flex items-center justify-center group-hover:bg-white/40 transition-all duration-300 group-hover:rotate-12">
                    <Linkedin className="w-9 h-9 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="relative text-white font-bold text-base">LinkedIn</span>
                </button>
              </div>

              {/* Referral Link Display - Redesigned */}
              <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-100 shadow-inner">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                    Your Referral Link
                  </p>
                  <button
                    onClick={copyReferralLink}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                  >
                    {linkCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm text-gray-700 break-all font-mono bg-white/60 p-3 rounded-lg">
                  {`${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${user.referral_code}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </Layout>
  );
}

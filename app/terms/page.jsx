'use client';

import { Shield, AlertCircle, CheckCircle, TrendingUp, Users, Lock } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-400 text-lg">
            Last Updated: November 2025
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-700/50 shadow-xl space-y-8">
          {/* Welcome Section */}
          <div className="border-l-4 border-blue-500 pl-6">
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to SalonMoney</h2>
            <p className="text-gray-300 leading-relaxed">
              Thank you for choosing SalonMoney as your trusted investment platform. By accessing or using our services, you agree to be bound by these Terms of Service. Please read them carefully to understand your rights and obligations.
            </p>
          </div>

          {/* About the Platform */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">About Our Platform</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                SalonMoney is a premier VIP investment platform designed to provide users with opportunities to grow their wealth through structured investment packages. Our platform operates on a transparent, user-friendly system that enables both novice and experienced investors to participate in wealth-building activities.
              </p>
              <div className="bg-gray-700/30 rounded-lg p-6 space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  How Our Platform Works:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li>Users register and verify their accounts</li>
                  <li>Recharge your account balance through secure payment methods</li>
                  <li>Choose from our range of VIP investment packages (VIP1 - VIP8)</li>
                  <li>Earn daily returns based on your selected package</li>
                  <li>Withdraw your earnings at any time</li>
                  <li>Invite friends through our referral program and earn commissions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Investment Packages */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Investment Packages</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                We offer eight distinct VIP levels, each designed to cater to different investment capacities and goals:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">VIP1 - VIP4</h4>
                  <p className="text-sm">Entry-level packages perfect for beginners starting their investment journey with lower capital requirements.</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">VIP5 - VIP8</h4>
                  <p className="text-sm">Premium packages offering higher returns for experienced investors seeking maximum profit potential.</p>
                </div>
              </div>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Your Responsibilities</h2>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-6 space-y-3">
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Provide accurate and truthful information during registration</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Maintain the security and confidentiality of your account credentials</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Enable Two-Factor Authentication (2FA) for enhanced account security</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Comply with all applicable laws and regulations in your jurisdiction</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Not engage in fraudulent activities or attempt to manipulate the system</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Report any suspicious activities or security breaches immediately</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Risk Disclosure */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Risk Disclosure</h2>
            </div>
            <div className="bg-yellow-500/10 border-l-4 border-yellow-500 rounded-lg p-6 space-y-4">
              <p className="text-gray-300 leading-relaxed">
                While we strive to provide a secure and profitable platform, all investments carry inherent risks. Please consider the following:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Market Volatility:</strong> Investment returns may fluctuate based on market conditions</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Capital Risk:</strong> Only invest what you can afford to lose</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">No Guarantees:</strong> Past performance does not guarantee future results</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Withdrawal Processing:</strong> Withdrawals may take 24-48 hours to process</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Security & Privacy */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Security & Privacy</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                Your security is our top priority. We implement industry-leading security measures to protect your account and funds:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2 flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-blue-400" />
                    Bank-Level Encryption
                  </h4>
                  <p className="text-sm">All data is encrypted using SSL/TLS protocols</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2 flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-purple-400" />
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm">Optional 2FA for enhanced account protection</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2 flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-green-400" />
                    Secure Payments
                  </h4>
                  <p className="text-sm">PCI-compliant payment processing systems</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2 flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-pink-400" />
                    Regular Audits
                  </h4>
                  <p className="text-sm">Continuous security monitoring and updates</p>
                </div>
              </div>
            </div>
          </section>

          {/* Referral Program */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-pink-400" />
              <h2 className="text-2xl font-bold text-white">Referral Program</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                Our referral program allows you to earn additional income by inviting friends and family to join SalonMoney:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Receive a unique referral link from your dashboard</li>
                <li>Earn commission when your referrals make investments</li>
                <li>Track your referral earnings in real-time</li>
                <li>Withdraw referral commissions along with your regular earnings</li>
              </ul>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Account Termination</h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activities, or pose security risks to our platform and community. Users may also close their accounts voluntarily at any time.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Modifications to Terms</h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                SalonMoney reserves the right to update these Terms of Service at any time. Users will be notified of significant changes via email or platform notifications. Continued use of the platform after such modifications constitutes acceptance of the updated terms.
              </p>
            </div>
          </section>

          {/* Encouragement Section */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Start Your Investment Journey Today!</h3>
            <p className="text-gray-300 leading-relaxed mb-6">
              Join thousands of satisfied investors who trust SalonMoney for their financial growth. Our platform is designed with your success in mind, offering competitive returns, robust security, and exceptional customer support. Whether you're a beginner or an experienced investor, we have the perfect VIP package for you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-gray-800 rounded-lg p-4 text-left">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">24/7</div>
                <div className="text-sm text-gray-400">Customer Support</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-left">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">8</div>
                <div className="text-sm text-gray-400">VIP Packages</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-left">
                <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Secure</div>
                <div className="text-sm text-gray-400">Transactions</div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <section className="border-t border-gray-700 pt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Questions?</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about these Terms of Service, please don't hesitate to contact us through our{' '}
              <a href="/help" className="text-blue-400 hover:text-blue-300 underline">Help Center</a>
              {' '}or{' '}
              <a href="/contact" className="text-blue-400 hover:text-blue-300 underline">Contact Us</a>
              {' '}page. Our support team is available 24/7 to assist you.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

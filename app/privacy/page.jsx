'use client';

import { Shield, Lock, Eye, Database, UserCheck, FileText, Bell, Globe } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-lg">
            Last Updated: November 2025
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-700/50 shadow-xl space-y-8">
          {/* Introduction */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h2 className="text-2xl font-bold text-white mb-4">Our Commitment to Your Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              At SalonMoney, we take your privacy seriously. This Privacy Policy explains how we collect, use, protect, and share your personal information when you use our investment platform. By using SalonMoney, you agree to the collection and use of information in accordance with this policy.
            </p>
          </div>

          {/* Information We Collect */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Information We Collect</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <UserCheck className="w-5 h-5 text-green-400 mr-2" />
                  Personal Information
                </h3>
                <ul className="space-y-2 text-gray-300 ml-7">
                  <li>• Full name and username</li>
                  <li>• Email address</li>
                  <li>• Phone number</li>
                  <li>• Password (encrypted and securely stored)</li>
                  <li>• Profile information and preferences</li>
                </ul>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <FileText className="w-5 h-5 text-purple-400 mr-2" />
                  Financial Information
                </h3>
                <ul className="space-y-2 text-gray-300 ml-7">
                  <li>• Account balance and transaction history</li>
                  <li>• Investment details and package selections</li>
                  <li>• Withdrawal and recharge records</li>
                  <li>• Payment method information (securely processed)</li>
                  <li>• Referral earnings and commission data</li>
                </ul>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Globe className="w-5 h-5 text-blue-400 mr-2" />
                  Technical Information
                </h3>
                <ul className="space-y-2 text-gray-300 ml-7">
                  <li>• IP address and device information</li>
                  <li>• Browser type and version</li>
                  <li>• Operating system</li>
                  <li>• Login timestamps and activity logs</li>
                  <li>• Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="w-6 h-6 text-pink-400" />
              <h2 className="text-2xl font-bold text-white">How We Use Your Information</h2>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-6 space-y-3">
              <p className="text-gray-300 leading-relaxed mb-4">
                We use the information we collect for the following purposes:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <Shield className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Account Management:</strong> To create and manage your account, verify your identity, and provide customer support</span>
                </li>
                <li className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Transaction Processing:</strong> To process your investments, withdrawals, and recharges securely</span>
                </li>
                <li className="flex items-start">
                  <Shield className="w-5 h-5 text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Platform Improvement:</strong> To analyze usage patterns and improve our services and user experience</span>
                </li>
                <li className="flex items-start">
                  <Shield className="w-5 h-5 text-pink-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Security:</strong> To detect and prevent fraud, unauthorized access, and other security threats</span>
                </li>
                <li className="flex items-start">
                  <Shield className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Communication:</strong> To send you important updates, notifications, and promotional materials</span>
                </li>
                <li className="flex items-start">
                  <Shield className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Compliance:</strong> To comply with legal obligations and regulatory requirements</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">How We Protect Your Data</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                We implement robust security measures to protect your personal and financial information:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-lg p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-white">SSL/TLS Encryption</h4>
                  </div>
                  <p className="text-sm text-gray-300">
                    All data transmitted between your device and our servers is encrypted using industry-standard SSL/TLS protocols.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-lg p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-white">Password Encryption</h4>
                  </div>
                  <p className="text-sm text-gray-300">
                    Your password is hashed and encrypted using advanced cryptographic algorithms, making it unreadable even to our staff.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-600/10 to-blue-600/10 border border-green-500/30 rounded-lg p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-white">Two-Factor Authentication</h4>
                  </div>
                  <p className="text-sm text-gray-300">
                    Optional 2FA adds an extra layer of security by requiring a verification code in addition to your password.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-pink-600/10 to-blue-600/10 border border-pink-500/30 rounded-lg p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-white">Secure Databases</h4>
                  </div>
                  <p className="text-sm text-gray-300">
                    Your data is stored in secure, encrypted databases with regular backups and strict access controls.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Information Sharing</h2>
            </div>
            <div className="bg-yellow-500/10 border-l-4 border-yellow-500 rounded-lg p-6 space-y-4">
              <p className="text-gray-300 leading-relaxed">
                We do NOT sell, rent, or trade your personal information to third parties. However, we may share your information in the following limited circumstances:
              </p>
              <ul className="space-y-2 text-gray-300 ml-4">
                <li>• <strong className="text-white">Service Providers:</strong> With trusted third-party services that help us operate our platform (e.g., payment processors, hosting providers)</li>
                <li>• <strong className="text-white">Legal Compliance:</strong> When required by law, court order, or government request</li>
                <li>• <strong className="text-white">Security Purposes:</strong> To protect against fraud, security threats, or illegal activities</li>
                <li>• <strong className="text-white">Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Cookies and Tracking</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience on our platform. Cookies help us:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Remember your login preferences and settings</li>
                <li>Analyze how you use our platform to improve services</li>
                <li>Provide personalized content and recommendations</li>
                <li>Detect and prevent fraudulent activity</li>
              </ul>
              <p className="leading-relaxed">
                You can control cookies through your browser settings, but disabling them may affect some platform features.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <UserCheck className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Your Privacy Rights</h2>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Access</h4>
                    <p className="text-sm text-gray-300">Request a copy of your personal data</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Correction</h4>
                    <p className="text-sm text-gray-300">Update or correct inaccurate information</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Deletion</h4>
                    <p className="text-sm text-gray-300">Request deletion of your account and data</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Opt-Out</h4>
                    <p className="text-sm text-gray-300">Unsubscribe from marketing communications</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Data Retention</h2>
            </div>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you close your account, we will delete or anonymize your data within 90 days, except where we are required to retain it for legal, regulatory, or security purposes.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                Our platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will take steps to delete such information immediately.
              </p>
            </div>
          </section>

          {/* Policy Updates */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Changes to This Policy</h2>
            </div>
            <div className="space-y-3 text-gray-300">
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for legal and regulatory reasons. We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="border-t border-gray-700 pt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us About Privacy</h2>
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your personal information, please contact us:
              </p>
              <div className="space-y-2 text-gray-300">
                <p>📧 Email: <a href="mailto:privacy@salonmoney.com" className="text-blue-400 hover:text-blue-300">privacy@salonmoney.com</a></p>
                <p>📞 Phone: +232 (0) 123 456 789</p>
                <p>💬 Live Chat: Available through our <a href="/help" className="text-blue-400 hover:text-blue-300 underline">Help Center</a></p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

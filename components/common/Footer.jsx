'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-[#0a1628] via-[#1a2642] to-[#0d1b2a] text-white mt-auto border-t border-gray-800/50">
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* About Section */}
          <div className="space-y-5">
            <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              SalonMoney
            </h3>
            <p className="text-base text-gray-300 leading-relaxed font-medium">
              Your trusted platform for VIP investment packages and financial growth.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center hover:from-blue-700 hover:to-blue-800 transition-all hover:scale-110 shadow-lg hover:shadow-blue-500/50">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gradient-to-r from-sky-500 to-sky-600 rounded-full flex items-center justify-center hover:from-sky-600 hover:to-sky-700 transition-all hover:scale-110 shadow-lg hover:shadow-sky-500/50">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gradient-to-r from-pink-600 to-pink-700 rounded-full flex items-center justify-center hover:from-pink-700 hover:to-pink-800 transition-all hover:scale-110 shadow-lg hover:shadow-pink-500/50">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h3 className="text-xl font-extrabold text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="text-base text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block font-medium">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-base text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block font-medium">
                  VIP Products
                </Link>
              </li>
              <li>
                <Link href="/transactions" className="text-base text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block font-medium">
                  Transactions
                </Link>
              </li>
              <li>
                <Link href="/referrals" className="text-base text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block font-medium">
                  Referrals
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-5">
            <h3 className="text-xl font-extrabold text-white">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-base text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block font-medium">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-base text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block font-medium">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-base text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-base text-gray-300 hover:text-white hover:translate-x-1 transition-all inline-block font-medium">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-5">
            <h3 className="text-xl font-extrabold text-white">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 group">
                <Mail className="w-6 h-6 text-blue-400 mt-0.5 group-hover:scale-110 transition-transform" />
                <a href="mailto:support@salonmoney.com" className="text-base text-gray-300 hover:text-white transition-colors font-medium">
                  support@salonmoney.com
                </a>
              </li>
              <li className="flex items-start space-x-3 group">
                <Phone className="w-6 h-6 text-purple-400 mt-0.5 group-hover:scale-110 transition-transform" />
                <a href="tel:+2320123456789" className="text-base text-gray-300 hover:text-white transition-colors font-medium">
                  +232 (0) 123 456 789
                </a>
              </li>
              <li className="flex items-start space-x-3 group">
                <MapPin className="w-6 h-6 text-pink-400 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="text-base text-gray-300 font-medium">Freetown, Sierra Leone</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 mt-8 pt-6">
          <div className="text-center">
            <p className="text-lg font-extrabold text-white mb-2">
              © {currentYear} SalonMoney. All rights reserved.
            </p>
            <p className="text-sm text-gray-300 font-medium">
              Empowering Your Financial Future
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

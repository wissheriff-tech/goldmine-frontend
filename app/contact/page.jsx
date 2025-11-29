'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Facebook as FacebookIcon, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  // Social media links - UPDATE THESE WITH YOUR ACTUAL LINKS
  const socialLinks = {
    whatsapp: 'https://chat.whatsapp.com/YOUR_GROUP_INVITE_LINK', // UPDATE THIS
    facebook: 'https://facebook.com/salonmoney', // UPDATE THIS
    tiktok: 'https://chat.whatsapp.com/YOUR_GROUP_INVITE_LINK', // Currently links to WhatsApp as requested
    instagram: 'https://chat.whatsapp.com/YOUR_GROUP_INVITE_LINK', // Currently links to WhatsApp as requested
    twitter: 'https://chat.whatsapp.com/YOUR_GROUP_INVITE_LINK', // Currently links to WhatsApp as requested
    youtube: 'https://chat.whatsapp.com/YOUR_GROUP_INVITE_LINK', // Currently links to WhatsApp as requested
    linkedin: 'https://chat.whatsapp.com/YOUR_GROUP_INVITE_LINK', // Currently links to WhatsApp as requested
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('Your message has been sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Contact Us
          </h1>
          <p className="text-gray-400 text-lg">
            Get in touch with our team - We're here to help you 24/7
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <Send className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Send Us a Message</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="+232 XXX XXX XXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email Us</h3>
                    <a href="mailto:support@salonmoney.com" className="text-gray-400 hover:text-blue-400 transition-colors">
                      support@salonmoney.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Call Us</h3>
                    <a href="tel:+2320123456789" className="text-gray-400 hover:text-purple-400 transition-colors">
                      +232 (0) 123 456 789
                    </a>
                    <p className="text-sm text-gray-500 mt-1">Available 24/7</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Visit Us</h3>
                    <p className="text-gray-400">
                      Freetown, Sierra Leone
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 shadow-xl">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-white mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Join Our WhatsApp Community</h3>
                <p className="text-blue-100 mb-4">
                  Get instant support and updates from our team
                </p>
                <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Join WhatsApp Group</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Connect With Us</h2>
            <p className="text-gray-400">Follow us on social media for updates and exclusive offers</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {/* WhatsApp */}
            <a
              href={socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl p-6 flex flex-col items-center justify-center space-y-3 transition-all transform hover:scale-105 shadow-lg"
            >
              <MessageCircle className="w-8 h-8 text-white" />
              <span className="text-white font-semibold text-sm">WhatsApp</span>
            </a>

            {/* Facebook */}
            <a
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl p-6 flex flex-col items-center justify-center space-y-3 transition-all transform hover:scale-105 shadow-lg"
            >
              <FacebookIcon className="w-8 h-8 text-white" />
              <span className="text-white font-semibold text-sm">Facebook</span>
            </a>

            {/* TikTok */}
            <a
              href={socialLinks.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black rounded-xl p-6 flex flex-col items-center justify-center space-y-3 transition-all transform hover:scale-105 shadow-lg"
            >
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <span className="text-white font-semibold text-sm">TikTok</span>
            </a>

            {/* Instagram */}
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-pink-600 via-purple-600 to-orange-500 hover:from-pink-700 hover:via-purple-700 hover:to-orange-600 rounded-xl p-6 flex flex-col items-center justify-center space-y-3 transition-all transform hover:scale-105 shadow-lg"
            >
              <Instagram className="w-8 h-8 text-white" />
              <span className="text-white font-semibold text-sm">Instagram</span>
            </a>

            {/* Twitter */}
            <a
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 rounded-xl p-6 flex flex-col items-center justify-center space-y-3 transition-all transform hover:scale-105 shadow-lg"
            >
              <Twitter className="w-8 h-8 text-white" />
              <span className="text-white font-semibold text-sm">Twitter</span>
            </a>

            {/* YouTube */}
            <a
              href={socialLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl p-6 flex flex-col items-center justify-center space-y-3 transition-all transform hover:scale-105 shadow-lg"
            >
              <Youtube className="w-8 h-8 text-white" />
              <span className="text-white font-semibold text-sm">YouTube</span>
            </a>

            {/* LinkedIn */}
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gradient-to-br from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 rounded-xl p-6 flex flex-col items-center justify-center space-y-3 transition-all transform hover:scale-105 shadow-lg"
            >
              <Linkedin className="w-8 h-8 text-white" />
              <span className="text-white font-semibold text-sm">LinkedIn</span>
            </a>
          </div>

          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-gray-300 text-center">
              <span className="font-semibold text-yellow-400">Note:</span> Some social media links are temporarily set to our WhatsApp group. We'll update them once the respective social media pages are active.
            </p>
          </div>
        </div>

        {/* Business Hours */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Response Times</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">WhatsApp Chat</h3>
              <p className="text-gray-400 text-sm">Instant response</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Email Support</h3>
              <p className="text-gray-400 text-sm">Within 24 hours</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Phone Support</h3>
              <p className="text-gray-400 text-sm">24/7 availability</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

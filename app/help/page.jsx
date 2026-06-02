'use client';

import { useState } from 'react';
import { Send, MessageCircle, X, Bot, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HelpCenter() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I\'m your SalonMoney assistant. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('Your message has been sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message
    const userMessage = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);

    // Generate bot response based on keywords
    const botResponse = generateBotResponse(chatInput.toLowerCase());

    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 800);

    setChatInput('');
  };

  const generateBotResponse = (input) => {
    // Simple AI-like responses based on keywords
    if (input.includes('invest') || input.includes('investment') || input.includes('vip')) {
      return 'We offer various VIP investment packages with different returns. You can view all available packages in the Products section. Each package has different investment amounts and return percentages. Would you like to know more about a specific package?';
    }
    if (input.includes('withdraw') || input.includes('withdrawal')) {
      return 'Withdrawals can be made from your dashboard. Go to the Withdraw section, enter your amount, and submit your request. Processing typically takes 24-48 hours. Minimum withdrawal amount is ₦1,000.';
    }
    if (input.includes('recharge') || input.includes('deposit') || input.includes('fund')) {
      return 'You can recharge your account via the Recharge section in your dashboard. We accept bank transfers and online payments. Your account is credited within minutes after payment confirmation.';
    }
    if (input.includes('referral') || input.includes('refer')) {
      return 'Our referral program rewards you for inviting friends! Share your unique referral link and earn commissions when they invest. You can find your referral link in the Referrals section of your dashboard.';
    }
    if (input.includes('account') || input.includes('profile')) {
      return 'You can manage your account settings from the Account section. There you can update your profile, change password, enable 2FA security, and manage your payment methods.';
    }
    if (input.includes('security') || input.includes('2fa') || input.includes('safe')) {
      return 'We take security seriously! We recommend enabling Two-Factor Authentication (2FA) for extra protection. You can activate this in your Account settings. We also use bank-level encryption to protect your data.';
    }
    if (input.includes('contact') || input.includes('support') || input.includes('help')) {
      return 'You can reach our support team via the Contact Us page, email at support@salonmoney.com, or join our WhatsApp community group for instant support. Our team is available 24/7 to assist you.';
    }
    if (input.includes('how') && input.includes('work')) {
      return 'SalonMoney is an investment platform where you purchase VIP packages and earn daily returns. Simply recharge your account, choose a package, invest, and watch your earnings grow! You can withdraw your profits anytime.';
    }
    if (input.includes('package') || input.includes('plan')) {
      return 'We have multiple VIP packages ranging from VIP1 to VIP8, each with different investment amounts and daily returns. Higher VIP levels offer better returns. Check the Products page to see all available packages and their benefits.';
    }
    if (input.includes('profit') || input.includes('earning') || input.includes('return')) {
      return 'Your profits are calculated daily based on your VIP package. Returns are automatically added to your account balance. You can view your earnings history in the Transactions section and withdraw anytime.';
    }
    if (input.includes('hi') || input.includes('hello') || input.includes('hey')) {
      return 'Hello! Welcome to SalonMoney support. I\'m here to help you with any questions about investments, withdrawals, recharges, or account management. What would you like to know?';
    }

    // Default response
    return 'Thank you for your question! For detailed assistance, please fill out the contact form below or reach out to our support team via the Contact Us page. Our team will provide you with specific information about your inquiry.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Help Center
          </h1>
          <p className="text-gray-400 text-lg">
            We're here to help! Send us a message or chat with our AI assistant
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <Send className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Send Us a Message</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
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
                  Email Address
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
                  Subject
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
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* FAQ Section */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>

              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-semibold text-white mb-2">How do I invest?</h3>
                  <p className="text-gray-400 text-sm">
                    Simply recharge your account, go to Products, select a VIP package, and click invest. Your returns will be calculated daily.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-lg font-semibold text-white mb-2">How long does withdrawal take?</h3>
                  <p className="text-gray-400 text-sm">
                    Withdrawals are processed within 24-48 hours. You'll receive a notification once completed.
                  </p>
                </div>

                <div className="border-l-4 border-pink-500 pl-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Is my money safe?</h3>
                  <p className="text-gray-400 text-sm">
                    Yes! We use bank-level encryption and security measures. We also recommend enabling 2FA for extra protection.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-lg font-semibold text-white mb-2">How does the referral program work?</h3>
                  <p className="text-gray-400 text-sm">
                    Share your unique referral link with friends. When they invest, you earn commission. Find your link in the Referrals section.
                  </p>
                </div>
              </div>
            </div>

            {/* Chat with AI Button */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center shadow-xl">
              <MessageCircle className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Need Quick Help?</h3>
              <p className="text-blue-100 mb-4">
                Chat with our AI assistant for instant answers
              </p>
              <button
                onClick={() => setChatOpen(true)}
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>

        {/* AI Chat Modal */}
        {chatOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl w-full max-w-2xl h-[600px] flex flex-col shadow-2xl border border-gray-700">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">SalonMoney Assistant</h3>
                    <p className="text-blue-100 text-sm">Online</p>
                  </div>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-2 ${
                      msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.sender === 'bot' ? 'bg-blue-600' : 'bg-purple-600'
                    }`}>
                      {msg.sender === 'bot' ? (
                        <Bot className="w-5 h-5 text-white" />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl ${
                        msg.sender === 'bot'
                          ? 'bg-gray-700 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

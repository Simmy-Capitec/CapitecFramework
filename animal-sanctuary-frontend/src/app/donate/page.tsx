'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, DollarSign, Calendar, Shield, 
  CreditCard, Gift, Users, Home,
  CheckCircle, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function DonatePage() {
  const [donationType, setDonationType] = useState<'one-time' | 'monthly'>('one-time');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);

  const impactLevels = [
    { amount: 25, impact: "Feeds 5 animals for a week", icon: "🥘" },
    { amount: 50, impact: "Provides medical supplies for a month", icon: "💊" },
    { amount: 100, impact: "Covers a complete vet checkup", icon: "🏥" },
    { amount: 250, impact: "Sponsors an animal's care for a month", icon: "🏠" },
    { amount: 500, impact: "Funds a critical surgery", icon: "💗" },
    { amount: 1000, impact: "Builds new shelter improvements", icon: "🏗️" }
  ];

  const handleDonate = () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!amount || amount <= 0 || isNaN(amount)) {
      toast.error('Please select or enter a valid donation amount');
      return;
    }
    
    // Simulate donation processing
    toast.success(`Processing your ${donationType} donation of $${amount}...`);
    setTimeout(() => {
      setShowThankYou(true);
    }, 2000);
  };

  if (showThankYou) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sanctuary-nature-50 to-sanctuary-primary-50 flex items-center justify-center p-4">
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-sanctuary-primary-800 mb-4">
            Thank You!
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Your generous donation helps us continue our mission of rescuing and caring for animals in need.
          </p>
          <div className="bg-sanctuary-primary-50 rounded-lg p-4 mb-6">
            <p className="text-sanctuary-primary-700">
              You'll receive a receipt at your email address shortly.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-sanctuary-primary-600 text-white py-2 px-6 rounded-lg hover:bg-sanctuary-primary-700"
          >
            Return to Homepage
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sanctuary-nature-50 to-sanctuary-primary-50">
      {/* Hero Section */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-sanctuary-primary-800 mb-6">
              Make a Difference Today
            </h1>
            <p className="text-xl text-sanctuary-primary-600 max-w-3xl mx-auto">
              Your donation directly supports the care, medical treatment, and rehabilitation 
              of animals waiting for their forever homes.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Impact Stats */}
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-sanctuary-primary-600 mb-2">500+</div>
              <p className="text-gray-600">Animals Rescued</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-sanctuary-nature-600 mb-2">$75K</div>
              <p className="text-gray-600">Annual Medical Costs</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-sanctuary-care-600 mb-2">95%</div>
              <p className="text-gray-600">Goes to Animal Care</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-sanctuary-primary-600 mb-2">1,200+</div>
              <p className="text-gray-600">Monthly Donors</p>
            </div>
          </div>
        </motion.section>

        {/* Donation Form */}
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-sanctuary-primary-800 mb-8 text-center">
              Choose Your Impact
            </h2>

            {/* Donation Type Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                <button
                  onClick={() => setDonationType('one-time')}
                  className={`px-6 py-2 rounded-md transition-all ${
                    donationType === 'one-time'
                      ? 'bg-white text-sanctuary-primary-600 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  One-Time Gift
                </button>
                <button
                  onClick={() => setDonationType('monthly')}
                  className={`px-6 py-2 rounded-md transition-all ${
                    donationType === 'monthly'
                      ? 'bg-white text-sanctuary-primary-600 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Monthly
                  </span>
                </button>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {impactLevels.map((level) => (
                <motion.button
                  key={level.amount}
                  onClick={() => {
                    setSelectedAmount(level.amount);
                    setCustomAmount('');
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedAmount === level.amount
                      ? 'border-sanctuary-primary-500 bg-sanctuary-primary-50'
                      : 'border-gray-200 hover:border-sanctuary-primary-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-2xl mb-1">{level.icon}</div>
                  <div className="font-bold text-lg mb-1">${level.amount}</div>
                  <div className="text-xs text-gray-600">{level.impact}</div>
                </motion.button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or enter a custom amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sanctuary-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Donation Button */}
            <button
              onClick={handleDonate}
              className="w-full bg-sanctuary-primary-600 text-white py-4 rounded-lg hover:bg-sanctuary-primary-700 transition-colors duration-200 flex items-center justify-center text-lg font-semibold"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Donate ${customAmount || selectedAmount || 0} {donationType === 'monthly' ? 'Monthly' : 'Now'}
            </button>

            {/* Security Note */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 flex items-center justify-center">
                <Shield className="h-4 w-4 mr-1" />
                Your donation is secure and processed through our trusted payment partner
              </p>
            </div>
          </div>
        </motion.section>

        {/* Other Ways to Help */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-sanctuary-primary-800 mb-8 text-center">
            Other Ways to Help
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Gift className="h-12 w-12 text-sanctuary-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Wish List</h3>
              <p className="text-gray-600 mb-4">
                Donate supplies like food, toys, and blankets from our Amazon wish list.
              </p>
              <a href="#" className="text-sanctuary-primary-600 hover:text-sanctuary-primary-700">
                View Wish List →
              </a>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Users className="h-12 w-12 text-sanctuary-nature-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Corporate Sponsorship</h3>
              <p className="text-gray-600 mb-4">
                Partner with us for corporate giving and employee engagement programs.
              </p>
              <a href="#" className="text-sanctuary-primary-600 hover:text-sanctuary-primary-700">
                Learn More →
              </a>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Home className="h-12 w-12 text-sanctuary-care-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Legacy Giving</h3>
              <p className="text-gray-600 mb-4">
                Include Paws & Hearts in your will to create a lasting impact.
              </p>
              <a href="#" className="text-sanctuary-primary-600 hover:text-sanctuary-primary-700">
                Plan Your Legacy →
              </a>
            </div>
          </div>
        </motion.section>

        {/* Where Your Money Goes */}
        <motion.section 
          className="mt-16 bg-white rounded-lg shadow-md p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-sanctuary-primary-800 mb-8 text-center">
            Where Your Donation Goes
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Animal Care & Medical</span>
                  <span className="font-semibold">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-sanctuary-primary-600 h-3 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Facility Operations</span>
                  <span className="font-semibold">20%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-sanctuary-nature-600 h-3 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Adoption Programs</span>
                  <span className="font-semibold">10%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-sanctuary-care-600 h-3 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Administration</span>
                  <span className="font-semibold">5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gray-600 h-3 rounded-full" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
            
            <p className="text-center text-gray-600 mt-6">
              We're committed to transparency. View our complete 
              <a href="#" className="text-sanctuary-primary-600 hover:text-sanctuary-primary-700 ml-1">
                annual report
              </a>.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
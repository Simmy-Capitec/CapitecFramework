'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Heart, CheckCircle, Users, FileText, Home, 
  Clock, Shield, ArrowRight, DollarSign, Phone, Mail 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdoptionProcessPage() {
  const steps = [
    {
      number: 1,
      title: "Browse & Choose",
      description: "Browse our available animals and find your perfect companion",
      icon: Heart,
      timeframe: "Browse anytime",
      details: [
        "View detailed profiles of all available animals",
        "Learn about their personality, medical history, and needs",
        "Visit our sanctuary to meet them in person"
      ]
    },
    {
      number: 2,
      title: "Application",
      description: "Complete our comprehensive adoption application",
      icon: FileText,
      timeframe: "15-30 minutes",
      details: [
        "Provide information about your living situation",
        "Tell us about your experience with pets",
        "Reference checks and veterinarian references"
      ]
    },
    {
      number: 3,
      title: "Meet & Greet",
      description: "Schedule a visit to meet your potential new family member",
      icon: Users,
      timeframe: "1-2 hours",
      details: [
        "Spend quality time with the animal",
        "Bring family members and other pets",
        "Ask questions about care and behavior"
      ]
    },
    {
      number: 4,
      title: "Home Visit",
      description: "Our team conducts a friendly home visit",
      icon: Home,
      timeframe: "1 hour",
      details: [
        "Ensure your home is safe and suitable",
        "Provide tips for pet-proofing",
        "Address any concerns or questions"
      ]
    },
    {
      number: 5,
      title: "Approval & Adoption",
      description: "Finalize the adoption and welcome your new family member",
      icon: CheckCircle,
      timeframe: "30 minutes",
      details: [
        "Sign adoption contract and pay adoption fee",
        "Receive medical records and care instructions",
        "Schedule follow-up support if needed"
      ]
    }
  ];

  const requirements = [
    {
      icon: Shield,
      title: "Age Requirement",
      description: "Adopters must be 21 years or older"
    },
    {
      icon: Home,
      title: "Housing",
      description: "Stable housing situation with landlord approval if renting"
    },
    {
      icon: DollarSign,
      title: "Financial Stability",
      description: "Ability to provide ongoing care, food, and veterinary expenses"
    },
    {
      icon: Clock,
      title: "Time Commitment",
      description: "Adequate time for exercise, training, and companionship"
    }
  ];

  const fees = [
    { type: "Dogs", fee: "$200-400", includes: "Spay/neuter, vaccinations, microchip" },
    { type: "Cats", fee: "$100-200", includes: "Spay/neuter, vaccinations, microchip" },
    { type: "Small Animals", fee: "$50-150", includes: "Health check, vaccinations" },
    { type: "Special Needs", fee: "Varies", includes: "Ongoing medical support included" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sanctuary-nature-50 to-sanctuary-primary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <motion.h1 
              className="text-4xl font-bold text-sanctuary-primary-800 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Adoption Process
            </motion.h1>
            <motion.p 
              className="text-xl text-sanctuary-primary-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Find your perfect companion through our caring, thorough adoption process designed to ensure lifelong matches
            </motion.p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Steps Section */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-sanctuary-primary-800 text-center mb-12">
            Our 5-Step Adoption Process
          </h2>
          
          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                className="bg-white rounded-lg shadow-md p-8"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                  {/* Step Number & Icon */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-sanctuary-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                      {step.number}
                    </div>
                    <step.icon className="h-8 w-8 text-sanctuary-primary-600" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-semibold text-sanctuary-primary-800 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-lg text-gray-600 mb-4">
                          {step.description}
                        </p>
                      </div>
                      <div className="flex items-center text-sm text-sanctuary-primary-600 bg-sanctuary-primary-50 px-3 py-1 rounded-full whitespace-nowrap">
                        <Clock className="h-4 w-4 mr-1" />
                        {step.timeframe}
                      </div>
                    </div>
                    
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-sanctuary-care-500 mt-0.5 mr-3 flex-shrink-0" />
                          <span className="text-gray-600">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Arrow */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block">
                      <ArrowRight className="h-6 w-6 text-sanctuary-primary-400" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Requirements Section */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-sanctuary-primary-800 text-center mb-12">
            Adoption Requirements
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {requirements.map((requirement, index) => (
              <motion.div
                key={requirement.title}
                className="bg-white rounded-lg shadow-md p-6 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
              >
                <requirement.icon className="h-12 w-12 text-sanctuary-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-sanctuary-primary-800 mb-3">
                  {requirement.title}
                </h3>
                <p className="text-gray-600">
                  {requirement.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Adoption Fees Section */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <h2 className="text-3xl font-bold text-sanctuary-primary-800 text-center mb-12">
            Adoption Fees
          </h2>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sanctuary-primary-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-lg font-semibold text-sanctuary-primary-800">
                      Animal Type
                    </th>
                    <th className="px-6 py-4 text-left text-lg font-semibold text-sanctuary-primary-800">
                      Adoption Fee
                    </th>
                    <th className="px-6 py-4 text-left text-lg font-semibold text-sanctuary-primary-800">
                      What's Included
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fees.map((fee, index) => (
                    <tr key={fee.type} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 font-medium text-sanctuary-primary-700">
                        {fee.type}
                      </td>
                      <td className="px-6 py-4 text-sanctuary-primary-600 font-semibold">
                        {fee.fee}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {fee.includes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-sanctuary-care-50 rounded-lg p-6 mt-6">
            <div className="flex items-start">
              <Heart className="h-6 w-6 text-sanctuary-care-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-sanctuary-care-800 mb-2">
                  Why Adoption Fees?
                </h3>
                <p className="text-sanctuary-care-700">
                  Adoption fees help cover the cost of medical care, food, shelter, and other expenses 
                  while animals are in our care. They also help ensure that adopters are prepared for 
                  the ongoing costs of pet ownership.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-sanctuary-primary-800 mb-4">
              Ready to Find Your New Best Friend?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Browse our available animals and start your adoption journey today. 
              Our team is here to help you every step of the way.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/animals"
                className="bg-sanctuary-primary-600 text-white px-8 py-3 rounded-lg hover:bg-sanctuary-primary-700 transition-colors duration-200 flex items-center justify-center"
              >
                <Heart className="h-5 w-5 mr-2" />
                Browse Available Animals
              </Link>
              <a 
                href="tel:+15551234567"
                className="border border-sanctuary-primary-600 text-sanctuary-primary-600 px-8 py-3 rounded-lg hover:bg-sanctuary-primary-50 transition-colors duration-200 flex items-center justify-center"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call Us: (555) 123-PAWS
              </a>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-sanctuary-primary-800 mb-4">
                Questions? We're Here to Help
              </h3>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-sm">
                <a 
                  href="mailto:adopt@pawsandhearts.org" 
                  className="flex items-center text-sanctuary-primary-600 hover:text-sanctuary-primary-700"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  adopt@pawsandhearts.org
                </a>
                <div className="flex items-center text-gray-600">
                  <Home className="h-4 w-4 mr-2" />
                  123 Sanctuary Lane, Hope Valley, CA 95432
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
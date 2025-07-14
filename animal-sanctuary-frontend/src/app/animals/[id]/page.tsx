'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAnimal } from '@/hooks/use-animals';
import { 
  Heart, ArrowLeft, Calendar, MapPin, DollarSign, 
  Shield, Stethoscope, AlertCircle, CheckCircle,
  User, Phone, Mail, Home
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function AnimalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const animalId = parseInt(params.id as string);
  const [showAdoptionForm, setShowAdoptionForm] = useState(false);

  const { data: response, isLoading, error } = useAnimal(animalId);
  const animal = response?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sanctuary-primary-600"></div>
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Animal Not Found</h2>
          <p className="text-gray-600 mb-4">Sorry, we couldn't find the animal you're looking for.</p>
          <Link href="/animals" className="text-sanctuary-primary-600 hover:text-sanctuary-primary-700">
            ← Back to all animals
          </Link>
        </div>
      </div>
    );
  }

  const statusColors = {
    Available: 'bg-green-100 text-green-800 border-green-300',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Medical Hold': 'bg-red-100 text-red-800 border-red-300',
    Adopted: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sanctuary-nature-50 to-sanctuary-primary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/animals" 
            className="inline-flex items-center text-sanctuary-primary-600 hover:text-sanctuary-primary-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to all animals
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Animal Header */}
            <motion.div 
              className="bg-white rounded-lg shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Photo */}
              <div className="h-96 bg-gradient-to-br from-sanctuary-primary-200 to-sanctuary-nature-200 flex items-center justify-center">
                {animal.photos ? (
                  <img 
                    src={animal.photos} 
                    alt={animal.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Heart className="h-24 w-24 text-sanctuary-primary-400" />
                )}
              </div>

              {/* Basic Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-sanctuary-primary-800 mb-2">
                      {animal.name}
                    </h1>
                    <p className="text-lg text-sanctuary-primary-600">
                      {animal.species} • {animal.breed || 'Mixed Breed'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[animal.adoption_status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                    {animal.adoption_status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-sanctuary-primary-500" />
                    <span>{animal.age} years old</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Shield className="h-4 w-4 mr-2 text-sanctuary-primary-500" />
                    <span>{animal.gender}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2 text-sanctuary-primary-500" />
                    <span>${animal.adoption_fee} fee</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-sanctuary-primary-500" />
                    <span>{animal.habitat_name}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Detailed Information */}
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div>
                <h2 className="text-xl font-semibold text-sanctuary-primary-800 mb-3">About {animal.name}</h2>
                <div className="space-y-4 text-gray-600">
                  <div>
                    <p className="font-medium text-gray-700">Appearance</p>
                    <p>{animal.color} • {animal.weight_kg}kg</p>
                  </div>
                  
                  {animal.behavioral_notes && (
                    <div>
                      <p className="font-medium text-gray-700">Personality & Behavior</p>
                      <p>{animal.behavioral_notes}</p>
                    </div>
                  )}
                  
                  {animal.dietary_requirements && (
                    <div>
                      <p className="font-medium text-gray-700">Dietary Requirements</p>
                      <p>{animal.dietary_requirements}</p>
                    </div>
                  )}
                  
                  {animal.special_needs && animal.special_needs !== 'None' && (
                    <div>
                      <p className="font-medium text-gray-700">Special Needs</p>
                      <p>{animal.special_needs}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="font-medium text-gray-700">Time at Sanctuary</p>
                    <p>{animal.days_in_sanctuary} days (arrived {format(new Date(animal.arrival_date), 'MMMM d, yyyy')})</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Medical History */}
            {animal.medical_history && animal.medical_history.length > 0 && (
              <motion.div 
                className="bg-white rounded-lg shadow-md p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-xl font-semibold text-sanctuary-primary-800 mb-4 flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Medical History
                </h2>
                <div className="space-y-3">
                  {animal.medical_history.map((record: any) => (
                    <div key={record.record_id} className="border-l-4 border-sanctuary-care-300 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-700">{record.visit_type}</p>
                          <p className="text-sm text-gray-600">{record.diagnosis || 'Routine checkup'}</p>
                          {record.treatment && (
                            <p className="text-sm text-gray-500 mt-1">Treatment: {record.treatment}</p>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {format(new Date(record.visit_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Adoption CTA */}
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-lg font-semibold text-sanctuary-primary-800 mb-4">
                Interested in {animal.name}?
              </h3>
              
              {animal.adoption_status === 'Available' ? (
                <>
                  <p className="text-gray-600 mb-4">
                    {animal.name} is ready to find a forever home! Our adoption process ensures the perfect match.
                  </p>
                  <button 
                    onClick={() => setShowAdoptionForm(true)}
                    className="w-full bg-sanctuary-primary-600 text-white py-3 px-4 rounded-lg hover:bg-sanctuary-primary-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    Start Adoption Application
                  </button>
                  <Link 
                    href="/adoption-process"
                    className="block text-center text-sanctuary-primary-600 hover:text-sanctuary-primary-700 mt-3 text-sm"
                  >
                    Learn about our adoption process
                  </Link>
                </>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    {animal.adoption_status === 'Pending' && 'This animal has a pending adoption application.'}
                    {animal.adoption_status === 'Medical Hold' && 'This animal is receiving medical care.'}
                    {animal.adoption_status === 'Adopted' && 'This animal has found their forever home!'}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Quick Stats */}
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-sanctuary-primary-800 mb-4">
                Quick Facts
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Medical Records</span>
                  <span className="font-medium">{animal.medical_records_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Applications</span>
                  <span className="font-medium">{animal.application_count || 0}</span>
                </div>
                {animal.microchip_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Microchipped</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div 
              className="bg-sanctuary-primary-50 rounded-lg p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-sanctuary-primary-800 mb-4">
                Questions?
              </h3>
              <div className="space-y-3 text-sm">
                <a href="tel:+15551234567" className="flex items-center text-sanctuary-primary-700 hover:text-sanctuary-primary-800">
                  <Phone className="h-4 w-4 mr-2" />
                  (555) 123-PAWS
                </a>
                <a href="mailto:adopt@pawsandhearts.org" className="flex items-center text-sanctuary-primary-700 hover:text-sanctuary-primary-800">
                  <Mail className="h-4 w-4 mr-2" />
                  adopt@pawsandhearts.org
                </a>
                <div className="flex items-start text-sanctuary-primary-700">
                  <Home className="h-4 w-4 mr-2 mt-0.5" />
                  <div>
                    <p>123 Sanctuary Lane</p>
                    <p>Hope Valley, CA 95432</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Adoption Form Modal (placeholder) */}
      {showAdoptionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-sanctuary-primary-800 mb-4">
              Start Adoption Application
            </h2>
            <p className="text-gray-600 mb-4">
              To begin the adoption process, please create an account or log in.
            </p>
            <div className="space-y-3">
              <button className="w-full bg-sanctuary-primary-600 text-white py-2 px-4 rounded-lg hover:bg-sanctuary-primary-700">
                Create Account
              </button>
              <button className="w-full border border-sanctuary-primary-600 text-sanctuary-primary-600 py-2 px-4 rounded-lg hover:bg-sanctuary-primary-50">
                Log In
              </button>
              <button 
                onClick={() => setShowAdoptionForm(false)}
                className="w-full text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
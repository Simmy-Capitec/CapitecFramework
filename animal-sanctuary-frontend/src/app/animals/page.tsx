'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAnimals } from '@/hooks/use-animals';
import { Heart, Search, Filter, MapPin, Calendar, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

// ===================================================================
// ANIMALS BROWSE PAGE
// ===================================================================

export default function AnimalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch animals with filters
  const { 
    data: animalsResponse, 
    isLoading, 
    error 
  } = useAnimals({
    species: selectedSpecies || undefined,
    status: selectedStatus || undefined,
    page: currentPage,
    limit: 12,
    available_only: !selectedStatus ? true : undefined
  });

  const animals = animalsResponse?.data || [];
  const pagination = animalsResponse?.pagination;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sanctuary-nature-50 to-sanctuary-primary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <motion.h1 
              className="text-4xl font-bold text-sanctuary-primary-800 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Find Your Forever Friend
            </motion.h1>
            <motion.p 
              className="text-lg text-sanctuary-primary-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Every animal deserves a loving home. Browse our wonderful companions waiting to meet you.
            </motion.p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <motion.div 
          className="bg-white rounded-lg shadow-md p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sanctuary-primary-500 focus:border-transparent"
              />
            </div>

            {/* Species Filter */}
            <select
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sanctuary-primary-500 focus:border-transparent"
            >
              <option value="">All Species</option>
              <option value="Dog">Dogs</option>
              <option value="Cat">Cats</option>
              <option value="Rabbit">Rabbits</option>
              <option value="Bird">Birds</option>
              <option value="Other">Other</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sanctuary-primary-500 focus:border-transparent"
            >
              <option value="">Available Only</option>
              <option value="Available">Available</option>
              <option value="Pending">Pending Adoption</option>
              <option value="Medical Hold">Medical Hold</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecies('');
                setSelectedStatus('');
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-sanctuary-primary-600 text-white rounded-lg hover:bg-sanctuary-primary-700 transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sanctuary-primary-600 mx-auto"></div>
            <p className="mt-4 text-sanctuary-primary-600">Loading our wonderful animals...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">
              Unable to load animals at the moment. Please try again later.
            </p>
            <p className="text-red-500 text-sm mt-2">
              Note: Database connection needs to be configured with your PostgreSQL credentials.
            </p>
          </div>
        )}

        {/* Animals Grid */}
        {!isLoading && !error && (
          <>
            {animals.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-sanctuary-primary-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-sanctuary-primary-700 mb-2">
                  No animals match your criteria
                </h3>
                <p className="text-sanctuary-primary-600">
                  Try adjusting your filters to see more animals.
                </p>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {animals.map((animal, index) => (
                  <AnimalCard key={animal.animal_id} animal={animal} index={index} />
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.has_prev_page}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sanctuary-primary-50"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 bg-sanctuary-primary-600 text-white rounded-lg">
                    {pagination.current_page} of {pagination.total_pages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.has_next_page}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sanctuary-primary-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ===================================================================
// ANIMAL CARD COMPONENT
// ===================================================================

interface AnimalCardProps {
  animal: any;
  index: number;
}

function AnimalCard({ animal, index }: AnimalCardProps) {
  const statusColors: Record<string, string> = {
    Available: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    'Medical Hold': 'bg-red-100 text-red-800',
    Adopted: 'bg-blue-100 text-blue-800',
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -2 }}
    >
      {/* Photo */}
      <div className="h-48 bg-gradient-to-br from-sanctuary-primary-200 to-sanctuary-nature-200 flex items-center justify-center">
        {animal.photos ? (
          <img 
            src={animal.photos} 
            alt={animal.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Heart className="h-12 w-12 text-sanctuary-primary-400" />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-sanctuary-primary-800">
            {animal.name}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[animal.adoption_status] || 'bg-gray-100 text-gray-800'}`}>
            {animal.adoption_status}
          </span>
        </div>

        <div className="space-y-2 text-sm text-sanctuary-primary-600">
          <div className="flex items-center">
            <span className="font-medium">{animal.species}</span>
            {animal.breed && <span className="ml-1">• {animal.breed}</span>}
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{animal.age} years old</span>
          </div>
          
          {animal.habitat_name && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{animal.habitat_name}</span>
            </div>
          )}
          
          {animal.adoption_fee > 0 && (
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>${animal.adoption_fee} adoption fee</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <Link 
            href={`/animals/${animal.animal_id}`}
            className="block w-full bg-sanctuary-primary-600 text-white py-2 px-4 rounded-lg hover:bg-sanctuary-primary-700 transition-colors duration-200 text-center"
          >
            Learn More
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
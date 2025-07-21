'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, MapPin, Clock, Users, Heart, Star, 
  Filter, ArrowRight, Phone, Mail, DollarSign,
  Gift, Award, TreePine, Camera, Music, Utensils
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

  const categories = [
    { id: 'all', name: 'All Events', color: 'sanctuary-primary' },
    { id: 'adoption', name: 'Adoption Events', color: 'sanctuary-care' },
    { id: 'fundraising', name: 'Fundraising', color: 'sanctuary-nature' },
    { id: 'education', name: 'Education', color: 'sanctuary-primary' },
    { id: 'volunteer', name: 'Volunteer', color: 'sanctuary-care' },
    { id: 'community', name: 'Community', color: 'sanctuary-nature' }
  ];

  const months = [
    'all', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Super Adoption Saturday",
      date: "2025-07-12",
      time: "10:00 AM - 4:00 PM",
      category: "adoption",
      location: "Sanctuary Main Campus",
      description: "Join us for a special adoption event with reduced fees and extended hours. Meet dozens of animals looking for their forever homes.",
      featured: true,
      cost: "Free",
      capacity: "Open event",
      organizer: "Adoption Team",
      highlights: [
        "Reduced adoption fees ($50 off)",
        "Extended hours for more flexibility",
        "Meet & greet with all available animals",
        "Adoption counselors on-site",
        "Photo booth with your new pet"
      ],
      icon: Heart
    },
    {
      id: 2,
      title: "Paws & Paint Fundraiser",
      date: "2025-07-19",
      time: "6:00 PM - 9:00 PM",
      category: "fundraising",
      location: "Community Center Ballroom",
      description: "An elegant evening of art, wine, and animal advocacy. Create artwork alongside rescued animals and support our medical fund.",
      featured: true,
      cost: "$75 per person",
      capacity: "Limited to 50 guests",
      organizer: "Development Team",
      highlights: [
        "Guided painting session with therapy animals",
        "Wine and appetizer reception",
        "Silent auction with local art",
        "100% proceeds support medical care",
        "Take home your masterpiece"
      ],
      icon: Star
    },
    {
      id: 3,
      title: "Volunteer Orientation",
      date: "2025-07-05",
      time: "1:00 PM - 4:00 PM",
      category: "volunteer",
      location: "Education Center",
      description: "New volunteer orientation covering animal care basics, safety protocols, and available volunteer opportunities.",
      featured: false,
      cost: "Free",
      capacity: "20 participants",
      organizer: "Volunteer Coordinator",
      highlights: [
        "Comprehensive training program",
        "Tour of all facility areas",
        "Meet current volunteer team",
        "Safety and handling training",
        "Refreshments provided"
      ],
      icon: Users
    },
    {
      id: 4,
      title: "Kids & Critters Summer Camp",
      date: "2025-07-22",
      time: "9:00 AM - 3:00 PM",
      category: "education",
      location: "Sanctuary Grounds",
      description: "Week-long summer camp for children ages 8-14 to learn about animal care, responsible pet ownership, and wildlife conservation.",
      featured: false,
      cost: "$150 per week",
      capacity: "15 children per session",
      organizer: "Education Team",
      highlights: [
        "Hands-on animal interactions",
        "Educational workshops and crafts",
        "Nature walks and outdoor activities",
        "Lunch and snacks included",
        "Certificate of completion"
      ],
      icon: Award
    },
    {
      id: 5,
      title: "Annual Gala: \"A Night for the Animals\"",
      date: "2025-08-15",
      time: "7:00 PM - 11:00 PM",
      category: "fundraising",
      location: "Grand Hotel Ballroom",
      description: "Our premier fundraising event featuring dinner, entertainment, and a live auction to support sanctuary operations.",
      featured: true,
      cost: "$200 per person",
      capacity: "300 guests",
      organizer: "Board of Directors",
      highlights: [
        "Three-course plated dinner",
        "Live and silent auctions",
        "Awards ceremony",
        "Dancing and entertainment",
        "VIP reception option available"
      ],
      icon: Star
    },
    {
      id: 6,
      title: "Photography Workshop: \"Capturing Animal Personalities\"",
      date: "2025-07-28",
      time: "10:00 AM - 2:00 PM",
      category: "education",
      location: "Sanctuary Grounds",
      description: "Learn professional photography techniques while helping create adoption photos for our animals.",
      featured: false,
      cost: "$40 per person",
      capacity: "12 participants",
      organizer: "Marketing Team",
      highlights: [
        "Professional photographer instruction",
        "Hands-on practice with animals",
        "Digital editing basics",
        "Create portfolio for animals",
        "Light lunch included"
      ],
      icon: Camera
    }
  ];

  const filteredEvents = upcomingEvents.filter(event => {
    const categoryMatch = selectedCategory === 'all' || event.category === selectedCategory;
    const monthMatch = selectedMonth === 'all' || 
      new Date(event.date).toLocaleString('default', { month: 'long' }) === selectedMonth;
    return categoryMatch && monthMatch;
  });

  const pastEvents = [
    {
      title: "Spring Adoption Spectacular",
      date: "2025-05-18",
      animals_adopted: 23,
      funds_raised: 5600,
      attendees: 150
    },
    {
      title: "Volunteer Appreciation Dinner",
      date: "2025-04-12",
      volunteers_honored: 45,
      years_of_service: 230,
      attendees: 80
    },
    {
      title: "Walk for Paws 5K",
      date: "2025-03-22",
      participants: 89,
      funds_raised: 12400,
      miles_walked: 445
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sanctuary-nature-50 to-sanctuary-primary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-sanctuary-primary-800 mb-4">
              Events & Activities
            </h1>
            <p className="text-xl text-sanctuary-primary-600 max-w-3xl mx-auto">
              Join us for exciting events that bring our community together while supporting animals in need. 
              From adoption events to fundraisers, there's something for everyone.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Filter className="h-5 w-5 text-sanctuary-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-sanctuary-primary-800">Filter Events</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sanctuary-primary-500 focus:border-sanctuary-primary-500"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sanctuary-primary-500 focus:border-sanctuary-primary-500"
                >
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month === 'all' ? 'All Months' : month}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Featured Events */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-sanctuary-primary-800 mb-8">Featured Events</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredEvents.filter(event => event.featured).map((event, index) => (
              <motion.div
                key={event.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-sanctuary-care-400"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <event.icon className="h-8 w-8 text-sanctuary-care-600 mr-3" />
                      <span className="px-3 py-1 bg-sanctuary-care-100 text-sanctuary-care-800 rounded-full text-sm font-medium">
                        Featured
                      </span>
                    </div>
                    <Star className="h-6 w-6 text-yellow-500" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-sanctuary-primary-800 mb-3">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>{event.cost}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <h4 className="font-semibold text-sanctuary-primary-800">Event Highlights:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {event.highlights.slice(0, 3).map((highlight, idx) => (
                        <li key={idx} className="flex items-start">
                          <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-sanctuary-care-500 flex-shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 bg-sanctuary-primary-600 text-white py-2 px-4 rounded-lg hover:bg-sanctuary-primary-700 transition-colors duration-200">
                      Register Now
                    </button>
                    <button className="flex-1 border border-sanctuary-primary-600 text-sanctuary-primary-600 py-2 px-4 rounded-lg hover:bg-sanctuary-primary-50 transition-colors duration-200">
                      Learn More
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* All Events */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-sanctuary-primary-800 mb-8">Upcoming Events</h2>
          
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Events Found</h3>
              <p className="text-gray-500">Try adjusting your filters to see more events.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  className="bg-white rounded-lg shadow-md p-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start mb-4">
                        <event.icon className="h-6 w-6 text-sanctuary-primary-600 mr-3 mt-1" />
                        <div>
                          <h3 className="text-xl font-bold text-sanctuary-primary-800 mb-2">
                            {event.title}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{event.capacity}</span>
                            </div>
                          </div>
                          <p className="text-gray-600">{event.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="lg:ml-6 lg:flex-shrink-0">
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                        <button className="bg-sanctuary-primary-600 text-white px-6 py-2 rounded-lg hover:bg-sanctuary-primary-700 transition-colors duration-200">
                          Register
                        </button>
                        <button className="border border-sanctuary-primary-600 text-sanctuary-primary-600 px-6 py-2 rounded-lg hover:bg-sanctuary-primary-50 transition-colors duration-200">
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Past Events Success Stories */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <h2 className="text-3xl font-bold text-sanctuary-primary-800 mb-8">Recent Event Highlights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pastEvents.map((event, index) => (
              <motion.div
                key={event.title}
                className="bg-white rounded-lg shadow-md p-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
              >
                <h3 className="text-lg font-semibold text-sanctuary-primary-800 mb-3">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {new Date(event.date).toLocaleDateString()}
                </p>
                
                <div className="space-y-3">
                  {event.animals_adopted && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Animals Adopted</span>
                      <span className="font-semibold text-sanctuary-care-600">{event.animals_adopted}</span>
                    </div>
                  )}
                  {event.funds_raised && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Funds Raised</span>
                      <span className="font-semibold text-sanctuary-nature-600">${event.funds_raised.toLocaleString()}</span>
                    </div>
                  )}
                  {event.volunteers_honored && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Volunteers Honored</span>
                      <span className="font-semibold text-sanctuary-primary-600">{event.volunteers_honored}</span>
                    </div>
                  )}
                  {event.participants && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Participants</span>
                      <span className="font-semibold text-sanctuary-primary-600">{event.participants}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-gray-600">Total Attendees</span>
                    <span className="font-semibold text-sanctuary-primary-800">{event.attendees}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        >
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-sanctuary-primary-800 mb-4">
              Stay Connected
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Don't miss out on upcoming events! Subscribe to our newsletter or follow us on social media 
              for the latest updates on events, adoption success stories, and volunteer opportunities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button className="bg-sanctuary-primary-600 text-white px-8 py-3 rounded-lg hover:bg-sanctuary-primary-700 transition-colors duration-200 flex items-center justify-center">
                <Mail className="h-5 w-5 mr-2" />
                Subscribe to Newsletter
              </button>
              <Link 
                href="/volunteer"
                className="border border-sanctuary-primary-600 text-sanctuary-primary-600 px-8 py-3 rounded-lg hover:bg-sanctuary-primary-50 transition-colors duration-200 flex items-center justify-center"
              >
                <Users className="h-5 w-5 mr-2" />
                Become a Volunteer
              </Link>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-sanctuary-primary-800 mb-4">
                Questions About Events?
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-sanctuary-primary-600 mr-2" />
                  <span>(555) 123-PAWS</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-sanctuary-primary-600 mr-2" />
                  <span>events@pawsandhearts.org</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
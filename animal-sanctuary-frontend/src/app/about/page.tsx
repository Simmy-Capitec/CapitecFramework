'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Heart, Users, Shield, Award, MapPin, Phone, Mail, 
  Clock, TreePine, Home, Stethoscope, GraduationCap,
  Target, Star, Calendar, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const stats = [
    { icon: Heart, label: "Animals Rescued", value: "2,500+", color: "text-sanctuary-care-600" },
    { icon: Home, label: "Forever Homes", value: "1,800+", color: "text-sanctuary-primary-600" },
    { icon: Users, label: "Active Volunteers", value: "150+", color: "text-sanctuary-nature-600" },
    { icon: Calendar, label: "Years of Service", value: "15", color: "text-sanctuary-care-600" }
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "Every animal receives individualized care, medical attention, and love while they wait for their forever home.",
      color: "sanctuary-care"
    },
    {
      icon: Shield,
      title: "No-Kill Philosophy",
      description: "We are committed to finding homes for all healthy and treatable animals, regardless of how long it takes.",
      color: "sanctuary-primary"
    },
    {
      icon: Users,
      title: "Community Focus",
      description: "Building strong relationships with adopters, volunteers, and the community to create lasting bonds.",
      color: "sanctuary-nature"
    },
    {
      icon: GraduationCap,
      title: "Education & Advocacy",
      description: "Promoting responsible pet ownership through education, training, and community outreach programs.",
      color: "sanctuary-care"
    }
  ];

  const team = [
    {
      name: "Dr. Sarah Mitchell",
      role: "Veterinary Director",
      experience: "12 years",
      specialization: "Emergency care & surgery",
      image: null
    },
    {
      name: "Michael Rodriguez",
      role: "Operations Manager",
      experience: "8 years",
      specialization: "Facility management & logistics",
      image: null
    },
    {
      name: "Emily Chen",
      role: "Adoption Coordinator",
      experience: "6 years",
      specialization: "Behavioral assessment & matching",
      image: null
    },
    {
      name: "James Thompson",
      role: "Volunteer Director",
      experience: "10 years",
      specialization: "Training & community outreach",
      image: null
    }
  ];

  const milestones = [
    {
      year: "2009",
      title: "Foundation Established",
      description: "Paws & Hearts Sanctuary was founded with a mission to rescue and rehome abandoned animals."
    },
    {
      year: "2012",
      title: "First Major Expansion",
      description: "Opened our medical facility and doubled our capacity to care for more animals in need."
    },
    {
      year: "2015",
      title: "1,000th Adoption",
      description: "Celebrated our 1,000th successful adoption, marking a major milestone in our mission."
    },
    {
      year: "2018",
      title: "Education Center Opened",
      description: "Launched our community education center offering training programs and workshops."
    },
    {
      year: "2021",
      title: "COVID-19 Response",
      description: "Adapted operations to continue rescues safely during the pandemic while maintaining adoption services."
    },
    {
      year: "2024",
      title: "Modern Facility Upgrade",
      description: "Completed major renovation with state-of-the-art medical equipment and expanded housing."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sanctuary-nature-50 to-sanctuary-primary-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-sanctuary-primary-600 to-sanctuary-care-600 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold mb-6">About Paws & Hearts Sanctuary</h1>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              For over 15 years, we've been dedicated to rescuing, rehabilitating, and rehoming animals in need. 
              Every life matters, every story deserves a happy ending.
            </p>
            <div className="flex items-center justify-center text-lg">
              <MapPin className="h-6 w-6 mr-2" />
              <span>123 Sanctuary Lane, Hope Valley, CA 95432</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <stat.icon className={`h-12 w-12 ${stat.color} mx-auto mb-4`} />
                <div className="text-3xl font-bold text-sanctuary-primary-800 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Mission & Values */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-sanctuary-primary-800 mb-6">Our Mission & Values</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              We believe every animal deserves love, care, and a chance at happiness. Our comprehensive approach 
              combines rescue, rehabilitation, adoption, and education to create lasting positive impact.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                className="bg-white rounded-lg shadow-md p-8 border-l-4 border-sanctuary-primary-400"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              >
                <value.icon className={`h-12 w-12 ${
                  value.color === 'sanctuary-care' ? 'text-sanctuary-care-600' :
                  value.color === 'sanctuary-primary' ? 'text-sanctuary-primary-600' :
                  value.color === 'sanctuary-nature' ? 'text-sanctuary-nature-600' :
                  'text-gray-600'
                } mb-4`} />
                <h3 className="text-2xl font-semibold text-sanctuary-primary-800 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="py-16 bg-sanctuary-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <h2 className="text-4xl font-bold text-sanctuary-primary-800 mb-6">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From humble beginnings to a leading animal sanctuary, see how we've grown and evolved 
              to better serve our community and the animals in our care.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 transform md:-translate-x-px h-full w-0.5 bg-sanctuary-primary-300"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-sanctuary-primary-600 rounded-full border-4 border-white shadow-md z-10"></div>
                  
                  {/* Content */}
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'} pl-20 md:pl-0`}>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center mb-3">
                        <span className="text-2xl font-bold text-sanctuary-primary-600 mr-4">
                          {milestone.year}
                        </span>
                        <h3 className="text-xl font-semibold text-sanctuary-primary-800">
                          {milestone.title}
                        </h3>
                      </div>
                      <p className="text-gray-600">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <h2 className="text-4xl font-bold text-sanctuary-primary-800 mb-6">Meet Our Leadership Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our dedicated team of professionals brings together veterinary expertise, operations management, 
              and community outreach to ensure the best care for every animal.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.6 + index * 0.1 }}
              >
                {/* Photo placeholder */}
                <div className="h-64 bg-gradient-to-br from-sanctuary-primary-200 to-sanctuary-care-200 flex items-center justify-center">
                  <Users className="h-16 w-16 text-sanctuary-primary-400" />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-sanctuary-primary-800 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-sanctuary-primary-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{member.experience} experience</span>
                    </div>
                    <div className="flex items-start">
                      <Star className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{member.specialization}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Facilities Section */}
      <div className="py-16 bg-sanctuary-nature-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
          >
            <h2 className="text-4xl font-bold text-sanctuary-primary-800 mb-6">Our Facilities</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              State-of-the-art facilities designed with animal welfare and comfort as our top priorities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="bg-white rounded-lg shadow-md p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.0 }}
            >
              <Stethoscope className="h-16 w-16 text-sanctuary-care-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-sanctuary-primary-800 mb-4">
                Medical Center
              </h3>
              <p className="text-gray-600 mb-4">
                Full-service veterinary facility with surgery suites, diagnostic equipment, and 24/7 emergency care.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Digital X-ray and ultrasound</li>
                <li>• Surgical and dental suites</li>
                <li>• Isolation and quarantine areas</li>
                <li>• Pharmacy and laboratory</li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg shadow-md p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.1 }}
            >
              <Home className="h-16 w-16 text-sanctuary-primary-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-sanctuary-primary-800 mb-4">
                Housing & Habitats
              </h3>
              <p className="text-gray-600 mb-4">
                Comfortable, climate-controlled environments designed for different species and special needs.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Individual and group housing</li>
                <li>• Indoor/outdoor access</li>
                <li>• Enrichment and play areas</li>
                <li>• Special needs accommodations</li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg shadow-md p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.2 }}
            >
              <TreePine className="h-16 w-16 text-sanctuary-nature-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-sanctuary-primary-800 mb-4">
                Outdoor Spaces
              </h3>
              <p className="text-gray-600 mb-4">
                Expansive outdoor areas for exercise, socialization, and natural behaviors on our 25-acre property.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Secure exercise yards</li>
                <li>• Nature trails and gardens</li>
                <li>• Training and agility areas</li>
                <li>• Visitor meeting spaces</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Contact & Visit Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.4 }}
          >
            <h2 className="text-4xl font-bold text-sanctuary-primary-800 mb-8">Visit Us & Get Involved</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-sanctuary-primary-50 rounded-lg p-8">
                <h3 className="text-2xl font-semibold text-sanctuary-primary-800 mb-6">
                  Contact Information
                </h3>
                <div className="space-y-4 text-left">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-sanctuary-primary-600 mr-3" />
                    <div>
                      <p className="font-medium">123 Sanctuary Lane</p>
                      <p className="text-gray-600">Hope Valley, CA 95432</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-sanctuary-primary-600 mr-3" />
                    <div>
                      <p className="font-medium">(555) 123-PAWS</p>
                      <p className="text-gray-600">Main office & adoption inquiries</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-sanctuary-primary-600 mr-3" />
                    <div>
                      <p className="font-medium">info@pawsandhearts.org</p>
                      <p className="text-gray-600">General information</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-sanctuary-care-50 rounded-lg p-8">
                <h3 className="text-2xl font-semibold text-sanctuary-primary-800 mb-6">
                  Visit Hours
                </h3>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="font-medium">Monday - Friday</span>
                    <span className="text-gray-600">10:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Saturday</span>
                    <span className="text-gray-600">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sunday</span>
                    <span className="text-gray-600">12:00 PM - 4:00 PM</span>
                  </div>
                  <div className="mt-4 p-3 bg-white rounded border-l-4 border-sanctuary-care-400">
                    <p className="text-sm text-gray-600">
                      <strong>Note:</strong> Walk-ins welcome, but appointments recommended for adoptions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/animals"
                className="bg-sanctuary-primary-600 text-white px-8 py-3 rounded-lg hover:bg-sanctuary-primary-700 transition-colors duration-200 flex items-center justify-center"
              >
                <Heart className="h-5 w-5 mr-2" />
                Meet Our Animals
              </Link>
              <Link 
                href="/volunteer"
                className="border border-sanctuary-primary-600 text-sanctuary-primary-600 px-8 py-3 rounded-lg hover:bg-sanctuary-primary-50 transition-colors duration-200 flex items-center justify-center"
              >
                <Users className="h-5 w-5 mr-2" />
                Become a Volunteer
              </Link>
              <Link 
                href="/donate"
                className="bg-sanctuary-care-600 text-white px-8 py-3 rounded-lg hover:bg-sanctuary-care-700 transition-colors duration-200 flex items-center justify-center"
              >
                <Target className="h-5 w-5 mr-2" />
                Support Our Mission
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
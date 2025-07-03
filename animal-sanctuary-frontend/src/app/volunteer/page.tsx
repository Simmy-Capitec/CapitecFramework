'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Users, Calendar, Clock, Shield, 
  CheckCircle, Star, Award, Briefcase
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

// Form validation schema
const volunteerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  dateOfBirth: z.string(),
  occupation: z.string().optional(),
  experience: z.string(),
  availability: z.array(z.string()).min(1, 'Please select at least one day'),
  interests: z.array(z.string()).min(1, 'Please select at least one area of interest'),
  emergencyContact: z.string().min(5, 'Please provide emergency contact information'),
  whyVolunteer: z.string().min(50, 'Please tell us more about why you want to volunteer (min 50 characters)'),
  criminalBackground: z.boolean(),
  agreeTo: z.boolean().refine(val => val === true, 'You must agree to the terms')
});

type VolunteerFormData = z.infer<typeof volunteerSchema>;

export default function VolunteerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: {
      availability: [],
      interests: [],
      criminalBackground: false,
      agreeTo: false
    }
  });

  const watchAvailability = watch('availability', []);
  const watchInterests = watch('interests', []);

  const handleCheckboxChange = (field: 'availability' | 'interests', value: string) => {
    const current = field === 'availability' ? watchAvailability : watchInterests;
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    setValue(field, updated);
  };

  const onSubmit = async (data: VolunteerFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Submit to API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setShowThankYou(true);
      toast.success('Volunteer application submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const volunteerRoles = [
    {
      icon: Heart,
      title: "Animal Care",
      description: "Feed, groom, and provide daily care for our animals"
    },
    {
      icon: Users,
      title: "Adoption Counseling",
      description: "Help match animals with their perfect families"
    },
    {
      icon: Calendar,
      title: "Event Support",
      description: "Assist with fundraisers and community events"
    },
    {
      icon: Briefcase,
      title: "Administrative",
      description: "Help with office tasks and record keeping"
    }
  ];

  const benefits = [
    "Make a real difference in animals' lives",
    "Join a compassionate community",
    "Gain valuable experience",
    "Flexible scheduling options",
    "Volunteer appreciation events",
    "Reference letters available"
  ];

  if (showThankYou) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sanctuary-nature-50 to-sanctuary-primary-50 flex items-center justify-center p-4">
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-sanctuary-primary-800 mb-4">
            Thank You for Your Application!
          </h2>
          <p className="text-gray-600 mb-6">
            We've received your volunteer application and will review it shortly. 
            You'll receive an email within 3-5 business days with next steps.
          </p>
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
              Become a Volunteer
            </h1>
            <p className="text-xl text-sanctuary-primary-600 max-w-3xl mx-auto">
              Join our dedicated team of volunteers and help us provide love, care, and 
              second chances to animals in need. Every hour you give makes a difference.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Volunteer Opportunities */}
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-sanctuary-primary-800 text-center mb-12">
            Volunteer Opportunities
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {volunteerRoles.map((role, index) => (
              <motion.div
                key={role.title}
                className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <div className="w-16 h-16 bg-sanctuary-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <role.icon className="h-8 w-8 text-sanctuary-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-sanctuary-primary-800 mb-2">
                  {role.title}
                </h3>
                <p className="text-gray-600">
                  {role.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Why Volunteer */}
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-sanctuary-primary-800 mb-8 text-center">
              Why Volunteer With Us?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <Star className="h-6 w-6 text-sanctuary-primary-500 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Application Form */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-sanctuary-primary-800 mb-8 text-center">
              Volunteer Application
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-xl font-semibold text-sanctuary-primary-700 mb-4">
                  Personal Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      {...register('firstName')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sanctuary-primary-500 focus:border-transparent"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      {...register('lastName')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sanctuary-primary-500 focus:border-transparent"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sanctuary-primary-500 focus:border-transparent"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      {...register('phone')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sanctuary-primary-500 focus:border-transparent"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      {...register('dateOfBirth')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sanctuary-primary-500 focus:border-transparent"
                    />
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupation
                    </label>
                    <input
                      type="text"
                      {...register('occupation')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sanctuary-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Previous Animal Experience *
                </label>
                <select
                  {...register('experience')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sanctuary-primary-500 focus:border-transparent"
                >
                  <option value="">Select experience level</option>
                  <option value="none">No previous experience</option>
                  <option value="personal">Personal pets only</option>
                  <option value="volunteer">Previous volunteer experience</option>
                  <option value="professional">Professional experience</option>
                </select>
                {errors.experience && (
                  <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>
                )}
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-xl font-semibold text-sanctuary-primary-700 mb-4">
                  Availability *
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Flexible'].map(day => (
                    <label key={day} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={day}
                        checked={watchAvailability.includes(day)}
                        onChange={() => handleCheckboxChange('availability', day)}
                        className="h-4 w-4 text-sanctuary-primary-600 focus:ring-sanctuary-primary-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
                {errors.availability && (
                  <p className="text-red-500 text-sm mt-1">{errors.availability.message}</p>
                )}
              </div>

              {/* Areas of Interest */}
              <div>
                <h3 className="text-xl font-semibold text-sanctuary-primary-700 mb-4">
                  Areas of Interest *
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Animal Care & Feeding',
                    'Dog Walking',
                    'Cat Socialization',
                    'Adoption Events',
                    'Fundraising',
                    'Administrative Tasks',
                    'Maintenance & Cleaning',
                    'Photography/Social Media'
                  ].map(interest => (
                    <label key={interest} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={interest}
                        checked={watchInterests.includes(interest)}
                        onChange={() => handleCheckboxChange('interests', interest)}
                        className="h-4 w-4 text-sanctuary-primary-600 focus:ring-sanctuary-primary-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{interest}</span>
                    </label>
                  ))}
                </div>
                {errors.interests && (
                  <p className="text-red-500 text-sm mt-1">{errors.interests.message}</p>
                )}
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact (Name & Phone) *
                </label>
                <input
                  type="text"
                  {...register('emergencyContact')}
                  placeholder="Jane Doe - (555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sanctuary-primary-500 focus:border-transparent"
                />
                {errors.emergencyContact && (
                  <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.message}</p>
                )}
              </div>

              {/* Why Volunteer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Why do you want to volunteer at our sanctuary? *
                </label>
                <textarea
                  {...register('whyVolunteer')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sanctuary-primary-500 focus:border-transparent"
                />
                {errors.whyVolunteer && (
                  <p className="text-red-500 text-sm mt-1">{errors.whyVolunteer.message}</p>
                )}
              </div>

              {/* Background Check */}
              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    {...register('criminalBackground')}
                    className="h-4 w-4 text-sanctuary-primary-600 focus:ring-sanctuary-primary-500 border-gray-300 rounded mt-1"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    I understand that a background check may be required for certain volunteer positions
                  </span>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    {...register('agreeTo')}
                    className="h-4 w-4 text-sanctuary-primary-600 focus:ring-sanctuary-primary-500 border-gray-300 rounded mt-1"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    I agree to commit to a minimum of 4 hours per month and attend an orientation session *
                  </span>
                </label>
                {errors.agreeTo && (
                  <p className="text-red-500 text-sm mt-1">{errors.agreeTo.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="text-center pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-sanctuary-primary-600 text-white py-3 px-8 rounded-lg hover:bg-sanctuary-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
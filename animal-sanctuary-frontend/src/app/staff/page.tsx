'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Heart, Calendar, DollarSign, 
  Activity, FileText, Settings, LogIn,
  BarChart3, TrendingUp, AlertCircle, CheckCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function StaffPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      // Store JWT token in localStorage (in production, consider more secure storage)
      localStorage.setItem('auth_token', result.data.token);
      localStorage.setItem('user_data', JSON.stringify(result.data.user));

      setIsAuthenticated(true);
      toast.success(result.message || 'Welcome to the Staff Portal!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sanctuary-primary-50 to-sanctuary-nature-50 flex items-center justify-center p-4">
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-sanctuary-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-8 w-8 text-sanctuary-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-sanctuary-primary-800 mb-2">
              Staff Portal
            </h1>
            <p className="text-gray-600">
              Sign in to access the management dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit(onLogin)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sanctuary-primary-500 focus:border-transparent"
                placeholder="staff@pawsandhearts.org"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                {...register('password')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sanctuary-primary-500 focus:border-transparent"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sanctuary-primary-600 text-white py-3 rounded-lg hover:bg-sanctuary-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center text-sm text-gray-600">
              <p className="font-semibold mb-2">Demo Credentials:</p>
              <div className="space-y-1">
                <p>Admin: robert.brown@sanctuary.org / admin123</p>
                <p>Vet: sarah.williams@sanctuary.org / vet123</p>
                <p>Adoption: jennifer.davis@sanctuary.org / adoption123</p>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // Dashboard Stats
  const stats = [
    { 
      label: 'Total Animals', 
      value: '48', 
      change: '+3', 
      icon: Heart, 
      color: 'text-sanctuary-primary-600',
      bgColor: 'bg-sanctuary-primary-100'
    },
    { 
      label: 'Pending Applications', 
      value: '12', 
      change: '+5', 
      icon: FileText, 
      color: 'text-sanctuary-nature-600',
      bgColor: 'bg-sanctuary-nature-100'
    },
    { 
      label: 'Active Volunteers', 
      value: '32', 
      change: '+2', 
      icon: Users, 
      color: 'text-sanctuary-care-600',
      bgColor: 'bg-sanctuary-care-100'
    },
    { 
      label: 'Monthly Donations', 
      value: '$12,450', 
      change: '+15%', 
      icon: DollarSign, 
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  const recentApplications = [
    { id: 1, name: 'Sarah Johnson', animal: 'Max', status: 'Under Review', date: '2 hours ago' },
    { id: 2, name: 'Mike Chen', animal: 'Luna', status: 'Interview Scheduled', date: '5 hours ago' },
    { id: 3, name: 'Emily Davis', animal: 'Charlie', status: 'Submitted', date: '1 day ago' },
  ];

  const urgentTasks = [
    { id: 1, task: 'Medical checkup for Bella', type: 'medical', due: 'Today' },
    { id: 2, task: 'Review adoption application #45', type: 'application', due: 'Tomorrow' },
    { id: 3, task: 'Update vaccination records', type: 'medical', due: 'This week' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-sanctuary-primary-800">
              Staff Dashboard
            </h1>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                toast.success('Logged out successfully');
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    {stat.change} this month
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Applications */}
          <motion.div 
            className="lg:col-span-2 bg-white rounded-lg shadow-md p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-sanctuary-primary-800 mb-4">
              Recent Adoption Applications
            </h2>
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{app.name}</p>
                    <p className="text-sm text-gray-600">Applied for {app.animal}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      app.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'Interview Scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {app.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{app.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-sanctuary-primary-600 hover:text-sanctuary-primary-700 text-sm font-medium">
              View All Applications →
            </button>
          </motion.div>

          {/* Urgent Tasks */}
          <motion.div 
            className="bg-white rounded-lg shadow-md p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-xl font-semibold text-sanctuary-primary-800 mb-4">
              Urgent Tasks
            </h2>
            <div className="space-y-3">
              {urgentTasks.map((task) => (
                <div key={task.id} className="flex items-start">
                  <div className={`p-2 rounded-lg mr-3 ${
                    task.type === 'medical' ? 'bg-red-100' :
                    task.type === 'application' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    {task.type === 'medical' ? (
                      <Activity className="h-4 w-4 text-red-600" />
                    ) : (
                      <FileText className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{task.task}</p>
                    <p className="text-xs text-gray-500">Due: {task.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div 
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <button className="bg-sanctuary-primary-600 text-white p-4 rounded-lg hover:bg-sanctuary-primary-700 transition-colors">
            <Heart className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm">Add New Animal</span>
          </button>
          <button className="bg-sanctuary-nature-600 text-white p-4 rounded-lg hover:bg-sanctuary-nature-700 transition-colors">
            <FileText className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm">Review Applications</span>
          </button>
          <button className="bg-sanctuary-care-600 text-white p-4 rounded-lg hover:bg-sanctuary-care-700 transition-colors">
            <Activity className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm">Medical Records</span>
          </button>
          <button className="bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 transition-colors">
            <BarChart3 className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm">View Reports</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
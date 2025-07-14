import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Heart, Shield, Users, MapPin, Phone, Mail } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sanctuary-neutral-200">
        <div className="sanctuary-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-sanctuary-primary-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-xl text-sanctuary-primary-600">
                  Paws & Hearts
                </h1>
                <p className="text-xs text-sanctuary-neutral-500 -mt-1">Animal Sanctuary</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/animals" className="text-sanctuary-neutral-700 hover:text-sanctuary-primary-600 font-medium transition-colors">
                Find a Pet
              </Link>
              <Link href="/about" className="text-sanctuary-neutral-700 hover:text-sanctuary-primary-600 font-medium transition-colors">
                About Us
              </Link>
              <Link href="/volunteer" className="text-sanctuary-neutral-700 hover:text-sanctuary-primary-600 font-medium transition-colors">
                Volunteer
              </Link>
              <Link href="/donate" className="text-sanctuary-neutral-700 hover:text-sanctuary-primary-600 font-medium transition-colors">
                Donate
              </Link>
              <Link href="/staff" className="sanctuary-button-primary text-sm">
                Staff Portal
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-lg bg-sanctuary-neutral-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-sanctuary-primary-50 via-sanctuary-nature-50 to-sanctuary-care-50"></div>
        <div className="absolute inset-0 bg-[url('/images/paw-pattern.svg')] opacity-5"></div>
        
        <div className="sanctuary-container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-heading font-bold leading-tight">
                  <span className="sanctuary-text-gradient">Every Animal</span>
                  <br />
                  <span className="text-sanctuary-neutral-800">Deserves Love</span>
                </h1>
                <p className="text-xl text-sanctuary-neutral-600 leading-relaxed max-w-lg">
                  Welcome to Paws & Hearts Animal Sanctuary, where we provide loving care for rescued animals 
                  and help them find their forever homes.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/animals" className="sanctuary-button-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                  Find Your New Best Friend
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/volunteer" className="sanctuary-button-secondary inline-flex items-center gap-2 text-lg px-8 py-4">
                  <Heart className="w-5 h-5" />
                  Volunteer Today
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-8 pt-8 border-t border-sanctuary-neutral-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-sanctuary-primary-600">500+</div>
                  <div className="text-sm text-sanctuary-neutral-600">Animals Rescued</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-sanctuary-nature-600">350+</div>
                  <div className="text-sm text-sanctuary-neutral-600">Successful Adoptions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-sanctuary-care-600">95%</div>
                  <div className="text-sm text-sanctuary-neutral-600">Adoption Success Rate</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-slide-in">
              <div className="relative rounded-3xl overflow-hidden shadow-large">
                <Image
                  src="/images/hero-animals.jpg"
                  alt="Happy rescued animals at Paws & Hearts Sanctuary"
                  width={600}
                  height={500}
                  className="w-full h-[500px] object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Floating Success Story */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-medium p-6 max-w-xs animate-float">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-sanctuary-nature-100 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-sanctuary-nature-600 animate-heart-beat" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sanctuary-neutral-800">Bella</h3>
                    <p className="text-sm text-sanctuary-neutral-600">Just got adopted!</p>
                  </div>
                </div>
                <p className="text-sm text-sanctuary-neutral-600">
                  "Finding Bella was the best thing that happened to our family. Thank you Paws & Hearts!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Animals Preview */}
      <section className="py-20 bg-white/50">
        <div className="sanctuary-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-sanctuary-neutral-800 mb-4">
              Meet Our Available Animals
            </h2>
            <p className="text-xl text-sanctuary-neutral-600 max-w-2xl mx-auto">
              These loving animals are ready to find their forever homes. Each one has a unique story and is waiting for the perfect family.
            </p>
          </div>

          {/* Animal Cards Grid */}
          <div className="animal-grid mb-12">
            {/* Featured Animal Cards - These would be populated from API */}
            {[
              {
                name: "Max",
                species: "Dog",
                breed: "Golden Retriever Mix",
                age: 3,
                image: "photo-1601758228041-f3b2795255f1",
                status: "available",
                description: "Friendly and energetic, loves playing fetch and swimming!"
              },
              {
                name: "Luna",
                species: "Cat", 
                breed: "Domestic Shorthair",
                age: 2,
                image: "photo-1514888286974-6c03e2ca1dba",
                status: "available",
                description: "Gentle and affectionate, perfect for a quiet home."
              },
              {
                name: "Charlie",
                species: "Dog",
                breed: "Beagle Mix",
                age: 1,
                image: "photo-1587300003388-59208cc962cb",
                status: "pending",
                description: "Playful puppy who loves treats and belly rubs!"
              },
              {
                name: "Whiskers",
                species: "Cat",
                breed: "Maine Coon Mix",
                age: 4,
                image: "photo-1574144611937-0df059b5ef3e",
                status: "available",
                description: "Calm and loving, great with children and other pets."
              }
            ].map((animal, index) => (
              <div key={index} className="sanctuary-card hover-lift group">
                <div className="relative overflow-hidden rounded-t-2xl">
                  <Image
                    src={`https://images.unsplash.com/${animal.image}?auto=format&fit=crop&w=400&h=300&q=80`}
                    alt={`${animal.name} - ${animal.species} available for adoption`}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium ${
                    animal.status === 'available' 
                      ? 'bg-sanctuary-nature-100 text-sanctuary-nature-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {animal.status === 'available' ? '✅ Available' : '⏳ Pending'}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-xl font-heading font-semibold text-sanctuary-neutral-800 mb-1">
                      {animal.name}
                    </h3>
                    <p className="text-sanctuary-neutral-600">
                      {animal.breed} • {animal.age} year{animal.age !== 1 ? 's' : ''} old
                    </p>
                  </div>
                  
                  <p className="text-sanctuary-neutral-700 mb-4 line-clamp-2">
                    {animal.description}
                  </p>
                  
                  <button className="w-full sanctuary-button-secondary">
                    Learn More About {animal.name}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/animals" className="sanctuary-button-primary inline-flex items-center gap-2 text-lg px-8 py-4">
              View All Available Animals
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-sanctuary-primary-50/50">
        <div className="sanctuary-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-sanctuary-neutral-800 mb-6">
                  Our Mission: Saving Lives, Creating Families
                </h2>
                <p className="text-lg text-sanctuary-neutral-600 leading-relaxed mb-6">
                  At Paws & Hearts Animal Sanctuary, we believe every animal deserves a chance at happiness. 
                  Our dedicated team provides comprehensive care, rehabilitation, and love to animals in need, 
                  while working tirelessly to match them with perfect forever families.
                </p>
                <p className="text-lg text-sanctuary-neutral-600 leading-relaxed">
                  Since our founding, we've rescued over 500 animals and facilitated 350+ successful adoptions, 
                  with a 95% success rate that speaks to our careful matching process and ongoing support.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-sanctuary-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-8 h-8 text-sanctuary-primary-600" />
                  </div>
                  <h3 className="font-semibold text-sanctuary-neutral-800 mb-1">Loving Care</h3>
                  <p className="text-sm text-sanctuary-neutral-600">24/7 medical and emotional support</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-sanctuary-nature-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-8 h-8 text-sanctuary-nature-600" />
                  </div>
                  <h3 className="font-semibold text-sanctuary-neutral-800 mb-1">Safe Haven</h3>
                  <p className="text-sm text-sanctuary-neutral-600">Secure, comfortable environments</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-sanctuary-care-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-sanctuary-care-600" />
                  </div>
                  <h3 className="font-semibold text-sanctuary-neutral-800 mb-1">Perfect Matches</h3>
                  <p className="text-sm text-sanctuary-neutral-600">Thoughtful family pairing</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <Image
                src="/images/mission-collage.jpg"
                alt="Our mission in action - caring for animals"
                width={600}
                height={500}
                className="rounded-3xl shadow-large w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved Section */}
      <section className="py-20 bg-white">
        <div className="sanctuary-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-sanctuary-neutral-800 mb-4">
              Get Involved and Make a Difference
            </h2>
            <p className="text-xl text-sanctuary-neutral-600 max-w-2xl mx-auto">
              There are many ways to support our mission and help animals in need. Every contribution, 
              big or small, makes a real difference in an animal's life.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Adopt */}
            <div className="sanctuary-card hover-lift text-center p-8">
              <div className="w-20 h-20 bg-sanctuary-nature-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-sanctuary-nature-600" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-sanctuary-neutral-800 mb-4">Adopt</h3>
              <p className="text-sanctuary-neutral-600 mb-6 leading-relaxed">
                Give a rescued animal the loving forever home they deserve. Our adoption process ensures the perfect match for your family.
              </p>
              <Link href="/animals" className="sanctuary-button-primary w-full">
                Find Your Perfect Pet
              </Link>
            </div>

            {/* Volunteer */}
            <div className="sanctuary-card hover-lift text-center p-8">
              <div className="w-20 h-20 bg-sanctuary-care-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-sanctuary-care-600" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-sanctuary-neutral-800 mb-4">Volunteer</h3>
              <p className="text-sanctuary-neutral-600 mb-6 leading-relaxed">
                Join our amazing team of volunteers. Help with animal care, events, administration, or use your special skills to support our mission.
              </p>
              <Link href="/volunteer" className="sanctuary-button-primary w-full">
                Start Volunteering
              </Link>
            </div>

            {/* Donate */}
            <div className="sanctuary-card hover-lift text-center p-8">
              <div className="w-20 h-20 bg-sanctuary-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-sanctuary-primary-600" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-sanctuary-neutral-800 mb-4">Donate</h3>
              <p className="text-sanctuary-neutral-600 mb-6 leading-relaxed">
                Your financial support helps us provide medical care, food, shelter, and love to animals in need. Every dollar makes a difference.
              </p>
              <Link href="/donate" className="sanctuary-button-primary w-full">
                Make a Donation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Footer */}
      <footer className="bg-sanctuary-neutral-800 text-white py-16">
        <div className="sanctuary-container">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-sanctuary-primary-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-2xl">Paws & Hearts</h3>
                  <p className="text-sanctuary-neutral-300">Animal Sanctuary</p>
                </div>
              </div>
              <p className="text-sanctuary-neutral-300 mb-6 leading-relaxed max-w-md">
                Where every animal finds their forever home. We're dedicated to rescuing, rehabilitating, 
                and rehoming animals in need while building lasting bonds between pets and families.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-sanctuary-neutral-700 rounded-lg flex items-center justify-center hover:bg-sanctuary-primary-500 transition-colors">
                  <span className="sr-only">Facebook</span>
                  📘
                </a>
                <a href="#" className="w-10 h-10 bg-sanctuary-neutral-700 rounded-lg flex items-center justify-center hover:bg-sanctuary-primary-500 transition-colors">
                  <span className="sr-only">Instagram</span>
                  📷
                </a>
                <a href="#" className="w-10 h-10 bg-sanctuary-neutral-700 rounded-lg flex items-center justify-center hover:bg-sanctuary-primary-500 transition-colors">
                  <span className="sr-only">Twitter</span>
                  🐦
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/animals" className="text-sanctuary-neutral-300 hover:text-white transition-colors">Available Animals</Link></li>
                <li><Link href="/adoption-process" className="text-sanctuary-neutral-300 hover:text-white transition-colors">Adoption Process</Link></li>
                <li><Link href="/volunteer" className="text-sanctuary-neutral-300 hover:text-white transition-colors">Volunteer</Link></li>
                <li><Link href="/donate" className="text-sanctuary-neutral-300 hover:text-white transition-colors">Donate</Link></li>
                <li><Link href="/events" className="text-sanctuary-neutral-300 hover:text-white transition-colors">Events</Link></li>
                <li><Link href="/about" className="text-sanctuary-neutral-300 hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-sanctuary-primary-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sanctuary-neutral-300">
                    <p>123 Sanctuary Lane</p>
                    <p>Hope Valley, CA 95432</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-sanctuary-primary-400 flex-shrink-0" />
                  <a href="tel:+15551234567" className="text-sanctuary-neutral-300 hover:text-white transition-colors">
                    (555) 123-PAWS
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-sanctuary-primary-400 flex-shrink-0" />
                  <a href="mailto:adopt@pawsandhearts.org" className="text-sanctuary-neutral-300 hover:text-white transition-colors">
                    adopt@pawsandhearts.org
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-sanctuary-neutral-700 mt-12 pt-8 text-center">
            <p className="text-sanctuary-neutral-400">
              © 2024 Paws & Hearts Animal Sanctuary. All rights reserved. Built with love for animals in need.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
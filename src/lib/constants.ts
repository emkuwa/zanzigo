import { PopularRoute, Testimonial } from './types';

export const SITE_NAME = 'ZanziGo';
export const TAGLINE = 'Your Ride Across Zanzibar';
export const SITE_DESCRIPTION = 'Book reliable Zanzibar transfers in minutes. Connect instantly with trusted drivers across Zanzibar.';
export const SITE_URL = 'https://zanzigo.com';
export const WHATSAPP_NUMBER = '+255777000000';

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/request', label: 'Book Transfer' },
  { href: '/register/driver', label: 'Become a Driver' },
  { href: '/login', label: 'Login' },
];

export const POPULAR_ROUTES: PopularRoute[] = [
  { from: 'Abeid Amani Karume Airport', to: 'Paje', price: '98,000', price_usd: 35, duration: '45 min', distance: '48 km' },
  { from: 'Abeid Amani Karume Airport', to: 'Nungwi', price: '140,000', price_usd: 50, duration: '60 min', distance: '60 km' },
  { from: 'Abeid Amani Karume Airport', to: 'Kendwa', price: '140,000', price_usd: 50, duration: '65 min', distance: '63 km' },
  { from: 'Stone Town', to: 'Paje', price: '98,000', price_usd: 35, duration: '40 min', distance: '42 km' },
  { from: 'Stone Town', to: 'Jambiani', price: '98,000', price_usd: 35, duration: '50 min', distance: '50 km' },
  { from: 'Paje', to: 'Nungwi', price: '168,000', price_usd: 60, duration: '75 min', distance: '72 km' },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Tourist from UK',
    avatar: 'SJ',
    content: 'ZanziGo made our airport transfer incredibly smooth. The driver was waiting for us with a sign, and the car was clean and air-conditioned. Highly recommend!',
    rating: 5,
  },
  {
    id: '2',
    name: 'Markus Weber',
    role: 'Tourist from Germany',
    avatar: 'MW',
    content: 'After a long flight, it was great to have a reliable transfer arranged. The WhatsApp confirmation gave us peace of mind. Fantastic service!',
    rating: 5,
  },
  {
    id: '3',
    name: 'Emma Thompson',
    role: 'Tourist from Australia',
    avatar: 'ET',
    content: 'We used ZanziGo for multiple transfers during our stay. Every driver was punctual, friendly, and professional. The online tracking feature is brilliant.',
    rating: 5,
  },
  {
    id: '4',
    name: 'Jean-Pierre Dubois',
    role: 'Tourist from France',
    avatar: 'JD',
    content: 'Excellent service from airport to our hotel in Nungwi. The driver shared local tips along the way. Made our first day in Zanzibar special.',
    rating: 4,
  },
];

export const FAQS = [
  {
    q: 'How do I book a transfer?',
    a: 'Simply fill in the booking form on our website with your pickup location, destination, date, and contact details. We will match you with an available driver.',
  },
  {
    q: 'How are drivers verified?',
    a: 'All drivers on ZanziGo undergo a thorough verification process including license checks, vehicle inspections, and background screening.',
  },
  {
    q: 'Can I cancel my booking?',
    a: 'Yes, you can cancel your booking at any time. We recommend cancelling at least 2 hours before your scheduled pickup.',
  },
  {
    q: 'How do I pay for my transfer?',
    a: 'Payment is made directly to the driver in Tanzanian Shillings (TZS), USD, or via mobile money (M-Pesa). Cash is also accepted.',
  },
  {
    q: 'What if my flight is delayed?',
    a: 'We track flight arrivals for airport pickups. Your driver will be informed of any delays and will adjust their arrival time accordingly.',
  },
  {
    q: 'Are child seats available?',
    a: 'Please mention child seat requirements in your booking notes. We will do our best to accommodate your request.',
  },
  {
    q: 'How do I become a driver?',
    a: 'Register on our website with your details and documents. Our team will review your application and verify your credentials.',
  },
];

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Submit Your Request',
    description: 'Fill in your pickup, destination, and contact details. It takes less than 2 minutes.',
  },
  {
    step: 2,
    title: 'Driver Accepts',
    description: 'Available drivers in your area receive your request and one will accept it.',
  },
  {
    step: 3,
    title: 'Get Driver Details',
    description: 'Receive your driver\'s name, phone number, and vehicle details instantly.',
  },
  {
    step: 4,
    title: 'Enjoy Your Ride',
    description: 'Meet your driver at the pickup point and enjoy a comfortable ride across Zanzibar.',
  },
];

export const BENEFITS = [
  {
    title: 'Verified Drivers',
    description: 'All drivers are thoroughly vetted and verified for your safety and peace of mind.',
    icon: 'ShieldCheck',
  },
  {
    title: 'Instant Booking',
    description: 'Book your transfer in under 2 minutes. No phone calls needed.',
    icon: 'Zap',
  },
  {
    title: 'WhatsApp Integration',
    description: 'Receive updates and communicate with your driver via WhatsApp.',
    icon: 'MessageCircle',
  },
  {
    title: 'Best Prices',
    description: 'Transparent pricing with no hidden fees. Pay the price you see.',
    icon: 'Wallet',
  },
  {
    title: '24/7 Support',
    description: 'Our support team is available around the clock to help with any issues.',
    icon: 'Headphones',
  },
  {
    title: 'GPS Tracking',
    description: 'Track your driver\'s arrival in real-time for airport pickups.',
    icon: 'MapPin',
  },
];

export const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan (1-3 passengers)' },
  { value: 'suv', label: 'SUV (1-4 passengers)' },
  { value: 'minivan', label: 'Minivan (5-7 passengers)' },
  { value: 'bus', label: 'Bus (8-15 passengers)' },
  { value: 'taxi', label: 'Taxi (1-4 passengers)' },
];

export const ZANZIBAR_AREAS = [
  'Abeid Amani Karume Airport',
  'Stone Town',
  'Paje',
  'Nungwi',
  'Kendwa',
  'Jambiani',
  'Bwejuu',
  'Matemwe',
  'Kiwengwa',
  'Michenzani',
  'Mkunguni',
  'Fumba',
  'Kizimkazi',
  'Mtoni',
  'Mkokotoni',
  'Mkoani',
];

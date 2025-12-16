import React, { useState } from 'react';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { Button } from '../components/ui/button';
import {
  Briefcase,
  MapPin,
  Clock,
  Code,
  Palette,
  Settings,
  Megaphone,
  DollarSign,
  Package,
  Headphones,
  Users,
  Globe,
  Coffee,
  Calendar,
  Award,
  CheckCircle2,
  ArrowRight,
  Upload,
  GraduationCap,
  Laptop,
  Shield,
  Lightbulb,
  Handshake,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';

interface Job {
  id: string;
  title: string;
  category: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Intern' | 'Contract';
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  salaryRange?: string;
}

const jobCategories = [
  { id: 'engineering', label: 'Engineering', icon: Code, color: 'text-blue-600 dark:text-blue-400' },
  { id: 'design', label: 'Design', icon: Palette, color: 'text-purple-600 dark:text-purple-400' },
  { id: 'operations', label: 'Operations', icon: Settings, color: 'text-green-600 dark:text-green-400' },
  { id: 'marketing', label: 'Marketing', icon: Megaphone, color: 'text-pink-600 dark:text-pink-400' },
  { id: 'finance', label: 'Finance', icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'product', label: 'Product', icon: Package, color: 'text-orange-600 dark:text-orange-400' },
  { id: 'support', label: 'Support', icon: Headphones, color: 'text-red-600 dark:text-red-400' },
];

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Frontend Engineer',
    category: 'engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'We are looking for an experienced Frontend Engineer to join our team and help build the next generation of our marketplace platform.',
    responsibilities: [
      'Develop responsive and interactive user interfaces using React and TypeScript',
      'Collaborate with designers to implement pixel-perfect UI components',
      'Optimize application performance and ensure cross-browser compatibility',
      'Write clean, maintainable, and well-documented code',
      'Participate in code reviews and contribute to technical decisions',
    ],
    requiredSkills: [
      '3+ years of experience with React and TypeScript',
      'Strong knowledge of Tailwind CSS and modern CSS practices',
      'Experience with state management (Zustand, Redux, or similar)',
      'Understanding of RESTful APIs and GraphQL',
      'Familiarity with Git and version control',
    ],
    preferredSkills: [
      'Experience with Supabase or similar backend-as-a-service platforms',
      'Knowledge of Next.js or similar React frameworks',
      'Understanding of accessibility standards (WCAG)',
      'Experience with testing frameworks (Jest, React Testing Library)',
    ],
    salaryRange: '$60,000 - $90,000',
  },
  {
    id: '2',
    title: 'Backend Engineer',
    category: 'engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Join our backend team to build scalable APIs and services that power our marketplace platform.',
    responsibilities: [
      'Design and develop RESTful APIs and microservices',
      'Implement database schemas and optimize queries',
      'Ensure system security and data protection',
      'Collaborate with frontend team to define API contracts',
      'Monitor and maintain production systems',
    ],
    requiredSkills: [
      '3+ years of experience with Node.js',
      'Strong knowledge of PostgreSQL or similar databases',
      'Experience with API design and documentation',
      'Understanding of authentication and authorization',
      'Familiarity with cloud platforms (AWS, GCP, or Azure)',
    ],
    preferredSkills: [
      'Experience with Supabase',
      'Knowledge of GraphQL',
      'Understanding of microservices architecture',
      'Experience with Docker and Kubernetes',
    ],
    salaryRange: '$70,000 - $100,000',
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    category: 'design',
    location: 'Remote',
    type: 'Full-time',
    description: 'We are seeking a talented UI/UX Designer to create intuitive and beautiful user experiences for our marketplace.',
    responsibilities: [
      'Design user interfaces for web and mobile applications',
      'Create wireframes, prototypes, and high-fidelity designs',
      'Conduct user research and usability testing',
      'Collaborate with developers to ensure design implementation',
      'Maintain and evolve our design system',
    ],
    requiredSkills: [
      '3+ years of UI/UX design experience',
      'Proficiency in Figma, Sketch, or Adobe XD',
      'Strong portfolio demonstrating design skills',
      'Understanding of user-centered design principles',
      'Knowledge of responsive design and accessibility',
    ],
    preferredSkills: [
      'Experience with e-commerce or marketplace platforms',
      'Knowledge of HTML/CSS',
      'Experience with animation and prototyping tools',
      'Understanding of frontend development constraints',
    ],
    salaryRange: '$50,000 - $75,000',
  },
  {
    id: '4',
    title: 'AI Engineer',
    category: 'engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Help us build intelligent features that enhance the shopping experience using AI and machine learning.',
    responsibilities: [
      'Develop AI-powered recommendation systems',
      'Implement natural language processing for search',
      'Build machine learning models for fraud detection',
      'Optimize AI models for production deployment',
      'Research and experiment with new AI technologies',
    ],
    requiredSkills: [
      '2+ years of experience with machine learning',
      'Proficiency in Python and ML frameworks (TensorFlow, PyTorch)',
      'Understanding of NLP and computer vision',
      'Experience with model deployment and MLOps',
      'Strong mathematical and statistical background',
    ],
    preferredSkills: [
      'Experience with recommendation systems',
      'Knowledge of cloud ML services',
      'Understanding of e-commerce AI applications',
      'Experience with A/B testing and experimentation',
    ],
    salaryRange: '$80,000 - $120,000',
  },
  {
    id: '5',
    title: 'DevOps / Cloud Engineer',
    category: 'engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Join our infrastructure team to ensure our platform is scalable, reliable, and secure.',
    responsibilities: [
      'Manage cloud infrastructure and deployments',
      'Implement CI/CD pipelines',
      'Monitor system performance and troubleshoot issues',
      'Ensure security best practices',
      'Automate infrastructure provisioning and management',
    ],
    requiredSkills: [
      '3+ years of DevOps experience',
      'Strong knowledge of cloud platforms (AWS, GCP, or Azure)',
      'Experience with Docker and Kubernetes',
      'Proficiency in infrastructure as code (Terraform, CloudFormation)',
      'Understanding of CI/CD tools (GitHub Actions, GitLab CI)',
    ],
    preferredSkills: [
      'Experience with monitoring tools (Datadog, New Relic)',
      'Knowledge of security practices and compliance',
      'Experience with database administration',
      'Understanding of microservices architecture',
    ],
    salaryRange: '$75,000 - $110,000',
  },
  {
    id: '6',
    title: 'Marketing Lead',
    category: 'marketing',
    location: 'Remote',
    type: 'Full-time',
    description: 'Lead our marketing efforts to grow our user base and brand awareness across Africa and globally.',
    responsibilities: [
      'Develop and execute marketing strategies',
      'Manage digital marketing campaigns (SEO, SEM, social media)',
      'Create content for various marketing channels',
      'Analyze marketing metrics and optimize campaigns',
      'Build partnerships and collaborations',
    ],
    requiredSkills: [
      '5+ years of marketing experience',
      'Strong knowledge of digital marketing channels',
      'Experience with marketing analytics tools',
      'Excellent written and verbal communication skills',
      'Understanding of e-commerce marketing',
    ],
    preferredSkills: [
      'Experience in African markets',
      'Knowledge of growth marketing strategies',
      'Experience with content creation',
      'Understanding of brand building',
    ],
    salaryRange: '$60,000 - $85,000',
  },
  {
    id: '7',
    title: 'Customer Success Specialist',
    category: 'support',
    location: 'Remote',
    type: 'Full-time',
    description: 'Help our users succeed on the platform by providing exceptional support and guidance.',
    responsibilities: [
      'Respond to customer inquiries and resolve issues',
      'Onboard new sellers and buyers',
      'Gather customer feedback and insights',
      'Create support documentation and resources',
      'Escalate complex issues to appropriate teams',
    ],
    requiredSkills: [
      '2+ years of customer support experience',
      'Excellent communication and problem-solving skills',
      'Patience and empathy when dealing with customers',
      'Ability to work in a fast-paced environment',
      'Proficiency in English (additional languages a plus)',
    ],
    preferredSkills: [
      'Experience with e-commerce platforms',
      'Knowledge of CRM systems',
      'Understanding of marketplace dynamics',
      'Experience with remote support tools',
    ],
    salaryRange: '$35,000 - $50,000',
  },
  {
    id: '8',
    title: 'Logistics Data Analyst',
    category: 'operations',
    location: 'Remote',
    type: 'Full-time',
    description: 'Analyze logistics data to optimize delivery operations and improve customer satisfaction.',
    responsibilities: [
      'Analyze shipping and delivery data',
      'Identify trends and optimization opportunities',
      'Create reports and dashboards for stakeholders',
      'Work with logistics partners to improve processes',
      'Monitor key performance indicators',
    ],
    requiredSkills: [
      '2+ years of data analysis experience',
      'Proficiency in SQL and data visualization tools',
      'Strong analytical and problem-solving skills',
      'Experience with Excel and Google Sheets',
      'Understanding of logistics and supply chain',
    ],
    preferredSkills: [
      'Experience with Python or R',
      'Knowledge of business intelligence tools',
      'Understanding of e-commerce logistics',
      'Experience with A/B testing',
    ],
    salaryRange: '$45,000 - $65,000',
  },
];

const cultureValues = [
  { title: 'Innovation', description: 'We encourage creative thinking and embrace new technologies' },
  { title: 'Openness', description: 'Transparent communication and honest feedback' },
  { title: 'Ownership', description: 'Take responsibility and drive results' },
  { title: 'Learning', description: 'Continuous growth and skill development' },
  { title: 'Flexibility', description: 'Remote-friendly work environment' },
  { title: 'Diversity', description: 'Inclusive culture that values different perspectives' },
  { title: 'Customer-First', description: 'Everything we do is centered around our users' },
];

const perks = [
  { title: 'Flexible Hours', icon: Clock },
  { title: 'Remote Work', icon: Laptop },
  { title: 'Free Training', icon: GraduationCap },
  { title: 'Project Bonuses', icon: Award },
  { title: 'Equipment Support', icon: Settings },
  { title: 'Paid Leave', icon: Calendar },
  { title: 'Team Retreats', icon: Users },
];

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Frontend Engineer',
    quote: 'Working at REAGLEX has been incredible. I get to work on cutting-edge technology while making a real impact on commerce in Africa.',
    avatar: '👩‍💻',
  },
  {
    name: 'David K.',
    role: 'Product Manager',
    quote: 'The team is amazing, and the mission is inspiring. Every day I see how our platform helps sellers grow their businesses.',
    avatar: '👨‍💼',
  },
  {
    name: 'Amina H.',
    role: 'Marketing Lead',
    quote: 'The flexibility and trust here are unmatched. I can do my best work while maintaining a healthy work-life balance.',
    avatar: '👩‍💼',
  },
];

const recruitmentSteps = [
  { step: 1, title: 'Apply Online', description: 'Submit your application through our portal' },
  { step: 2, title: 'Screening', description: 'Our team reviews your application' },
  { step: 3, title: 'Interview', description: 'Meet with the team and discuss your fit' },
  { step: 4, title: 'Offer', description: 'Receive your offer and join the team' },
];

const Careers: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
    portfolio: '',
    jobId: '',
  });

  const filteredJobs = selectedCategory
    ? mockJobs.filter((job) => job.category === selectedCategory)
    : mockJobs;

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setApplicationForm({ ...applicationForm, jobId: job.id });
    setIsApplicationOpen(true);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the application to your backend
    console.log('Application submitted:', applicationForm);
    alert('Application submitted successfully! We will get back to you soon.');
    setIsApplicationOpen(false);
    setApplicationForm({
      name: '',
      email: '',
      phone: '',
      coverLetter: '',
      portfolio: '',
      jobId: '',
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AnnouncementBar />
      <Header />

      {/* Hero Section */}
      <section className="w-full bg-gray-50 dark:bg-gray-900 py-16 sm:py-24 lg:py-32">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Build the Future of Global Commerce with REAGLEX
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join us in revolutionizing e-commerce through AI-powered commerce, secure marketplace innovation, and empowering Africa's digital trade growth.
            </p>
            <Button
              onClick={() => {
                document.getElementById('open-roles')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-6 text-lg"
            >
              Explore Open Roles
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="w-full bg-white dark:bg-gray-900 py-16 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Our Mission & Vision
            </h2>
            <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300">
              <p>
                REAGLEX stands for empowering global buyers and sellers with intelligent commerce solutions. We exist to bridge the gap between traditional commerce and the digital future, making secure, AI-powered marketplace technology accessible to everyone.
              </p>
              <p>
                Our long-term mission extends from Africa to the globe, creating opportunities for millions of sellers, buyers, and businesses. We're building a platform that not only facilitates transactions but also drives economic growth and digital transformation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Work at REAGLEX */}
      <section className="w-full bg-gray-50 dark:bg-gray-900 py-16 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Why Work at REAGLEX?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                'Competitive opportunities',
                'Build real-world intelligent commerce',
                'Fast-growing startup environment',
                'Work with modern technologies (AI, Supabase, Node.js, React, Cloud)',
                'Empower millions of buyers & sellers',
                'Work with a small elite team',
                'Opportunities for leadership and rapid growth',
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 dark:text-gray-300">{benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Culture & Values */}
      <section className="w-full bg-white dark:bg-gray-900 py-16 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              REAGLEX Culture & Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cultureValues.map((value, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section id="open-roles" className="w-full bg-gray-50 dark:bg-gray-900 py-16 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Open Roles
            </h2>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-orange-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                All Roles
              </button>
              {jobCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? 'bg-orange-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${selectedCategory === category.id ? 'text-white' : category.color}`} />
                    {category.label}
                  </button>
                );
              })}
            </div>

            {/* Job Listings */}
            <div className="space-y-4">
              {filteredJobs.map((job) => {
                const category = jobCategories.find((c) => c.id === job.category);
                const CategoryIcon = category?.icon || Briefcase;
                return (
                  <div
                    key={job.id}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CategoryIcon className={`h-5 w-5 ${category?.color || 'text-gray-600'}`} />
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {job.title}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.type}
                          </div>
                          {job.salaryRange && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {job.salaryRange}
                            </div>
                          )}
                        </div>
                        <p className="mt-3 text-gray-700 dark:text-gray-300 line-clamp-2">
                          {job.description}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleApply(job)}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                      >
                        Apply Now
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Job Details Modal */}
      {selectedJob && (
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedJob.title}
              </DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 pt-2">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {selectedJob.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {selectedJob.type}
                </div>
                {selectedJob.salaryRange && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {selectedJob.salaryRange}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h4>
                <p className="text-gray-700 dark:text-gray-300">{selectedJob.description}</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Responsibilities
                </h4>
                <ul className="space-y-2">
                  {selectedJob.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Required Skills
                </h4>
                <ul className="space-y-2">
                  {selectedJob.requiredSkills.map((skill, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedJob.preferredSkills.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Preferred Skills
                  </h4>
                  <ul className="space-y-2">
                    {selectedJob.preferredSkills.map((skill, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => {
                    setSelectedJob(null);
                    handleApply(selectedJob);
                  }}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                >
                  Apply for this Position
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Application Form Modal */}
      <Dialog open={isApplicationOpen} onOpenChange={setIsApplicationOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Apply for {selectedJob?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Fill out the form below to submit your application. We'll review it and get back to you soon.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitApplication} className="space-y-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={applicationForm.name}
                onChange={(e) => setApplicationForm({ ...applicationForm, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={applicationForm.email}
                onChange={(e) => setApplicationForm({ ...applicationForm, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={applicationForm.phone}
                onChange={(e) => setApplicationForm({ ...applicationForm, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CV/Resume *
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    required
                    className="hidden"
                    onChange={(e) => {
                      // Handle file upload
                      console.log('File selected:', e.target.files?.[0]);
                    }}
                  />
                  <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-center hover:border-orange-500 transition-colors">
                    <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload or drag and drop
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      PDF, DOC, DOCX (Max 5MB)
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Letter (Optional)
              </label>
              <textarea
                value={applicationForm.coverLetter}
                onChange={(e) => setApplicationForm({ ...applicationForm, coverLetter: e.target.value })}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Tell us why you're interested in this position..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Portfolio / GitHub (Optional)
              </label>
              <input
                type="url"
                value={applicationForm.portfolio}
                onChange={(e) => setApplicationForm({ ...applicationForm, portfolio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="https://github.com/username or https://portfolio.com"
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsApplicationOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
              >
                Submit Application
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Life at REAGLEX */}
      <section className="w-full bg-white dark:bg-gray-900 py-16 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Life at REAGLEX
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Team Collaboration', icon: Users, color: 'text-blue-600 dark:text-blue-400' },
                { title: 'Innovation Labs', icon: Lightbulb, color: 'text-yellow-600 dark:text-yellow-400' },
                { title: 'Social Events', icon: Coffee, color: 'text-orange-600 dark:text-orange-400' },
                { title: 'Achievements', icon: Award, color: 'text-purple-600 dark:text-purple-400' },
                { title: 'Global Impact', icon: Globe, color: 'text-green-600 dark:text-green-400' },
                { title: 'Partnerships', icon: Handshake, color: 'text-red-600 dark:text-red-400' },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 text-center"
                  >
                    <Icon className={`h-12 w-12 mx-auto mb-4 ${item.color}`} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Diversity Statement */}
      <section className="w-full bg-gray-50 dark:bg-gray-900 py-12 sm:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-orange-600 dark:text-orange-400" />
            <p className="text-lg text-gray-700 dark:text-gray-300">
              REAGLEX is an equal opportunity employer committed to diversity, equity, and inclusion. We welcome applicants from all backgrounds and believe that diverse teams create better products and services.
            </p>
          </div>
        </div>
      </section>

      {/* Recruitment Process */}
      <section className="w-full bg-white dark:bg-gray-900 py-16 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Our Recruitment Process
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recruitmentSteps.map((step, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center"
                >
                  <div className="w-12 h-12 bg-orange-600 dark:bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full bg-gray-50 dark:bg-gray-900 py-16 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              What Our Team Says
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="text-4xl mb-4">{testimonial.avatar}</div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Perks & Benefits */}
      <section className="w-full bg-white dark:bg-gray-900 py-16 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Perks & Benefits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {perks.map((perk, index) => {
                const Icon = perk.icon;
                return (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {perk.title}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full bg-gradient-to-r from-orange-600 to-red-600 py-16 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Join us and redefine the future of online commerce.
            </h2>
            <Button
              onClick={() => {
                document.getElementById('open-roles')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
            >
              Explore Open Roles
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;


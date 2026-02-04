import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  MessageSquare,
  GitBranch,
  ArrowRight,
  Sparkles,
  Zap,
  Brain,
  Shield,
} from 'lucide-react';
import { Card } from '../components/common';

const features = [
  {
    icon: Sparkles,
    title: 'Neural Synthesis',
    description:
      'Transform research papers directly into executable repositories via multi-agent LLM pipelines.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    icon: Zap,
    title: 'Hyper-Speed Mode',
    description:
      'Acceleration layer that parallelizes retrieval, planning, and implementation for fastest delivery.',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
  },
  {
    icon: Brain,
    title: 'Cognitive Context',
    description:
      'Semantic memory graphs retain methodology, datasets, and evaluation strategy during reasoning.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Shield,
    title: 'Secure Sandbox',
    description:
      'Isolated execution & validation environment keeps experiments safe and reproducible.',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
];

const actions = [
  {
    path: '/paper-to-code',
    icon: FileText,
    title: 'Paper to Code',
    description: 'Convert research papers into working implementations',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    path: '/chat',
    icon: MessageSquare,
    title: 'Chat Planning',
    description: 'Describe your project and let AI generate the code',
    color: 'from-purple-500 to-pink-600',
  },
  {
    path: '/workflow',
    icon: GitBranch,
    title: 'Workflow Editor',
    description: 'Visual workflow design for complex projects',
    color: 'from-green-500 to-teal-600',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
            DeepCode
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Transform research papers and natural language specifications into
          production-ready code with AI-powered automation.
        </p>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={action.path}>
                <Card className="group hover:shadow-md transition-shadow h-full">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.color} mb-4`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {action.description}
                  </p>
                  <span className="inline-flex items-center text-sm font-medium text-primary-600">
                    Get started
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Features */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Powerful Features
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="h-full">
                  <div
                    className={`inline-flex p-2.5 rounded-lg ${feature.bgColor} mb-3`}
                  >
                    <Icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

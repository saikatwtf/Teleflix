import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Recent Uploads - Teleflix',
  description: 'Browse recent uploads on Teleflix',
};

export default function RecentPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Recent Uploads</h1>
      <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400">No recent uploads available yet.</p>
        <p className="mt-4">
          <Link href="/" className="text-primary-600 dark:text-primary-400 hover:underline">
            Return to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
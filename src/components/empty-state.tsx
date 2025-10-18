import { User } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export default function EmptyState() {
  return (
    <Card className="h-full flex items-center justify-center shadow-md">
      <CardContent className="text-center text-gray-500 p-6">
        <div className="flex justify-center mb-4">
            <User className="w-16 h-16 text-gray-300" />
        </div>
        <p className="text-lg font-medium">Select a patient to view their records</p>
      </CardContent>
    </Card>
  );
}

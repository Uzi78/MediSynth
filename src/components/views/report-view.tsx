'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Record as RecordType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import ConsolidatedReport from '../consolidated-report';

export default function ReportView() {
  const { user } = useUser();
  const firestore = useFirestore();

  const recordsRef = useMemoFirebase(() => 
    (user && firestore) ? collection(firestore, 'users', user.uid, 'patients', user.uid, 'records') : null
  , [user, firestore]);

  const recordsQuery = useMemoFirebase(() => 
    recordsRef ? query(recordsRef) : null
  , [recordsRef]);

  const { data: records, isLoading: isLoadingRecords } = useCollection<RecordType>(recordsQuery);

  if (isLoadingRecords) {
    return (
        <div className="p-6 space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }
  
  return <ConsolidatedReport records={records} />;

}

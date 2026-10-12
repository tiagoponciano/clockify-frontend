import { TimerBar } from '@/components/timer/timer-bar';
import { EntriesList } from '@/components/entries/entries-list';

export default function TimerPage() {
  return (
    <div className="flex flex-1 flex-col">
      <TimerBar />
      <EntriesList />
    </div>
  );
}

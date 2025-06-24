import { TIMESTAMP_END } from '@/const';

function formatEndDate(timestamp: number) {
  const date = new Date(timestamp * 1000);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const hours = date.getHours();
  const minutes = date.getMinutes();
  // Format day with ordinal suffix
  const ordinal = (n: number) => {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };
  // Format hours to 12-hour and AM/PM
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const ampm = hours < 12 ? 'AM' : 'PM';
  return `${day}${ordinal(day)} ${month}, ${hour12}${
    minutes === 0 ? '' : ':' + minutes.toString().padStart(2, '0')
  }${ampm}`;
}

export default function Countdown() {
  return (
    <div className="text-yellow-400 font-bold text-xs p-2 text-center w-full">
      Contest ends on {formatEndDate(TIMESTAMP_END)}
    </div>
  );
}

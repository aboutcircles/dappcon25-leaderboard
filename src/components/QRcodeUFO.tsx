import { MIN_CIRCLES_TO_JOIN, QR_CODE_VALUE } from '@/const';
import Image from 'next/image';

export default function QRcodeBanner() {
  return (
    <div className="flex flex-col p-2 items-end shrink">
      <Image
        className="absolute bottom-10 left-3 beam"
        src="/images/qr.png"
        alt="QR"
        width={280}
        height={200}
      />

      <div className="text-white text-xs sm:text-sm ml-5 min-w-[250px] self-end">
        <a
          href={QR_CODE_VALUE}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
          style={{
            whiteSpace: 'nowrap',
            fontSize: '0.7rem',
          }}
        >
          Send {MIN_CIRCLES_TO_JOIN} CRC to join the Circles leaderboard
        </a>
      </div>
    </div>
  );
}

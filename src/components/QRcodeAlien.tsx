import Image from 'next/image';
import { MIN_CIRCLES_TO_JOIN, QR_CODE_VALUE } from '@/const';
import QRCode from 'react-qr-code';

export default function QRcodeAlien() {
  return (
    <div className="flex flex-col p-2 items-end shrink relative">
      {/* Fixed to bottom-left corner */}
      <div className="absolute bottom-10 left-7 p-2 rounded-xl bg-white border border-black shadow-[0_0_30px_#000000] animate-pulse-glow hover:scale-105 transition-transform duration-400 group overflow-hidden">
        <div className="relative w-[180px] h-[180px]">
          <QRCode
            value={QR_CODE_VALUE}
            bgColor="#ffffff"
            fgColor="#000000"
            size={180}
            level="H"
          />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Image
              src="/images/circles.png"
              alt="Circles Logo"
              width={48}
              height={48}
              className="rounded-full"
            />
          </div>
        </div>
      </div>

      {/* CTA Text */}
      <div className="text-black text-sm sm:text-sm ml-5 min-w-[300px] self-end">
        <a
          href={QR_CODE_VALUE}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white font-bold text-yellow-400"
        >
          Send {MIN_CIRCLES_TO_JOIN} CRC to join the Circles leaderboard
        </a>
      </div>
    </div>
  );
}

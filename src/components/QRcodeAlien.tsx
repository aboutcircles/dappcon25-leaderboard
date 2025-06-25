import { MIN_CIRCLES_TO_JOIN, QR_CODE_VALUE } from '@/const';
import QRCode from 'react-qr-code';

export default function QRcodeAlien() {
  return (
    <div className="flex flex-col p-2 items-end shrink relative">
      {/* Fixed to bottom-left corner */}
      <div
        className="absolute bottom-10 left-7 p-2 rounded-xl bg-black border border-yellow-400
        shadow-[0_0_30px_#facc15] animate-pulse hover:scale-105 transition-transform duration-300 group overflow-hidden"
      >
        <QRCode
          value={QR_CODE_VALUE}
          bgColor="#000000"
          fgColor="#facc15"
          size={180}
          level="H"
        />

        {/* Scanline overlay */}
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none
          bg-gradient-to-b from-transparent via-yellow-300 to-transparent opacity-20 animate-[scan_2s_linear_infinite]"
        />
      </div>

      {/* CTA Text */}
      <div className="text-white text-xs sm:text-sm ml-5 min-w-[300px] self-end">
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

interface HideButtonProps {
  onClick?: () => void;
  className?: string;
}

export default function HideButton({ onClick }: HideButtonProps) {
  return (
    <button
      type="button"
      className={`absolute top-1 left-1 z-50 text-white bg-transparent hover:cursor-pointer transition focus:outline-none`}
      onClick={onClick}
      aria-label="Hide"
    >
      ✨
    </button>
  );
}

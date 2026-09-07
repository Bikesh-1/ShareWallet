const avatars = [
  "https://i.pravatar.cc/100?img=12",
  "https://i.pravatar.cc/100?img=1",
  "https://i.pravatar.cc/100?img=2",
  "https://i.pravatar.cc/100?img=22",
  "https://i.pravatar.cc/100?img=42",
  "https://i.pravatar.cc/100?img=5",
];

export default function Community() {
  return (
    <div className="flex flex-col items-center ">
      
      <div className="flex items-center gap-4">
        <div className="flex -space-x-2">
          {avatars.map((avatar, index) => (
            <img
              key={index}
              src={avatar}
              alt=""
              className="h-9 w-9 rounded-full border-2 border-white object-cover"
            />
          ))}
        </div>

        <div className="h-9 w-px bg-[#E5E5E5]" />

        <div>
          <p className="text-[13px] font-semibold leading-tight text-[#171717]">
            Join 10,000+ people
          </p>

          <p className="mt-1 text-[10px] text-[#9A9A9A]">
            building a better financial tomorrow.
          </p>
        </div>
      </div>

      {/* Scroll */}
      <div className="mt-8 flex flex-col items-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E5EF] bg-white">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4F47EA"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        <span className="mt-3 text-[10px] font-medium text-[#999999]">
          Scroll to explore
        </span>
      </div>

    </div>
  );
}
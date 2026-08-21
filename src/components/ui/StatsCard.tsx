
import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string | React.ReactNode;
  notification?: string;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  notification,
  className = "",
}) => {
  return (
    <div
      className={`bg-[rgba(255,255,255,0.15)] flex items-center gap-4 px-4 py-5 rounded-[30px] text-white text-center w-full ${className}`}
    >
      {notification && (
        <div className="flex flex-col text-xs font-normal">
          <div className="bg-[rgba(255,122,0,1)] z-10 min-h-[27px] w-[27px] h-[27px] px-2 rounded-[74px]">
            {notification}
          </div>
        </div>
      )}
      {typeof icon === 'string' ? (
        <img
          loading="lazy"
          src={icon}
          className="aspect-[1] object-contain w-[65px] shrink-0 rounded-[50%]"
          alt={`${title} icon`}
        />
      ) : (
        <div className="w-[65px] h-[65px] shrink-0 flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="text-base font-normal self-stretch my-auto break-words">
        {title}
      </div>
      <div className="text-xl font-bold self-stretch my-auto break-words ml-auto">
        {value}
      </div>
    </div>
  );
};

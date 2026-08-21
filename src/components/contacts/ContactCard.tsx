import React from "react";

interface ContactCardProps {
  name: string;
  message: string;
  avatar: string;
  notification?: string;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  name,
  message,
  avatar,
  notification,
}) => {
  return (
    <div className="bg-[rgba(255,255,255,0.15)] flex w-full items-stretch gap-[40px_50px] flex-wrap rounded-[10px] p-4">
      <div className="flex items-stretch gap-[17px] grow shrink basis-auto">
        <div className="relative">
          {notification && (
            <div className="absolute -top-4 -left-4 bg-[rgba(255,122,0,1)] z-10 min-h-[27px] w-[27px] h-[27px] flex items-center justify-center text-xs font-normal text-white rounded-[74px]">
              {notification}
            </div>
          )}
          <img
            loading="lazy"
            src={avatar}
            className="aspect-[1] object-contain w-[61px] shrink-0 rounded-[50%]"
            alt={`${name}'s avatar`}
          />
        </div>
        <div className="flex flex-col items-stretch grow shrink-0 basis-0 w-fit my-auto">
          <div className="text-xl font-bold text-white">{name}</div>
          <div className="text-xs font-normal text-white mt-1.5">{message}</div>
        </div>
      </div>
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/87b026b6426c43e89a984782635271b0/6e5155e35cd2ff35dfe4d06527934d19c6e8de30d4e4061739592eaffd647f33?placeholderIfAbsent=true"
        className="aspect-[0.48] object-contain w-10 shrink-0 rounded-[0px_10px_10px_0px]"
        alt="Contact options"
      />
    </div>
  );
};

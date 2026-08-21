import React from "react";
import { ContactCard } from "./ContactCard";

const CONTACTS = [
  {
    name: "Gaurav Mehta",
    message: "Lorem Ipsum is simply dummy text of the skajns dskjas........",
    avatar:
      "https://cdn.builder.io/api/v1/image/assets/87b026b6426c43e89a984782635271b0/2851a64aa255e1942c2913376009e7f24b91caa1d21239cbff6936b5f0630e88?placeholderIfAbsent=true",
    notification: "12",
  },
  {
    name: "Paarth Jain",
    message: "Lorem Ipsum is simply dummy text of the skajns dskjas........",
    avatar:
      "https://cdn.builder.io/api/v1/image/assets/87b026b6426c43e89a984782635271b0/2851a64aa255e1942c2913376009e7f24b91caa1d21239cbff6936b5f0630e88?placeholderIfAbsent=true",
    notification: "29",
  },
  {
    name: "Sayam Sarkar",
    message: "Lorem Ipsum is simply dummy text of the skajns dskjas........",
    avatar:
      "https://cdn.builder.io/api/v1/image/assets/87b026b6426c43e89a984782635271b0/2851a64aa255e1942c2913376009e7f24b91caa1d21239cbff6936b5f0630e88?placeholderIfAbsent=true",
  },
  // Add more contacts as needed
];

export const ContactList: React.FC = () => {
  return (
    <div className="flex flex-col gap-7">
      <h2 className="text-[28px] font-bold text-white">Recently Contacted</h2>
      <div className="flex flex-col gap-7">
        {CONTACTS.map((contact, index) => (
          <ContactCard key={index} {...contact} />
        ))}
      </div>
    </div>
  );
};

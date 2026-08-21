
import React, { useState, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onChatRedirect?: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search",
  className = "",
  onChatRedirect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const searchPages = (query: string) => {
    const pages = [
      { path: "/", keywords: ["home", "dashboard", "health", "metrics", "body"] },
      { path: "/emergency-contacts", keywords: ["emergency", "contact", "phone", "numbers"] },
      { path: "/services", keywords: ["service", "medical", "health", "assistance"] },
      { path: "/login", keywords: ["login", "signin", "account"] },
      { path: "/signup", keywords: ["signup", "register", "join"] },
    ];

    const queryLower = query.toLowerCase();
    const matchedPage = pages.find(page => 
      page.keywords.some(keyword => keyword.includes(queryLower))
    );

    if (matchedPage) {
      navigate(matchedPage.path);
      setSearchQuery("");
      return true;
    }
    return false;
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const found = searchPages(searchQuery);
    if (!found && onChatRedirect) {
      onChatRedirect(searchQuery);
      setSearchQuery("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className={`bg-[rgba(255,255,255,0.15)] flex items-stretch gap-[25px] flex-wrap px-5 py-2.5 rounded-[50px] ${className}`}
    >
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/87b026b6426c43e89a984782635271b0/68cda5f71f3dedf9709d35ad0b3d8ee3377dce75ca13cc869ac4c23a96d0562a"
        className="aspect-[1] object-contain w-10 shrink-0 cursor-pointer"
        alt="Search icon"
        onClick={handleSearch}
      />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="grow shrink basis-auto my-auto bg-transparent text-white text-2xl font-normal outline-none placeholder:text-white"
      />
    </div>
  );
};

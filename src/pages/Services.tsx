
import { MainLayout } from "@/components/layout/MainLayout";
import { Brain, Smile, Stethoscope, Utensils } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Services = () => {
  const services = [
    {
      id: 'mood',
      title: 'Mood Tracker',
      description: 'Track and analyze your emotional well-being',
      icon: <Smile className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />,
      link: '/mental-health'
    },
    {
      id: 'symptoms',
      title: 'Symptoms Tracker',
      description: 'Monitor and understand your health symptoms',
      icon: <Stethoscope className="w-6 h-6 md:w-8 md:h-8 text-red-400" />,
      link: '/symptoms-tracker'
    },
    {
      id: 'nutrition',
      title: 'Nutrition Care Taker',
      description: 'Get personalized nutrition advice',
      icon: <Utensils className="w-6 h-6 md:w-8 md:h-8 text-green-400" />,
      link: '/nutrition'
    },
    {
      id: 'brain',
      title: 'Brain Boost Buddy',
      description: 'Play mind-stimulating games and exercises',
      icon: <Brain className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />,
      link: '/brain-boost'
    }
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Our AI Services</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {services.map((service) => (
            <Link key={service.id} to={service.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.15)] backdrop-blur-sm hover:bg-[rgba(155,135,245,0.15)] h-full">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-center gap-3 md:gap-4">
                    {service.icon}
                    <CardTitle className="text-base md:text-lg text-white">{service.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <p className="text-sm md:text-base text-gray-300">{service.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Services;

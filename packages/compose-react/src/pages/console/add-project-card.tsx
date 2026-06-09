import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/core/card/card";
export const AddProjectCard = () => {
  const navigate = useNavigate();
  return (
    <Card
      onClick={() => navigate("/create-project")}
      className="border-primary/30 hover:border-primary/70 flex h-[160px] cursor-pointer items-center justify-center rounded-xl border bg-transparent shadow-sm transition-all duration-200 hover:shadow-md md:py-4"
    >
      <CardContent className="p-0 text-center">
        <div className="flex justify-center">
          <Plus className="text-primary" strokeWidth={2} size={50} />
        </div>
        <p className="text-primary mt-2 font-bold">Add Project</p>
      </CardContent>
    </Card>
  );
};

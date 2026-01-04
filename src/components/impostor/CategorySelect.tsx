import { CATEGORIES, Category } from "@/lib/impostorData";
import { Check } from "lucide-react";

interface CategorySelectProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string) => void;
  onContinue: () => void;
}

export const CategorySelect = ({ 
  selectedCategory, 
  onSelectCategory,
  onContinue
}: CategorySelectProps) => {
  return (
    <div className="flex flex-col h-full p-4">
      <div className="text-center mb-6">
        <h3 className="font-display text-xl font-bold text-ink">Choose a Category</h3>
        <p className="text-ink/60 text-sm mt-1">
          The secret word will be from this category
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto pb-4">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`relative p-4 rounded-2xl transition-all duration-200 flex flex-col items-center gap-2 border-2 ${
              selectedCategory === category.id 
                ? "border-ink shadow-lg scale-[1.02]" 
                : "border-transparent hover:border-ink/20"
            }`}
            style={{ 
              backgroundColor: `hsl(${category.color} / 0.3)` 
            }}
          >
            {selectedCategory === category.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-ink flex items-center justify-center">
                <Check className="w-3 h-3 text-paper" />
              </div>
            )}
            <span className="text-3xl">{category.icon}</span>
            <span className="text-ink font-medium text-sm text-center">
              {category.name}
            </span>
          </button>
        ))}
      </div>
      
      <button
        onClick={onContinue}
        disabled={!selectedCategory}
        className="w-full py-4 rounded-full bg-ink text-paper font-semibold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-opacity mt-4"
      >
        Continue
      </button>
    </div>
  );
};

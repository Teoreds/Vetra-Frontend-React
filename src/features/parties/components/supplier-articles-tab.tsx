import { Plus, Package } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardHeader, CardContent } from "@/shared/ui/card";

interface SupplierArticlesTabProps {
  onAddArticle: () => void;
}

export function SupplierArticlesTab({ onAddArticle }: SupplierArticlesTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[15px] font-semibold">Articoli Forniti</h2>
          </div>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2.5 text-[12px]" onClick={onAddArticle}>
            <Plus className="h-3.5 w-3.5" />
            Aggiungi
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="rounded-lg border border-border/60 bg-muted/40 py-6 text-center text-[13px] text-muted-foreground">
          Funzionalità disponibile a breve — il backend deve esporre il filtro per fornitore su <code className="text-[12px]">/articles</code>.
        </p>
      </CardContent>
    </Card>
  );
}

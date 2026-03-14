import { Operation, OperationStatus } from "@/store/inventoryStore";
import { StatusBadge } from "./StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const columns: OperationStatus[] = ['Draft', 'Ready', 'Done'];

interface KanbanBoardProps {
  operations: Operation[];
  onStatusChange: (id: string, status: OperationStatus) => void;
}

export function KanbanBoard({ operations, onStatusChange }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map(col => {
        const items = operations.filter(op => op.status === col);
        return (
          <div key={col} className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <StatusBadge status={col} />
              <span className="text-xs font-mono text-muted-foreground">({items.length})</span>
            </div>
            <div className="space-y-2 min-h-[100px]">
              {items.map(op => (
                <Card key={op.id} className={cn("bg-card border-border cursor-pointer hover:border-primary/30 transition-colors")}>
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-sm font-mono">{op.reference}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <p className="text-xs text-muted-foreground">{op.contact}</p>
                    <p className="text-xs text-muted-foreground">{op.scheduledDate}</p>
                    <div className="flex gap-1 mt-2">
                      {columns.filter(c => c !== col).map(target => (
                        <button
                          key={target}
                          onClick={() => onStatusChange(op.id, target)}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm border border-border hover:border-primary/50 hover:text-primary transition-colors"
                        >
                          → {target}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

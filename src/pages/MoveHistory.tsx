import { useState } from "react";
import { useInventoryStore } from "@/store/inventoryStore";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Search } from "lucide-react";

const MoveHistory = () => {
  const { moveHistory } = useInventoryStore();
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = moveHistory.filter(m => {
    const matchSearch = m.reference.toLowerCase().includes(search.toLowerCase()) || m.contact.toLowerCase().includes(search.toLowerCase());
    const matchDateFrom = !dateFrom || m.date >= dateFrom;
    const matchDateTo = !dateTo || m.date <= dateTo;
    return matchSearch && matchDateFrom && matchDateTo;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search reference or contact..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 font-mono text-sm" />
        </div>
        <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="font-mono text-sm w-auto" placeholder="From" />
        <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="font-mono text-sm w-auto" placeholder="To" />
      </div>

      <div className="border border-border rounded-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase">Reference</TableHead>
              <TableHead className="font-mono text-xs uppercase">Date</TableHead>
              <TableHead className="font-mono text-xs uppercase">Contact</TableHead>
              <TableHead className="font-mono text-xs uppercase">From</TableHead>
              <TableHead className="font-mono text-xs uppercase">To</TableHead>
              <TableHead className="font-mono text-xs uppercase">Quantity</TableHead>
              <TableHead className="font-mono text-xs uppercase">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(m => (
              <TableRow key={m.id} className="border-border">
                <TableCell className="font-mono text-sm font-medium">{m.reference}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{m.date}</TableCell>
                <TableCell className="text-sm">{m.contact}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{m.from}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{m.to}</TableCell>
                <TableCell className="font-mono text-sm font-bold">{m.quantity}</TableCell>
                <TableCell><StatusBadge status={m.status} /></TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground font-mono text-sm py-8">No move history</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MoveHistory;
